import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isMockMode =
  !supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project.supabase.co'

export const supabase =
  isMockMode || !supabaseUrl || !supabaseAnonKey
    ? null
    : createClient(supabaseUrl, supabaseAnonKey)
