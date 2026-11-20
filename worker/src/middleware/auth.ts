import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'

type Bindings = {
  DB: D1Database
  SESSION_SECRET: string
}

/**
 * requireAuth middleware
 *
 * Reads the 'session' HttpOnly cookie, validates it against the D1 sessions
 * table, and checks that it has not expired. If valid, execution continues.
 * Otherwise a 401 JSON response is returned immediately.
 */
export const requireAuth = async (
  c: Context<{ Bindings: Bindings }>,
  next: Next
): Promise<Response | void> => {
  const token = getCookie(c, 'session')

  if (!token) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  try {
    const session = await c.env.DB.prepare(
      'SELECT * FROM sessions WHERE token = ? LIMIT 1'
    )
      .bind(token)
      .first<{ token: string; expires_at: string }>()

    if (!session) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }

    const expiresAt = new Date(session.expires_at)
    if (expiresAt < new Date()) {
      // Clean up expired session
      await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?')
        .bind(token)
        .run()
      return c.json({ success: false, error: 'Session expired' }, 401)
    }

    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return c.json({ success: false, error: 'Internal server error' }, 500)
  }
}
