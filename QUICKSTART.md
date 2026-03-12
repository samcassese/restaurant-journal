# Deploy in one go

Do these once. After that, every `git push` to `main` will auto-deploy (if you use the Vercel dashboard flow).

---

## 1. Get your keys (5 min)

**Supabase** (dashboard.supabase.com → your project → **Settings** → **API**)

- `NEXT_PUBLIC_SUPABASE_URL` — Project URL  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key  

**Google Cloud** (console.cloud.google.com → APIs & Services → Credentials)

- Create an API key. Enable **Places API (New)** and **Maps JavaScript API**.  
- `GOOGLE_PLACES_API_KEY` — server (search & place details)  
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — same key is fine for MVP; restrict it later by HTTP referrer.

Keep these handy for the next step.

---

## 2. Deploy to Vercel (2 min)

**Option A – Browser (easiest)**

1. Open: **https://vercel.com/new?repository-url=https://github.com/samcassese/restaurant-journal**
2. Log in with GitHub if needed. Click **Import**.
3. Before clicking **Deploy**, open **Environment Variables** and add:

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | (paste from Supabase) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (paste from Supabase) |
   | `GOOGLE_PLACES_API_KEY` | (paste from Google) |
   | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | (paste same key for now) |

4. Click **Deploy**. Wait for the build to finish.
5. Copy your app URL (e.g. `https://restaurant-journal-xxx.vercel.app`).

**Option B – Terminal**

```bash
npm install
npx vercel
```

When prompted, log in and link the repo. Then add the same env vars above:

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add GOOGLE_PLACES_API_KEY
npx vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

(paste each value when prompted). Then:

```bash
npm run deploy
```

Copy the URL Vercel prints.

---

## 3. Tell Supabase your app URL (1 min)

Supabase → **Authentication** → **URL Configuration**:

- **Site URL**: `https://YOUR-VERCEL-URL.vercel.app` (the URL you copied)
- **Redirect URLs**: add `https://YOUR-VERCEL-URL.vercel.app/auth/callback`

Save. No redeploy needed — the app already uses Vercel’s URL for OAuth.

---

## 4. Done

Open your Vercel URL. Sign in with Google (or Apple if configured in Supabase).  
Future pushes to `main` will deploy automatically (when using Option A / GitHub integration).
