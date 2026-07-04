import { createClient } from '@supabase/supabase-js'

// These come from your .env file (see .env.example).
// In Vite, any variable prefixed with VITE_ is exposed to the browser.
const rawUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

// Be forgiving about how the URL was pasted. The Supabase client expects just
// the project origin (e.g. https://abc.supabase.co) and adds "/rest/v1" itself.
// If someone pastes a trailing slash or an extra "/rest/v1", strip it so we
// don't end up hitting ".../rest/v1/rest/v1/..." (which 404s on everything).
const supabaseUrl = rawUrl
  ? rawUrl
      .trim()
      .replace(/\/+$/, '') // drop trailing slashes
      .replace(/\/rest\/v1$/, '') // drop an accidental /rest/v1 suffix
  : rawUrl

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
