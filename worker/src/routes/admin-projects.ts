import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'

type Bindings = {
  DB: D1Database
  SESSION_SECRET: string
  ADMIN_USERNAME: string
}

interface Project {
  id: number
  title: string
  slug: string
  description: string | null
  category: string
  video_source_type: string
  video_url: string | null
  thumbnail_url: string | null
  display_order: number
  published: number
  created_at: string
  updated_at: string
}

interface CreateProjectBody {
  title?: string
  description?: string
  category?: string
  video_source_type?: string
  video_url?: string
  thumbnail_url?: string
  display_order?: number
  published?: boolean
}

export const adminProjectsRouter = new Hono<{ Bindings: Bindings }>()

// Apply auth middleware to ALL admin project routes
adminProjectsRouter.use('/projects/*', requireAuth)
adminProjectsRouter.use('/projects', requireAuth)

// ---------------------------------------------------------------------------
// Slug generation utility
// ---------------------------------------------------------------------------
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove special chars except hyphens
    .replace(/[\s_]+/g, '-')     // spaces and underscores → hyphens
    .replace(/-+/g, '-')         // collapse multiple hyphens
    .replace(/^-+|-+$/g, '')     // trim leading/trailing hyphens
}

/** Ensure slug is unique in the DB; appends -2, -3, etc. as needed. */
async function ensureUniqueSlug(
  db: D1Database,
  baseSlug: string,
  excludeId?: number
): Promise<string> {
  let slug = baseSlug
  let suffix = 1

  while (true) {
    let row: unknown
    if (excludeId !== undefined) {
      row = await db
        .prepare('SELECT id FROM projects WHERE slug = ? AND id != ? LIMIT 1')
        .bind(slug, excludeId)
        .first()
    } else {
      row = await db
        .prepare('SELECT id FROM projects WHERE slug = ? LIMIT 1')
        .bind(slug)
        .first()
    }

    if (!row) break

    suffix += 1
    slug = `${baseSlug}-${suffix}`
  }

  return slug
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
const VALID_VIDEO_SOURCE_TYPES = ['youtube', 'google_drive', 'direct_mp4', 'r2_upload']

function normalizeSourceType(type: string | undefined): string | undefined {
  if (!type) return undefined
  const cleaned = type.trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (cleaned === 'drive') return 'google_drive'
  if (cleaned === 'mp4' || cleaned === 'direct') return 'direct_mp4'
  if (cleaned === 'r2' || cleaned === 'upload') return 'r2_upload'
  return cleaned
}

function normalizeBody(raw: any): CreateProjectBody {
  if (!raw || typeof raw !== 'object') return {}
  return {
    title: raw.title,
    description: raw.description,
    category: raw.category,
    video_source_type: raw.video_source_type ?? raw.sourceType ?? raw.videoSourceType,
    video_url: raw.video_url ?? raw.videoUrl,
    thumbnail_url: raw.thumbnail_url ?? raw.thumbnailUrl,
    display_order: raw.display_order ?? raw.displayOrder,
    published: raw.published,
  }
}

function validateCreateBody(body: CreateProjectBody): string | null {
  if (!body.title || body.title.trim() === '') {
    return 'title is required'
  }
  if (!body.category || body.category.trim() === '') {
    return 'category is required'
  }
  const normalizedType = normalizeSourceType(body.video_source_type)
  if (!normalizedType || !VALID_VIDEO_SOURCE_TYPES.includes(normalizedType)) {
    return `video_source_type must be one of: ${VALID_VIDEO_SOURCE_TYPES.join(', ')}`
  }
  body.video_source_type = normalizedType
  return null
}

// ---------------------------------------------------------------------------
// GET /api/admin/projects
// List ALL projects (published + draft) with search, category, pagination.
// ---------------------------------------------------------------------------
adminProjectsRouter.get('/projects', async (c) => {
  try {
    const search = c.req.query('search')?.trim() || ''
    const category = c.req.query('category')?.trim() || ''
    const page = Math.max(1, parseInt(c.req.query('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20', 10)))
    const offset = (page - 1) * limit

    // Build WHERE clauses dynamically
    const conditions: string[] = []
    const params: (string | number)[] = []

    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }
    if (category) {
      conditions.push('category = ?')
      params.push(category)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Count total for pagination
    const countResult = await c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM projects ${whereClause}`
    )
      .bind(...params)
      .first<{ total: number }>()

    const total = countResult?.total ?? 0

    // Fetch paginated results
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM projects ${whereClause}
       ORDER BY display_order ASC, created_at DESC
       LIMIT ? OFFSET ?`
    )
      .bind(...params, limit, offset)
      .all<Project>()

    return c.json({
      success: true,
      data: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error listing projects:', error)
    return c.json({ success: false, error: 'Failed to list projects' }, 500)
  }
})

// ---------------------------------------------------------------------------
// GET /api/admin/projects/:id
// Single project by numeric ID (admin can see drafts).
// ---------------------------------------------------------------------------
adminProjectsRouter.get('/projects/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10)

    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid project ID' }, 400)
    }

    const project = await c.env.DB.prepare(
      'SELECT * FROM projects WHERE id = ? LIMIT 1'
    )
      .bind(id)
      .first<Project>()

    if (!project) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    return c.json({ success: true, data: project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return c.json({ success: false, error: 'Failed to fetch project' }, 500)
  }
})

// ---------------------------------------------------------------------------
// POST /api/admin/projects
// Create a new project.
// ---------------------------------------------------------------------------
adminProjectsRouter.post('/projects', async (c) => {
  let raw: any
  try {
    raw = await c.req.json()
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400)
  }
  const body = normalizeBody(raw)

  const validationError = validateCreateBody(body)
  if (validationError) {
    return c.json({ success: false, error: validationError }, 400)
  }

  try {
    const baseSlug = generateSlug(body.title!)
    const slug = await ensureUniqueSlug(c.env.DB, baseSlug)

    const now = new Date().toISOString()
    const displayOrder = body.display_order ?? 0
    const published = body.published ? 1 : 0

    const result = await c.env.DB.prepare(
      `INSERT INTO projects
         (title, slug, description, category, video_source_type, video_url,
          thumbnail_url, display_order, published, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`
    )
      .bind(
        body.title!.trim(),
        slug,
        body.description?.trim() ?? null,
        body.category!.trim(),
        body.video_source_type!,
        body.video_url?.trim() ?? null,
        body.thumbnail_url?.trim() ?? null,
        displayOrder,
        published,
        now,
        now
      )
      .first<Project>()

    return c.json({ success: true, data: result }, 201)
  } catch (error) {
    console.error('Error creating project:', error)
    return c.json({ success: false, error: 'Failed to create project' }, 500)
  }
})

// ---------------------------------------------------------------------------
// PUT /api/admin/projects/:id
// Full update of an existing project.
// ---------------------------------------------------------------------------
adminProjectsRouter.put('/projects/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)

  if (isNaN(id)) {
    return c.json({ success: false, error: 'Invalid project ID' }, 400)
  }

  let raw: any
  try {
    raw = await c.req.json()
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400)
  }
  const body = normalizeBody(raw)

  const validationError = validateCreateBody(body)
  if (validationError) {
    return c.json({ success: false, error: validationError }, 400)
  }

  try {
    // Verify project exists
    const existing = await c.env.DB.prepare(
      'SELECT id, title, slug FROM projects WHERE id = ? LIMIT 1'
    )
      .bind(id)
      .first<{ id: number; title: string; slug: string }>()

    if (!existing) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    // Regenerate slug only if title changed
    let slug = existing.slug
    if (body.title && body.title.trim() !== existing.title) {
      const baseSlug = generateSlug(body.title)
      slug = await ensureUniqueSlug(c.env.DB, baseSlug, id)
    }

    const now = new Date().toISOString()
    const displayOrder = body.display_order ?? 0
    const published = body.published ? 1 : 0

    const result = await c.env.DB.prepare(
      `UPDATE projects
       SET title = ?, slug = ?, description = ?, category = ?,
           video_source_type = ?, video_url = ?, thumbnail_url = ?,
           display_order = ?, published = ?, updated_at = ?
       WHERE id = ?
       RETURNING *`
    )
      .bind(
        body.title!.trim(),
        slug,
        body.description?.trim() ?? null,
        body.category!.trim(),
        body.video_source_type!,
        body.video_url?.trim() ?? null,
        body.thumbnail_url?.trim() ?? null,
        displayOrder,
        published,
        now,
        id
      )
      .first<Project>()

    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('Error updating project:', error)
    return c.json({ success: false, error: 'Failed to update project' }, 500)
  }
})

// ---------------------------------------------------------------------------
// DELETE /api/admin/projects/:id
// Hard delete a project.
// ---------------------------------------------------------------------------
adminProjectsRouter.delete('/projects/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)

  if (isNaN(id)) {
    return c.json({ success: false, error: 'Invalid project ID' }, 400)
  }

  try {
    const existing = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? LIMIT 1'
    )
      .bind(id)
      .first()

    if (!existing) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    await c.env.DB.prepare('DELETE FROM projects WHERE id = ?')
      .bind(id)
      .run()

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting project:', error)
    return c.json({ success: false, error: 'Failed to delete project' }, 500)
  }
})

// ---------------------------------------------------------------------------
// PATCH /api/admin/projects/:id/publish
// Toggle the published status of a project.
// ---------------------------------------------------------------------------
adminProjectsRouter.patch('/projects/:id/publish', async (c) => {
  const id = parseInt(c.req.param('id'), 10)

  if (isNaN(id)) {
    return c.json({ success: false, error: 'Invalid project ID' }, 400)
  }

  let body: { published?: boolean }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400)
  }

  if (typeof body.published !== 'boolean') {
    return c.json({ success: false, error: '"published" must be a boolean' }, 400)
  }

  try {
    const existing = await c.env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? LIMIT 1'
    )
      .bind(id)
      .first()

    if (!existing) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    const now = new Date().toISOString()
    const published = body.published ? 1 : 0

    const result = await c.env.DB.prepare(
      'UPDATE projects SET published = ?, updated_at = ? WHERE id = ? RETURNING *'
    )
      .bind(published, now, id)
      .first<Project>()

    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('Error toggling publish status:', error)
    return c.json({ success: false, error: 'Failed to update publish status' }, 500)
  }
})
