# Deploying Restaurant Journal

## 1. Push to GitHub

Your repo is already connected to `https://github.com/samcassese/restaurant-journal`. From the project root:

```bash
git add .
git commit -m "Initial app: auth, feed, map, reviews, forest green UI"
git push -u origin main
```

If the remote branch was recreated or empty, you may need:

```bash
git push -u origin main --force
```

(Only use `--force` if the remote has no commits you need to keep.)

---

## 2. Host on Vercel (recommended for Next.js)

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub is easiest).
2. Click **Add New** → **Project** and import `samcassese/restaurant-journal`.
3. **Environment variables** — add these in the Vercel project settings (Settings → Environment Variables):

   | Name | Value | Notes |
   |------|--------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | From Supabase Dashboard → Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Same place |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Optional; for admin/server tasks |
   | `GOOGLE_PLACES_API_KEY` | Your Google Cloud API key | Server-only; never exposed to browser |
   | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Same or separate key for Maps JS | Only if you use the map; restrict by domain |
   | `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Set after first deploy; needed for OAuth redirects |

4. **Supabase Auth redirect**  
   In Supabase Dashboard → Authentication → URL Configuration, set:

   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: add `https://your-app.vercel.app/auth/callback`

5. Deploy: Vercel builds and deploys on every push to `main`.

---

## 3. Other hosts

- **Netlify**: Connect the same GitHub repo; build command `npm run build`, publish directory `.next` (or use the Next.js runtime; they support it).
- **Railway / Render**: Connect repo, set build to `npm install && npm run build`, start command `npm start`; add the same env vars.

---

## 4. After going live

1. Set `NEXT_PUBLIC_APP_URL` to your real URL.
2. In Google Cloud Console, restrict your API keys by HTTP referrer (e.g. `https://your-app.vercel.app/*`) so they aren’t used from other sites.
3. In Supabase, confirm Auth redirect URLs and Site URL match your production domain.
