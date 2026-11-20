import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { projectsRouter } from './routes/projects'
import { adminProjectsRouter } from './routes/admin-projects'
import { authRouter } from './routes/auth'
import { uploadRouter } from './routes/upload'

type Bindings = {
  DB: D1Database
  R2_BUCKET?: R2Bucket
  ADMIN_USERNAME: string
  ADMIN_PASSWORD_HASH: string
  SESSION_SECRET: string
  ALLOWED_ORIGIN: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS — allow multipart/form-data for video uploads
app.use('*', cors({
  origin: (origin, c) => {
    const allowed = c.env.ALLOWED_ORIGIN || 'http://localhost:5173'
    const origins = allowed.split(',').map((s: string) => s.trim())
    return origins.includes(origin) ? origin : origins[0]
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'multipart/form-data'],
  credentials: true,
}))

app.route('/api', projectsRouter)
app.route('/api/admin', authRouter)
app.route('/api/admin', adminProjectsRouter)
app.route('/api/admin', uploadRouter)

app.get('/', (c) => c.json({ message: 'Sakthiedits API' }))

export default app
