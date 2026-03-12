# Restaurant Journal

A social restaurant tracking app: log places you’ve visited, rate them, and discover restaurants through friends (like Letterboxd for food).

## Features (MVP)

- **Auth**: Sign in with Google or Apple (Supabase Auth)
- **Restaurant search**: Google Places API (Western Washington–focused)
- **Reviews**: 1–10 rating, optional text, visit date, optional photos
- **Social**: Follow users, like and comment on reviews, activity feed
- **Want-to-try list**: Save restaurants to try later
- **Map**: Pins for visited and want-to-try restaurants (Google Maps)

## Tech stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **APIs**: Google Places API, Google Maps Platform

## Deploy (least work)

See **[QUICKSTART.md](./QUICKSTART.md)** — one link to import the repo to Vercel, paste 4 env vars, then add your app URL in Supabase. No second deploy needed.

---

## Setup (local dev)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example env and fill in your keys:

```bash
cp .env.local.example .env.local
```

- **Supabase**: Full walkthrough → **[docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)** (create project, run migrations, enable Google/Apple, get keys).
- **Google Cloud**: Create a project, enable **Places API (New)** and **Maps JavaScript API**. Create an API key and restrict it by HTTP referrer (and/or IP) for production. Put the key in `GOOGLE_PLACES_API_KEY` (server-only). For the map in the browser, use a separate key in `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (optional if you load the script yourself).
- **App URL** (optional): `NEXT_PUBLIC_APP_URL` for OAuth in dev (e.g. `http://localhost:3000`). On Vercel the app detects its own URL.

### 3. Database

Run the Supabase migrations in the SQL Editor (Supabase Dashboard → SQL Editor), in order:

1. `supabase/migrations/20240312000001_initial_schema.sql`
2. `supabase/migrations/20240312000002_rls_policies.sql`

Create a storage bucket for review photos:

- In Supabase Dashboard → Storage, create a bucket named `review-photos` and set it to **Public** if you want public read access for images.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/app/` – App Router pages and API routes
- `src/app/actions/` – Server actions (auth, reviews, follow, want-to-try)
- `src/components/` – Shared UI (nav, feed, map, buttons)
- `src/lib/` – Supabase clients, types, server-only helpers (e.g. Places)
- `supabase/migrations/` – SQL schema and RLS

## API keys and security

- Never commit `.env.local`. All secrets stay in env vars.
- Use `GOOGLE_PLACES_API_KEY` only on the server (API routes / server actions). Use `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` only for the map in the browser; restrict the key in Google Cloud (referrer/API restrictions).
- Supabase RLS policies enforce per-table access; the app uses the anon key and relies on RLS for security.

## Geographic scope (MVP)

Search and recommendations are tuned for **Western Washington** (Seattle, Tacoma, Bellevue, Shoreline, Lynnwood). You can change the default in `src/app/api/restaurants/search/route.ts`.

## Future (post-MVP)

- Direct messaging, collaborative lists, advanced recommendations
- Native iOS/Android apps, more regions
- Moderation: report review, block user (schema/UI placeholders can be added)
