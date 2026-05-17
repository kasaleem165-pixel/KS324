# Mehar Dairy & Fattening Farm
### مہر ڈیری اینڈ فیٹننگ فارم

> **Premium Qurbani Animals Catalog & Booking — Eid ul-Adha 2026**

A full-stack web application for browsing and booking Qurbani animals. Built with React + Vite + TypeScript + TailwindCSS v4 + Supabase.

---

## Features

**Public Site**
- `/` — Hero, value propositions, featured animals, WhatsApp CTA
- `/animals` — Filterable catalog (species, price, weight, status)
- `/animals/:id` — Photo gallery, full specs, booking form, WhatsApp button
- `/about` — Farm story and values
- `/contact` — All contact channels

**Admin Panel** (`/admin`)
- Protected by Supabase role-based auth
- CRUD for animals with Supabase Storage image upload
- Booking management with status workflow (pending → contacted → confirmed / cancelled)
- WhatsApp direct link per booking

---

## Setup

### 1. Clone & Install

```bash
cd mehar-dairy
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. In the **SQL Editor**, run the entire contents of `supabase/schema.sql`
3. Go to **Storage** → **New Bucket** → Name: `animals`, Public: ✅

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both values are in your Supabase project → **Settings → API**.

### 4. Run Locally

```bash
npm run dev
```

Open `http://localhost:5173`

### 5. Create Your First Admin

1. Sign up at `/auth` with your email & password
2. Find your user ID in **Supabase → Authentication → Users**
3. Run in the SQL Editor:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<your-user-uuid>', 'admin');
```

4. Log in at `/auth` → you'll be redirected to `/admin`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | TailwindCSS v4 (CSS-first, `@import "tailwindcss"`) |
| Routing | React Router v7 |
| Database & Auth | Supabase (PostgreSQL + RLS) |
| Storage | Supabase Storage (`animals` bucket) |
| Validation | Zod |
| Toasts | Sonner |
| Icons | Lucide React |
| Fonts | Cormorant Garamond · Inter · Noto Nastaliq Urdu |

---

## Database Schema

```
user_roles  — stores app_role ('admin' | 'user') per user
animals     — catalog of animals (cow, bull, goat, sheep)
bookings    — customer booking requests
```

Row Level Security:
- `animals`: Public read; admin-only write
- `bookings`: Public insert; admin-only read & update
- `user_roles`: Admin-only
- Storage `animals` bucket: Public read; admin-only write

---

## Brand & Contact

- **WhatsApp / Phone:** +92 303 0911125
- **Email:** mehardairy@gmail.com
- **Location:** Punjab, Pakistan

---

## Build for Production

```bash
npm run build
# Output in dist/
```

Deploy `dist/` to Vercel, Netlify, Cloudflare Pages, or any static host.
Set the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables in your hosting dashboard.
