# Deployment guide

## 1. Configure Supabase

1. Create a Supabase project and keep the project URL, publishable key, and project ref available locally.
2. Execute `supabase/migrations/202610250001_cloudvault.sql` in Supabase SQL Editor. Confirm the `vault-files` bucket is private and has a 25 MB per-object cap.
3. Enable email/password under Authentication providers. Configure the confirmation and password-reset email templates.
4. Under Auth URL Configuration, set the Site URL to `https://cloud-vault-vert.vercel.app`; add `https://cloud-vault-vert.vercel.app/**` and `http://localhost:5173/**` to allowed redirect URLs. The production Site URL and production redirect have been configured; add localhost only if you need local development.
5. Deploy `public-share-download` from a terminal on a machine with internet access. From the repository folder, run `npx supabase@latest login` (create a personal access token in Supabase Account → Access Tokens and enter it only in the local terminal prompt), then `npx supabase@latest link --project-ref jfbjbxapjupglhdrixvc`, then `npx supabase@latest functions deploy public-share-download --project-ref jfbjbxapjupglhdrixvc --use-api`. Do not paste the access token into chat or commit it. The function uses Supabase's server-side `SUPABASE_SERVICE_ROLE_KEY` injected by the platform; never put it in Vercel `VITE_` variables or frontend code. The function exposes only the file matched by a valid share token and returns a URL valid for 60 seconds. This function is not yet deployed.

## 2. Configure Vercel

1. Push this repository to a GitHub account, then import the repository in Vercel. This is complete for `sarahshaikh707/CloudVault`.
2. Select the Vite framework preset. Build command: `pnpm build`; output directory: `dist`; install command: `pnpm install`.
3. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SITE_URL` in Vercel Project Settings → Environment Variables. `VITE_SITE_URL` must be the final `https://...` origin. These two Supabase browser values are public identifiers/keys protected by RLS; never configure a service role key as a `VITE_` variable. These production variables are configured.
4. Deploy and open the provided Vercel URL. Add that exact origin to Supabase Auth's redirect URL allowlist. Production is live at `https://cloud-vault-vert.vercel.app` and its Auth redirect is configured.
5. Test registration, email confirmation, login, upload/download/delete, create a time-limited share, revoke it, and check the expired/revoked share route.

## Current deployment status (2026-10-26)

- Supabase project `jfbjbxapjupglhdrixvc` exists and is healthy in the Mumbai region.
- The SQL migration was run successfully in Supabase SQL Editor on 2026-10-25. It created the RLS-protected tables and private `vault-files` bucket.
- The source is pushed to `sarahshaikh707/CloudVault`, branch `main` (deployment source commit `dc8d3d988ee0b41e2fa11ea59175928a6956b476`).
- Vercel production deployment is Ready at `https://cloud-vault-vert.vercel.app`. Production Supabase URL, publishable key, and site URL are configured in Vercel. The public landing page, signup form, robots.txt, and sitemap.xml have been opened and verified.
- Supabase Auth Site URL and allowed production redirect are configured for the Vercel domain. The private storage bucket and migration are in place.
- Google Search Console URL-prefix property for `https://cloud-vault-vert.vercel.app/` has been verified using an HTML meta tag. Google accepted `sitemap.xml` with status Success and discovered 3 public pages. The home URL currently reports “Discovered - currently not indexed”; the live URL test/indexing request is still processing. Google controls crawl timing and indexing.
- Remaining provider setup: deploy the `public-share-download` Supabase Edge Function with the CLI. Until then, public share downloads are not complete. End-to-end signup, email confirmation, file operations, expiration/revocation, and cross-user isolation still need manual testing with two accounts.

Free plans may pause inactive projects or change quotas; check provider pricing and usage before launch. Vercel's Hobby terms restrict use to personal or non-commercial projects. Do not add billing or purchase a domain unless you choose to.

## 3. Confirm production behavior

- Confirm the homepage loads at the Vercel domain and the browser console shows no configuration errors. The homepage and signup form are confirmed reachable; account creation and cloud data operations have not yet been exercised.
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
