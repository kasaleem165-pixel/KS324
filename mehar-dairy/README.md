# Mehar Dairy & Fattening Farm
### مہر ڈیری اینڈ فیٹننگ فارم
**Premium Qurbani Animals — Eid ul-Adha 2026**

---

## Run the app in 3 steps

### Step 1 — Install Node.js (once only)
Download and install from: **https://nodejs.org** (click the "LTS" button)

### Step 2 — Open a terminal inside the `mehar-dairy` folder

**Windows:** Right-click the `mehar-dairy` folder → "Open in Terminal"
**Mac:** Right-click the folder → "New Terminal at Folder"

### Step 3 — Run these two commands

```
npm install
npm run dev
```

Then open your browser and go to: **http://localhost:5173**

That's it! The app runs in **demo mode** — sample animals are already loaded, no account or internet service needed.

---

## Demo Admin Login

Go to **http://localhost:5173/auth** and use:

| Field | Value |
|-------|-------|
| Email | `admin@demo.com` |
| Password | `admin123` |

In the admin panel you can add/edit animals, upload photos, and manage bookings.

---

## Connect to a real database (optional)

If you want real data that persists and is shared across devices:

1. Create a free account at **https://supabase.com**
2. Create a new project
3. In the SQL Editor, paste and run the contents of `supabase/schema.sql`
4. Go to **Storage → New Bucket** → name it `animals`, turn on **Public**
5. Copy your project URL and anon key from **Settings → API**
6. Create a file named `.env` in the `mehar-dairy` folder with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

7. Restart the app (`Ctrl+C` then `npm run dev`)
8. Sign up at `/auth`, then run in Supabase SQL Editor:
```sql
INSERT INTO user_roles (user_id, role) VALUES ('<your-user-id>', 'admin');
```

---

## Contact

- WhatsApp / Phone: **+92 303 0911125**
- Location: Punjab, Pakistan
