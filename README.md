# Sakthiedits — Portfolio Website

A premium video editing portfolio website built for Sakthiedits. Features a cinematic dark UI with smooth animations, an admin dashboard for managing portfolio projects, and a contact form — all hosted on Cloudflare's free tier.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Vite + TypeScript + Tailwind CSS v4 + Framer Motion |
| **Backend** | Cloudflare Workers (Hono) |
| **Database** | Cloudflare D1 (SQLite) |
| **Storage** | Cloudflare R2 *(optional, for direct video uploads)* |
| **Hosting** | Cloudflare Pages + Workers |

---

## Project Structure

```
sakthiedits/
├── frontend/                    # React + Vite frontend
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── sections/
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── Portfolio.tsx
│   │   │   │   ├── About.tsx
│   │   │   │   ├── Services.tsx
│   │   │   │   └── Contact.tsx
│   │   │   ├── ui/
│   │   │   │   ├── VideoCard.tsx
│   │   │   │   ├── VideoModal.tsx
│   │   │   │   └── AnimatedText.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── ProjectForm.tsx
│   │   │       └── LoginForm.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── AdminLogin.tsx
│   │   │   └── Admin.tsx
│   │   ├── hooks/
│   │   │   ├── useProjects.ts
│   │   │   └── useAuth.ts
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── worker/                      # Cloudflare Worker (Hono API)
│   ├── src/
│   │   ├── index.ts             # Main entry, route registration
│   │   ├── routes/
│   │   │   ├── projects.ts
│   │   │   ├── auth.ts
│   │   │   └── contact.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── cors.ts
│   │   └── db/
│   │       └── schema.ts
│   ├── .dev.vars.example
│   ├── wrangler.toml
│   ├── tsconfig.json
│   └── package.json
│
├── migrations/
│   └── 0001_initial.sql         # D1 database schema
│
├── scripts/
│   └── generate-hash.js         # Admin password hash generator
│
├── .gitignore
└── README.md
```

---

## Local Development

### Prerequisites

- **Node.js** 18+ — [nodejs.org](https://nodejs.org)
- **npm** (comes with Node.js)
- **Cloudflare account** — [dash.cloudflare.com](https://dash.cloudflare.com) (free)
- **Wrangler CLI** — `npm install -g wrangler`

---

### 1. Clone and Install

```bash
git clone <repo-url>
cd sakthiedits

# Install frontend deps
cd frontend && npm install && cd ..

# Install worker deps
cd worker && npm install && cd ..
```

---

### 2. Set Up the Worker (local)

Create a local D1 database:

```bash
cd worker
npx wrangler d1 create sakthiedits-db
```

Copy the `database_id` from the command output and paste it into `worker/wrangler.toml` under `database_id`.

Run migrations:

```bash
npx wrangler d1 execute sakthiedits-db --local --file=../migrations/0001_initial.sql
```

---

### 3. Configure Worker Secrets (local .dev.vars)

Create `worker/.dev.vars` (copy from `.dev.vars.example`):

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=sha256:<YOUR_HASH>
SESSION_SECRET=<random-32-char-string>
```

To generate the password hash, see the **Admin Setup** section below.

---

### 4. Start Development Servers

**Terminal 1 — Start Worker:**

```bash
cd worker
npx wrangler dev
```

**Terminal 2 — Start Frontend:**

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**

> The Vite dev server proxies `/api` requests to the local worker at `http://localhost:8787`, so no cross-origin issues during development.

---

## Admin Setup

The admin login requires a password hash stored as a Cloudflare secret. Passwords are **never** stored in plaintext.

### Generate Password Hash

Run this in Node.js to generate your hash:

```javascript
// In Node.js terminal:
const crypto = require('crypto');
const password = 'YourSecurePassword'; // Replace with your real password
const secret = 'YourSessionSecret';   // Replace with your SESSION_SECRET
const hash = crypto.createHash('sha256').update(`${password}:${secret}`).digest('hex');
console.log('sha256:' + hash);
```

Or use the provided script:

```bash
node scripts/generate-hash.js
```

Add the output to your `.dev.vars` as `ADMIN_PASSWORD_HASH`.

> **Never commit the actual password or hash to git.**

### Admin Login

- **Login URL:** http://localhost:5173/admin/login
- **Dashboard:** http://localhost:5173/admin

---

## Cloudflare Production Deployment

### 1. Create D1 Database

```bash
cd worker
npx wrangler d1 create sakthiedits-db
```

Update `worker/wrangler.toml` with the returned `database_id`.

### 2. Run Production Migrations

```bash
npx wrangler d1 execute sakthiedits-db --file=../migrations/0001_initial.sql
```

### 3. Set Production Secrets

```bash
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_PASSWORD_HASH
npx wrangler secret put SESSION_SECRET
```

### 4. Deploy Worker

```bash
cd worker
npm run deploy
```

Note the worker URL (e.g. `https://sakthiedits-api.yourname.workers.dev`).

### 5. Deploy Frontend to Cloudflare Pages

#### Option A: Connect via GitHub *(Recommended)*

1. Push code to GitHub
2. Go to **Cloudflare Dashboard → Pages → Create Project**
3. Connect your GitHub repo
4. Set build settings:
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Build output directory:** `frontend/dist`
5. No environment variables needed in the frontend — the API path is relative

#### Option B: Direct Upload

```bash
cd frontend && npm run build
npx wrangler pages deploy dist --project-name=sakthiedits
```

### 6. Configure CORS

Update `worker/wrangler.toml`:

```toml
[env.production.vars]
ALLOWED_ORIGIN = "https://sakthiedits.pages.dev"
```

Replace with your custom domain if applicable.

### 7. Custom Domain

1. **Cloudflare Pages:** Dashboard → Pages → *your-project* → Custom Domains
2. **Cloudflare Workers:** Dashboard → Workers → *your-worker* → Triggers → Custom Domains

---

## Adding Real Portfolio Videos

1. Log in at `/admin/login`
2. Click **Add New Project**
3. Choose a video source:
   - **YouTube** — Paste YouTube URL
   - **Google Drive** — Paste sharing URL *(must be shared to "Anyone with the link")*
   - **Direct MP4** — Paste a publicly accessible `.mp4` URL
4. Fill in title, description, and category
5. Click **Preview** to verify the video plays correctly
6. Click **Publish**

---

## Adding Real Assets

| Asset | Where to Update |
|-------|----------------|
| Profile photo | `frontend/src/components/sections/About.tsx` — replace placeholder `<div>` with `<img>` |
| Logo / wordmark | `frontend/src/components/layout/Navbar.tsx` — replace text logo |
| Favicon | `frontend/public/favicon.ico` |
| Email address | `frontend/src/components/sections/Contact.tsx` — uncomment email section |

---

## Optional: R2 Video Upload

To support direct video file uploads through the admin dashboard:

1. Create an R2 bucket:
   ```bash
   wrangler r2 bucket create sakthiedits-videos
   ```
2. Uncomment the `[[r2_buckets]]` section in `worker/wrangler.toml`
3. Redeploy the worker:
   ```bash
   cd worker && npm run deploy
   ```

> **Note:** R2 has its own pricing. The free tier includes **10 GB storage** and **1 million read operations/month**.

---

## Cloudflare Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| **Pages** | 500 builds/month, unlimited bandwidth |
| **Workers** | 100,000 requests/day |
| **D1** | 5M rows read/day, 100K writes/day, 5 GB storage |
| **R2** *(optional)* | 10 GB storage, 1M reads/month |

For approximately **100,000 visits/month**, the free tier is sufficient depending on API call frequency.

> **Video Hosting Notes:**
> - **YouTube** — No meaningful embedding limits
> - **Google Drive** — May hit viewing quotas on high-traffic files
> - **Direct MP4** — Must be publicly accessible; bandwidth costs depend on the hosting provider

---

## Security Notes

- ✅ Admin password is **never** stored in plaintext — only an HMAC-SHA256 hash
- ✅ Sessions expire after **24 hours**
- ✅ All admin API endpoints require a valid session cookie
- ✅ **HttpOnly cookies** prevent XSS token theft
- ✅ **CORS** restricts API access to your domain only
- ✅ **Rate limiting** on the login endpoint prevents brute-force attacks
- ⚠️ Never commit `.dev.vars` or any real secrets to git
- ⚠️ Keep `SESSION_SECRET` truly random (32+ characters) and never reuse it

---

## Contributing

This is a personal portfolio project. If you fork it for your own use, update all branding, copy, and credentials before deploying.

---

## License

MIT — see [LICENSE](./LICENSE) for details.
