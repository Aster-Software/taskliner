import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://huxaegzztkxgkvxqilmc.supabase.co'
const supabaseKey = import.meta.env.SUPABASE_API_SECRET

export const Supabase = createClient(supabaseUrl, supabaseKey);

