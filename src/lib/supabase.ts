import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const configured = Boolean(url && key && !url.includes('YOUR_PROJECT'))
export const supabase = createClient<Database>(url || 'https://placeholder.supabase.co', key || 'placeholder-anon-key')
export const BUCKET = 'vault-files'
export const MAX_FILE_SIZE = 25 * 1024 * 1024
export const ALLOWED_TYPES = new Set([
  'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain',
  'image/png', 'image/jpeg', 'application/zip', 'application/x-zip-compressed',
])
