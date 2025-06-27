import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface CategoriaProps {
  nome: string;
  descricao: string;
  slug: string;
  imagem_url?: string;
  ordem: number;
  destaque: boolean;
}

const NovaCategoria = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [verificandoAdmin, setVerificandoAdmin] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const [categorias, setCategorias] = useState<{id: string, nome: string, ordem: number}[]>([]);
  
  const [categoria, setCategoria] = useState<CategoriaProps>({
    nome: '',
    descricao: '',
    slug: '',
    imagem_url: '',
    ordem: 0,
    destaque: false
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
          buscarCategorias();
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
        buscarCategorias();
        setVerificandoAdmin(false);
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        navigate('/perfil');
      }
    };
    
    verificarAdmin();
  }, [user, navigate]);

  const buscarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nome, ordem')
        .order('ordem', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setCategorias(data);
        // Defina a ordem como o maior valor + 1
        if (data.length > 0) {
          const maiorOrdem = Math.max(...data.map(cat => cat.ordem));
          setCategoria(prev => ({ ...prev, ordem: maiorOrdem + 1 }));
        }
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error('Erro ao carregar categorias existentes.');
    }
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
        .from('categorias')
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

  const handleNomeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value;
    setCategoria(prev => ({ ...prev, nome }));
    
    // Gerar slug único
    const slugUnico = await gerarSlugUnico(nome);
    setCategoria(prev => ({ ...prev, slug: slugUnico }));
  };

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    
    try {
      let imagemUrl = categoria.imagem_url;
      
      // Upload da imagem se houver arquivo novo
      if (imagemArquivo) {
        imagemUrl = await uploadImagem(imagemArquivo);
      }

      // Verificar novamente o slug antes de salvar
      const slugFinal = await gerarSlugUnico(categoria.nome);
      
      const categoriaNova = {
        ...categoria,
        imagem_url: imagemUrl,
        slug: slugFinal
      };
      
      // Inserir categoria no banco
      const { data, error } = await supabase
        .from('categorias')
        .insert([categoriaNova])
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success('Categoria criada com sucesso!');
      navigate('/admin/categorias');
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao criar nova categoria.');
    } finally {
      setSalvando(false);
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
          Nova <span className="text-champagne-500">Categoria</span>
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
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Coluna da esquerda - Informações básicas */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-800 border-b pb-2">Informações da Categoria</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Categoria*
                </label>
                <input
                  type="text"
                  value={categoria.nome}
                  onChange={handleNomeChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)*
                </label>
                <input
                  type="text"
                  value={categoria.slug}
                  onChange={(e) => setCategoria({...categoria, slug: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Identificador único usado na URL. Gerado automaticamente do nome.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={categoria.descricao}
                  onChange={(e) => setCategoria({...categoria, descricao: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={categoria.ordem}
                    onChange={(e) => setCategoria({...categoria, ordem: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    min="0"
                    step="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Categorias são exibidas em ordem crescente.
                  </p>
                </div>
                
                <div className="flex items-center h-full pt-8">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoria.destaque}
                      onChange={(e) => setCategoria({...categoria, destaque: e.target.checked})}
                      className="sr-only"
                    />
                    <div className={`relative w-10 h-5 rounded-full transition-colors ${categoria.destaque ? 'bg-champagne-500' : 'bg-gray-300'}`}>
                      <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${categoria.destaque ? 'translate-x-5' : ''}`}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">Destacar na Home</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Coluna da direita - Imagem */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-800 border-b pb-2">Imagem da Categoria</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem da Categoria
                </label>
                <div className="flex flex-col space-y-2">
                  <input
                    type="file"
                    onChange={handleImagemChange}
                    className="hidden"
                    id="imagem-upload"
                    accept="image/*"
                  />
                  <label 
                    htmlFor="imagem-upload" 
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md cursor-pointer hover:bg-gray-300 inline-block w-full text-center"
                  >
                    Selecionar imagem
                  </label>
                  <p className="text-sm text-gray-500">
                    Recomendado: 800x400px, JPG ou PNG, máximo 2MB
                  </p>
                  
                  {imagemPreview ? (
                    <div className="mt-4 relative">
                      <img 
                        src={imagemPreview} 
                        alt="Prévia da imagem" 
                        className="h-48 w-full object-cover border rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => { setImagemPreview(null); setImagemArquivo(null); }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 border-2 border-dashed border-gray-300 rounded-md p-8 flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">Nenhuma imagem selecionada</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Categorias Existentes:</h3>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                  {categorias.length > 0 ? (
                    categorias.map((cat) => (
                      <div key={cat.id} className="flex items-center text-sm py-1 border-b last:border-b-0">
                        <span className="w-8 text-center text-gray-500">{cat.ordem}</span>
                        <span className="ml-2">{cat.nome}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">Nenhuma categoria cadastrada</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="mr-4 px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className={`px-6 py-2 bg-champagne-500 text-white rounded-md hover:bg-champagne-600 transition-colors ${salvando ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {salvando ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Salvando...
                </span>
              ) : 'Criar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovaCategoria; 