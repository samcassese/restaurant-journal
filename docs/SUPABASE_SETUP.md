# Supabase setup for Restaurant Journal

Do these in order. Takes about 10 minutes.

---

## 1. Create a project

1. Go to **[supabase.com](https://supabase.com)** and sign in (or create an account).
2. Click **New project**.
3. Pick an organization (or create one).
4. Set **Name** (e.g. `restaurant-journal`) and a **Database password** (save it somewhere safe).
5. Choose a **Region** (pick one close to you or your users).
6. Click **Create new project** and wait for it to finish provisioning.

---

## 2. Run the database migrations

The app needs tables and security rules. Run the two migration files in the Supabase SQL Editor.

1. In the left sidebar, open **SQL Editor**.
2. Click **New query**.
3. Open this file in your project and copy **all** of its contents:
   - `supabase/migrations/20240312000001_initial_schema.sql`
4. Paste into the SQL Editor and click **Run** (or Ctrl+Enter).
5. You should see “Success. No rows returned.”
6. Click **New query** again.
7. Copy all of:
   - `supabase/migrations/20240312000002_rls_policies.sql`
8. Paste and click **Run** again.

Done. Your database now has `users`, `restaurants`, `reviews`, `review_photos`, `review_likes`, `comments`, `follows`, `want_to_try`, `notifications`, `restaurant_stats`, plus triggers and RLS policies.

---

## 3. Get your API keys (Project URL + anon key)

**Where to find them**

- Click the **gear icon** (⚙️) in the **left sidebar** → **API**.  
  **or**
- Left sidebar → **Project Settings** → **API**.  
  **or**
- Open the project, then go directly to the **API** settings (not Integrations):  
  **https://supabase.com/dashboard/project/YOUR_PROJECT_REF/settings/api**  
  Replace `YOUR_PROJECT_REF` with your project ref (the random string in the URL when you’re in the project, e.g. `.../project/abcdefghij/...`).  
  **Important:** the path must end with **/settings/api**. Do not use `/integrations/data_api/` — that’s a different page.

**If your dashboard looks different (e.g. “Integrations” instead of “Settings → API”):**  
Go to **Integrations** → **Data API** → **Overview**. The **“API URL”** shown there (e.g. `https://xxxxx.supabase.co`) is your Project URL — use it as `NEXT_PUBLIC_SUPABASE_URL`. You still need the **anon** key from **Settings → API** (gear → API) or from a “Keys” / “Credentials” section on the Data API page.

On the **API** settings page (or where your keys are shown) you should see:

- **Project URL** — a URL like `https://abcdefghijk.supabase.co`. Use this as `NEXT_PUBLIC_SUPABASE_URL`.
- **Project API keys** (or **API Keys** tab) — use the **anon public** key as `NEXT_PUBLIC_SUPABASE_ANON_KEY`.  
  If you only see “Publishable” and “Legacy” tabs, open **Legacy** and use the **anon** key.

**If you still don’t see Project URL**

- On the **project home** (dashboard), look for a **Connect** or **Get API keys** / **Project URL** card or button; it often links to the same API settings page.
- Make sure you’re inside a **project** (not the org list). The gear and “Project Settings” only show when a project is selected.

Put the values in `.env.local` (local) or in Vercel’s Environment Variables (production):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 4. Enable Google sign-in

1. In the sidebar, go to **Authentication** → **Providers**.
2. Find **Google** and turn it **ON**.
3. You need a Google OAuth client:
   - Open **[Google Cloud Console](https://console.cloud.google.com)** → your project (or create one) → **APIs & Services** → **Credentials**.
   - **Create credentials** → **OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized redirect URIs**: add  
     `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`  
     (Use your real Project URL from Supabase; the ref is the part before `.supabase.co`.)
   - Create and copy the **Client ID** and **Client secret**.
4. Back in Supabase (Google provider settings), paste **Client ID** and **Client secret**, then **Save**.

Users can now sign in with Google.

---

## 5. (Optional) Enable Apple sign-in

1. **Authentication** → **Providers** → **Apple** → turn **ON**.
2. You need an Apple Developer account and an App ID / Service ID configured for “Sign in with Apple.” In Apple Developer:
   - Create a **Services ID** and set the redirect URL to your Supabase callback:  
     `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
   - Create a **Key** for Sign in with Apple and note the **Key ID**, **Service ID**, **Team ID**, and **Private Key**.
3. In Supabase, fill in those Apple values and **Save**.

If you skip this, the app will still work; only Google sign-in will be available.

---

## 6. Set redirect URL for your app (when you deploy)

After you deploy (e.g. to Vercel), you need to tell Supabase your app URL:

1. **Authentication** → **URL Configuration**.
2. **Site URL**: set to your app (e.g. `https://your-app.vercel.app` or `http://localhost:3000` for local).
3. **Redirect URLs**: add your callback, e.g.  
   `https://your-app.vercel.app/auth/callback`  
   and for local:  
   `http://localhost:3000/auth/callback`

Save. No need to redeploy the app for this.

---

## 7. (Optional) Storage for review photos

To allow photo uploads with reviews:

1. In the sidebar, open **Storage**.
2. Click **New bucket**.
3. Name: `review-photos`.
4. Turn **Public bucket** ON if you want images readable by anyone (e.g. in the feed). Otherwise keep it off and control access with RLS.
5. Create the bucket.

The app’s schema already has a `review_photos` table; you’ll upload files to this bucket and store the returned URL in that table (or wire that in when you add the upload UI).

---

## Summary

| Step | What you did |
|------|-------------------------------|
| 1 | Created a Supabase project |
| 2 | Ran the two migration SQL files in SQL Editor |
| 3 | Copied Project URL and anon key into `.env.local` (and Vercel when you deploy) |
| 4 | Enabled Google and (optionally) Apple in Auth → Providers |
| 5 | (Optional) Configured Apple provider |
| 6 | Set Site URL and Redirect URLs in Auth → URL Configuration (after you have an app URL) |
| 7 | (Optional) Created `review-photos` storage bucket |

After step 4 (and 6 for production), you can run the app and sign in with Google.
