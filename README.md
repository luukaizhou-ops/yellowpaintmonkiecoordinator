# 🥧 Pie Hangout Scheduler

A tiny, no-login web app that helps a fixed friend group of 10 find the date when
the most people are free to hang out (we bake pies). Everyone opens one link on
their phone, taps the dates/slots they're free, and a color-coded grid instantly
shows the hottest overlap. Live-synced across everyone via Supabase realtime.

- **Frontend:** React + Vite
- **Backend/DB:** Supabase (free tier)
- **Styling:** plain CSS, mobile-first
- **Deploy:** free on Vercel or Netlify

No accounts. You pick your name once (remembered on your device via
`localStorage`). Anyone can lock in the chosen hangout — we trust each other.

---

## What it does

- **Pick your name** from the 10 hardcoded friends. Saved on your device.
- **Availability grid** — the next ~6 weeks, each day split into *afternoon* /
  *evening*. Tap a slot to mark yourself free (tap again to unmark). No save button.
- **Overlap heatmap** — each slot shows a `count/10` badge and gets "hotter"
  (deeper orange) the more people are free.
- **Best dates** — a ranked top-3 of the busiest slots, pinned near the top.
- **Hangout banner** — the locked-in hangout stays pinned at the very top. Tap 📌
  on any slot to lock it in (or change it).
- **Live updates** — when anyone marks availability, everyone's grid updates
  instantly (no refresh).

---

## Setup — step by step

You'll need [Node.js](https://nodejs.org) (v18+) installed. Total time: ~10 min.

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (free, GitHub login works).
2. Click **New project**. Give it a name (e.g. `pie-hangout`), set a database
   password (save it somewhere), pick a region near you, and create it.
3. Wait ~1 minute for it to finish provisioning.

### 2. Create the tables + security policies

1. In your project, open the **SQL Editor** (left sidebar) → **New query**.
2. Open [`supabase-setup.sql`](./supabase-setup.sql) from this repo, copy the
   **entire** contents, paste into the editor, and click **Run**.
3. You should see "Success". This creates both tables, the RLS policies that let
   the app read/write without a login, and enables realtime.

> **Why the RLS step matters:** Supabase turns on Row Level Security for new
> tables, which **silently blocks all reads and writes** until you add policies.
> If you skip the SQL above, the app will load but show no data and saving will
> fail. The SQL adds permissive "anyone can read/write" policies — perfectly fine
> for a small trusted group, but don't reuse this pattern for anything private.

### 3. Grab your keys

In the Supabase dashboard, open **Project Settings** (the gear icon, bottom-left):

- **Data API** tab → copy the **Project URL**
  (looks like `https://abcdxyz.supabase.co`).
- **API Keys** tab → copy the **`anon` / `public`** key (a long string).

> ⚠️ Use the **anon / public** key, **not** the `service_role` key. The anon key
> is safe in a frontend because the RLS policies control what it can do. The
> `service_role` key bypasses all security — never put it in this app.

### 4. Plug the keys into the app

1. In this project folder, copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste your two values:
   ```
   VITE_SUPABASE_URL=https://abcdxyz.supabase.co
   VITE_SUPABASE_ANON_KEY=your-long-anon-key
   ```
   (`.env` is gitignored, so your keys won't be committed.)

### 5. Run it locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). Pick a name, tap some
slots, and watch the grid light up. Open it in a second browser tab as a
different name to see live updates working.

---

## Deploy (free) — Vercel or Netlify

Push this project to a GitHub repo first, then pick one:

### Option A — Vercel

1. Go to [vercel.com](https://vercel.com), **Add New… → Project**, and import your
   GitHub repo.
2. Vercel auto-detects Vite (Build command `npm run build`, output `dist`).
3. Before deploying, open **Environment Variables** and add the same two keys:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
4. Click **Deploy**. You'll get a shareable URL like
   `https://pie-hangout.vercel.app` — that's the single link you send everyone.

### Option B — Netlify

1. Go to [netlify.com](https://netlify.com), **Add new site → Import an existing
   project**, and pick your repo.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Under **Site configuration → Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. Share the generated URL.

> After changing environment variables on either host, trigger a fresh deploy so
> the new values are baked into the build.

---

## Changing the friends list

Edit the `FRIENDS` array in [`src/constants.js`](./src/constants.js). The app
uses its length for the `count/N` badges automatically.

---

## Note: free-tier sleep + optional keep-alive

Supabase **free-tier projects pause after 7 days with no database activity**.
When paused, the first request wakes it with a **~30 second cold start** — the app
just takes a moment to load that one time, then it's fast again. For an active
friend group this rarely happens.

If you want to avoid it entirely, this repo includes an optional GitHub Actions
workflow, [`.github/workflows/keepalive.yml`](./.github/workflows/keepalive.yml),
that pings your database every 3 days. To turn it on, add two **repository
secrets** in GitHub (**Settings → Secrets and variables → Actions**):

- `SUPABASE_URL` = your Project URL
- `SUPABASE_ANON_KEY` = your anon key

It then runs automatically (and you can trigger it manually from the Actions tab).

---

Happy baking! 🥧
