import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Interface para itens de pedido
interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

// Interface para pedidos
interface Order {
  id: number;
  user_id: string;
  user_email: string;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
  order_number?: string;
  tracking_code?: string;
  estimated_delivery?: string | null;
}

// Mapeamento de cores para status
const statusColors: Record<string, string> = {
  'PENDING': 'bg-yellow-100 text-yellow-800',
  'PAID': 'bg-blue-100 text-blue-800',
  'PROCESSING': 'bg-blue-100 text-blue-800',
  'SHIPPED': 'bg-purple-100 text-purple-800',
  'DELIVERED': 'bg-green-100 text-green-800',
  'CANCELLED': 'bg-red-100 text-red-800'
};

// Mapeamento de rótulos para status
const statusLabels: Record<string, string> = {
  'PENDING': 'Pendente',
  'PAID': 'Pago',
  'PROCESSING': 'Processando',
  'SHIPPED': 'Enviado',
  'DELIVERED': 'Entregue',
  'CANCELLED': 'Cancelado'
};

const AdminPedidos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoVisualizacao, setTipoVisualizacao] = useState<'todos' | 'entrega'>('todos');
  
  // Buscar pedidos ao carregar o componente
  useEffect(() => {
    if (user) {
      buscarPedidos();
    }
  }, [user]);

  // Função para buscar pedidos
  const buscarPedidos = async () => {
    try {
      setLoading(true);
      
      // Buscar pedidos com todos os campos necessários - correção dos campos conforme schema
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('orders')
        .select(`
          id, 
          user_id, 
          status, 
          total_amount, 
          created_at, 
          order_number,
          customer_name,
          customer_email,
          customer_phone,
          tracking_code,
          shipping_address,
          payment_method,
          payment_status
        `)
        .order('created_at', { ascending: false });
      
      if (pedidosError) {
        console.error('Erro ao buscar pedidos:', pedidosError);
        return;
      }
      
      // Mapear status do banco de dados para a interface
      const mapearStatus = (statusOriginal: string) => {
        const mapeamento: Record<string, string> = {
          'aguardando_pagamento': 'PENDING',
          'pagamento_aprovado': 'PAID',
          'em_preparacao': 'PROCESSING',
          'enviado': 'SHIPPED',
          'entregue': 'DELIVERED',
          'cancelado': 'CANCELLED'
        };
        
        return mapeamento[statusOriginal] || statusOriginal.toUpperCase();
      };
      
      // Processar os pedidos e buscar itens
      if (pedidosData) {
        const pedidosProcessados = await Promise.all(pedidosData.map(async (pedido) => {
          // Buscar itens do pedido
          const { data: itensData } = await supabase
            .from('order_items')
            .select('id, product_id, product_name, quantity, unit_price, total_price')
            .eq('order_id', pedido.id);
          
          // Processar os itens  
          const itens = itensData?.map(item => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.unit_price || 0
          })) || [];
          
          // Retornar o pedido formatado
          return {
            id: pedido.id,
            user_id: pedido.user_id || '',
            user_email: pedido.customer_email || 'Email não disponível',
            status: mapearStatus(pedido.status || 'PENDING'),
            total: pedido.total_amount || 0,
            created_at: pedido.created_at,
            items: itens,
            order_number: pedido.order_number,
            tracking_code: pedido.tracking_code,
            estimated_delivery: null // Campo não está disponível, definindo como null
          };
        }));
        
        setPedidos(pedidosProcessados);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrar pedidos com base no tipo de visualização
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (tipoVisualizacao === 'entrega') {
      // Mostrar apenas pedidos em processo de entrega (pagos, processando ou enviados)
      return ['PAID', 'PROCESSING', 'SHIPPED'].includes(pedido.status);
    }
    return true; // Mostrar todos os pedidos
  });

  // Formatar data para exibição
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-light">
          Gerenciamento de <span className="text-rose-300">Pedidos</span>
        </h1>
        <button 
          onClick={() => navigate('/admin')}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          ← Voltar ao Painel
        </button>
      </div>
      
      {/* Botões de filtro */}
      <div className="flex mb-6 space-x-4">
        <button
          onClick={() => setTipoVisualizacao('todos')}
          className={`px-4 py-2 rounded-md ${
            tipoVisualizacao === 'todos' 
              ? 'bg-rose-300 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todos os Pedidos
        </button>
        <button
          onClick={() => setTipoVisualizacao('entrega')}
          className={`px-4 py-2 rounded-md ${
            tipoVisualizacao === 'entrega' 
              ? 'bg-rose-300 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Em Processo de Entrega
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-rose-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-8">
          {pedidosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum pedido encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    {tipoVisualizacao === 'entrega' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rastreio</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pedido.order_number || `#${pedido.id}`}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pedido.user_email}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatarData(pedido.created_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.total)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[pedido.status] || 'bg-gray-100'}`}>
                          {statusLabels[pedido.status] || pedido.status}
                        </span>
                      </td>
                      {tipoVisualizacao === 'entrega' && (
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pedido.tracking_code ? (
                            <div>
                              <div>Código: {pedido.tracking_code}</div>
                              {pedido.estimated_delivery && (
                                <div className="text-xs text-gray-400">
                                  Entrega: {formatarData(pedido.estimated_delivery)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Não disponível</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPedidos; 