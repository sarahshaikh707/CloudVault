# Deployment guide

## 1. Configure Supabase

1. Create a Supabase project and keep the project URL, publishable key, and project ref available locally.
2. Execute `supabase/migrations/202610250001_cloudvault.sql` in Supabase SQL Editor. Confirm the `vault-files` bucket is private and has a 25 MB per-object cap.
3. Enable email/password under Authentication providers. Configure the confirmation and password-reset email templates.
4. Under Auth URL Configuration, add the deployed site URL and `http://localhost:5173` as allowed redirect URLs.
5. Install the Supabase CLI, authenticate, link the project, and deploy `public-share-download`. Keep the service role key in Supabase's server-side function secrets only. The hosted function uses a service key because share visitors are anonymous; it exposes only one matching file and returns a URL valid for 60 seconds.

## 2. Configure Vercel

1. Push this repository to a GitHub account, then import the repository in Vercel.
2. Select the Vite framework preset. Build command: `pnpm build`; output directory: `dist`; install command: `pnpm install`.
3. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SITE_URL` in Vercel Project Settings → Environment Variables. `VITE_SITE_URL` must be the final `https://...` origin. These two Supabase browser values are public identifiers/keys protected by RLS; never configure a service role key as a `VITE_` variable.
4. Deploy and open the provided Vercel URL. Add that exact origin to Supabase Auth's redirect URL allowlist.
5. Test registration, email confirmation, login, upload/download/delete, create a time-limited share, revoke it, and check the expired/revoked share route.

No provider account was connected for this task, so no cloud resource or deployment has been created yet. Free plans may pause inactive projects or change quotas; check provider pricing and usage before launch. Vercel's current Hobby terms restrict use to personal or non-commercial projects. Do not add billing or purchase a domain unless you choose to.

## 3. Confirm production behavior

- Confirm the homepage loads at the Vercel domain and the browser console shows no configuration errors.
- Create two test accounts. Verify each account only lists its own files and cannot retrieve another account's file object path.
- Confirm a share works in a signed-out/private browser and that revocation/expiration makes the URL unusable.
- Test mobile and desktop widths.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before final submission.

## 4. Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console) and add the deployed URL-prefix property.
2. Verify by the HTML meta tag or HTML file method. For a DNS verification method, add the record at the domain provider; do not purchase a domain just for this project.
3. Confirm `https://YOUR_DEPLOYED_ORIGIN/robots.txt` references the sitemap and `https://YOUR_DEPLOYED_ORIGIN/sitemap.xml` lists only the public home, About, and Help routes.
4. In Search Console → Sitemaps, submit `sitemap.xml`.
5. Use URL Inspection for the public home page, then select Request indexing if Google reports it is eligible.
6. Check Page indexing and URL Inspection later for crawl/index status. Fix robots blocks, canonical mismatches, server errors, or noindex tags if reported.

Search indexing and ranking are controlled by Google and cannot be guaranteed. Authenticated dashboard and share URLs are excluded from the sitemap; private files and signed URLs are never listed.
