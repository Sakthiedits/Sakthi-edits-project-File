import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
  R2_BUCKET?: R2Bucket
  ALLOWED_ORIGIN: string
}

export const projectsRouter = new Hono<{ Bindings: Bindings }>()

/**
 * GET /api/videos/:key{.*}
 * Stream video directly from R2 bucket with HTTP 206 Partial Content (Range requests)
 * Critical for iOS Safari & Android Chrome video seek and autoplay.
 */
projectsRouter.get('/videos/:key{.*}', async (c) => {
  if (!c.env.R2_BUCKET) {
    return c.text('R2 storage is not configured', 503)
  }

  const key = c.req.param('key')
  if (!key) {
    return c.text('Video key is required', 400)
  }

  try {
    const rangeHeader = c.req.header('range')
    let object: any

    if (rangeHeader) {
      object = await c.env.R2_BUCKET.get(key, {
        range: c.req.raw.headers,
        onlyIf: c.req.raw.headers,
      })
    } else {
      object = await c.env.R2_BUCKET.get(key)
    }

    if (!object) {
      return c.text('Video not found', 404)
    }

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('accept-ranges', 'bytes')
    headers.set('cache-control', 'public, max-age=31536000, immutable')

    const status = object.range ? 206 : 200
    return new Response(object.body, {
      headers,
      status,
    })
  } catch (error) {
    console.error('Error streaming video:', error)
    return c.text('Failed to stream video', 500)
  }
})

/**
 * GET /api/projects
 * Returns all published projects ordered by display_order ASC.
 * Accepts optional ?category= query param for filtering.
 */
projectsRouter.get('/projects', async (c) => {
  try {
    const category = c.req.query('category')

    let query: string
    let params: (string | number)[]

    if (category && category.trim() !== '') {
      query = `
        SELECT * FROM projects
        WHERE published = 1 AND category = ?
        ORDER BY display_order ASC, created_at DESC
      `
      params = [category.trim()]
    } else {
      query = `
        SELECT * FROM projects
        WHERE published = 1
        ORDER BY display_order ASC, created_at DESC
      `
      params = []
    }

    const { results } = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({ success: true, data: results })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return c.json({ success: false, error: 'Failed to fetch projects' }, 500)
  }
})

/**
 * GET /api/projects/:slug
 * Returns a single published project by its slug.
 * Returns 404 if not found or not published.
 */
projectsRouter.get('/projects/:slug', async (c) => {
  try {
    const slug = c.req.param('slug')

    const project = await c.env.DB.prepare(
      'SELECT * FROM projects WHERE slug = ? AND published = 1 LIMIT 1'
    )
      .bind(slug)
      .first()

    if (!project) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    return c.json({ success: true, data: project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return c.json({ success: false, error: 'Failed to fetch project' }, 500)
  }
})
