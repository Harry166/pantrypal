import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Log to help debug
console.log('Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl,
  env: import.meta.env
})

let supabaseClient

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Auth will not work.')
  // Create a dummy client that will fail gracefully
  const dummyUrl = 'https://placeholder.supabase.co'
  const dummyKey = 'placeholder-key'
  supabaseClient = createClient(dummyUrl, dummyKey)
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseClient
