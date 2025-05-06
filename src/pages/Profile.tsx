import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { updateProfile } from '../lib/auth';
import { setUserAsAdmin } from '../lib/supabase';

interface UserProfile extends User {
  role?: string;
  name?: string;
  phone?: string;
}

interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zip_code: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  product_name: string;
  product: {
    name: string;
  };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    size: string;
    color: string;
  }>;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, signOut, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'orders'>('info');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  console.log('Profile - Status do usuário:', { 
    email: authUser?.email, 
    isAdmin,
    authenticated: !!authUser 
  });

  // Redirecionar imediatamente se for admin
  useEffect(() => {
    // Verificação dupla para garantir redirecionamento
    if (isAdmin) {
      console.log('Usuário é admin, redirecionando para /admin a partir do perfil');
      window.location.href = '/admin'; // Forçar recarga completa para garantir
    }
  }, [isAdmin]);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      if (!authUser) {
        navigate('/conta');
        return;
      }

      // Buscar dados completos do usuário diretamente da tabela users
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError) {
        console.error('Erro ao buscar perfil do usuário:', userError);
        // Continua mesmo com erro, usando dados básicos do authUser
      }

      // Se temos dados do perfil, usamos eles, senão usamos o authUser básico
      if (userProfile) {
        setUser({
          ...authUser,
          name: userProfile.first_name || '',  // Usamos first_name como name
          phone: userProfile.phone || ''
        });
        
        setFormData({
          name: userProfile.first_name || '',  // Usamos first_name como name
          phone: userProfile.phone || ''
        });
      } else {
        // Fallback para dados básicos
        setUser(authUser as UserProfile);
        setFormData({
          name: (authUser as any).first_name || '',
          phone: (authUser as any).phone || ''
        });
      }

      try {
        // Carregar endereços
        const { data: addressesData } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', authUser.id);
        setAddresses(addressesData || []);
      } catch (error) {
        console.error('Erro ao carregar endereços:', error);
        setAddresses([]);
      }

      try {
        // Versão otimizada - carregando pedidos e seus itens em consultas eficientes
        // 1. Buscar todos os pedidos do usuário
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            total_amount,
            created_at
          `)
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        
        if (!ordersData || ordersData.length === 0) {
          setOrders([]);
          setIsLoading(false);
          return;
        }
        
        // 2. Buscar todos os itens de todos os pedidos de uma vez só
        const orderIds = ordersData.map(order => order.id);
        const { data: allOrderItems, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            order_id,
            quantity,
            price,
            size,
            color,
            product_id,
            products (
              name
            )
          `)
          .in('order_id', orderIds);

        if (itemsError) throw itemsError;
        
        // 3. Organizar os itens por pedido
        const formattedOrders = ordersData.map(order => {
          const orderItems = allOrderItems
            ? allOrderItems.filter(item => item.order_id === order.id)
            : [];
            
          return {
            ...order,
            items: orderItems.map(item => ({
              product_name: item.products?.[0]?.name || 'Produto',
              quantity: item.quantity || 1,
              price: item.price || 0,
              size: item.size || 'Único',
              color: item.color || 'Padrão'
            }))
          };
        });

        setOrders(formattedOrders);
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        setOrders([]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setIsLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    // Mostrar feedback visual de que está salvando
    const submitButton = (e.target as HTMLFormElement).querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Salvando...';
    submitButton.disabled = true;

    try {
      console.log('Enviando dados para atualização:', {
        name: formData.name,
        phone: formData.phone
      });
      
      const { error } = await updateProfile(user.id, {
        name: formData.name,
        phone: formData.phone
      });
        
      if (error) throw error;
      
      // Atualiza o estado do usuário localmente
      setUser({
        ...user,
        name: formData.name,
        phone: formData.phone
      });
      
      // Mostrar feedback visual de sucesso
      alert('Perfil atualizado com sucesso!');
      
      // Recarregar dados para garantir sincronização
      loadUserData();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      // Restaurar o estado do botão
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  }

  async function handleSignOut() {
    try {
      const { error } = await signOut();
      if (error) throw error;
      navigate('/conta');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout. Tente novamente.');
    }
  }
  
  async function forceSetAsAdmin() {
    if (!authUser?.email) return;
    
    try {
      const result = await setUserAsAdmin(authUser.email);
      if (result.success) {
        alert('Você foi promovido a administrador. Por favor, faça login novamente para aplicar as mudanças.');
        await signOut();
        navigate('/conta');
      } else {
        alert('Erro ao definir como administrador: ' + (result.error ? String(result.error) : 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao definir como admin:', error);
      alert('Erro ao promover para administrador.');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-champagne-500 text-lg">Carregando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-white rounded-lg shadow-md border border-gray-100">
          {/* Cabeçalho */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h1 className="text-3xl font-light text-gray-900">Minha <span className="text-champagne-500">Conta</span></h1>
          </div>

          {/* Navegação */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'info', label: 'Informações Pessoais' },
                { id: 'addresses', label: 'Endereços' },
                { id: 'orders', label: 'Pedidos' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`
                    px-6 py-4 text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'border-b-2 border-rose-300 text-rose-300'
                      : 'text-gray-500 hover:text-champagne-400 hover:border-champagne-200'}
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Conteúdo */}
          <div className="p-8">
            {activeTab === 'info' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-champagne-500 focus:border-transparent outline-none transition-all"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="block w-full px-4 py-3 border border-gray-200 rounded-md bg-gray-50"
                  />
                  <p className="mt-1 text-xs text-gray-500">Seu email não pode ser alterado</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-champagne-500 focus:border-transparent outline-none transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="flex justify-between pt-4">
                  <button
                    type="submit"
                    className="py-4 px-8 bg-rose-300 hover:bg-rose-400 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Salvar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="py-3 px-6 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors"
                  >
                    Sair da Conta
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Você ainda não possui endereços cadastrados</p>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-5 hover:border-champagne-200 transition-colors">
                      <p className="font-medium mb-1">{address.street}, {address.number}</p>
                      {address.complement && <p className="text-gray-500 mb-1">{address.complement}</p>}
                      <p className="text-gray-500 mb-1">
                        {address.district} - {address.city}/{address.state}
                      </p>
                      <p className="text-gray-500">CEP: {address.zip_code}</p>
                    </div>
                  ))
                )}
                <div className="text-center mt-6">
                  <button
                    onClick={() => navigate('/endereco/novo')}
                    className="py-4 px-8 bg-rose-300 hover:bg-rose-400 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Adicionar Novo Endereço
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Você ainda não realizou nenhum pedido</p>
                    <button
                      onClick={() => navigate('/colecao')}
                      className="py-4 px-8 bg-rose-300 hover:bg-rose-400 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      Ver Produtos
                    </button>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-5 hover:border-champagne-200 transition-colors">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="font-medium">Pedido #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`
                          px-3 py-1 text-sm rounded-full
                          ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                             order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                             'bg-champagne-100 text-champagne-800'}
                        `}>
                          {order.status === 'PENDING' ? 'Pendente' :
                           order.status === 'PAID' ? 'Pago' :
                           order.status === 'PROCESSING' ? 'Processando' :
                           order.status === 'SHIPPED' ? 'Enviado' :
                           order.status === 'DELIVERED' ? 'Entregue' :
                           order.status === 'CANCELLED' ? 'Cancelado' : order.status}
                        </span>
                      </div>
                      <div className="space-y-2 border-t border-b border-gray-100 py-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.product_name} - {item.size}/{item.color}</span>
                            <span>{item.quantity}x R$ {item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-right">
                        <p className="text-lg font-medium text-champagne-600">
                          Total: R$ {order.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-100 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Opções avançadas</h2>
            <button 
              onClick={handleSignOut}
              className="w-full md:w-auto px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors mb-4"
            >
              Sair da conta
            </button>
            
            {/* Botão de depuração para forçar admin - REMOVER EM PRODUÇÃO */}
            {authUser?.email && 
              ["tatiane.assessoria@gmail.com", "nasklima@gmail.com", "grupomeraki7@gmail.com"].includes(authUser.email) && 
              !isAdmin && (
              <button 
                onClick={forceSetAsAdmin}
                className="w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ml-0 md:ml-4"
              >
                Forçar Permissão Admin
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 