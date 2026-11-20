import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'

type Bindings = {
  DB: D1Database
  R2_BUCKET?: R2Bucket
  SESSION_SECRET: string
  ADMIN_USERNAME: string
  ALLOWED_ORIGIN: string
  R2_PUBLIC_URL?: string
}

export const uploadRouter = new Hono<{ Bindings: Bindings }>()

// Auth protect all upload routes
uploadRouter.use('/upload/*', requireAuth)

// ---------------------------------------------------------------------------
// POST /api/admin/upload/video
// Upload a video file to R2. Returns the public URL.
// Max 80MB per file (after browser compression ~15–25MB expected)
// ---------------------------------------------------------------------------
uploadRouter.post('/upload/video', async (c) => {
  if (!c.env.R2_BUCKET) {
    return c.json({ success: false, error: 'R2 storage not configured' }, 500)
  }

  try {
    const formData = await c.req.formData()
    const file = formData.get('video') as File | null

    if (!file) {
      return c.json({ success: false, error: 'No video file provided' }, 400)
    }

    // 80MB limit (browser compresses to ~15–25MB, raw cap at 80MB)
    const MAX_SIZE = 80 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return c.json({
        success: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum allowed is 80MB.`
      }, 400)
    }

    // Validate MIME type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v']
    if (!allowedTypes.includes(file.type)) {
      return c.json({
        success: false,
        error: `Invalid file type: ${file.type}. Only MP4, WebM, MOV allowed.`
      }, 400)
    }

    // Generate unique key: videos/YYYYMMDD-timestamp-random.mp4
    const ext = file.type === 'video/webm' ? 'webm' : file.type === 'video/quicktime' ? 'mov' : 'mp4'
    const date = new Date()
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
    const randomPart = Math.random().toString(36).slice(2, 8)
    const key = `videos/${dateStr}-${date.getTime()}-${randomPart}.${ext}`

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer()
    await c.env.R2_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
    })

    // Build public URL — uses R2_PUBLIC_URL if configured, otherwise Worker's streaming endpoint
    const origin = new URL(c.req.url).origin
    const r2PublicUrl = (c.env as any).R2_PUBLIC_URL?.replace(/\/$/, '')
    const publicUrl = r2PublicUrl ? `${r2PublicUrl}/${key}` : `${origin}/api/videos/${key}`

    return c.json({
      success: true,
      url: publicUrl,
      key,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ success: false, error: 'Upload failed. Please try again.' }, 500)
  }
})

// ---------------------------------------------------------------------------
// DELETE /api/admin/upload/video
// Delete a video from R2 by key
// ---------------------------------------------------------------------------
uploadRouter.delete('/upload/video', async (c) => {
  if (!c.env.R2_BUCKET) {
    return c.json({ success: false, error: 'R2 storage not configured' }, 500)
  }

  try {
    const { key } = await c.req.json<{ key: string }>()
    if (!key || !key.startsWith('videos/')) {
      return c.json({ success: false, error: 'Invalid key' }, 400)
    }

    await c.env.R2_BUCKET.delete(key)
    return c.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return c.json({ success: false, error: 'Delete failed' }, 500)
  }
})

// ---------------------------------------------------------------------------
// GET /api/admin/upload/usage
// Returns estimated R2 storage usage info
// ---------------------------------------------------------------------------
uploadRouter.get('/upload/usage', async (c) => {
  if (!c.env.R2_BUCKET) {
    return c.json({ success: false, error: 'R2 storage not configured' }, 500)
  }

  try {
    // List all objects and sum sizes
    const listed = await c.env.R2_BUCKET.list({ prefix: 'videos/' })
    let totalBytes = 0
    let count = 0
    for (const obj of listed.objects) {
      totalBytes += obj.size
      count++
    }

    const totalMB = totalBytes / 1024 / 1024
    const totalGB = totalMB / 1024
    const limitGB = 5
    const usedPercent = Math.min(100, (totalGB / limitGB) * 100)

    return c.json({
      success: true,
      usage: {
        totalBytes,
        totalMB: Math.round(totalMB * 100) / 100,
        totalGB: Math.round(totalGB * 1000) / 1000,
        limitGB,
        usedPercent: Math.round(usedPercent * 10) / 10,
        fileCount: count,
        remainingGB: Math.round((limitGB - totalGB) * 1000) / 1000,
      }
    })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to get usage' }, 500)
  }
})
