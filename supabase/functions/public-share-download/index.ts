import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  try {
    const { token } = await request.json()
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
      return Response.json({ error: 'Invalid share link' }, { status: 404, headers: corsHeaders })
    }
    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
    const { data: share, error } = await admin.from('file_shares')
      .select('expires_at, revoked_at, files(original_name, storage_path, mime_type, size_bytes)')
      .eq('token', token).maybeSingle()
    if (error || !share || share.revoked_at || (share.expires_at && new Date(share.expires_at) <= new Date())) {
      return Response.json({ error: 'This share link is unavailable' }, { status: 404, headers: corsHeaders })
    }
    const file = Array.isArray(share.files) ? share.files[0] : share.files
    if (!file) return Response.json({ error: 'This file is unavailable' }, { status: 404, headers: corsHeaders })
    const { data: signed, error: signError } = await admin.storage.from('vault-files')
      .createSignedUrl(file.storage_path, 60, { download: file.original_name })
    if (signError || !signed) return Response.json({ error: 'Could not prepare download' }, { status: 500, headers: corsHeaders })
    return Response.json({ url: signed.signedUrl, name: file.original_name, size: file.size_bytes, type: file.mime_type }, {
      headers: { ...corsHeaders, 'Cache-Control': 'no-store' },
    })
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400, headers: corsHeaders })
  }
})
