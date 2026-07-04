import { createClient } from '@supabase/supabase-js'

// These come from your .env file (see .env.example).
// In Vite, any variable prefixed with VITE_ is exposed to the browser.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// A friendly warning in the console if the keys are missing, so you're not
// left staring at a blank screen wondering why nothing loads.
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

if (!hasSupabaseConfig) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase keys are missing. Copy .env.example to .env and fill in ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.'
  )
}

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
