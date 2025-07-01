import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface Promocao {
  id: string;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  code: string;
  created_at?: string;
  updated_at?: string;
}

const Promocoes = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificandoAdmin, setVerificandoAdmin] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [promocaoEmEdicao, setPromocaoEmEdicao] = useState<Promocao | null>(null);
  const [formData, setFormData] = useState<Partial<Promocao>>({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    code: ''
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
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar promoções:', error);
        // Se houver erro, usar dados mockados para desenvolvimento
        const promosMock: Promocao[] = [
          {
            id: '1',
            name: 'Verão 2024',
            description: 'Desconto em toda coleção verão',
            discount_type: 'percentage',
            discount_value: 15,
            start_date: '2024-06-01T00:00:00Z',
            end_date: '2024-07-31T23:59:59Z',
            is_active: true,
            code: 'VERAO2024'
          },
          {
            id: '2',
            name: 'Black Friday',
            description: 'Desconto especial na Black Friday',
            discount_type: 'percentage',
            discount_value: 30,
            start_date: '2024-11-25T00:00:00Z',
            end_date: '2024-11-30T23:59:59Z',
            is_active: false,
            code: 'BLACKFRIDAY'
          }
        ];
        setPromocoes(promosMock);
        return;
      }
      
      setPromocoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar promoções:', error);
      toast.error('Não foi possível carregar a lista de promoções.');
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusPromocao = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ is_active })
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao atualizar promoção:', error);
        toast.error('Erro ao atualizar status da promoção.');
        return;
      }
      
      setPromocoes(promocoes.map(promo => 
        promo.id === id ? { ...promo, is_active } : promo
      ));
      
      toast.success(`Promoção ${is_active ? 'ativada' : 'desativada'} com sucesso!`);
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

  const handleEditarPromocao = (promocao: Promocao) => {
    setPromocaoEmEdicao(promocao);
    setFormData({
      name: promocao.name,
      description: promocao.description,
      discount_type: promocao.discount_type,
      discount_value: promocao.discount_value,
      start_date: promocao.start_date,
      end_date: promocao.end_date,
      is_active: promocao.is_active,
      code: promocao.code
    });
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    console.log('Iniciando handleSalvar');
    console.log('Dados do formulário:', formData);
    
    try {
      // Validações básicas
      if (!formData.name?.trim()) {
        toast.error('O nome da promoção é obrigatório');
        return;
      }

      if (!formData.code?.trim()) {
        toast.error('O código da promoção é obrigatório');
      return;
    }
    
      // Validar datas
      const startDate = new Date(formData.start_date || '');
      const endDate = new Date(formData.end_date || '');
      
      console.log('Datas:', { startDate, endDate });
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        toast.error('Datas inválidas');
        return;
      }

      if (endDate < startDate) {
        toast.error('A data de término deve ser posterior à data de início');
        return;
      }

      // Validar valor do desconto
      if (formData.discount_type === 'percentage' && (formData.discount_value || 0) > 100) {
        toast.error('Desconto em porcentagem não pode ser maior que 100%');
        return;
      }

      if (formData.discount_value === undefined || formData.discount_value < 0) {
        toast.error('Valor do desconto inválido');
        return;
      }

      const dadosAtualizacao = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        discount_type: formData.discount_type || 'percentage',
        discount_value: formData.discount_value || 0,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        is_active: formData.is_active || false,
        code: formData.code.trim().toUpperCase()
      };

      console.log('Dados para atualização:', dadosAtualizacao);

      if (promocaoEmEdicao) {
        console.log('Atualizando promoção existente:', promocaoEmEdicao.id);
        // Atualizar promoção existente
        const { data, error } = await supabase
          .from('promotions')
          .update({
            ...dadosAtualizacao,
            code: promocaoEmEdicao.code // Mantém o código original
          })
          .eq('id', promocaoEmEdicao.id)
          .select()
          .single();

        if (error) {
          console.error('Erro ao atualizar promoção:', error);
          toast.error(`Erro ao atualizar promoção: ${error.message}`);
          return;
        }

        console.log('Promoção atualizada com sucesso:', data);
        setPromocoes(promocoes.map(p => 
          p.id === promocaoEmEdicao.id ? { ...data, code: promocaoEmEdicao.code } : p
        ));

        toast.success('Promoção atualizada com sucesso!');
      } else {
        console.log('Criando nova promoção');
        // Verificar se já existe uma promoção com o mesmo código
        const { data: existingPromo } = await supabase
          .from('promotions')
          .select('id')
          .eq('code', dadosAtualizacao.code)
          .single();

        if (existingPromo) {
          toast.error('Já existe uma promoção com este código');
          return;
        }

        // Criar nova promoção
        const { data, error } = await supabase
        .from('promotions')
          .insert([dadosAtualizacao])
          .select()
          .single();
      
      if (error) {
          console.error('Erro ao criar promoção:', error);
          toast.error(`Erro ao criar promoção: ${error.message}`);
          return;
        }

        console.log('Nova promoção criada com sucesso:', data);
        setPromocoes([data, ...promocoes]);
        toast.success('Promoção criada com sucesso!');
      }

      // Limpa o formulário e fecha o modal
      setModalAberto(false);
      setPromocaoEmEdicao(null);
      setFormData({
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 10,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        code: ''
      });
    } catch (error) {
      console.error('Erro ao salvar promoção:', error);
      toast.error('Erro ao salvar promoção. Verifique o console para mais detalhes.');
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
            onClick={() => setModalAberto(true)}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promocoes.map((promocao) => (
                  <tr key={promocao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{promocao.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">{promocao.code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {promocao.discount_type === 'percentage' ? 'Porcentagem' : 'Valor Fixo'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {promocao.discount_type === 'percentage' ? `${promocao.discount_value}%` : `R$ ${promocao.discount_value.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(promocao.start_date).toLocaleDateString('pt-BR')} - {new Date(promocao.end_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${promocao.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {promocao.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => atualizarStatusPromocao(promocao.id, !promocao.is_active)}
                          className={promocao.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                        >
                          {promocao.is_active ? 'Desativar' : 'Ativar'}
                        </button>
                        <button 
                          onClick={() => handleEditarPromocao(promocao)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
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
      
      {/* Modal de Promoção */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {promocaoEmEdicao ? 'Editar Promoção' : 'Nova Promoção'}
                </h2>
                <button 
                  onClick={() => {
                    setModalAberto(false);
                    setPromocaoEmEdicao(null);
                    setFormData({
                      name: '',
                      description: '',
                      discount_type: 'percentage',
                      discount_value: 10,
                      start_date: new Date().toISOString(),
                      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                      is_active: true,
                      code: ''
                    });
                  }}
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
                    value={formData.name || ''}
                    onChange={(e) => {
                      console.log('Nome alterado:', e.target.value);
                      setFormData({...formData, name: e.target.value});
                    }}
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
                    value={formData.description || ''}
                    onChange={(e) => {
                      console.log('Descrição alterada:', e.target.value);
                      setFormData({...formData, description: e.target.value});
                    }}
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
                      type="datetime-local"
                      value={formData.start_date ? new Date(formData.start_date).toISOString().slice(0, 16) : ''}
                      onChange={(e) => {
                        console.log('Data de início alterada:', e.target.value);
                        setFormData({...formData, start_date: new Date(e.target.value).toISOString()});
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Término*
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_date ? new Date(formData.end_date).toISOString().slice(0, 16) : ''}
                      onChange={(e) => {
                        console.log('Data de término alterada:', e.target.value);
                        setFormData({...formData, end_date: new Date(e.target.value).toISOString()});
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Desconto*
                    </label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({...formData, discount_type: e.target.value as 'percentage' | 'fixed'})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    >
                      <option value="percentage">Porcentagem (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor do Desconto*
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({...formData, discount_value: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                        min="0"
                        step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                        required
                      />
                      <span className="ml-2">{formData.discount_type === 'percentage' ? '%' : 'R$'}</span>
                    </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código da Promoção*
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                        placeholder="Ex: VERAO2024"
                        required
                      disabled={promocaoEmEdicao !== null}
                      />
                    {!promocaoEmEdicao && (
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, code: gerarCodigoAleatorio()})}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
                      >
                        Gerar
                      </button>
                    )}
                  </div>
                  {promocaoEmEdicao && (
                    <p className="mt-1 text-sm text-gray-500">
                      O código da promoção não pode ser alterado após a criação.
                    </p>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="h-4 w-4 text-champagne-500 border-gray-300 rounded focus:ring-champagne-500"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Ativar promoção imediatamente
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalAberto(false);
                    setPromocaoEmEdicao(null);
                    setFormData({
                      name: '',
                      description: '',
                      discount_type: 'percentage',
                      discount_value: 10,
                      start_date: new Date().toISOString(),
                      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                      is_active: true,
                      code: ''
                    });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSalvar}
                  className="px-4 py-2 bg-champagne-500 text-white rounded-md hover:bg-champagne-600 transition-colors"
                >
                  {promocaoEmEdicao ? 'Salvar Alterações' : 'Criar Promoção'}
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