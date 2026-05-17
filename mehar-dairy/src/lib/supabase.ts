import { createClient } from '@supabase/supabase-js'
import { mockSupabase } from './mockSupabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const IS_DEMO_MODE = !supabaseUrl || supabaseUrl === 'https://your-project.supabase.co'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = IS_DEMO_MODE
  ? mockSupabase
  : createClient(supabaseUrl!, supabaseAnonKey!)
