import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, uploadImageToStorage } from '../../lib/supabase';
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
  
  category?: string;
  imagemPrincipal?: string;
  categories?: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
}

interface ImagemProduto {
  id?: string;
  product_id: string;
  url: string;
  is_main: boolean;
  display_order: number;
}

interface ProductColor {
  id?: string;
  product_id: string;
  name: string;
  color_code: string;
  image_url?: string;
  imageFile?: File;
  imagePreview?: string;
}

interface ProductSize {
  id?: string;
  product_id: string;
  size: string;
  display_order: number;
}

const AdminProdutos = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [verificandoAdmin, setVerificandoAdmin] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoParaEditar, setProdutoParaEditar] = useState<Product | null>(null);

  // Estado do formulário de edição
  const [formProduto, setFormProduto] = useState<Partial<Product>>({});
  const [salvandoProduto, setSalvandoProduto] = useState(false);
  
  // Estados para gerenciamento de imagens
  const [imagensProduto, setImagensProduto] = useState<ImagemProduto[]>([]);
  const [imagensNovas, setImagensNovas] = useState<File[]>([]);
  const [imagensPreview, setImagensPreview] = useState<string[]>([]);
  const [imagemPrincipal, setImagemPrincipal] = useState<number>(0);
  const [carregandoImagens, setCarregandoImagens] = useState(false);
  const [imagensParaRemover, setImagensParaRemover] = useState<string[]>([]);

  // Estados para cores e tamanhos
  const [coresProduto, setCoresProduto] = useState<ProductColor[]>([]);
  const [coresParaRemover, setCoresParaRemover] = useState<string[]>([]);
  const [novaCor, setNovaCor] = useState<ProductColor>({
    product_id: '',
    name: '',
    color_code: '#ffffff'
  });

  const [tamanhosProduto, setTamanhosProduto] = useState<ProductSize[]>([]);
  const [tamanhosParaRemover, setTamanhosParaRemover] = useState<string[]>([]);
  const [novoTamanho, setNovoTamanho] = useState<string>('');

  // Estado para abas
  const [abaAtiva, setAbaAtiva] = useState<'informacoes' | 'cores' | 'tamanhos'>('informacoes');

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
        
        console.log('Usuário é admin, buscando produtos e categorias');
        await buscarProdutos();
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

  const buscarProdutos = async () => {
    try {
      console.log('[Admin/Produtos] Iniciando busca de produtos...');
      setLoading(true);
      console.log('[Admin/Produtos] Estado de carregamento definido como true');

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Admin/Produtos] Erro ao buscar produtos:', error);
        toast.error('Erro ao carregar produtos. Por favor, tente novamente.');
        return;
      }

      console.log(`[Admin/Produtos] ${data?.length || 0} produtos encontrados`);
      
      if (!data || data.length === 0) {
        console.log('[Admin/Produtos] Nenhum produto encontrado');
        setProdutos([]);
        return;
      }

      // Buscar imagens em uma consulta separada para evitar problemas de relacionamento
      const { data: imagensData, error: imagensError } = await supabase
        .from('product_images')
        .select('*');
        
      if (imagensError) {
        console.error('[Admin/Produtos] Erro ao buscar imagens:', imagensError);
      }
      
      const produtosFormatados = data.map(produto => {
        const imagensDoProduto = imagensData?.filter(img => img.product_id === produto.id) || [];
        const imagemPrincipal = imagensDoProduto.find(img => img.is_main)?.url || '';
        const categoria = produto.categories?.name || 'Sem categoria';
        
        return {
          ...produto,
          imagemPrincipal,
          categoria,
          category: categoria, // Para manter compatibilidade com o resto do código
          // Garantir que o category_id esteja disponível
          category_id: produto.category_id || produto.categories?.id
        };
      });

      console.log('[Admin/Produtos] Produtos formatados com sucesso');
      console.log('[Admin/Produtos] Exemplo de produto formatado:', produtosFormatados[0]);
      setProdutos(produtosFormatados);
      console.log('[Admin/Produtos] Estado de produtos atualizado com sucesso');
    } catch (erro) {
      console.error('[Admin/Produtos] Exceção ao buscar produtos:', erro);
      toast.error('Erro inesperado ao carregar produtos.');
    } finally {
      setLoading(false);
      console.log('[Admin/Produtos] Estado de carregamento definido como false');
    }
  };

  const buscarCategorias = async () => {
    try {
      console.log('Buscando categorias...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true);
      
      if (error) {
        console.error('Erro ao buscar categorias:', error);
        toast.error('Erro ao carregar categorias');
        setCategorias([]);
        return;
      }
      
      if (data && data.length > 0) {
        console.log('Categorias encontradas:', data.length);
        // Armazenar objetos completos de categorias em vez de apenas nomes
        setCategorias(data);
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

  const buscarCoresETamanhos = async (produtoId: string) => {
    try {
      // Buscar cores
      const { data: coresData, error: coresError } = await supabase
        .from('product_colors')
        .select('*')
        .eq('product_id', produtoId);
      
      if (coresError) {
        console.error('Erro ao buscar cores:', coresError);
        toast.error('Erro ao carregar cores do produto');
      } else {
        setCoresProduto(coresData || []);
      }

      // Buscar tamanhos
      const { data: tamanhosData, error: tamanhosError } = await supabase
        .from('product_sizes')
        .select('*')
        .eq('product_id', produtoId)
        .order('display_order', { ascending: true });
      
      if (tamanhosError) {
        console.error('Erro ao buscar tamanhos:', tamanhosError);
        toast.error('Erro ao carregar tamanhos do produto');
      } else {
        setTamanhosProduto(tamanhosData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar cores e tamanhos:', error);
      toast.error('Erro ao carregar atributos do produto');
    }
  };

  const abrirModalEdicao = async (produto: Product) => {
    setProdutoParaEditar(produto);
    setModalAberto(true);
    
    // Resetar estados
    setImagensProduto([]);
    setImagensNovas([]);
    setImagensPreview([]);
    setImagensParaRemover([]);
    setImagemPrincipal(0);
    setCoresProduto([]);
    setCoresParaRemover([]);
    setTamanhosProduto([]);
    setTamanhosParaRemover([]);
    setNovaCor({
      product_id: produto.id,
      name: '',
      color_code: '#ffffff'
    });
    setNovoTamanho('');
    setAbaAtiva('informacoes');
    
    // Buscar imagens do produto
    try {
      setCarregandoImagens(true);
      
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', produto.id)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar imagens do produto:', error);
        toast.error('Erro ao carregar imagens do produto');
        return;
      }
      
      if (data && data.length > 0) {
        setImagensProduto(data);
        
        // Definir imagem principal
        const indexPrincipal = data.findIndex(img => img.is_main);
        if (indexPrincipal !== -1) {
          setImagemPrincipal(indexPrincipal);
        }
      }

      // Buscar cores e tamanhos
      await buscarCoresETamanhos(produto.id);
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
    } finally {
      setCarregandoImagens(false);
    }
  };

  // Funções para manipulação de imagens
  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arquivosSelecionados = Array.from(e.target.files);
      setImagensNovas([...imagensNovas, ...arquivosSelecionados]);
      
      // Converter arquivos para base64 em vez de usar URL.createObjectURL
      arquivosSelecionados.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setImagensPreview(prevPreview => [...prevPreview, base64String]);
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const removerImagem = (index: number, isExistente: boolean) => {
    if (isExistente) {
      // Remover imagem existente
      const imagem = imagensProduto[index];
      
      // Adicionar à lista de imagens para remover no servidor
      if (imagem.id) {
        setImagensParaRemover([...imagensParaRemover, imagem.id]);
      }
      
      // Remover do estado local
      const novasImagens = [...imagensProduto];
      novasImagens.splice(index, 1);
      setImagensProduto(novasImagens);
      
      // Ajustar imagem principal se necessário
      if (imagemPrincipal === index) {
        setImagemPrincipal(0);
      } else if (imagemPrincipal > index) {
        setImagemPrincipal(imagemPrincipal - 1);
      }
    } else {
      // Remover imagem nova
      const indexReal = index - imagensProduto.length;
      
      const novasImagens = [...imagensNovas];
      novasImagens.splice(indexReal, 1);
      setImagensNovas(novasImagens);
      
      const novosPreview = [...imagensPreview];
      // Com base64 não precisamos revogar URL
      novosPreview.splice(indexReal, 1);
      setImagensPreview(novosPreview);
      
      // Ajustar imagem principal se necessário
      const totalImagens = imagensProduto.length + imagensNovas.length;
      if (imagemPrincipal >= totalImagens) {
        setImagemPrincipal(totalImagens > 0 ? totalImagens - 1 : 0);
      }
    }
  };
  
  const definirImagemPrincipal = (index: number) => {
    setImagemPrincipal(index);
  };

  // Função para excluir um produto
  const excluirProduto = async (id: string) => {
    try {
      if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
      }
      
      setLoading(true);
      
      // Primeiro exclui todas as imagens relacionadas
      const { error: erroImagens } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', id);
      
      if (erroImagens) {
        console.error('Erro ao excluir imagens do produto:', erroImagens);
        toast.error('Erro ao excluir imagens do produto');
        setLoading(false);
        return;
      }
      
      // Agora exclui o produto
      const { error: erroProduto } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (erroProduto) {
        console.error('Erro ao excluir produto:', erroProduto);
        toast.error('Erro ao excluir produto');
        setLoading(false);
        return;
      }
      
      toast.success('Produto excluído com sucesso');
      // Remover o produto da lista local
      setProdutos(produtos.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    } finally {
      setLoading(false);
    }
  };
  
  const alterarDestaque = async (id: string, features: string[]) => {
    try {
      console.log('Estado atual do produto:', { id, features, tipo: typeof features });
      
      // Verificar se features é um array válido
      let featuresAtuais: string[] = [];
      
      if (Array.isArray(features)) {
        featuresAtuais = [...features];
      } else if (features) {
        console.warn('Campo features não é um array válido:', features);
        // Tentar converter para array se for string (formato JSON)
        try {
          if (typeof features === 'string') {
            featuresAtuais = JSON.parse(features);
            if (!Array.isArray(featuresAtuais)) {
              console.error('Campo features não pôde ser convertido para array:', features);
              featuresAtuais = [];
            }
          }
        } catch (err) {
          console.error('Erro ao converter features para array:', err);
          featuresAtuais = [];
        }
      }
      
      // Verificar se já tem o destaque
      const temDestaque = featuresAtuais.includes('destaque');
      
      // Atualizar features: adicionar ou remover 'destaque'
      const novasFeatures = temDestaque
        ? featuresAtuais.filter(f => f !== 'destaque')
        : [...featuresAtuais, 'destaque'];
      
      console.log('Novas features:', novasFeatures);
      
      const { error } = await supabase
        .from('products')
        .update({ features: novasFeatures })
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao atualizar destaque:', error);
        toast.error('Erro ao atualizar produto');
        return;
      }
      
      toast.success(temDestaque 
        ? 'Destaque removido' 
        : 'Produto marcado como destaque');
      
      // Atualizar produto na lista
      setProdutos(produtos.map(p => 
        p.id === id ? { ...p, features: novasFeatures } : p
      ));
    } catch (error) {
      console.error('Erro ao alterar destaque do produto:', error);
      toast.error('Erro ao atualizar produto');
    }
  };

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(produto => {
    const correspondeAoFiltro = produto.name.toLowerCase().includes(filtro.toLowerCase()) ||
                                 produto.id.includes(filtro);
    
    const correspondeACategoria = categoriaSelecionada === '' || 
                                  produto.category === categoriaSelecionada;
    
    return correspondeAoFiltro && correspondeACategoria;
  });

  // Atualiza o estado do formulário quando um produto é selecionado para edição
  useEffect(() => {
    if (produtoParaEditar) {
      setFormProduto({
        name: produtoParaEditar.name,
        description: produtoParaEditar.description || '',
        price: produtoParaEditar.price,
        stock: produtoParaEditar.stock,
        category_id: produtoParaEditar.category_id,
        features: produtoParaEditar.features || [],
        material: produtoParaEditar.material || '',
        discount_percent: produtoParaEditar.discount_percent || 0
      });
      console.log('Editando produto com categoria_id:', produtoParaEditar.category_id);
    } else {
      setFormProduto({});
    }
  }, [produtoParaEditar]);

  // Função para fazer upload de uma imagem para o Storage
  const uploadImagemStorage = async (file: File, produtoId: string): Promise<string | null> => {
    try {
      // Usar a nova função de upload de imagens
      const { url, error } = await uploadImageToStorage(
        file,
        'products',
        `product-images/${produtoId}`
      );
      
      if (error) {
        console.error('Erro no upload:', error);
        toast.error(`Erro ao fazer upload: ${error.message || 'Erro desconhecido'}`);
        return null;
      }
      
      return url;
    } catch (error) {
      console.error('Exceção no upload:', error);
      toast.error('Erro inesperado durante o upload');
      return null;
    }
  };

  // Função para atualizar o produto
  const salvarProduto = async () => {
    try {
      setSalvandoProduto(true);
      
      if (!formProduto.name || !formProduto.price) {
        toast.error('Nome e preço são obrigatórios');
        return;
      }
      
      // Log detalhado para depuração
      console.log('Dados do produto antes de salvar:', {
        ...formProduto,
        category_id_type: typeof formProduto.category_id
      });
      
      if (produtoParaEditar) {
        // Atualizar produto existente
        const { error } = await supabase
          .from('products')
          .update({
            name: formProduto.name,
            description: formProduto.description,
            price: formProduto.price,
            stock: formProduto.stock,
            category_id: formProduto.category_id,
            features: formProduto.features,
            material: formProduto.material,
            discount_percent: formProduto.discount_percent
          })
          .eq('id', produtoParaEditar.id);
        
        if (error) {
          console.error('Erro ao atualizar produto:', error);
          toast.error('Erro ao atualizar produto');
          return;
        }
        
        // Processar imagens
        // 1. Remover imagens marcadas para exclusão
        if (imagensParaRemover.length > 0) {
          for (const imagemId of imagensParaRemover) {
            const { error: erroRemocao } = await supabase
              .from('product_images')
              .delete()
              .eq('id', imagemId);
            
            if (erroRemocao) {
              console.error('Erro ao remover imagem:', erroRemocao);
            }
          }
        }
        
        // 2. Atualizar status de imagem principal nas imagens existentes
        for (let i = 0; i < imagensProduto.length; i++) {
          const isMain = i === imagemPrincipal;
          
          // Só atualiza se o status mudou
          if (imagensProduto[i].is_main !== isMain) {
            const { error: erroAtualizacao } = await supabase
              .from('product_images')
              .update({ is_main: isMain, display_order: i })
              .eq('id', imagensProduto[i].id);
            
            if (erroAtualizacao) {
              console.error('Erro ao atualizar status da imagem:', erroAtualizacao);
            }
          }
        }
        
        // 3. Upload de novas imagens
        if (imagensNovas.length > 0) {
          for (let i = 0; i < imagensNovas.length; i++) {
            // Índice real considerando a posição após as imagens existentes
            const indexReal = imagensProduto.length + i;
            
            // Fazer upload da imagem para o Storage
            const url = await uploadImagemStorage(imagensNovas[i], produtoParaEditar.id);
            
            if (!url) {
              toast.error(`Erro ao fazer upload da imagem ${i+1}`);
              continue;
            }
            
            // Inserir na tabela de imagens
            const { error: erroImagem } = await supabase
              .from('product_images')
              .insert({
                product_id: produtoParaEditar.id,
                url: url,
                is_main: indexReal === imagemPrincipal,
                display_order: indexReal
              });
            
            if (erroImagem) {
              console.error(`Erro ao salvar referência da imagem ${i}:`, erroImagem);
              toast.error(`Erro ao salvar referência da imagem ${i+1}`);
            }
          }
        }

        // 4. Processar cores
        // 4.1 Remover cores marcadas para exclusão
        if (coresParaRemover.length > 0) {
          for (const corId of coresParaRemover) {
            // Excluir variantes (color_size_variants) relacionadas a esta cor
            const { error: erroVariantes } = await supabase
              .from('color_size_variants')
              .delete()
              .eq('color_id', corId);
            
            if (erroVariantes) {
              console.error('Erro ao remover variantes da cor:', erroVariantes);
            }

            // Excluir a cor
            const { error: erroRemocaoCor } = await supabase
              .from('product_colors')
              .delete()
              .eq('id', corId);
            
            if (erroRemocaoCor) {
              console.error('Erro ao remover cor:', erroRemocaoCor);
            }
          }
        }

        // 4.2 Processar cores novas e existentes
        for (const cor of coresProduto) {
          let corId = cor.id;
          
          // Upload da imagem da cor, se houver
          let imageUrl = cor.image_url;
          if (cor.imageFile) {
            const nomeArquivoImagem = `${Date.now()}-color-${cor.name}-${cor.imageFile.name}`;
            const caminhoArquivoImagem = `product-colors/${produtoParaEditar.id}/${nomeArquivoImagem}`;
            
            const { error: erroUploadCorImagem } = await supabase.storage
              .from('products')
              .upload(caminhoArquivoImagem, cor.imageFile);
            
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

          if (corId) {
            // Atualizar cor existente
            const { error: erroAtualizacaoCor } = await supabase
              .from('product_colors')
              .update({
                name: cor.name,
                color_code: cor.color_code,
                image_url: imageUrl
              })
              .eq('id', corId);
            
            if (erroAtualizacaoCor) {
              console.error(`Erro ao atualizar cor ${cor.name}:`, erroAtualizacaoCor);
            }
          } else {
            // Inserir nova cor
            const { data: corInserida, error: erroInserirCor } = await supabase
              .from('product_colors')
              .insert({
                product_id: produtoParaEditar.id,
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
            
            corId = corInserida.id;
          }
        }

        // 5. Processar tamanhos
        // 5.1 Remover tamanhos marcados para exclusão
        if (tamanhosParaRemover.length > 0) {
          for (const tamanhoId of tamanhosParaRemover) {
            // Excluir variantes relacionadas a este tamanho
            const { error: erroVariantesTamanho } = await supabase
              .from('color_size_variants')
              .delete()
              .eq('size_id', tamanhoId);
            
            if (erroVariantesTamanho) {
              console.error('Erro ao remover variantes do tamanho:', erroVariantesTamanho);
            }

            // Excluir o tamanho
            const { error: erroRemocaoTamanho } = await supabase
              .from('product_sizes')
              .delete()
              .eq('id', tamanhoId);
            
            if (erroRemocaoTamanho) {
              console.error('Erro ao remover tamanho:', erroRemocaoTamanho);
            }
          }
        }

        // 5.2 Processar tamanhos novos e existentes
        for (let i = 0; i < tamanhosProduto.length; i++) {
          const tamanho = tamanhosProduto[i];
          
          if (tamanho.id) {
            // Atualizar tamanho existente
            const { error: erroAtualizacaoTamanho } = await supabase
              .from('product_sizes')
              .update({
                size: tamanho.size,
                display_order: i
              })
              .eq('id', tamanho.id);
            
            if (erroAtualizacaoTamanho) {
              console.error(`Erro ao atualizar tamanho ${tamanho.size}:`, erroAtualizacaoTamanho);
            }
          } else {
            // Inserir novo tamanho
            const { error: erroInserirTamanho } = await supabase
              .from('product_sizes')
              .insert({
                product_id: produtoParaEditar.id,
                size: tamanho.size,
                display_order: i
              });
            
            if (erroInserirTamanho) {
              console.error(`Erro ao inserir tamanho ${tamanho.size}:`, erroInserirTamanho);
            }
          }
        }

        // 6. Criação/atualização de variantes cor x tamanho
        // Vamos regenerar as variantes após alterar cores e tamanhos
        // Primeiro, buscar cores e tamanhos atualizados do produto
        const { data: coresAtualizadas, error: erroCores } = await supabase
          .from('product_colors')
          .select('id')
          .eq('product_id', produtoParaEditar.id);
        
        const { data: tamanhosAtualizados, error: erroTamanhos } = await supabase
          .from('product_sizes')
          .select('id')
          .eq('product_id', produtoParaEditar.id);
        
        if (erroCores || erroTamanhos) {
          console.error('Erro ao buscar cores/tamanhos atualizados');
        } else if (coresAtualizadas && tamanhosAtualizados) {
          // Para cada combinação, vamos verificar se já existe uma variante
          for (const cor of coresAtualizadas) {
            for (const tamanho of tamanhosAtualizados) {
              // Verificar se já existe esta variante
              const { data: varianteExistente, error: erroConsulta } = await supabase
                .from('color_size_variants')
                .select('id')
                .eq('product_id', produtoParaEditar.id)
                .eq('color_id', cor.id)
                .eq('size_id', tamanho.id)
                .maybeSingle();
              
              if (erroConsulta) {
                console.error('Erro ao consultar variante:', erroConsulta);
                continue;
              }
              
              if (!varianteExistente) {
                // Criar nova variante
                const { error: erroCriarVariante } = await supabase
                  .from('color_size_variants')
                  .insert({
                    product_id: produtoParaEditar.id,
                    color_id: cor.id,
                    size_id: tamanho.id,
                    stock_quantity: Math.floor(formProduto.stock || 0 / (coresAtualizadas.length * tamanhosAtualizados.length))
                  });
                
                if (erroCriarVariante) {
                  console.error('Erro ao criar variante:', erroCriarVariante);
                }
              }
            }
          }
        }
        
        toast.success('Produto atualizado com sucesso');
        
        // Atualiza a lista local
        setProdutos(produtos.map(p => 
          p.id === produtoParaEditar.id 
            ? { 
                ...p, 
                ...formProduto,
                category: p.categories?.name || 'Sem categoria'
              } 
            : p
        ));
      }
      
      // Fecha o modal
      setModalAberto(false);
      setProdutoParaEditar(null);
      
      // Recarregar produtos para atualizar as imagens na lista
      buscarProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setSalvandoProduto(false);
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
        imageFile: file,
        imagePreview: preview
      });
    }
  };

  const adicionarCor = () => {
    if (!novaCor.name) {
      toast.error('Insira um nome para a cor');
      return;
    }

    // Verificar se já existe uma cor com o mesmo nome
    if (coresProduto.some(cor => cor.name.toLowerCase() === novaCor.name.toLowerCase())) {
      toast.error('Já existe uma cor com esse nome');
      return;
    }

    // Adicionar a nova cor ao estado local (sem salvar no banco ainda)
    setCoresProduto([...coresProduto, novaCor]);
    
    // Resetar o formulário
    setNovaCor({
      product_id: produtoParaEditar?.id || '',
      name: '',
      color_code: '#ffffff'
    });
  };

  const removerCor = (index: number) => {
    const corParaRemover = coresProduto[index];
    
    // Se a cor já está no banco (tem ID), adiciona à lista para remover depois
    if (corParaRemover.id) {
      setCoresParaRemover([...coresParaRemover, corParaRemover.id]);
    }
    
    // Liberar URL do preview se existir
    if (corParaRemover.imagePreview) {
      URL.revokeObjectURL(corParaRemover.imagePreview);
    }
    
    // Remover do estado local
    const novasCores = [...coresProduto];
    novasCores.splice(index, 1);
    setCoresProduto(novasCores);
  };

  // Manipuladores para tamanhos
  const adicionarTamanho = () => {
    if (!novoTamanho) {
      toast.error('Insira um tamanho');
      return;
    }

    // Verificar se já existe esse tamanho
    if (tamanhosProduto.some(t => t.size.toLowerCase() === novoTamanho.toLowerCase())) {
      toast.error('Este tamanho já foi adicionado');
      return;
    }

    // Adicionar o novo tamanho ao estado local
    const novoTamanhoObj: ProductSize = {
      product_id: produtoParaEditar?.id || '',
      size: novoTamanho,
      display_order: tamanhosProduto.length
    };
    
    setTamanhosProduto([...tamanhosProduto, novoTamanhoObj]);
    setNovoTamanho('');
  };

  const removerTamanho = (index: number) => {
    const tamanhoParaRemover = tamanhosProduto[index];
    
    // Se o tamanho já está no banco (tem ID), adiciona à lista para remover depois
    if (tamanhoParaRemover.id) {
      setTamanhosParaRemover([...tamanhosParaRemover, tamanhoParaRemover.id]);
    }
    
    // Remover do estado local
    const novosTamanhos = [...tamanhosProduto];
    novosTamanhos.splice(index, 1);
    setTamanhosProduto(novosTamanhos);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-light">
          Gerenciamento de <span className="text-champagne-500">Produtos</span>
        </h1>
        <button 
          onClick={() => navigate('/admin')}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          ← Voltar ao Painel
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome ou ID..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={categoriaSelecionada}
              onChange={(e) => setCategoriaSelecionada(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
            >
              <option value="">Todas as categorias</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <button 
              onClick={() => navigate('/admin/produtos/novo')}
              className="px-4 py-2 bg-champagne-500 text-white rounded-md hover:bg-champagne-600 transition-colors"
            >
              Adicionar Produto
            </button>
          </div>
        </div>
        
        {verificandoAdmin ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum produto encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destaque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtosFiltrados.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{produto.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => alterarDestaque(produto.id, produto.features)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          produto.features?.includes('destaque') 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {produto.features?.includes('destaque') ? 'Destacado' : 'Normal'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => abrirModalEdicao(produto)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => excluirProduto(produto.id)}
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
      
      {/* Modal de edição de produto */}
      {modalAberto && produtoParaEditar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Editar Produto</h2>
              <button 
                onClick={() => {
                  setModalAberto(false);
                  setProdutoParaEditar(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Abas de navegação */}
            <div className="flex border-b mb-6">
              <button 
                className={`py-2 px-4 font-medium ${abaAtiva === 'informacoes' ? 'text-champagne-500 border-b-2 border-champagne-500' : 'text-gray-500'}`}
                onClick={() => setAbaAtiva('informacoes')}
              >
                Informações
              </button>
              <button 
                className={`py-2 px-4 font-medium ${abaAtiva === 'cores' ? 'text-champagne-500 border-b-2 border-champagne-500' : 'text-gray-500'}`}
                onClick={() => setAbaAtiva('cores')}
              >
                Cores
              </button>
              <button 
                className={`py-2 px-4 font-medium ${abaAtiva === 'tamanhos' ? 'text-champagne-500 border-b-2 border-champagne-500' : 'text-gray-500'}`}
                onClick={() => setAbaAtiva('tamanhos')}
              >
                Tamanhos
              </button>
            </div>
            
            {/* Conteúdo da aba Informações */}
            {abaAtiva === 'informacoes' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Coluna da esquerda - Imagens */}
                <div className="md:col-span-1 space-y-4">
                  <div className="border-b pb-2 mb-4">
                    <h3 className="font-medium text-lg">Imagens do Produto</h3>
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
                    
                    {carregandoImagens ? (
                      <div className="flex justify-center py-4">
                        <div className="w-8 h-8 border-2 border-champagne-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div>
                        {/* Imagens existentes */}
                        {imagensProduto.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Imagens atuais:</p>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              {imagensProduto.map((imagem, index) => (
                                <div
                                  key={`existing-${index}`}
                                  className={`relative border rounded-md overflow-hidden ${
                                    index === imagemPrincipal ? 'ring-2 ring-champagne-500' : ''
                                  }`}
                                >
                                  <img
                                    src={imagem.url}
                                    alt={`Imagem ${index + 1}`}
                                    className="w-full h-32 object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => definirImagemPrincipal(index)}
                                      className="p-1 bg-white rounded-full text-xs mr-1"
                                      title="Definir como principal"
                                    >
                                      ⭐
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removerImagem(index, true)}
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
                          </div>
                        )}
                        
                        {/* Novas imagens */}
                        {imagensPreview.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Novas imagens:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {imagensPreview.map((preview, index) => (
                                <div
                                  key={`new-${index}`}
                                  className={`relative border rounded-md overflow-hidden ${
                                    imagensProduto.length + index === imagemPrincipal ? 'ring-2 ring-champagne-500' : ''
                                  }`}
                                >
                                  <img
                                    src={preview}
                                    alt={`Nova imagem ${index + 1}`}
                                    className="w-full h-32 object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => definirImagemPrincipal(imagensProduto.length + index)}
                                      className="p-1 bg-white rounded-full text-xs mr-1"
                                      title="Definir como principal"
                                    >
                                      ⭐
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removerImagem(imagensProduto.length + index, false)}
                                      className="p-1 bg-white rounded-full text-xs ml-1"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                  {imagensProduto.length + index === imagemPrincipal && (
                                    <div className="absolute top-0 left-0 bg-champagne-500 text-white text-xs p-1">
                                      Principal
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {imagensProduto.length === 0 && imagensPreview.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-2">
                            Nenhuma imagem disponível. Adicione imagens para o produto.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Coluna da direita - Formulário de informações */}
                <div className="md:col-span-2 space-y-4">
                  <div className="border-b pb-2 mb-4">
                    <h3 className="font-medium text-lg">Informações do Produto</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      value={formProduto.name || ''}
                      onChange={(e) => setFormProduto({...formProduto, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={formProduto.description || ''}
                      onChange={(e) => setFormProduto({...formProduto, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formProduto.price || ''}
                        onChange={(e) => setFormProduto({...formProduto, price: parseFloat(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Total</label>
                      <input
                        type="number"
                        value={formProduto.stock || 0}
                        onChange={(e) => setFormProduto({...formProduto, stock: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
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
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Conteúdo da aba Cores */}
            {abaAtiva === 'cores' && (
              <div className="space-y-6">
                <div className="border-b pb-2 mb-4">
                  <h3 className="font-medium text-lg">Cores do Produto</h3>
                  <p className="text-sm text-gray-500">Adicione as cores disponíveis para este produto</p>
                </div>

                {/* Formulário para adicionar cor */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium mb-3">Adicionar Nova Cor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagem da Cor (opcional)</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        id="imagemCor"
                        accept="image/*"
                        onChange={handleImagemCorChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="imagemCor"
                        className="cursor-pointer flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <span className="text-sm text-gray-600">Selecionar imagem</span>
                      </label>
                      {novaCor.imagePreview && (
                        <div className="relative w-16 h-16">
                          <img
                            src={novaCor.imagePreview}
                            alt="Preview da imagem da cor"
                            className="w-16 h-16 object-cover border rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={adicionarCor}
                      className="bg-champagne-500 text-white text-sm py-2 px-4 rounded-md hover:bg-champagne-600"
                    >
                      Adicionar Cor
                    </button>
                  </div>
                </div>

                {/* Lista de cores adicionadas */}
                <div>
                  <h4 className="text-md font-medium mb-3">Cores Adicionadas</h4>
                  
                  {coresProduto.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhuma cor adicionada. Adicione cores para este produto.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {coresProduto.map((cor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-md">
                          <div className="flex items-center">
                            <div
                              className="w-8 h-8 rounded-full mr-3"
                              style={{ backgroundColor: cor.color_code }}
                            ></div>
                            <span className="font-medium">{cor.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            {(cor.image_url || cor.imagePreview) && (
                              <img
                                src={cor.imagePreview || cor.image_url}
                                alt={`Imagem da cor ${cor.name}`}
                                className="w-10 h-10 object-cover rounded-sm"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => removerCor(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Conteúdo da aba Tamanhos */}
            {abaAtiva === 'tamanhos' && (
              <div className="space-y-6">
                <div className="border-b pb-2 mb-4">
                  <h3 className="font-medium text-lg">Tamanhos do Produto</h3>
                  <p className="text-sm text-gray-500">Adicione os tamanhos disponíveis para este produto</p>
                </div>

                {/* Formulário para adicionar tamanho */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium mb-3">Adicionar Novo Tamanho</h4>
                  <div className="flex space-x-3 mb-2">
                    <input
                      type="text"
                      value={novoTamanho}
                      onChange={(e) => setNovoTamanho(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      placeholder="Ex: P, M, G, 38, 40..."
                    />
                    <button
                      type="button"
                      onClick={adicionarTamanho}
                      className="bg-champagne-500 text-white text-sm py-2 px-4 rounded-md hover:bg-champagne-600"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                {/* Lista de tamanhos adicionados */}
                <div>
                  <h4 className="text-md font-medium mb-3">Tamanhos Adicionados</h4>
                  
                  {tamanhosProduto.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum tamanho adicionado. Adicione tamanhos para este produto.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tamanhosProduto.map((tamanho, index) => (
                        <div key={index} className="flex items-center bg-white border px-4 py-2 rounded-md">
                          <span className="font-medium mr-2">{tamanho.size}</span>
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
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
              <button
                type="button"
                onClick={() => {
                  setModalAberto(false);
                  setProdutoParaEditar(null);
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarProduto}
                disabled={salvandoProduto}
                className={`px-4 py-2 text-sm text-white rounded-md ${
                  salvandoProduto ? 'bg-champagne-400 cursor-not-allowed' : 'bg-champagne-500 hover:bg-champagne-600'
                }`}
              >
                {salvandoProduto ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProdutos; 