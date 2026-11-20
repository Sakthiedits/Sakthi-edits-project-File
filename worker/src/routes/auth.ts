import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

type Bindings = {
  DB: D1Database
  ADMIN_USERNAME: string
  ADMIN_PASSWORD_HASH: string
  SESSION_SECRET: string
  ALLOWED_ORIGIN: string
}

export const authRouter = new Hono<{ Bindings: Bindings }>()

// ---------------------------------------------------------------------------
// In-memory rate-limit store
// Key: IP address  →  Value: { count: number; windowStart: number }
// Limits: 5 failed attempts per 15 minutes.
// NOTE: This resets on Worker cold-starts, which is acceptable for this scale.
// For distributed rate-limiting, use Cloudflare KV or Durable Objects.
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

interface RateLimitEntry {
  count: number
  windowStart: number
}

const failedAttempts = new Map<string, RateLimitEntry>()

function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  return (
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = failedAttempts.get(ip)

  if (!entry) return false

  // Reset window if expired
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    failedAttempts.delete(ip)
    return false
  }

  return entry.count >= RATE_LIMIT_MAX
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now()
  const entry = failedAttempts.get(ip)

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    failedAttempts.set(ip, { count: 1, windowStart: now })
  } else {
    entry.count += 1
  }
}

function clearFailedAttempts(ip: string): void {
  failedAttempts.delete(ip)
}

// ---------------------------------------------------------------------------
// Password hashing helpers (SubtleCrypto / Web Crypto API)
//
// Hash format stored in ADMIN_PASSWORD_HASH env var:
//   sha256:<hex_of_sha256(password + ':' + SESSION_SECRET)>
//
// To generate a hash for setup (run once in any JS environment):
//   const hash = await crypto.subtle.digest('SHA-256',
//     new TextEncoder().encode(password + ':' + sessionSecret))
//   const hex = Array.from(new Uint8Array(hash))
//     .map(b => b.toString(16).padStart(2, '0')).join('')
//   console.log('sha256:' + hex)
//
// NOTE: For true production security, migrate to bcrypt via a separate
// authentication micro-service, or use Cloudflare Access for admin auth.
// ---------------------------------------------------------------------------
async function hashPassword(password: string, secret: string): Promise<string> {
  const data = new TextEncoder().encode(`${password}:${secret}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return `sha256:${hex}`
}

/** Constant-time string comparison to prevent timing attacks. */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/** Generate a cryptographically random 32-byte hex token. */
function generateSessionToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ---------------------------------------------------------------------------
// POST /api/admin/login
// ---------------------------------------------------------------------------
authRouter.post('/login', async (c) => {
  const ip = getClientIp(c)

  // Rate limit check
  if (isRateLimited(ip)) {
    return c.json(
      { success: false, error: 'Too many failed attempts. Try again in 15 minutes.' },
      429
    )
  }

  let body: { username?: string; password?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400)
  }

  const { username, password } = body

  if (!username || !password) {
    return c.json({ success: false, error: 'Username and password are required' }, 400)
  }

  // Validate credentials
  const usernameMatch = safeCompare(username, c.env.ADMIN_USERNAME)

  const computedHash = await hashPassword(password, c.env.SESSION_SECRET)
  const storedHash = c.env.ADMIN_PASSWORD_HASH

  const passwordMatch = safeCompare(computedHash, storedHash)

  if (!usernameMatch || !passwordMatch) {
    recordFailedAttempt(ip)
    return c.json({ success: false, error: 'Invalid credentials' }, 401)
  }

  // Clear rate limit on successful login
  clearFailedAttempts(ip)

  // Create session token
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  try {
    await c.env.DB.prepare(
      'INSERT INTO sessions (token, expires_at) VALUES (?, ?)'
    )
      .bind(token, expiresAt.toISOString())
      .run()
  } catch (error) {
    console.error('Failed to create session:', error)
    return c.json({ success: false, error: 'Internal server error' }, 500)
  }

  // Set HttpOnly session cookie
  setCookie(c, 'session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 86400, // 24 hours in seconds
    path: '/',
  })

  return c.json({ success: true, message: 'Logged in' })
})

// ---------------------------------------------------------------------------
// POST /api/admin/logout
// ---------------------------------------------------------------------------
authRouter.post('/logout', async (c) => {
  const token = getCookie(c, 'session')

  if (token) {
    try {
      await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?')
        .bind(token)
        .run()
    } catch (error) {
      console.error('Failed to delete session:', error)
      // Continue anyway — we'll still clear the cookie
    }
  }

  deleteCookie(c, 'session', { path: '/' })

  return c.json({ success: true })
})

// ---------------------------------------------------------------------------
// GET /api/admin/session
// ---------------------------------------------------------------------------
authRouter.get('/session', async (c) => {
  const token = getCookie(c, 'session')

  if (!token) {
    return c.json({ success: false, error: 'Not authenticated' }, 401)
  }

  try {
    const session = await c.env.DB.prepare(
      'SELECT * FROM sessions WHERE token = ? LIMIT 1'
    )
      .bind(token)
      .first<{ token: string; expires_at: string }>()

    if (!session) {
      return c.json({ success: false, error: 'Invalid session' }, 401)
    }

    const expiresAt = new Date(session.expires_at)
    if (expiresAt < new Date()) {
      await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?')
        .bind(token)
        .run()
      deleteCookie(c, 'session', { path: '/' })
      return c.json({ success: false, error: 'Session expired' }, 401)
    }

    return c.json({
      success: true,
      data: { username: c.env.ADMIN_USERNAME },
    })
  } catch (error) {
    console.error('Session validation error:', error)
    return c.json({ success: false, error: 'Internal server error' }, 500)
  }
})
