import { createClient } from '@supabase/supabase-js';

/*
 * Configuração do Supabase
 *
 * Em um ambiente de produção, estas chaves devem ser obtidas de variáveis de ambiente.
 * Para configurar no Supabase:
 * 1. Crie uma conta em https://supabase.com
 * 2. Crie um novo projeto
 * 3. Vá para Settings > API e copie a URL e a anon key
 * 4. No arquivo .env.local, defina:
 *    VITE_SUPABASE_URL=sua_url
 *    VITE_SUPABASE_ANON_KEY=sua_chave_anônima
 * 
 * IMPORTANTE: Para testar localmente, você pode substituir os valores abaixo
 * pelas suas credenciais do Supabase, mas NUNCA envie estas chaves para o repositório.
 */

// Idealmente, essas variáveis devem vir de um arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sua-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anonima';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções de autenticação
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/atualizar-senha`,
  });
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
}; 