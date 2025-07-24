import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
// You can get these from your Supabase dashboard at https://app.supabase.com
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
