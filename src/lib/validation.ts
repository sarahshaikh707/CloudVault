import { ALLOWED_TYPES, MAX_FILE_SIZE } from './supabase'

export function fileValidationError(file: Pick<File, 'type' | 'size'>): string | null {
  if (!ALLOWED_TYPES.has(file.type)) return 'File type is not supported.'
  if (file.size > MAX_FILE_SIZE) return 'Maximum file size is 25 MB.'
  if (file.size === 0) return 'Empty files cannot be uploaded.'
  return null
}
