import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PrivateRoute = ({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) => {
  const { user, loading, error, isAdmin } = useAuth();
  const [showLoading, setShowLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const navigate = useNavigate();

  console.log('PrivateRoute renderizado:', { 
    adminOnly, 
    isUserLoggedIn: !!user, 
    isAdmin, 
    loading, 
    userEmail: user?.email 
  });

  useEffect(() => {
    // Se o loading durar mais de 500ms, mostramos o indicador de loading
    // para evitar flashes rápidos de UI
    const timer = setTimeout(() => setShowLoading(true), 500);
    
    // Se o loading durar mais de 10 segundos, assumimos que há um problema
    // e permitimos o acesso mesmo assim para evitar bloqueio completo
    const timeoutTimer = setTimeout(() => setLoadingTimeout(true), 10000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timeoutTimer);
    };
  }, []);

  // Efeito para redirecionamento baseado no status do usuário e admin
  useEffect(() => {
    // Só executar quando não estiver carregando
    if (!loading) {
      if (adminOnly) {
        console.log('PrivateRoute: Checando rota admin para', user?.email, 'isAdmin:', isAdmin, 'rota:', window.location.pathname);
        
        // Se for uma rota admin e o usuário não for admin, redirecionar
        if (user && !isAdmin) {
          console.log('PrivateRoute: Usuário não é admin, redirecionando para /');
          navigate('/', { replace: true });
        } else {
          console.log('PrivateRoute: Acesso permitido à rota admin');
        }
      } else if (!user) {
        // Se não for uma rota admin e o usuário não estiver logado, redirecionar para login
        console.log('PrivateRoute: Usuário não está logado, redirecionando para /conta');
        navigate('/conta', { replace: true });
      } else {
        console.log('PrivateRoute: Acesso permitido à rota protegida para usuário logado');
      }
    }
  }, [user, isAdmin, loading, adminOnly, navigate]);

  // Se houver um erro no sistema de autenticação e o carregamento
  // estiver demorando demais, mostramos um alerta e permitimos acesso
  if ((loadingTimeout && loading) || error) {
    console.warn('Timeout de autenticação ou erro detectado, permitindo acesso temporário');
    
    // Se for uma rota de admin e estamos forçando acesso, não permitimos
    if (adminOnly) {
      return <Navigate to="/" replace />;
    }
    
    return (
      <>
        {error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p>Aviso: Ocorreu um problema no sistema de autenticação. Algumas funcionalidades podem estar limitadas.</p>
          </div>
        )}
        {children}
      </>
    );
  }

  // Se estiver carregando e ainda não passou tempo suficiente, não mostra nada
  if (loading && !showLoading) {
    return null;
  }

  // Se estiver carregando por mais de 500ms, mostra o loading
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin border-t-2 border-b-2 border-rose-300"></div>
      </div>
    );
  }

  // Verifica se o usuário está autenticado
  if (!user) {
    console.log(`Acesso negado - Usuário não autenticado`);
    return <Navigate to="/conta" replace />;
  }

  // Verifica se a rota é apenas para admin
  if (adminOnly && !isAdmin) {
    console.log(`Acesso negado à rota admin - Usuário: ${user?.email}, isAdmin: ${isAdmin}, rota: ${window.location.pathname}`);
    return <Navigate to="/" replace />;
  }

  // Se passou por todas as verificações, renderiza o conteúdo
  if (adminOnly) {
    console.log(`Acesso permitido à rota admin - Usuário: ${user?.email}, isAdmin: ${isAdmin}, rota: ${window.location.pathname}`);
  } else {
    console.log(`Acesso permitido à rota protegida - Usuário: ${user?.email}, rota: ${window.location.pathname}`);
  }
  return <>{children}</>;
}; 