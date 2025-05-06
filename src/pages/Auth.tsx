import React, { useState, useEffect, ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

// Interfaces para os componentes
interface CardProps {
  children: ReactNode;
  className?: string;
}

interface AuthProps {
  resetMode?: boolean;
}

interface ChildrenProps {
  children: ReactNode;
  className?: string;
}

interface LabelProps {
  htmlFor: string;
  children: ReactNode;
}

interface InputProps {
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

// Componentes inline simples
const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>{children}</div>
);

const CardHeader: React.FC<ChildrenProps> = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardTitle: React.FC<ChildrenProps> = ({ children }) => (
  <h3 className="text-xl font-semibold">{children}</h3>
);

const CardDescription: React.FC<ChildrenProps> = ({ children }) => (
  <p className="text-sm text-gray-500 mt-1">{children}</p>
);

const CardContent: React.FC<ChildrenProps> = ({ children }) => (
  <div className="px-6 py-4">{children}</div>
);

const CardFooter: React.FC<ChildrenProps> = ({ children }) => (
  <div className="px-6 py-4 border-t border-gray-200">{children}</div>
);

const Label: React.FC<LabelProps> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const Input: React.FC<InputProps> = ({ id, type = 'text', placeholder, value, onChange, required = false }) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
  />
);

const Auth: React.FC<AuthProps> = ({ resetMode: propResetMode }) => {
  const [searchParams] = useSearchParams();
  const resetMode = propResetMode || searchParams.get('reset') === 'true';
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<string>(resetMode ? 'resetPassword' : 'login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Função para forçar recarga e garantir que o estado esteja atualizado
  const recarregarPagina = (rota: string) => {
    console.log('Forçando recarga da página para:', rota);
    setTimeout(() => {
      window.location.href = rota;
    }, 100); // Pequeno atraso para garantir que o estado foi atualizado
  };

  // Se o usuário já estiver autenticado e não estiver no modo de redefinição,
  // redirecionar para a página de perfil
  useEffect(() => {
    if (user && !resetMode) {
      navigate('/perfil');
    }
  }, [user, resetMode, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const { data, error } = await signIn(email, password);
      if (error) throw error;
      
      setMessage({
        type: 'success',
        text: 'Login realizado com sucesso! Redirecionando...'
      });
      
      // Forçar recarga completa da página para garantir atualização do estado
      recarregarPagina('/perfil');
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Verifique suas credenciais e tente novamente'
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'As senhas não coincidem'
      });
      return;
    }

    try {
      const { data, error } = await signUp(email, password);
      
      if (error) throw error;
      
      setMessage({
        type: 'success',
        text: 'Conta criada com sucesso! Redirecionando...'
      });
      
      // Forçar recarga completa da página para garantir atualização do estado
      recarregarPagina('/perfil');
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Ocorreu um erro ao criar sua conta'
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!email) {
      setMessage({
        type: 'error',
        text: 'Por favor, informe seu e-mail para redefinir a senha'
      });
      return;
    }

    try {
      await resetPassword(email);
      setMessage({
        type: 'success',
        text: 'Verifique sua caixa de entrada para redefinir sua senha'
      });
      setTimeout(() => navigate('/conta'), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Não foi possível enviar o e-mail de redefinição'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin border-t-2 border-b-2 border-rose-300"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      {/* Tabs simples */}
      {!resetMode && (
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 ${activeTab === 'login' ? 'border-b-2 border-rose-300 text-rose-300' : 'text-gray-500'}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'registro' ? 'border-b-2 border-rose-300 text-rose-300' : 'text-gray-500'}`}
            onClick={() => setActiveTab('registro')}
          >
            Registro
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'resetPassword' ? 'border-b-2 border-rose-300 text-rose-300' : 'text-gray-500'}`}
            onClick={() => setActiveTab('resetPassword')}
          >
            Esqueci a senha
          </button>
        </div>
      )}

      {/* Mensagem de sucesso ou erro */}
      {message && (
        <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
          {message.text}
        </div>
      )}

      {/* Conteúdo com base na tab ativa */}
      {activeTab === 'login' && (
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Entre com sua conta para acessar seu perfil</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Entrar</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {activeTab === 'registro' && (
        <Card>
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>Crie uma nova conta para acessar a loja</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-signup">E-mail</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Senha</Label>
                <Input
                  id="password-signup"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Criar conta</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {activeTab === 'resetPassword' && (
        <Card>
          <CardHeader>
            <CardTitle>Recuperar senha</CardTitle>
            <CardDescription>Enviaremos um link para redefinir sua senha</CardDescription>
          </CardHeader>
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">E-mail</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full">Enviar link de recuperação</Button>
              {!resetMode && (
                <button 
                  type="button" 
                  className="text-sm text-champagne-500 hover:underline"
                  onClick={() => setActiveTab('login')}
                >
                  Voltar para o login
                </button>
              )}
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
};

export default Auth; 