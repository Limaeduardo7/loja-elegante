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
  parent_id?: string | null;
  children?: Categoria[];
  is_active: boolean;
}

interface CategoriaForm {
  nome: string;
  descricao: string;
  slug: string;
  imagem_url?: string;
  parent_id?: string | null;
  is_active?: boolean;
}

const AdminCategorias: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [categoriaAtual, setCategoriaAtual] = useState<CategoriaForm>({
    nome: '',
    descricao: '',
    slug: '',
    imagem_url: '',
    parent_id: null,
    is_active: true
  });
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (user) {
      buscarCategorias();
    }
  }, [user]);

  const buscarCategorias = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          children:categories(*)
        `)
        .is('parent_id', null); // Busca apenas categorias principais
      
      if (error) {
        console.error('Erro ao buscar categorias:', error);
        toast.error('Erro ao carregar categorias');
        setCategorias([]);
      } else if (data && data.length > 0) {
        console.log('Dados encontrados:', data);
        
        const categoriasFormatadas = data.map(cat => ({
          id: cat.id,
          nome: cat.name || '',
          descricao: cat.description || '',
          slug: cat.slug || '',
          imagem_url: cat.image_url || '',
          ordem: 0,
          destaque: false,
          created_at: cat.created_at,
          parent_id: cat.parent_id,
          children: cat.children?.map((child: any) => ({
            id: child.id,
            nome: child.name || '',
            descricao: child.description || '',
            slug: child.slug || '',
            imagem_url: child.image_url || '',
            ordem: 0,
            destaque: false,
            created_at: child.created_at,
            parent_id: child.parent_id,
            is_active: child.is_active
          })),
          is_active: cat.is_active
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
      nome: '',
      descricao: '',
      slug: '',
      imagem_url: '',
      parent_id: null,
      is_active: true
    });
    setImagemPreview(null);
    setImagemArquivo(null);
    setModoEdicao(false);
    setModalAberto(true);
  };

  const abrirModalEdicao = (categoria: Categoria) => {
    setCategoriaAtual({
      nome: categoria.nome,
      descricao: categoria.descricao,
      slug: categoria.slug,
      imagem_url: categoria.imagem_url || '',
      parent_id: categoria.parent_id,
      is_active: categoria.is_active
    });
    setImagemPreview(categoria.imagem_url || null);
    setImagemArquivo(null);
    setModoEdicao(true);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setCategoriaAtual({
      nome: '',
      descricao: '',
      slug: '',
      imagem_url: '',
      parent_id: null,
      is_active: true
    });
  };

  const gerarSlugUnico = async (nomeBase: string): Promise<string> => {
    // Gerar slug base
    let slug = nomeBase.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slugFinal = slug;
    let contador = 1;
    let slugExiste = true;

    // Verificar se o slug existe e adicionar número se necessário
    while (slugExiste) {
      const { data, error } = await supabase
        .from('categories')
        .select('slug')
        .eq('slug', slugFinal)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar slug:', error);
        return slug; // Retorna o slug original em caso de erro
      }

      if (!data) {
        slugExiste = false; // Slug está disponível
      } else {
        slugFinal = `${slug}-${contador}`; // Adiciona número ao slug
        contador++;
      }
    }

    return slugFinal;
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (!categoriaAtual) return;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCategoriaAtual({ ...categoriaAtual, [name]: checked });
    } else if (name === 'nome') {
      const nome = value;
      // Gerar slug único automaticamente a partir do nome
      const slugUnico = await gerarSlugUnico(nome);
      setCategoriaAtual({ ...categoriaAtual, nome, slug: slugUnico });
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

  const uploadImagem = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `categorias/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('store-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('store-images')
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload de imagem:', error);
      throw error;
    }
  };

  const salvarCategoria = async () => {
    if (!categoriaAtual) return;
    
    try {
      setSalvando(true);
      let imagemUrl: string | undefined = categoriaAtual.imagem_url;
      
      // Upload da imagem se houver arquivo novo
      if (imagemArquivo) {
        imagemUrl = await uploadImagem(imagemArquivo);
      }

      // Verificar novamente o slug antes de salvar
      const slugFinal = await gerarSlugUnico(categoriaAtual.nome);
      
      const novaCategoria = {
        name: categoriaAtual.nome,
        description: categoriaAtual.descricao,
        slug: slugFinal,
        image_url: imagemUrl || null,
        parent_id: categoriaAtual.parent_id || null,
        is_active: true
      };
      
      // Inserir categoria no banco
      const { data, error } = await supabase
        .from('categories')
        .insert([novaCategoria])
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success('Categoria salva com sucesso!');
      fecharModal();
      buscarCategorias(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    } finally {
      setSalvando(false);
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

  const abrirModalNovaSubcategoria = (categoriaId: string) => {
    setCategoriaAtual({
      nome: '',
      descricao: '',
      slug: '',
      imagem_url: '',
      parent_id: categoriaId,
      is_active: true
    });
    setImagemPreview(null);
    setImagemArquivo(null);
    setModoEdicao(false);
    setModalAberto(true);
  };

  // Renderização da lista de categorias com subcategorias
  const renderizarCategoria = (categoria: Categoria, nivel: number = 0) => {
    return (
      <div key={categoria.id} className={`border-b last:border-b-0 ${nivel > 0 ? 'ml-8 pl-4 border-l' : ''}`}>
        <div className="py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {categoria.imagem_url && (
              <img 
                src={categoria.imagem_url} 
                alt={categoria.nome}
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div>
              <h3 className="font-medium">{categoria.nome}</h3>
              <p className="text-sm text-gray-500">{categoria.descricao}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => abrirModalNovaSubcategoria(categoria.id)}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              + Subcategoria
            </button>
            <button
              onClick={() => abrirModalEdicao(categoria)}
              className="px-3 py-1 text-sm bg-champagne-500 text-white rounded hover:bg-champagne-600 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => confirmarExclusao(categoria.id)}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
        
        {/* Renderizar subcategorias recursivamente */}
        {categoria.children && categoria.children.length > 0 && (
          <div className="mt-2">
            {categoria.children.map(subcategoria => renderizarCategoria(subcategoria, nivel + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Carregando categorias...</p>
        </div>
      );
    }

    if (categorias.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          <p>Nenhuma categoria cadastrada</p>
        </div>
      );
    }

    return (
      <div className="divide-y">
        {categorias.map(categoria => renderizarCategoria(categoria))}
      </div>
    );
  };

  const renderModal = () => {
    if (!modalAberto) return null;

    const isSubcategoria = !!categoriaAtual.parent_id;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {modoEdicao 
                ? 'Editar ' + (isSubcategoria ? 'Subcategoria' : 'Categoria') 
                : 'Nova ' + (isSubcategoria ? 'Subcategoria' : 'Categoria')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome {isSubcategoria ? 'da Subcategoria' : 'da Categoria'}*
                </label>
                <input
                  type="text"
                  name="nome"
                  value={categoriaAtual.nome || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {isSubcategoria 
                    ? 'Nome da subcategoria que será exibido dentro da categoria principal. Escolha um nome específico e relacionado à categoria pai.'
                    : 'Nome que será exibido para os clientes. Escolha um nome claro e descritivo.'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)*
                </label>
                <input
                  type="text"
                  name="slug"
                  value={categoriaAtual.slug || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {isSubcategoria
                    ? 'Identificador único usado na URL da subcategoria. Será combinado com o slug da categoria principal.'
                    : 'Identificador único usado na URL da categoria. Gerado automaticamente a partir do nome, mas pode ser personalizado.'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={categoriaAtual.descricao || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {isSubcategoria
                    ? 'Breve descrição da subcategoria que ajuda a especificar melhor os produtos dentro desta classificação.'
                    : 'Breve descrição da categoria que ajuda os clientes a entenderem melhor o tipo de produtos que encontrarão.'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem
                </label>
                <input
                  type="file"
                  onChange={handleImagemChange}
                  className="hidden"
                  id="imagem-upload"
                  accept="image/*"
                />
                <label 
                  htmlFor="imagem-upload"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-champagne-500"
                >
                  Selecionar imagem
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  {isSubcategoria
                    ? 'Imagem opcional que representa a subcategoria. Recomendado: 800x400px, formato JPG ou PNG, máximo 2MB.'
                    : 'Imagem que representa a categoria. Recomendado: 800x400px, formato JPG ou PNG, máximo 2MB.'}
                </p>
                
                {imagemPreview && (
                  <div className="mt-2 relative">
                    <img 
                      src={imagemPreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagemPreview(null);
                        setImagemArquivo(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={categoriaAtual.is_active || false}
                    onChange={(e) => handleChange({
                      target: {
                        name: 'is_active',
                        value: e.target.checked,
                        type: 'checkbox'
                      }
                    } as any)}
                    className="rounded border-gray-300 text-champagne-500 focus:ring-champagne-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{isSubcategoria ? 'Subcategoria Ativa' : 'Categoria Ativa'}</span>
                </label>
                <p className="text-sm text-gray-500 mt-1 ml-6">
                  {isSubcategoria
                    ? 'Quando desativada, a subcategoria não será exibida no site, mas seus produtos permanecem no banco de dados.'
                    : 'Quando desativada, a categoria não será exibida no site, mas seus produtos permanecem no banco de dados.'}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={fecharModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarCategoria}
                disabled={salvando}
                className={`px-4 py-2 bg-champagne-500 text-white rounded-md hover:bg-champagne-600 transition-colors ${salvando ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {salvando ? (
                  <span className="flex items-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Salvando...
                  </span>
                ) : modoEdicao 
                    ? `Salvar ${isSubcategoria ? 'Subcategoria' : 'Categoria'}`
                    : `Criar ${isSubcategoria ? 'Subcategoria' : 'Categoria'}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-light">
          Gerenciar <span className="text-champagne-500">Categorias</span>
        </h1>
        <button
          onClick={abrirModalNovaCategoria}
          className="px-4 py-2 bg-champagne-500 text-white rounded-md hover:bg-champagne-600 transition-colors"
        >
          Nova Categoria
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {renderContent()}
      </div>

      {renderModal()}
    </div>
  );
};

export default AdminCategorias; 