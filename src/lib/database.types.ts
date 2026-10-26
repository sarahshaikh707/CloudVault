export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      files: { Row: { id: string; owner_id: string; original_name: string; storage_path: string; mime_type: string; size_bytes: number; created_at: string }; Insert: { id?: string; owner_id: string; original_name: string; storage_path: string; mime_type: string; size_bytes: number; created_at?: string }; Update: Partial<Database['public']['Tables']['files']['Insert']>; Relationships: [] }
      file_shares: { Row: { id: string; file_id: string; owner_id: string; token: string; expires_at: string | null; revoked_at: string | null; created_at: string }; Insert: never; Update: never; Relationships: [] }
      activity: { Row: { id: string; owner_id: string; file_id: string | null; action: string; details: Json; created_at: string }; Insert: { id?: string; owner_id: string; file_id?: string | null; action: string; details?: Json; created_at?: string }; Update: never; Relationships: [] }
    }
    Views: Record<string, never>
    Functions: { create_file_share: { Args: { p_file_id: string; p_expires_at: string | null }; Returns: string }; revoke_file_share: { Args: { p_share_id: string }; Returns: undefined } }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
