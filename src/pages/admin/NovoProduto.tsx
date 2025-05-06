import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  category_id?: string;
  features: string[];
  material?: string;
  sizes?: string[];
  colors?: string[];
  discount_percent?: number;
  is_new?: boolean;
  tags?: string[];
  stock: number;
  created_at: string;
  updated_at?: string;
}

interface ProductColor {
  name: string;
  color_code: string;
  image?: File | null;
  imagePreview?: string;
}

const NovoProduto = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verificandoAdmin, setVerificandoAdmin] = useState(true);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriasData, setCategoriasData] = useState<any[]>([]);
  
  // Estado do formulário
  const [formProduto, setFormProduto] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: '',
    features: [],
    material: '',
    discount_percent: 0,
    is_new: false,
    tags: [],
    sizes: []
  });
  
  // Estado para upload de imagens
  const [imagens, setImagens] = useState<File[]>([]);
  const [imagemPrincipal, setImagemPrincipal] = useState<number>(0);
  const [imagensPreview, setImagensPreview] = useState<string[]>([]);
  
  // Estado para cores
  const [cores, setCores] = useState<ProductColor[]>([]);
  const [novaCor, setNovaCor] = useState<ProductColor>({
    name: '',
    color_code: '#ffffff',
    image: null
  });

  // Estado para tamanhos
  const [tamanhos, setTamanhos] = useState<string[]>([]);
  const [novoTamanho, setNovoTamanho] = useState<string>('');
  
  useEffect(() => {
    if (!user) {
      navigate('/conta');
      return;
    }
    
    const carregarDados = async () => {
      setVerificandoAdmin(true);
      
      try {
        if (!isAdmin) {
          console.log('Usuário não é admin, redirecionando para perfil');
          toast.error('Você não tem permissão para acessar esta página');
          navigate('/perfil');
          return;
        }
        
        console.log('Usuário é admin, buscando categorias');
        await buscarCategorias();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
        navigate('/perfil');
      } finally {
        setVerificandoAdmin(false);
      }
    };
    
    carregarDados();
  }, [user, isAdmin, navigate]);
  
  const buscarCategorias = async () => {
    try {
      console.log('Buscando categorias...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) {
        console.error('Erro ao buscar categorias:', error);
        toast.error('Erro ao carregar categorias');
        setCategorias([]);
        return;
      }
      
      if (data && data.length > 0) {
        const nomesCategorias = data.map(cat => cat.name);
        console.log('Categorias encontradas:', nomesCategorias.length);
        setCategorias(nomesCategorias);
        setCategoriasData(data);
      } else {
        console.log('Nenhuma categoria encontrada');
        setCategorias([]);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error('Erro ao carregar categorias');
      setCategorias([]);
    }
  };
  
  // Manipuladores para o formulário de novo produto
  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arquivosSelecionados = Array.from(e.target.files);
      setImagens([...imagens, ...arquivosSelecionados]);
      
      // Gerar previews
      const novosPreview = arquivosSelecionados.map(file => URL.createObjectURL(file));
      setImagensPreview([...imagensPreview, ...novosPreview]);
    }
  };
  
  const removerImagem = (index: number) => {
    const novasImagens = [...imagens];
    novasImagens.splice(index, 1);
    setImagens(novasImagens);
    
    const novosPreview = [...imagensPreview];
    URL.revokeObjectURL(novosPreview[index]);
    novosPreview.splice(index, 1);
    setImagensPreview(novosPreview);
    
    if (imagemPrincipal === index) {
      setImagemPrincipal(0);
    } else if (imagemPrincipal > index) {
      setImagemPrincipal(imagemPrincipal - 1);
    }
  };

  // Manipuladores para cores
  const handleNovaCorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovaCor({
      ...novaCor,
      [name]: value
    });
  };

  const handleImagemCorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      
      setNovaCor({
        ...novaCor,
        image: file,
        imagePreview: preview
      });
    }
  };

  const adicionarCor = () => {
    if (!novaCor.name) {
      toast.error('Insira um nome para a cor');
      return;
    }

    setCores([...cores, novaCor]);
    setNovaCor({
      name: '',
      color_code: '#ffffff',
      image: null,
      imagePreview: undefined
    });
  };

  const removerCor = (index: number) => {
    const novasCores = [...cores];
    
    // Liberar a URL do preview se existir
    if (novasCores[index].imagePreview) {
      URL.revokeObjectURL(novasCores[index].imagePreview!);
    }
    
    novasCores.splice(index, 1);
    setCores(novasCores);
  };

  // Manipuladores para tamanhos
  const adicionarTamanho = () => {
    if (!novoTamanho) {
      toast.error('Insira um tamanho');
      return;
    }

    if (tamanhos.includes(novoTamanho)) {
      toast.error('Este tamanho já foi adicionado');
      return;
    }

    setTamanhos([...tamanhos, novoTamanho]);
    setNovoTamanho('');
  };

  const removerTamanho = (index: number) => {
    const novosTamanhos = [...tamanhos];
    novosTamanhos.splice(index, 1);
    setTamanhos(novosTamanhos);
  };
  
  const salvarProduto = async () => {
    try {
      setLoading(true);
      
      if (!formProduto.name || !formProduto.price) {
        toast.error('Nome e preço são obrigatórios');
        setLoading(false);
        return;
      }
      
      if (imagens.length === 0) {
        toast.error('Adicione pelo menos uma imagem');
        setLoading(false);
        return;
      }

      if (cores.length === 0) {
        toast.error('Adicione pelo menos uma cor');
        setLoading(false);
        return;
      }

      if (tamanhos.length === 0) {
        toast.error('Adicione pelo menos um tamanho');
        setLoading(false);
        return;
      }
      
      // Encontrar o ID da categoria pelo nome
      let categoryId = '';
      
      if (formProduto.category_id) {
        const categoria = categoriasData.find(cat => cat.name === formProduto.category_id);
        if (categoria) {
          categoryId = categoria.id;
        }
      }
      
      // Inserir o produto
      const { data: novoProduto, error: erroProduto } = await supabase
        .from('products')
        .insert({
          name: formProduto.name,
          description: formProduto.description,
          price: formProduto.price,
          stock: formProduto.stock,
          category_id: categoryId,
          features: formProduto.features,
          material: formProduto.material,
          discount_percent: formProduto.discount_percent,
          is_new: formProduto.is_new,
          tags: formProduto.tags,
          slug: formProduto.name?.toLowerCase().replace(/\s+/g, '-')
        })
        .select()
        .single();
      
      if (erroProduto) {
        console.error('Erro ao criar produto:', erroProduto);
        toast.error('Erro ao criar produto');
        setLoading(false);
        return;
      }
      
      // Upload das imagens gerais do produto
      for (let i = 0; i < imagens.length; i++) {
        // Upload para o storage
        const nomeArquivo = `${Date.now()}-${imagens[i].name}`;
        const caminhoArquivo = `product-images/${novoProduto.id}/${nomeArquivo}`;
        
        const { error: erroUpload } = await supabase.storage
          .from('products')
          .upload(caminhoArquivo, imagens[i]);
        
        if (erroUpload) {
          console.error(`Erro ao fazer upload da imagem ${i}:`, erroUpload);
          toast.error(`Erro ao fazer upload da imagem ${i+1}`);
          continue;
        }
        
        // Obter URL da imagem
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(caminhoArquivo);
        
        // Inserir na tabela de imagens
        const { error: erroImagem } = await supabase
          .from('product_images')
          .insert({
            product_id: novoProduto.id,
            url: urlData.publicUrl,
            is_main: i === imagemPrincipal,
            display_order: i
          });
        
        if (erroImagem) {
          console.error(`Erro ao salvar referência da imagem ${i}:`, erroImagem);
        }
      }

      // Salvar cores
      for (const cor of cores) {
        // Upload da imagem da cor (se existir)
        let imageUrl = null;

        if (cor.image) {
          const nomeArquivoImagem = `${Date.now()}-color-${cor.name}-${cor.image.name}`;
          const caminhoArquivoImagem = `product-colors/${novoProduto.id}/${nomeArquivoImagem}`;
          
          const { error: erroUploadCorImagem } = await supabase.storage
            .from('products')
            .upload(caminhoArquivoImagem, cor.image);
          
          if (erroUploadCorImagem) {
            console.error(`Erro ao fazer upload da imagem da cor ${cor.name}:`, erroUploadCorImagem);
            toast.error(`Erro ao fazer upload da imagem da cor ${cor.name}`);
          } else {
            const { data: urlDataCor } = supabase.storage
              .from('products')
              .getPublicUrl(caminhoArquivoImagem);
            
            imageUrl = urlDataCor.publicUrl;
          }
        }

        // Inserir a cor
        const { data: corInserida, error: erroInserirCor } = await supabase
          .from('product_colors')
          .insert({
            product_id: novoProduto.id,
            name: cor.name,
            color_code: cor.color_code,
            image_url: imageUrl
          })
          .select()
          .single();

        if (erroInserirCor) {
          console.error(`Erro ao inserir cor ${cor.name}:`, erroInserirCor);
          continue;
        }

        // Salvar tamanhos
        for (const tamanho of tamanhos) {
          const { data: tamanhoInserido, error: erroInserirTamanho } = await supabase
            .from('product_sizes')
            .insert({
              product_id: novoProduto.id,
              size: tamanho,
              display_order: tamanhos.indexOf(tamanho)
            })
            .select()
            .single();

          if (erroInserirTamanho) {
            console.error(`Erro ao inserir tamanho ${tamanho}:`, erroInserirTamanho);
            continue;
          }

          // Criar variantes de cor e tamanho
          const { error: erroVariante } = await supabase
            .from('color_size_variants')
            .insert({
              product_id: novoProduto.id,
              color_id: corInserida.id,
              size_id: tamanhoInserido.id,
              stock_quantity: Math.floor(formProduto.stock || 0 / (cores.length * tamanhos.length))
            });

          if (erroVariante) {
            console.error(`Erro ao criar variante para ${cor.name}/${tamanho}:`, erroVariante);
          }
        }
      }
      
      toast.success('Produto criado com sucesso!');
      navigate('/admin/produtos');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-light">
          <span className="text-champagne-500">Novo</span> Produto
        </h1>
        <button 
          onClick={() => navigate('/admin/produtos')}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          ← Voltar para Produtos
        </button>
      </div>
      
      {verificandoAdmin ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coluna da esquerda - Upload de imagens */}
            <div className="md:col-span-1 space-y-4">
              <div className="border-b pb-2 mb-4">
                <h2 className="font-medium text-lg">Imagens do Produto</h2>
                <p className="text-sm text-gray-500">Adicione imagens gerais do produto</p>
              </div>
              
              <div className="space-y-2">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="imagens"
                    multiple
                    accept="image/*"
                    onChange={handleImagemChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="imagens"
                    className="cursor-pointer flex flex-col items-center justify-center py-4"
                  >
                    <svg
                      className="w-10 h-10 text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <p className="text-sm text-gray-600">
                      Clique para adicionar imagens
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos: JPG, PNG, WEBP
                    </p>
                  </label>
                </div>
                
                {/* Previews de imagens */}
                {imagensPreview.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {imagensPreview.map((preview, index) => (
                      <div
                        key={index}
                        className={`relative border rounded-md overflow-hidden ${
                          index === imagemPrincipal ? 'ring-2 ring-champagne-500' : ''
                        }`}
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setImagemPrincipal(index)}
                            className="p-1 bg-white rounded-full text-xs mr-1"
                            title="Definir como principal"
                          >
                            ⭐
                          </button>
                          <button
                            type="button"
                            onClick={() => removerImagem(index)}
                            className="p-1 bg-white rounded-full text-xs ml-1"
                          >
                            🗑️
                          </button>
                        </div>
                        {index === imagemPrincipal && (
                          <div className="absolute top-0 left-0 bg-champagne-500 text-white text-xs p-1">
                            Principal
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seção de Cores */}
              <div className="mt-8 border-t pt-4">
                <div className="border-b pb-2 mb-4">
                  <h2 className="font-medium text-lg">Cores do Produto</h2>
                  <p className="text-sm text-gray-500">Adicione as cores disponíveis</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Cor</label>
                      <input
                        type="text"
                        name="name"
                        value={novaCor.name}
                        onChange={handleNovaCorChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                        placeholder="Ex: Vermelho"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código da Cor</label>
                      <input
                        type="color"
                        name="color_code"
                        value={novaCor.color_code}
                        onChange={handleNovaCorChange}
                        className="w-full h-10 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagem da Cor (opcional)</label>
                    <div className="grid grid-cols-3 gap-2 items-end">
                      <div className="col-span-2">
                        <input
                          type="file"
                          id="imagemCor"
                          accept="image/*"
                          onChange={handleImagemCorChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="imagemCor"
                          className="cursor-pointer flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 w-full"
                        >
                          <span className="text-sm text-gray-600">Selecionar imagem</span>
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={adicionarCor}
                        className="bg-champagne-500 text-white text-sm py-2 px-4 rounded-md hover:bg-champagne-600"
                      >
                        Adicionar
                      </button>
                    </div>

                    {novaCor.imagePreview && (
                      <div className="mt-2">
                        <img
                          src={novaCor.imagePreview}
                          alt="Preview da imagem da cor"
                          className="w-20 h-20 object-cover border rounded-md"
                        />
                      </div>
                    )}
                  </div>

                  {/* Lista de cores adicionadas */}
                  {cores.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Cores adicionadas:</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {cores.map((cor, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                              <div
                                className="w-6 h-6 rounded-full mr-2"
                                style={{ backgroundColor: cor.color_code }}
                              ></div>
                              <span className="text-sm">{cor.name}</span>
                              {cor.imagePreview && (
                                <img
                                  src={cor.imagePreview}
                                  alt={`Imagem da cor ${cor.name}`}
                                  className="w-8 h-8 object-cover ml-2 rounded-sm"
                                />
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removerCor(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Seção de Tamanhos */}
              <div className="mt-8 border-t pt-4">
                <div className="border-b pb-2 mb-4">
                  <h2 className="font-medium text-lg">Tamanhos do Produto</h2>
                  <p className="text-sm text-gray-500">Adicione os tamanhos disponíveis</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho</label>
                      <input
                        type="text"
                        value={novoTamanho}
                        onChange={(e) => setNovoTamanho(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                        placeholder="Ex: P, M, G, 38, 40..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={adicionarTamanho}
                      className="bg-champagne-500 text-white text-sm py-2 px-4 rounded-md hover:bg-champagne-600"
                    >
                      Adicionar
                    </button>
                  </div>

                  {/* Lista de tamanhos adicionados */}
                  {tamanhos.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Tamanhos adicionados:</h3>
                      <div className="flex flex-wrap gap-2">
                        {tamanhos.map((tamanho, index) => (
                          <div key={index} className="flex items-center bg-gray-50 px-3 py-1 rounded-md">
                            <span className="text-sm mr-2">{tamanho}</span>
                            <button
                              type="button"
                              onClick={() => removerTamanho(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Coluna da direita - Formulário de dados */}
            <div className="md:col-span-2 space-y-4">
              <div className="border-b pb-2 mb-4">
                <h2 className="font-medium text-lg">Informações do Produto</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto*</label>
                  <input
                    type="text"
                    value={formProduto.name || ''}
                    onChange={(e) => setFormProduto({...formProduto, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="Ex: Vestido Floral de Verão"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={formProduto.description || ''}
                    onChange={(e) => setFormProduto({...formProduto, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="Descreva detalhes importantes do produto..."
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)*</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formProduto.price || ''}
                      onChange={(e) => setFormProduto({...formProduto, price: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      placeholder="0,00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Total</label>
                    <input
                      type="number"
                      value={formProduto.stock || 0}
                      onChange={(e) => setFormProduto({...formProduto, stock: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Será distribuído entre as variantes</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                      value={formProduto.category_id || ''}
                      onChange={(e) => setFormProduto({...formProduto, category_id: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desconto (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formProduto.discount_percent || 0}
                      onChange={(e) => setFormProduto({...formProduto, discount_percent: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                  <input
                    type="text"
                    value={formProduto.material || ''}
                    onChange={(e) => setFormProduto({...formProduto, material: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="Ex: Algodão, Poliéster, etc."
                  />
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <input
                      type="checkbox"
                      checked={formProduto.is_new || false}
                      onChange={(e) => setFormProduto({...formProduto, is_new: e.target.checked})}
                      className="mr-2 h-4 w-4 text-champagne-500 focus:ring-champagne-500 border-gray-300 rounded"
                    />
                    Marcar como Novo
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formProduto.tags?.join(', ') || ''}
                    onChange={(e) => setFormProduto({
                      ...formProduto, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="verão, festa, casual, etc."
                  />
                </div>
                
                <div className="pt-4 border-t mt-6">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/produtos')}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={salvarProduto}
                      disabled={loading}
                      className={`px-6 py-2 text-sm text-white rounded-md ${
                        loading ? 'bg-champagne-400 cursor-not-allowed' : 'bg-champagne-500 hover:bg-champagne-600'
                      }`}
                    >
                      {loading ? 'Salvando...' : 'Salvar Produto'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NovoProduto; 