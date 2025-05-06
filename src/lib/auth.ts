import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  role?: string;
  name?: string;
  phone?: string;
}

// Função para registrar um novo usuário
export async function signUp(email: string, password: string, name: string, phone?: string) {
  try {
    // 1. Registrar o usuário no auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (!authData.user) throw new Error('Erro ao criar usuário');

    // 2. Inserir dados adicionais na tabela users
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          name,
          phone,
          role: 'user', // Papel padrão
        },
      ]);

    if (profileError) throw profileError;

    return { user: authData.user, error: null };
  } catch (error) {
    console.error('Erro no registro:', error);
    return { user: null, error };
  }
}

// Função para login
export async function signIn(email: string, password: string) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    // Buscar dados adicionais do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) throw userError;

    return {
      user: { ...authData.user, role: userData.role },
      error: null,
    };
  } catch (error) {
    console.error('Erro no login:', error);
    return { user: null, error };
  }
}

// Função para logout
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Função para verificar se o usuário está autenticado e obter seus dados
export async function getCurrentUser() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) return { user: null, error: null };

    try {
      // Buscar dados adicionais do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // Se encontrar o perfil, retorne com os dados completos
      if (!userError && userData) {
        return {
          user: { 
            ...user, 
            role: userData.role,
            name: userData.name,
            phone: userData.phone
          },
          error: null,
        };
      }
    } catch (profileError) {
      console.warn('Perfil não encontrado, retornando apenas dados básicos do usuário');
      // Continua com o fluxo para retornar o usuário base
    }

    // Se não encontrar o perfil ou ocorrer erro, retorna apenas os dados básicos
    return {
      user,
      error: null,
    };
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return { user: null, error };
  }
}

// Função para verificar se o usuário é admin
export function isAdmin(user: AuthUser | null) {
  return user?.role === 'admin';
}

// Função para atualizar o perfil do usuário
export async function updateProfile(userId: string, data: {
  name?: string;
  phone?: string;
}) {
  try {
    // Converte o campo name para first_name
    const updateData: any = {
      first_name: data.name,
      phone: data.phone
    };
    
    // Remove campos undefined
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    console.log('Atualizando perfil com dados:', updateData);
    
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Erro detalhado ao atualizar perfil:', error);
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { error };
  }
}

// Função para redefinir senha
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    return { error };
  }
}

// Função para atualizar senha
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { error };
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return { error };
  }
} 