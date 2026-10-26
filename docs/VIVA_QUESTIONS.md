# CloudVault viva questions and answers

1. **What is CloudVault?** A web application for private cloud file storage and controlled file sharing.
2. **What does cloud computing mean here?** The frontend, identity, database, and file objects are hosted remotely and accessed over the internet.
3. **Why use Supabase?** It provides managed authentication, PostgreSQL, object storage, RLS, and serverless functions in one platform.
4. **What does Vercel do?** It hosts the built static frontend and routes SPA pages to the app entry point.
5. **Where are file bytes stored?** In a private Supabase Storage bucket named `vault-files`.
6. **Where are file names and sizes stored?** In the PostgreSQL `files` table.
7. **What is RLS?** Row Level Security lets PostgreSQL enforce which rows a database role can read or change.
8. **How does CloudVault isolate users?** Policies compare row ownership with `auth.uid()` and storage paths start with that user's UUID.
9. **Is the Supabase publishable key a secret?** It is intended for browser use; RLS and storage policies must protect data. The service role key is secret.
10. **How are passwords stored?** Supabase Auth manages password storage and verification; CloudVault does not keep plaintext passwords.
11. **How does upload work?** The browser uploads bytes to the private bucket, then inserts metadata under the authenticated user.
12. **What is the maximum file size?** 25 MiB per file in this project configuration.
13. **What file types are accepted?** PDF, DOCX, TXT, PNG, JPG, and ZIP MIME types.
14. **How does direct download work?** An authenticated user requests a short-lived signed URL for an owned object.
15. **How does public sharing work?** A random token is checked by an Edge Function, which makes a 60-second URL for only the corresponding file.
16. **How can a share be stopped?** The owner revokes it; the function then rejects its token.
17. **What does expiration do?** The server function rejects a share after its configured timestamp.
18. **Why is the storage bucket private?** It prevents anonymous access to all objects; access is granted only through policies or temporary signed URLs.
19. **What happens when a file is deleted?** The client removes the object first, then the owner-scoped metadata row; shares cascade with that row.
20. **What is a cloud database?** A database service hosted and operated remotely by a cloud provider.
21. **What is object storage?** A service that stores file-like binary objects under keys rather than relational rows.
22. **What are the project limitations?** 25 MB cap, no malware scanning or versioning, bearer share links, and free-tier availability limits.
23. **Does this project demonstrate auto-scaling?** No; it does not configure or verify autoscaling.
24. **Can Google indexing be guaranteed?** No. Search Console can request crawling, but Google decides whether and when to index or rank pages.
25. **What must be done before public deployment?** Configure Supabase, apply the migration, deploy the Edge Function, add Vercel environment variables, and test with separate users.
