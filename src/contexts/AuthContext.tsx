import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  supabase, 
  signIn, 
  signUp, 
  signOut, 
  resetPassword, 
  isUserAdmin,
  forceCreateUserRecord,
  initializeEnderecosTable,
  initializeSupabaseStorage
} from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const checkAdminStatus = async (email: string) => {
    if (!email) return false;
    
    try {
      console.log(`Verificando status de admin para email: ${email}`);
      const { data, error } = await isUserAdmin(email);
      if (error) {
        console.error('Erro na verificação de admin:', error);
      }
      console.log(`Resultado da verificação de admin para ${email}:`, data);
      return !!data;
    } catch (error) {
      console.error('Erro ao verificar status de administrador:', error);
      return false;
    }
  };

  // Função para inicializar o usuário uma vez que temos dados
  const initializeUser = async (currentUser: User | null) => {
    if (!currentUser || !currentUser.email) {
      setIsAdmin(false);
      setUser(currentUser);
      setLoading(false);
      return;
    }

    try {
      console.log('Inicializando usuário no AuthContext:', currentUser.email);
      
      // Verificar se é admin e criar registro se necessário
      const adminStatus = await checkAdminStatus(currentUser.email);
      console.log('Status de admin determinado:', adminStatus);
      
      // Só tentamos criar o registro do usuário se o usuário existir
      if (currentUser.id) {
        try {
          await forceCreateUserRecord(currentUser);
        } catch (err) {
          console.error('Erro ao criar registro de usuário, mas continuando mesmo assim:', err);
        }
      }
      
      // Atualizamos os states uma única vez após tudo concluído
      setIsAdmin(adminStatus);
      setUser(currentUser);
      
      console.log('Usuário inicializado com sucesso. Admin:', adminStatus);
    } catch (error) {
      console.error('Erro ao inicializar usuário:', error);
      // Mesmo com erro, definimos o usuário para permitir o funcionamento básico
      setUser(currentUser);
      setError('Erro ao carregar usuário.');
    } finally {
      // Sempre finalizamos o loading, mesmo com erro
      setLoading(false);
    }
  };

  useEffect(() => {
    // Evitar re-inicialização do provider
    if (initialized) return;
    
    setInitialized(true);
    
    // Inicializar o Storage do Supabase
    initializeSupabaseStorage().catch(error => {
      console.error('Erro ao inicializar Storage do Supabase, mas continuando mesmo assim:', error);
    });
    
    // Inicializar a tabela de endereços - uma única vez
    // Agora em um try/catch separado e não-bloqueante
    initializeEnderecosTable().catch(error => {
      console.error('Erro ao inicializar tabela de endereços, mas continuando mesmo assim:', error);
    });

    // Verificar se já existe uma sessão ativa
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        await initializeUser(data.session?.user || null);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setError('Falha ao carregar usuário.');
        setLoading(false);
      }
    };

    // Configurar listener para mudanças de autenticação
    let authListener: { subscription: { unsubscribe: () => void } } = { 
      subscription: { unsubscribe: () => {} } 
    };
    
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event);
          await initializeUser(session?.user || null);
        }
      );
      
      if (data) {
        authListener = data;
      }
    } catch (error) {
      console.error('Erro ao configurar listener de autenticação:', error);
      // Mesmo se falhar o listener, ainda tentamos carregar a sessão inicial
    }

    // Carregar dados iniciais
    checkSession();

    // Limpar listener quando o componente for desmontado
    return () => {
      try {
        authListener.subscription.unsubscribe();
      } catch (error) {
        console.error('Erro ao desinscrever listener:', error);
      }
    };
  }, [initialized]);

  const value = {
    user,
    loading,
    error,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 