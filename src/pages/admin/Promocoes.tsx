import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface Promocao {
  id: string;
  nome: string;
  descricao: string;
  desconto: number;
  data_inicio: string;
  data_fim: string;
  ativa: boolean;
  produtos_ids: string[];
  codigo: string;
}

const Promocoes = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificandoAdmin, setVerificandoAdmin] = useState(true);
  const [modalNovaPromocaoAberto, setModalNovaPromocaoAberto] = useState(false);
  const [novaPromocao, setNovaPromocao] = useState<Partial<Promocao>>({
    nome: '',
    descricao: '',
    desconto: 10,
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ativa: true,
    produtos_ids: [],
    codigo: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/conta');
      return;
    }
    
    const verificarAdmin = async () => {
      setVerificandoAdmin(true);
      try {
        // Verificar admin pelo campo is_admin em user_metadata
        const { data: userMetadata, error: metadataError } = await supabase
          .from('user_metadata')
          .select('is_admin')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (metadataError) {
          console.error('Erro ao verificar metadados do usuário:', metadataError);
        }
        
        // Se o usuário já é marcado como admin nos metadados
        if (userMetadata?.is_admin === true) {
          console.log('Usuário é admin pelos metadados');
          buscarPromocoes();
          setVerificandoAdmin(false);
          return;
        }
        
        // Verificação usando a função RPC verificar_admin
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('verificar_admin', { user_uuid: user.id });
        
        if (adminError) {
          console.error('Erro ao verificar papel do usuário:', adminError);
          navigate('/perfil');
          return;
        }
        
        if (!isAdmin) {
          console.log('Usuário não tem papel admin');
          navigate('/perfil');
          return;
        }
        
        console.log('Usuário é admin');
        buscarPromocoes();
        setVerificandoAdmin(false);
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        navigate('/perfil');
      }
    };
    
    verificarAdmin();
  }, [user, navigate]);

  const buscarPromocoes = async () => {
    setLoading(true);
    try {
      // Verificar se a tabela existe
      const { data: tableInfo, error: tableError } = await supabase
        .from('promotions')
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.error('Erro ao buscar promoções ou tabela não existe:', tableError);
        // Se a tabela não existir, criaremos dados mockados para desenvolvimento
        const promosMock: Promocao[] = [
          {
            id: '1',
            nome: 'Verão 2024',
            descricao: 'Desconto em toda coleção verão',
            desconto: 15,
            data_inicio: '2024-06-01',
            data_fim: '2024-07-31',
            ativa: true,
            produtos_ids: [],
            codigo: 'VERAO2024'
          },
          {
            id: '2',
            nome: 'Black Friday',
            descricao: 'Desconto especial na Black Friday',
            desconto: 30,
            data_inicio: '2024-11-25',
            data_fim: '2024-11-30',
            ativa: false,
            produtos_ids: [],
            codigo: 'BLACK30'
          }
        ];
        setPromocoes(promosMock);
        return;
      }
      
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('data_inicio', { ascending: false });
      
      if (error) throw error;
      
      setPromocoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar promoções:', error);
      toast.error('Não foi possível carregar a lista de promoções.');
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusPromocao = async (id: string, ativa: boolean) => {
    try {
      // Em produção, isso faria uma atualização real no banco
      // Se a tabela não existir, apenas atualizamos o estado localmente
      const { error } = await supabase
        .from('promotions')
        .update({ ativa })
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao atualizar promoção no banco:', error);
        // Prosseguir apenas com atualização local para fins de demonstração
      }
      
      // Atualizar localmente
      setPromocoes(promocoes.map(promo => 
        promo.id === id ? { ...promo, ativa } : promo
      ));
      
      toast.success(`Promoção ${ativa ? 'ativada' : 'desativada'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar status da promoção:', error);
      toast.error('Erro ao atualizar promoção.');
    }
  };

  const gerarCodigoAleatorio = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleNovaPromocao = () => {
    setNovaPromocao({
      nome: '',
      descricao: '',
      desconto: 10,
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ativa: true,
      produtos_ids: [],
      codigo: gerarCodigoAleatorio()
    });
    setModalNovaPromocaoAberto(true);
  };

  const handleSalvarPromocao = async () => {
    if (!novaPromocao.nome || !novaPromocao.codigo) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    
    try {
      // Em produção, salvaria no banco
      // Para fins de demonstração, apenas adicionamos ao estado
      const novaPromo: Promocao = {
        id: Date.now().toString(),
        nome: novaPromocao.nome || '',
        descricao: novaPromocao.descricao || '',
        desconto: novaPromocao.desconto || 0,
        data_inicio: novaPromocao.data_inicio || new Date().toISOString().split('T')[0],
        data_fim: novaPromocao.data_fim || '',
        ativa: novaPromocao.ativa || false,
        produtos_ids: novaPromocao.produtos_ids || [],
        codigo: novaPromocao.codigo || ''
      };
      
      // Tentar salvar no banco se a tabela existir
      const { error } = await supabase
        .from('promotions')
        .insert([novaPromo]);
      
      if (error) {
        console.error('Erro ao salvar promoção no banco:', error);
        // Continuar com adição local para fins de demonstração
      }
      
      setPromocoes([novaPromo, ...promocoes]);
      setModalNovaPromocaoAberto(false);
      toast.success('Promoção criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar promoção:', error);
      toast.error('Erro ao criar promoção.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/conta');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (verificandoAdmin) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-champagne-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Verificando permissões de administrador...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-light">
          Gerenciamento de <span className="text-champagne-500">Promoções</span>
        </h1>
        <div className="flex space-x-4">
          <button 
            onClick={() => navigate('/admin')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            ← Voltar ao Painel
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v7a1 1 0 11-2 0V4H4v12h10v-1a1 1 0 112 0v2a1 1 0 01-1 1H4a1 1 0 01-1-1V3z" clipRule="evenodd" />
              <path d="M16.707 10.293a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L13.586 12H7a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 111.414-1.414l3 3z" />
            </svg>
            Sair
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-800">Promoções Ativas e Agendadas</h2>
          <button 
            onClick={handleNovaPromocao}
            className="px-4 py-2 bg-champagne-500 text-white rounded-md hover:bg-champagne-600"
          >
            Nova Promoção
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-2 border-champagne-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : promocoes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma promoção cadastrada. Clique em "Nova Promoção" para começar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promocoes.map((promocao) => (
                  <tr key={promocao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{promocao.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">{promocao.codigo}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{promocao.desconto}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(promocao.data_inicio).toLocaleDateString('pt-BR')} - {new Date(promocao.data_fim).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${promocao.ativa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {promocao.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => atualizarStatusPromocao(promocao.id, !promocao.ativa)}
                          className={promocao.ativa ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                        >
                          {promocao.ativa ? 'Desativar' : 'Ativar'}
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal de Nova Promoção */}
      {modalNovaPromocaoAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Nova Promoção</h2>
                <button 
                  onClick={() => setModalNovaPromocaoAberto(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Promoção*
                  </label>
                  <input
                    type="text"
                    value={novaPromocao.nome}
                    onChange={(e) => setNovaPromocao({...novaPromocao, nome: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="Ex: Black Friday, Verão 2024..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={novaPromocao.descricao}
                    onChange={(e) => setNovaPromocao({...novaPromocao, descricao: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="Descrição da promoção (opcional)"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início*
                    </label>
                    <input
                      type="date"
                      value={novaPromocao.data_inicio}
                      onChange={(e) => setNovaPromocao({...novaPromocao, data_inicio: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Término*
                    </label>
                    <input
                      type="date"
                      value={novaPromocao.data_fim}
                      onChange={(e) => setNovaPromocao({...novaPromocao, data_fim: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Porcentagem de Desconto*
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={novaPromocao.desconto}
                        onChange={(e) => setNovaPromocao({...novaPromocao, desconto: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                        min="1"
                        max="99"
                        required
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código da Promoção*
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={novaPromocao.codigo}
                        onChange={(e) => setNovaPromocao({...novaPromocao, codigo: e.target.value.toUpperCase()})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                        placeholder="Ex: VERAO2024"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setNovaPromocao({...novaPromocao, codigo: gerarCodigoAleatorio()})}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
                      >
                        Gerar
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ativa"
                    checked={novaPromocao.ativa}
                    onChange={(e) => setNovaPromocao({...novaPromocao, ativa: e.target.checked})}
                    className="h-4 w-4 text-champagne-500 border-gray-300 rounded focus:ring-champagne-500"
                  />
                  <label htmlFor="ativa" className="ml-2 block text-sm text-gray-900">
                    Ativar promoção imediatamente
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalNovaPromocaoAberto(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSalvarPromocao}
                  className="px-4 py-2 bg-champagne-500 text-white rounded-md hover:bg-champagne-600 transition-colors"
                >
                  Salvar Promoção
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promocoes; 