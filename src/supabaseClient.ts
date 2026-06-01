import { createClient } from '@supabase/supabase-js';

const meta = import.meta as any;
const supabaseUrl = meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ Supabase URL ou Anon Key não configurados no arquivo .env.local!\n" +
    "O aplicativo funcionará no modo de demonstração usando LocalStorage."
  );
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);
