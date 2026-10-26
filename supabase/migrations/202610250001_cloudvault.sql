-- CloudVault initial schema. Run with the Supabase SQL editor or Supabase CLI.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  original_name text not null check (length(original_name) between 1 and 255),
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 26214400),
  created_at timestamptz not null default now(),
  constraint file_path_belongs_to_owner check (split_part(storage_path, '/', 1) = owner_id::text)
);
create index if not exists files_owner_created_idx on public.files(owner_id, created_at desc);
alter table public.files enable row level security;
create policy "Owners can read their files" on public.files for select to authenticated using (auth.uid() = owner_id);
create policy "Owners can add their files" on public.files for insert to authenticated with check (auth.uid() = owner_id);
create policy "Owners can delete their files" on public.files for delete to authenticated using (auth.uid() = owner_id);

create table if not exists public.file_shares (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references public.files(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint share_expiry_future check (expires_at is null or expires_at > created_at)
);
create index if not exists file_shares_owner_created_idx on public.file_shares(owner_id, created_at desc);
create index if not exists file_shares_token_idx on public.file_shares(token);
alter table public.file_shares enable row level security;
create policy "Owners can inspect their shares" on public.file_shares for select to authenticated using (auth.uid() = owner_id);

create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  file_id uuid references public.files(id) on delete set null,
  action text not null check (action in ('download', 'share_created')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activity_owner_created_idx on public.activity(owner_id, created_at desc);
alter table public.activity enable row level security;
create policy "Owners can read their activity" on public.activity for select to authenticated using (auth.uid() = owner_id);
create policy "Owners can add their activity" on public.activity for insert to authenticated with check (auth.uid() = owner_id);

create or replace function public.create_file_share(p_file_id uuid, p_expires_at timestamptz default null)
returns text language plpgsql security definer set search_path = '' as $$
declare v_owner uuid := auth.uid(); v_token text := encode(extensions.gen_random_bytes(32), 'hex');
begin
  if v_owner is null then raise exception 'Authentication required'; end if;
  if p_expires_at is not null and (p_expires_at <= now() or p_expires_at > now() + interval '1 year') then raise exception 'Expiry must be within the next year'; end if;
  if not exists(select 1 from public.files where id = p_file_id and owner_id = v_owner) then raise exception 'File not found'; end if;
  insert into public.file_shares(file_id, owner_id, token, expires_at) values(p_file_id, v_owner, v_token, p_expires_at);
  insert into public.activity(owner_id, file_id, action, details) values(v_owner, p_file_id, 'share_created', jsonb_build_object('expires_at', p_expires_at));
  return v_token;
end $$;
revoke all on function public.create_file_share(uuid, timestamptz) from public;
grant execute on function public.create_file_share(uuid, timestamptz) to authenticated;

create or replace function public.revoke_file_share(p_share_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.file_shares set revoked_at = now() where id = p_share_id and owner_id = auth.uid() and revoked_at is null;
  if not found then raise exception 'Share not found or already revoked'; end if;
end $$;
revoke all on function public.revoke_file_share(uuid) from public;
grant execute on function public.revoke_file_share(uuid) to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('vault-files', 'vault-files', false, 26214400, array[
  'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain',
  'image/png', 'image/jpeg', 'application/zip', 'application/x-zip-compressed'
]) on conflict (id) do update set public = false, file_size_limit = 26214400;
create policy "Users can upload to their own folder" on storage.objects for insert to authenticated
with check (bucket_id = 'vault-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users can read their own objects" on storage.objects for select to authenticated
using (bucket_id = 'vault-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users can delete their own objects" on storage.objects for delete to authenticated
using (bucket_id = 'vault-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
