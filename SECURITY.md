# Security model and precautions

- Supabase Auth manages passwords and sessions; this app never handles or stores plaintext passwords.
- `files`, `file_shares`, and `activity` enable row level security. File rows are scoped by `auth.uid()`; paths must begin with the owner UUID.
- The `vault-files` object bucket is private. Storage policies limit reads, inserts, and deletes to the authenticated owner's first path component.
- Client-side type/size checks improve feedback; Supabase Storage bucket constraints and the database size constraint enforce accepted types and the 25 MiB maximum at the service boundary.
- Browser configuration uses only the Supabase publishable/anon key. The share Edge Function uses the service key on the server and validates a 64-character random token, expiry, and revocation before generating a 60-second signed URL.
- Share tokens are bearer links. Anyone who receives one can download that one file while active. Do not share sensitive files using no-expiration links. Revoke links from Shared files.
- Signed URLs are bearer credentials until their 60-second expiry. Avoid posting them publicly; the share UI does not store or display them.
- RLS is not a malware scanner, antivirus, encryption policy you control, or backup system. Do not upload sensitive or regulated data for this academic demo.
- The frontend checks MIME types, which a client can spoof; the private bucket allowlist and size limit are defense in depth, not malware inspection.
- Configure email confirmation and password recovery redirects to only your local and production site origins.
- Keep `.env`, service-role keys, Supabase access tokens, and provider credentials out of Git. Rotate any secret accidentally exposed.
- Deletion removes the Storage object first and then the metadata row. If metadata removal fails, retry the delete from the dashboard; the absent object cannot be downloaded.
- Review Supabase logs and usage. Free service quotas and inactivity behavior can change; there is no configured alerting, backup retention, HA, or recovery objective in this project.
