import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface SupabaseAuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  ban_duration?: string | null;
  user_metadata?: {
    name?: string;
    phone?: string;
    avatar_url?: string;
    is_admin?: boolean;
  };
}

interface Usuario {
  id: string;
  email: string;
  nome?: string;
  telefone?: string;
  data_criacao: string;
  ultimo_login?: string;
  is_admin: boolean;
  status: 'ativo' | 'inativo' | 'bloqueado';
}

const statusColors = {
  ativo: 'bg-green-100 text-green-800',
  inativo: 'bg-gray-100 text-gray-800',
  bloqueado: 'bg-red-100 text-red-800'
};

const AdminUsuarios = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificandoAdmin, setVerificandoAdmin] = useState(true); // Novo estado para controlar verificação de admin
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [usuarioDetalhado, setUsuarioDetalhado] = useState<Usuario | null>(null);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalPromoverAdminAberto, setModalPromoverAdminAberto] = useState(false);
  const [usuarioPromover, setUsuarioPromover] = useState<Usuario | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/conta');
      return;
    }
    
    const verificarAdmin = async () => {
      setVerificandoAdmin(true); // Indicar que estamos verificando
      try {
        console.log('Verificando admin para usuário:', user);
        
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
          buscarUsuarios();
          return;
        }
        
        // Verificação usando a função RPC verificar_admin corrigida
        // Esta função verifica se o usuário tem o papel admin (id = 1)
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('verificar_admin', { user_uuid: user.id });
        
        if (adminError) {
          console.error('Erro ao verificar papel do usuário:', adminError);
          
          // Verificação alternativa via view v_admin_users
          const { data: adminView, error: viewError } = await supabase
            .from('v_admin_users')
            .select('is_admin_role, is_admin')
            .eq('id', user.id)
            .maybeSingle();
          
          if (!viewError && (adminView?.is_admin_role || adminView?.is_admin)) {
            console.log('Usuário é admin pela view v_admin_users');
            buscarUsuarios();
            return;
          }
          
          console.log('Usuário não é admin');
          navigate('/perfil');
          return;
        }
        
        if (!isAdmin) {
          console.log('Usuário não tem papel admin');
          navigate('/perfil');
          return;
        }
        
        console.log('Usuário é admin pela tabela user_roles');
        buscarUsuarios();
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        navigate('/perfil');
      } finally {
        setVerificandoAdmin(false); // Finalizar verificação
      }
    };
    
    verificarAdmin();
  }, [user, navigate]);

  const buscarUsuarios = async () => {
    setLoading(true);
    
    try {
      // Buscar usuários da tabela users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) {
        console.error('Erro ao buscar usuários:', usersError);
        throw usersError;
      }
      
      // Buscar administradores usando RPC em vez de consulta direta à tabela user_roles
      const { data: adminsData, error: adminsError } = await supabase
        .rpc('listar_administradores');
      
      const adminIds = adminsData || [];
      
      console.log('Administradores encontrados (via RPC):', adminIds);
      
      // Buscar informações de metadados do usuário
      const { data: userMetadata, error: metadataError } = await supabase
        .from('user_metadata')
        .select('*');
        
      if (metadataError) {
        console.error('Erro ao buscar metadados:', metadataError);
      }
      
      const usuariosProcessados = users.map(dbUser => {
        // Encontrar metadados do usuário (se existirem)
        const metadata = userMetadata?.find(m => m.user_id === dbUser.id);
        
        // Determinar o status baseado nos dados disponíveis
        let status: 'ativo' | 'inativo' | 'bloqueado' = 'ativo'; // Assumindo ativo por padrão
        
        if (metadata?.is_banned) {
          status = 'bloqueado';
        } else if (!dbUser.email_confirmed) {
          status = 'inativo';
        }
        
        return {
          id: dbUser.id,
          email: dbUser.email,
          nome: dbUser.name,
          telefone: dbUser.phone,
          data_criacao: dbUser.created_at,
          ultimo_login: metadata?.last_sign_in || undefined,
          is_admin: adminIds.includes(dbUser.id),
          status
        };
      });
      
      setUsuarios(usuariosProcessados);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Não foi possível carregar a lista de usuários.');
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusUsuario = async (id: string, novoStatus: 'ativo' | 'inativo' | 'bloqueado') => {
    try {
      // Como não podemos usar supabase.auth.admin, vamos atualizar nossa própria tabela
      if (novoStatus === 'bloqueado') {
        // Atualizar flag de banimento na tabela de metadados
        const { error: metadataError } = await supabase
          .from('user_metadata')
          .upsert({ 
            user_id: id, 
            is_banned: true 
          });
          
        if (metadataError) throw metadataError;
      } else {
        // Remover banimento se existir
        const { error: metadataError } = await supabase
          .from('user_metadata')
          .upsert({ 
            user_id: id, 
            is_banned: false 
          });
          
        if (metadataError) throw metadataError;
        
        // Se for ativar o usuário, atualizar flag de email confirmado
        if (novoStatus === 'ativo') {
          const { error: userError } = await supabase
            .from('users')
            .update({ email_confirmed: true })
            .eq('id', id);
            
          if (userError) throw userError;
        }
      }
      
      // Atualizar lista localmente
      setUsuarios(usuarios.map(usuario => 
        usuario.id === id ? { ...usuario, status: novoStatus } : usuario
      ));
      
      // Atualizar no usuário detalhado se estiver aberto
      if (usuarioDetalhado && usuarioDetalhado.id === id) {
        setUsuarioDetalhado({ ...usuarioDetalhado, status: novoStatus });
      }
      
      toast.success('Status do usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      toast.error('Erro ao atualizar status do usuário');
    }
  };

  const promoverParaAdmin = async (usuario: Usuario) => {
    try {
      // Verificar se já é admin
      if (usuario.is_admin) {
        toast.error('Este usuário já é um administrador.');
        return;
      }
      
      // Promover usuário usando RPC personalizada que lida corretamente com tipos
      const { data, error } = await supabase
        .rpc('promover_para_admin', { user_uuid: usuario.id });
      
      if (error) {
        console.error('Erro ao promover usuário:', error);
        toast.error('Erro ao atribuir papel de administrador');
        return;
      }
      
      console.log('Usuário promovido:', data);
      
      // Atualizar lista localmente
      setUsuarios(usuarios.map(u => 
        u.id === usuario.id ? { ...u, is_admin: true } : u
      ));
      
      toast.success(`${usuario.email} agora é um administrador.`);
      setModalPromoverAdminAberto(false);
    } catch (error) {
      console.error('Erro ao promover usuário para admin:', error);
      toast.error('Erro ao promover usuário para administrador');
    }
  };

  const removerAdmin = async (usuario: Usuario) => {
    try {
      if (!usuario.is_admin) {
        toast.error('Este usuário não é um administrador.');
        return;
      }
      
      // Verificar se é o último admin usando a view
      const { data: adminsView, error: viewError } = await supabase
        .from('v_admin_users')
        .select('id')
        .or('is_admin.eq.true,is_admin_role.eq.true');
        
      if (viewError) {
        console.error('Erro ao verificar quantidade de admins:', viewError);
        toast.error('Erro ao verificar quantidade de administradores');
        return;
      }
      
      if (!adminsView || adminsView.length <= 1) {
        toast.error('Não é possível remover o último administrador do sistema.');
        return;
      }
      
      // Remover admin usando RPC personalizada
      const { data, error } = await supabase
        .rpc('remover_admin', { user_uuid: usuario.id });
      
      if (error) {
        console.error('Erro ao remover admin:', error);
        toast.error('Erro ao remover papel de administrador');
        return;
      }
      
      console.log('Admin removido:', data);
      
      // Atualizar lista localmente
      setUsuarios(usuarios.map(u => 
        u.id === usuario.id ? { ...u, is_admin: false } : u
      ));
      
      toast.success(`${usuario.email} não é mais um administrador.`);
    } catch (error) {
      console.error('Erro ao remover privilégios de admin:', error);
      toast.error('Erro ao atualizar privilégios de administrador');
    }
  };

  const abrirDetalhes = (usuario: Usuario) => {
    setUsuarioDetalhado(usuario);
    setModalDetalhesAberto(true);
  };

  const abrirModalPromoverAdmin = (usuario: Usuario) => {
    setUsuarioPromover(usuario);
    setModalPromoverAdminAberto(true);
  };

  // Filtrar usuários
  const usuariosFiltrados = usuarios.filter(usuario => {
    const correspondeAoStatus = filtroStatus === '' || usuario.status === filtroStatus;
    
    const correspondeABusca = filtroBusca === '' ||
                              usuario.email.toLowerCase().includes(filtroBusca.toLowerCase()) ||
                              (usuario.nome && usuario.nome.toLowerCase().includes(filtroBusca.toLowerCase()));
    
    return correspondeAoStatus && correspondeABusca;
  });

  const formatarData = (dataString?: string) => {
    if (!dataString) return 'N/A';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-light">
          Gerenciamento de <span className="text-champagne-500">Usuários</span>
        </h1>
        <button 
          onClick={() => navigate('/admin')}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          ← Voltar ao Painel
        </button>
      </div>
      
      {verificandoAdmin ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-champagne-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Verificando permissões de administrador...</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-champagne-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por e-mail ou nome..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>
            <div>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
                <option value="bloqueado">Bloqueados</option>
              </select>
            </div>
          </div>
          
          {usuariosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Cadastro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{usuario.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.nome || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatarData(usuario.data_criacao)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[usuario.status]}`}>
                          {usuario.status.charAt(0).toUpperCase() + usuario.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {usuario.is_admin ? (
                          <span className="px-2 py-1 text-xs font-medium bg-champagne-100 text-champagne-800 rounded-full">
                            Administrador
                          </span>
                        ) : 'Cliente'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => abrirDetalhes(usuario)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Detalhes
                          </button>
                          {usuario.is_admin ? (
                            <button 
                              onClick={() => removerAdmin(usuario)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remover Admin
                            </button>
                          ) : (
                            <button 
                              onClick={() => abrirModalPromoverAdmin(usuario)}
                              className="text-champagne-600 hover:text-champagne-800"
                            >
                              Promover
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Modal de detalhes do usuário */}
      {modalDetalhesAberto && usuarioDetalhado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Detalhes do Usuário</h2>
                <button 
                  onClick={() => setModalDetalhesAberto(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Informações de Conta</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">ID:</span> {usuarioDetalhado.id}</p>
                    <p><span className="font-medium">E-mail:</span> {usuarioDetalhado.email}</p>
                    <p><span className="font-medium">Nome:</span> {usuarioDetalhado.nome || 'Não informado'}</p>
                    <p><span className="font-medium">Telefone:</span> {usuarioDetalhado.telefone || 'Não informado'}</p>
                    <p>
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${statusColors[usuarioDetalhado.status]}`}>
                        {usuarioDetalhado.status.charAt(0).toUpperCase() + usuarioDetalhado.status.slice(1)}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Função:</span> 
                      {usuarioDetalhado.is_admin ? (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-champagne-100 text-champagne-800 rounded-full">
                          Administrador
                        </span>
                      ) : 'Cliente'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Atividade</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Data de Cadastro:</span> {formatarData(usuarioDetalhado.data_criacao)}</p>
                    <p><span className="font-medium">Último Login:</span> {formatarData(usuarioDetalhado.ultimo_login)}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <div>
                  <select
                    value={usuarioDetalhado.status}
                    onChange={(e) => {
                      const novoStatus = e.target.value as 'ativo' | 'inativo' | 'bloqueado';
                      atualizarStatusUsuario(usuarioDetalhado.id, novoStatus);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>
                </div>
                <div className="space-x-3">
                  {usuarioDetalhado.is_admin ? (
                    <button
                      onClick={() => removerAdmin(usuarioDetalhado)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                    >
                      Remover Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setModalDetalhesAberto(false);
                        abrirModalPromoverAdmin(usuarioDetalhado);
                      }}
                      className="px-4 py-2 bg-champagne-100 text-champagne-800 rounded-md hover:bg-champagne-200 transition-colors"
                    >
                      Promover a Admin
                    </button>
                  )}
                  <button
                    onClick={() => setModalDetalhesAberto(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmação para promover admin */}
      {modalPromoverAdminAberto && usuarioPromover && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Promover a Administrador</h2>
                <button 
                  onClick={() => setModalPromoverAdminAberto(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  Tem certeza que deseja promover <span className="font-medium">{usuarioPromover.email}</span> a administrador do sistema?
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Esta ação concederá acesso completo ao painel administrativo, incluindo gerenciamento de produtos, pedidos e outros usuários.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setModalPromoverAdminAberto(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => promoverParaAdmin(usuarioPromover)}
                  className="px-4 py-2 bg-champagne-500 text-white rounded-md hover:bg-champagne-600 transition-colors"
                >
                  Confirmar Promoção
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios; 