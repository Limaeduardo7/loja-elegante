import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

interface AuthProps {
  resetMode?: boolean;
}

const Auth: React.FC<AuthProps> = ({ resetMode = false }) => {
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'reset'>(resetMode ? 'reset' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [resetData, setResetData] = useState({
    email: '',
  });

  // Redirecionar se o usuário já estiver logado
  useEffect(() => {
    if (user && !resetMode) {
      navigate('/conta/perfil');
    }
  }, [user, navigate, resetMode]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      const { email, password } = loginData;
      const { error } = await signIn(email, password);
      
      if (error) throw error;
      
      // Login bem-sucedido, o usuário será redirecionado pelo useEffect
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Falha ao fazer login. Verifique suas credenciais.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      const { name, email, password, confirmPassword } = registerData;
      
      if (password !== confirmPassword) {
        setMessage({
          type: 'error',
          text: 'As senhas não coincidem.'
        });
        return;
      }
      
      const { error } = await signUp(email, password);
      
      if (error) throw error;
      
      setMessage({
        type: 'success',
        text: 'Registro realizado com sucesso! Verifique seu e-mail para confirmar sua conta.'
      });
      
      // Limpar formulário
      setRegisterData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      
      // Voltar para a aba de login
      setActiveTab('login');
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Falha ao criar conta. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      const { email } = resetData;
      const { error } = await resetPassword(email);
      
      if (error) throw error;
      
      setMessage({
        type: 'success',
        text: 'E-mail de redefinição enviado. Verifique sua caixa de entrada.'
      });
      
      // Limpar formulário
      setResetData({
        email: '',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Falha ao enviar e-mail de redefinição.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 pb-16 pt-28 md:pt-32">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-gold-500 transition-colors">
            Início
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Minha Conta</span>
        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light mb-6 text-gray-900">
            Minha <span className="text-gold-500">Conta</span>
          </h1>
          <p className="max-w-3xl mx-auto text-gray-600 font-light leading-relaxed">
            {activeTab === 'login' && 'Faça login para acessar sua conta e acompanhar seus pedidos.'}
            {activeTab === 'register' && 'Crie sua conta para uma experiência personalizada e exclusiva.'}
            {activeTab === 'reset' && 'Informe seu e-mail para redefinir sua senha.'}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Abas */}
          {!resetMode && (
            <div className="flex border-b border-gray-200 mb-8">
              <button
                className={`flex-1 py-4 font-light text-center border-b-2 transition-colors ${
                  activeTab === 'login'
                    ? 'border-gold-500 text-gold-500'
                    : 'border-transparent text-gray-600 hover:text-gold-400'
                }`}
                onClick={() => setActiveTab('login')}
              >
                Entrar
              </button>
              <button
                className={`flex-1 py-4 font-light text-center border-b-2 transition-colors ${
                  activeTab === 'register'
                    ? 'border-gold-500 text-gold-500'
                    : 'border-transparent text-gray-600 hover:text-gold-400'
                }`}
                onClick={() => setActiveTab('register')}
              >
                Criar Conta
              </button>
            </div>
          )}

          {/* Mensagens */}
          {message && (
            <div
              className={`p-4 mb-6 rounded-md ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Formulário de Login */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                    className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                    placeholder="seu.email@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <button
                    type="button"
                    className="text-sm text-gold-500 hover:text-gold-600 transition-colors"
                    onClick={() => setActiveTab('reset')}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    className="w-full pl-10 pr-10 px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="py-4 px-6 bg-gold-500 hover:bg-gold-600 text-white text-base font-light tracking-wide w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Entrar <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          )}

          {/* Formulário de Registro */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    required
                    className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                    className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                    placeholder="seu.email@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="register-password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                    className="w-full pl-10 pr-10 px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                    placeholder="********"
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">A senha deve ter pelo menos 6 caracteres.</p>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirm-password"
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                    className="w-full pl-10 pr-10 px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                    placeholder="********"
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="py-4 px-6 bg-gold-500 hover:bg-gold-600 text-white text-base font-light tracking-wide w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Criando conta...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Criar Conta <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Ao criar uma conta, você concorda com nossos{' '}
                <a href="#" className="text-gold-500 hover:underline">
                  Termos de Serviço
                </a>{' '}
                e{' '}
                <a href="#" className="text-gold-500 hover:underline">
                  Política de Privacidade
                </a>
                .
              </p>
            </form>
          )}

          {/* Formulário de Recuperação de Senha */}
          {activeTab === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-6">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="reset-email"
                    name="email"
                    value={resetData.email}
                    onChange={handleResetChange}
                    required
                    className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                    placeholder="seu.email@exemplo.com"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="py-4 px-6 bg-gold-500 hover:bg-gold-600 text-white text-base font-light tracking-wide w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Enviar link de recuperação <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>

              {!resetMode && (
                <div className="text-center">
                  <button
                    type="button"
                    className="text-gold-500 hover:underline text-sm"
                    onClick={() => setActiveTab('login')}
                  >
                    Voltar para o login
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth; 