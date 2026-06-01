import { createClient } from '@supabase/supabase-js';

// Declaração de tipos global para que o TypeScript reconheça as variáveis do Vite no build
declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// SANITIZAÇÃO CRÍTICA: Se a URL terminar com o sufixo REST, remove-o para evitar erro 404 nas requisições do Supabase
if (supabaseUrl.endsWith('/rest/v1/')) {
  supabaseUrl = supabaseUrl.slice(0, -9);
} else if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.slice(0, -8);
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ Supabase URL ou Anon Key não configurados no arquivo .env.local!\n" +
    "O aplicativo funcionará no modo de demonstração usando LocalStorage."
  );
} else {
  // Alerta de formato de chave: Chaves do Supabase reais são JWTs longos começando com "eyJ"
  if (!supabaseAnonKey.startsWith('eyJ')) {
    console.error(
      "❌ ERRO DE CONFIGURAÇÃO DO SUPABASE:\n" +
      "A chave configurada (" + supabaseAnonKey.substring(0, 10) + "...) NÃO parece ser uma chave válida do Supabase!\n" +
      "As chaves corretas do Supabase são tokens JWT extremamente longos que começam obrigatoriamente com 'eyJ'.\n" +
      "Por favor, verifique suas chaves em Project Settings -> API no painel do Supabase."
    );
  }
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);
