import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, uploadImageToStorage } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface Categoria {
  id: string;
  nome: string;
  descricao: string;
  slug: string;
  imagem_url?: string;
  ordem: number;
  destaque: boolean;
  created_at: string;
}

const AdminCategorias = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [categoriaAtual, setCategoriaAtual] = useState<Categoria | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      buscarCategorias();
    }
  }, [user]);

  const buscarCategorias = async () => {
    try {
      setLoading(true);
      
      // Tentar buscar da tabela original que tem os dados
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) {
        console.error('Erro ao buscar categorias:', error);
        toast.error('Erro ao carregar categorias');
        setCategorias([]);
      } else if (data && data.length > 0) {
        console.log('Dados encontrados:', data);
        
        // Mapear os campos da tabela para o formato da interface Categoria
        const categoriasFormatadas = data.map(cat => ({
          id: cat.id,
          nome: cat.name || '',
          descricao: cat.description || '',
          slug: cat.slug || '',
          imagem_url: cat.image_url || cat.image || '',
          ordem: 0,
          destaque: false,
          created_at: cat.created_at || new Date().toISOString()
        }));
        
        setCategorias(categoriasFormatadas);
      } else {
        console.log('Nenhuma categoria encontrada');
        setCategorias([]);
      }
    } catch (error) {
      console.error('Erro geral ao buscar categorias:', error);
      toast.error('Erro ao carregar categorias');
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNovaCategoria = () => {
    setCategoriaAtual({
      id: '',
      nome: '',
      descricao: '',
      slug: '',
      imagem_url: '',
      ordem: categorias.length > 0 ? Math.max(...categorias.map(cat => cat.ordem)) + 1 : 0,
      destaque: false,
      created_at: new Date().toISOString()
    });
    setImagemPreview(null);
    setImagemArquivo(null);
    setModoEdicao(false);
    setModalAberto(true);
  };

  const abrirModalEdicao = (categoria: Categoria) => {
    setCategoriaAtual(categoria);
    setImagemPreview(categoria.imagem_url || null);
    setImagemArquivo(null);
    setModoEdicao(true);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setCategoriaAtual(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (!categoriaAtual) return;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCategoriaAtual({ ...categoriaAtual, [name]: checked });
    } else if (name === 'nome') {
      const nome = value;
      // Gerar slug automaticamente a partir do nome
      const slug = nome.toLowerCase()
        .normalize('NFD') // Normaliza caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove múltiplos hífens consecutivos
        .trim();
      
      setCategoriaAtual({ ...categoriaAtual, nome, slug });
    } else {
      setCategoriaAtual({ ...categoriaAtual, [name]: value });
    }
  };

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Resetar mensagem de erro
      setUploadError(null);
      
      setImagemArquivo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImagem = async (file: File): Promise<string | null> => {
    try {
      setUploadError(null);
      
      // Verificar se o arquivo é uma imagem
      if (!file.type.startsWith('image/')) {
        setUploadError('O arquivo selecionado não é uma imagem válida');
        return null;
      }
      
      // Utilizar a nova função de upload de imagens
      const { url, error } = await uploadImageToStorage(
        file,
        'categories',
        'category-images'
      );
      
      if (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        setUploadError(`Erro ao fazer upload: ${error.message || 'Erro desconhecido'}`);
        
        // Em caso de erro, retornar a própria imagem em base64 como fallback
        return imagemPreview;
      }
      
      return url;
    } catch (error) {
      console.error('Exceção no upload:', error);
      setUploadError('Erro inesperado durante o upload.');
      // Em caso de erro, retornar a própria imagem em base64 como fallback
      return imagemPreview;
    }
  };

  const salvarCategoria = async () => {
    if (!categoriaAtual) return;
    
    try {
      let imagemUrl = categoriaAtual.imagem_url;
      
      // Upload da imagem se houver arquivo novo
      if (imagemArquivo && imagemPreview) {
        // Usar o próprio preview como URL (que já está em base64)
        imagemUrl = imagemPreview;
      }
      
      const categoriaSalvar = {
        ...categoriaAtual,
        imagem_url: imagemUrl
      };
      
      // Verificar qual tabela de categorias está disponível - sempre será 'categories'
      const tabelaCategoria = await verificarTabelaCategoria();
      
      if (!tabelaCategoria) {
        toast.error('Não foi possível acessar a tabela de categorias no banco de dados.');
        return;
      }
      
      if (modoEdicao) {
        // Atualizar categoria existente
        const { id, created_at, ...categoriaParaAtualizar } = categoriaSalvar;
        
        // Adaptar dados para o formato da tabela 'categories'
        const dadosCategories = {
          name: categoriaParaAtualizar.nome,
          description: categoriaParaAtualizar.descricao,
          slug: categoriaParaAtualizar.slug,
          image_url: categoriaParaAtualizar.imagem_url,
          is_active: true
        };
        
        const { error } = await supabase
          .from('categories')
          .update(dadosCategories)
          .eq('id', id);
        
        if (error) throw error;
        
        toast.success('Categoria atualizada com sucesso!');
      } else {
        // Criar nova categoria
        const { id, created_at, ...categoriaParaInserir } = categoriaSalvar;
        
        // Adaptar dados para o formato da tabela 'categories'
        const dadosCategories = {
          name: categoriaParaInserir.nome,
          description: categoriaParaInserir.descricao,
          slug: categoriaParaInserir.slug,
          image_url: categoriaParaInserir.imagem_url,
          is_active: true
        };
        
        const { error } = await supabase
          .from('categories')
          .insert([dadosCategories]);
        
        if (error) throw error;
        
        toast.success('Categoria criada com sucesso!');
      }
      
      fecharModal();
      buscarCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error(modoEdicao ? 'Erro ao atualizar categoria.' : 'Erro ao criar categoria.');
    }
  };

  const confirmarExclusao = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        toast.success('Categoria excluída com sucesso!');
        buscarCategorias();
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        toast.error('Erro ao excluir categoria.');
      }
    }
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const criarCategoriasExemplo = async () => {
    try {
      setLoading(true);
      console.log('Criando categorias de exemplo...');
      
      // Lista de categorias de exemplo para uma loja de roupas
      const categoriasPadrao = [
        {
          nome: 'Vestidos',
          descricao: 'Vestidos para todas as ocasiões: casual, festa, trabalho e mais.',
          slug: 'vestidos',
          imagem_url: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=400&h=400',
          ordem: 1,
          destaque: true
        },
        {
          nome: 'Blusas',
          descricao: 'Camisetas, camisas, croppeds e mais opções para o dia a dia.',
          slug: 'blusas',
          imagem_url: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=400&h=400',
          ordem: 2,
          destaque: true
        },
        {
          nome: 'Calças',
          descricao: 'Jeans, alfaiataria, leggings e mais modelos para todos os estilos.',
          slug: 'calcas',
          imagem_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&h=400',
          ordem: 3,
          destaque: true
        },
        {
          nome: 'Casacos',
          descricao: 'Jaquetas, blazers, cardigãs e mais opções para os dias frios.',
          slug: 'casacos',
          imagem_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&h=400',
          ordem: 4,
          destaque: false
        },
        {
          nome: 'Saias',
          descricao: 'Mini, midi, longas e mais modelos para todos os gostos.',
          slug: 'saias',
          imagem_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=400&h=400',
          ordem: 5,
          destaque: false
        },
        {
          nome: 'Conjuntos',
          descricao: 'Conjuntos completos para facilitar a composição do look.',
          slug: 'conjuntos',
          imagem_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&h=400',
          ordem: 6,
          destaque: false
        },
        {
          nome: 'Acessórios',
          descricao: 'Bolsas, cintos, bijuterias e mais para completar seu visual.',
          slug: 'acessorios',
          imagem_url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=400&h=400',
          ordem: 7,
          destaque: false
        }
      ];
      
      // Adaptar para o formato da tabela 'categories'
      const dadosParaCategories = categoriasPadrao.map(cat => ({
        name: cat.nome,
        description: cat.descricao,
        slug: cat.slug,
        image_url: cat.imagem_url,
        is_active: true
      }));
      
      // Inserir na tabela 'categories'
      const { error } = await supabase
        .from('categories')
        .insert(dadosParaCategories);
        
      if (error) {
        console.error('Erro ao inserir categorias:', error);
        toast.error('Erro ao criar categorias de exemplo.');
        return;
      }
      
      toast.success('Categorias de exemplo criadas com sucesso!');
      // Recarregar as categorias
      buscarCategorias();
    } catch (error) {
      console.error('Erro ao criar categorias de exemplo:', error);
      toast.error('Erro ao criar categorias de exemplo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Função para verificar qual tabela de categorias existe no banco
  const verificarTabelaCategoria = async (): Promise<string | null> => {
    try {
      // Verificar apenas a tabela 'categories' que sabemos que existe
      const { error: categoriesError } = await supabase
        .from('categories')
        .select('id')
        .limit(1);
      
      if (!categoriesError) {
        return 'categories';
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao verificar tabelas:', error);
      return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-light">
          Gerenciamento de <span className="text-rose-300">Categorias</span>
        </h1>
        <button 
          onClick={() => navigate('/admin')}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          ← Voltar ao Painel
        </button>
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={abrirModalNovaCategoria}
          className="px-4 py-2 bg-rose-300 text-white rounded-md hover:bg-rose-400 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nova Categoria
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-rose-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          {categorias.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma categoria cadastrada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagem</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordem</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destaque</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categorias.map((categoria) => (
                    <tr key={categoria.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        {categoria.imagem_url ? (
                          <img 
                            src={categoria.imagem_url} 
                            alt={categoria.nome} 
                            className="h-10 w-10 object-cover rounded"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {categoria.nome}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categoria.slug}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categoria.ordem}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categoria.destaque ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Sim</span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Não</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatarData(categoria.created_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => abrirModalEdicao(categoria)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => confirmarExclusao(categoria.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Excluir
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
      )}
      
      {/* Modal de Edição/Criação */}
      {modalAberto && categoriaAtual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-900">
                {modoEdicao ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button 
                onClick={fecharModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  name="nome"
                  value={categoriaAtual.nome}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={categoriaAtual.slug}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Gerado automaticamente a partir do nome
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={categoriaAtual.descricao}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem
                </label>
                <input
                  type="number"
                  name="ordem"
                  value={categoriaAtual.ordem}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="destaque"
                    checked={categoriaAtual.destaque}
                    onChange={handleChange}
                    className="h-4 w-4 text-rose-300 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Categoria em destaque</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem da Categoria
                </label>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImagemChange}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-rose-50 file:text-rose-400 hover:file:bg-rose-100"
                      />
                      {imagemPreview && (
                        <img 
                          src={imagemPreview} 
                          alt="Preview" 
                          className="h-20 w-20 object-cover rounded border border-gray-200" 
                        />
                      )}
                    </div>
                  </div>
                  
                  {uploadError && (
                    <p className="text-sm text-red-500 mt-1 bg-red-50 p-2 rounded">
                      <span className="font-semibold">Aviso:</span> {uploadError}
                    </p>
                  )}
                  
                  {categoriaAtual.imagem_url && !imagemPreview && (
                    <div className="flex flex-col space-y-2">
                      <p className="text-xs text-gray-500 font-semibold">
                        Imagem atual:
                      </p>
                      <img 
                        src={categoriaAtual.imagem_url} 
                        alt="Imagem atual" 
                        className="h-20 w-20 object-cover rounded border border-gray-200" 
                        onError={(e) => {
                          // Se a imagem falhar, escondê-la
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Colocar mensagem de erro
                          target.parentElement?.insertAdjacentHTML('beforeend', 
                            '<p class="text-xs text-red-500">Erro ao carregar imagem</p>');
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={fecharModal}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvarCategoria}
                className="px-4 py-2 bg-rose-300 text-white rounded-md hover:bg-rose-400 transition-colors"
              >
                {modoEdicao ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategorias; 