import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, uploadImageToStorage } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';

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
}

interface NovaCategoria {
  nome: string;
  slug?: string;
  descricao?: string;
  imagem?: string;
  ordem?: number;
  ativa: boolean;
  destaque: boolean;
  parent_id?: string | null;
}

const NovoProduto = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verificandoAdmin, setVerificandoAdmin] = useState(true);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriasData, setCategoriasData] = useState<any[]>([]);
  
  // Estado do modal de categoria
  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState<NovaCategoria>({
    nome: '',
    descricao: '',
    ativa: true,
    destaque: false,
    parent_id: null
  });
  const [imagemCategoria, setImagemCategoria] = useState<File | null>(null);
  const [imagemCategoriaPreview, setImagemCategoriaPreview] = useState<string>('');
  
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
    color_code: '#ffffff'
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
        await verificarEstruturaProdutos();
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
        .select('*, children:categories!parent_id(*)')
        .is('parent_id', null)
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar categorias:', error);
        toast.error('Erro ao carregar categorias');
        setCategorias([]);
        return;
      }
      
      if (data && data.length > 0) {
        // Criar lista hierárquica de categorias
        const categoriasHierarquicas: string[] = [];
        const categoriasDataCompleta: any[] = [];
        
        data.forEach(categoria => {
          // Adicionar categoria principal
          categoriasHierarquicas.push(categoria.name);
          categoriasDataCompleta.push(categoria);
          
          // Adicionar subcategorias se existirem
          if (categoria.children && categoria.children.length > 0) {
            categoria.children.forEach((subcategoria: any) => {
              categoriasHierarquicas.push(`${categoria.name} > ${subcategoria.name}`);
              categoriasDataCompleta.push({
                ...subcategoria,
                displayName: `${categoria.name} > ${subcategoria.name}`,
                parentName: categoria.name
              });
            });
          }
        });
        
        console.log('Categorias encontradas (incluindo subcategorias):', categoriasHierarquicas.length);
        setCategorias(categoriasHierarquicas);
        setCategoriasData(categoriasDataCompleta);
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
  
  // Função para verificar estrutura da tabela products
  const verificarEstruturaProdutos = async () => {
    try {
      console.log('Verificando estrutura da tabela products...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (data && data.length > 0) {
        console.log('Estrutura da tabela products:', Object.keys(data[0]));
        console.log('Exemplo de produto:', data[0]);
      } else {
        console.log('Nenhum produto encontrado para verificar estrutura');
      }
    } catch (error) {
      console.error('Erro ao verificar estrutura:', error);
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

  const adicionarCor = () => {
    if (!novaCor.name) {
      toast.error('Insira um nome para a cor');
      return;
    }

    setCores([...cores, novaCor]);
    setNovaCor({
      name: '',
      color_code: '#ffffff'
    });
  };

  const removerCor = (index: number) => {
    const novasCores = [...cores];
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
  
  // Função para gerar slug único
  const gerarSlugUnico = async (nome: string): Promise<string> => {
    const slugBase = nome.trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();
    
    let slugFinal = slugBase;
    let contador = 1;
    
    // Verificar se o slug já existe
    while (true) {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slugFinal)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao verificar slug:', error);
        break;
      }
      
      // Se não encontrou nenhum produto com esse slug, está livre
      if (!data) {
        break;
      }
      
      // Se encontrou, incrementa o contador e tenta novamente
      slugFinal = `${slugBase}-${contador}`;
      contador++;
    }
    
    console.log(`Slug gerado: ${slugFinal}`);
    return slugFinal;
  };



  // Função para upload de imagem no storage (baseada na versão funcional do modal de edição)
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

  // Função para salvar produto completo (versão corrigida baseada no modal de edição)
  const salvarProdutoCompleto = async () => {
    console.log('Iniciando salvarProdutoCompleto');
    console.log('Dados do formulário:', formProduto);
    console.log('Imagens:', imagens);
    console.log('Cores:', cores);
    console.log('Tamanhos:', tamanhos);
    
    try {
      setLoading(true);
      
      // Validações básicas
      if (!formProduto.name?.trim()) {
        toast.error('O nome do produto é obrigatório');
        setLoading(false);
        return;
      }
      
      if (!formProduto.price || formProduto.price <= 0) {
        toast.error('O preço deve ser maior que zero');
        setLoading(false);
        return;
      }
      
      if (imagens.length === 0) {
        toast.error('Adicione pelo menos uma imagem do produto');
        setLoading(false);
        return;
      }

      if (cores.length === 0) {
        toast.error('Adicione pelo menos uma cor para o produto');
        setLoading(false);
        return;
      }

      if (tamanhos.length === 0) {
        toast.error('Adicione pelo menos um tamanho para o produto');
        setLoading(false);
        return;
      }
      
      // Encontrar o ID da categoria pelo nome (incluindo subcategorias)
      let categoryId = null;
      if (formProduto.category_id) {
        const categoria = categoriasData.find(cat => 
          cat.name === formProduto.category_id || 
          cat.displayName === formProduto.category_id
        );
        if (categoria) {
          categoryId = categoria.id;
        }
      }
      
      console.log('Categoria selecionada:', categoryId);
      
      // Gerar slug único baseado no nome
      const slug = await gerarSlugUnico(formProduto.name.trim());
      
      // Preparar dados do produto - baseado na estrutura real do schema.ts
      const produtoData: any = {
        name: formProduto.name.trim(),
        price: formProduto.price,
        slug: slug,
        is_active: true,
        in_stock: (formProduto.stock || 0) > 0
      };

      // Adicionar campos opcionais apenas se existirem e não forem vazios
      if (formProduto.description?.trim()) {
        produtoData.description = formProduto.description.trim();
      }
      
      if (categoryId) {
        produtoData.category_id = categoryId;
      }
      
      if (formProduto.discount_percent && formProduto.discount_percent > 0) {
        produtoData.discount_percent = formProduto.discount_percent;
      }
      
      if (formProduto.material?.trim()) {
        produtoData.material = formProduto.material.trim();
      }
      
      // Converter features array para string JSON se existir
      if (formProduto.features && formProduto.features.length > 0) {
        produtoData.features = JSON.stringify(formProduto.features);
      }
      
      // Marcar como destaque se for novo
      if (formProduto.is_new) {
        produtoData.is_featured = true;
      }
      
      console.log('Dados do produto para inserção:', produtoData);
      
      // Inserir o produto
      const { data: novoProduto, error: erroProduto } = await supabase
        .from('products')
        .insert(produtoData)
        .select()
        .single();
      
      if (erroProduto) {
        console.error('Erro ao criar produto:', erroProduto);
        toast.error(`Erro ao criar produto: ${erroProduto.message}`);
        setLoading(false);
        return;
      }
      
      console.log('Produto criado com sucesso:', novoProduto);
      
      // 1. Upload e inserção de imagens
      console.log('Iniciando upload de imagens...');
      for (let i = 0; i < imagens.length; i++) {
        // Fazer upload da imagem para o Storage
        const url = await uploadImagemStorage(imagens[i], novoProduto.id);
        
        if (!url) {
          toast.error(`Erro ao fazer upload da imagem ${i+1}`);
          continue;
        }
        
        // Inserir na tabela de imagens
        const { error: erroImagem } = await supabase
          .from('product_images')
          .insert({
            product_id: novoProduto.id,
            url: url,
            is_main: i === imagemPrincipal,
            display_order: i
          });
        
        if (erroImagem) {
          console.error(`Erro ao salvar referência da imagem ${i}:`, erroImagem);
          toast.error(`Erro ao salvar referência da imagem ${i+1}`);
        }
      }
      console.log('Upload de imagens concluído');

      // 2. Inserir cores
      console.log('Iniciando inserção de cores...');
      const coresInseridas = [];
      for (const cor of cores) {
        // Inserir nova cor (sem imagem pois removemos o campo de imagem das cores)
        const { data: corInserida, error: erroInserirCor } = await supabase
          .from('product_colors')
          .insert({
            product_id: novoProduto.id,
            name: cor.name,
            color_code: cor.color_code
          })
          .select()
          .single();

        if (erroInserirCor) {
          console.error(`Erro ao inserir cor ${cor.name}:`, erroInserirCor);
          toast.error(`Erro ao inserir cor ${cor.name}`);
          continue;
        }

        coresInseridas.push(corInserida);
      }
      console.log('Cores inseridas:', coresInseridas);

      // 3. Inserir tamanhos
      console.log('Iniciando inserção de tamanhos...');
      const tamanhosInseridos = [];
      for (let i = 0; i < tamanhos.length; i++) {
          const { data: tamanhoInserido, error: erroInserirTamanho } = await supabase
            .from('product_sizes')
            .insert({
              product_id: novoProduto.id,
            size: tamanhos[i],
            display_order: i
            })
            .select()
            .single();

          if (erroInserirTamanho) {
          console.error(`Erro ao inserir tamanho ${tamanhos[i]}:`, erroInserirTamanho);
          toast.error(`Erro ao inserir tamanho ${tamanhos[i]}`);
            continue;
          }

        tamanhosInseridos.push(tamanhoInserido);
      }
      console.log('Tamanhos inseridos:', tamanhosInseridos);

      // 4. Criar variantes de cor e tamanho
      console.log('Iniciando criação de variantes...');
      if (coresInseridas.length > 0 && tamanhosInseridos.length > 0) {
        const quantidadePorVariante = Math.floor((formProduto.stock || 0) / (coresInseridas.length * tamanhosInseridos.length)) || 0;
        
        for (const cor of coresInseridas) {
          for (const tamanho of tamanhosInseridos) {
          const { error: erroVariante } = await supabase
            .from('color_size_variants')
            .insert({
              product_id: novoProduto.id,
                color_id: cor.id,
                size_id: tamanho.id,
                stock_quantity: quantidadePorVariante
            });

          if (erroVariante) {
              console.error(`Erro ao criar variante para ${cor.name}/${tamanho.size}:`, erroVariante);
          }
        }
        }
        console.log('Variantes criadas com sucesso');
      } else {
        console.log('Não é possível criar variantes: faltam cores ou tamanhos');
      }
      
      toast.success('Produto criado com sucesso!');
      navigate('/admin/produtos');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagemCategoriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagemCategoria(file);
      setImagemCategoriaPreview(URL.createObjectURL(file));
    }
  };

  const handleNovaCategoriaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setNovaCategoria({
        ...novaCategoria,
        [(e.target as HTMLInputElement).name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setNovaCategoria({
        ...novaCategoria,
        [name]: value
      });
    }
  };

  const gerarSlugCategoria = (nome: string): string => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const salvarNovaCategoria = async () => {
    if (!novaCategoria.nome) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    setLoading(true);

    try {
      const slug = gerarSlugCategoria(novaCategoria.nome);
      let imagemUrl = '';

      if (imagemCategoria) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('categories')
          .upload(`${slug}/${imagemCategoria.name}`, imagemCategoria);

        if (uploadError) {
          throw new Error('Erro ao fazer upload da imagem');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('categories')
          .getPublicUrl(`${slug}/${imagemCategoria.name}`);

        imagemUrl = publicUrl;
      }

      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert([{
          name: novaCategoria.nome,
          slug,
          description: novaCategoria.descricao,
          image_url: imagemUrl || null,
          is_active: novaCategoria.ativa,
          is_featured: novaCategoria.destaque,
          order: novaCategoria.ordem || 0,
          parent_id: novaCategoria.parent_id || null
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success(novaCategoria.parent_id ? 'Subcategoria criada com sucesso!' : 'Categoria criada com sucesso!');
      await buscarCategorias(); // Atualiza a lista de categorias
      setModalCategoriaAberto(false);
      setNovaCategoria({
        nome: '',
        descricao: '',
        ativa: true,
        destaque: false,
        parent_id: null
      });
      setImagemCategoria(null);
      setImagemCategoriaPreview('');

      // Se a categoria foi criada com sucesso, seleciona ela no formulário do produto
      if (newCategory) {
        setFormProduto({
          ...formProduto,
          category_id: newCategory.id
        });
      }

    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
    } finally {
      setLoading(false);
    }
  };

  const renderModalCategoria = () => {
    if (!modalCategoriaAberto) return null;

    // Filtra apenas categorias principais para o select de categoria pai
    const categoriasPrincipais = categoriasData.filter(cat => !cat.parent_id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {novaCategoria.parent_id ? 'Nova Subcategoria' : 'Nova Categoria'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria Pai (opcional)
                </label>
                <select
                  name="parent_id"
                  value={novaCategoria.parent_id || ''}
                  onChange={(e) => setNovaCategoria({
                    ...novaCategoria,
                    parent_id: e.target.value || null,
                    destaque: e.target.value ? false : novaCategoria.destaque // Desativa destaque para subcategorias
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                >
                  <option value="">Nenhuma (Categoria Principal)</option>
                  {categoriasPrincipais.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Selecione uma categoria pai para criar uma subcategoria. Deixe em branco para criar uma categoria principal.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome {novaCategoria.parent_id ? 'da Subcategoria' : 'da Categoria'}*
                </label>
                <input
                  type="text"
                  name="nome"
                  value={novaCategoria.nome}
                  onChange={handleNovaCategoriaChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  placeholder={novaCategoria.parent_id ? "Ex: Vestidos de Festa" : "Ex: Vestidos"}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {novaCategoria.parent_id 
                    ? "Nome da subcategoria que será exibido dentro da categoria pai."
                    : "Nome da categoria principal que será exibido no site."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={novaCategoria.descricao}
                  onChange={handleNovaCategoriaChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  rows={3}
                  placeholder="Descreva brevemente esta categoria..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Uma breve descrição para ajudar na organização e SEO do site.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem {novaCategoria.parent_id ? 'da Subcategoria' : 'da Categoria'}
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagemCategoriaChange}
                    className="w-full"
                  />
                  {imagemCategoriaPreview && (
                    <img
                      src={imagemCategoriaPreview}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded"
                    />
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Imagem que representa a {novaCategoria.parent_id ? 'subcategoria' : 'categoria'}. Recomendado: 800x600px, máximo 2MB.
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="ativa"
                    checked={novaCategoria.ativa}
                    onChange={handleNovaCategoriaChange}
                    className="h-4 w-4 text-champagne-600 focus:ring-champagne-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {novaCategoria.parent_id ? 'Subcategoria Ativa' : 'Categoria Ativa'}
                  </label>
                </div>
                {!novaCategoria.parent_id && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="destaque"
                      checked={novaCategoria.destaque}
                      onChange={handleNovaCategoriaChange}
                      className="h-4 w-4 text-champagne-600 focus:ring-champagne-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Destacar Categoria
                    </label>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {novaCategoria.parent_id 
                  ? "Subcategorias ativas são exibidas dentro de suas categorias pai."
                  : "Categorias ativas são exibidas no site. Categorias em destaque aparecem em seções especiais."}
              </p>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setModalCategoriaAberto(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-champagne-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarNovaCategoria}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-champagne-600 border border-transparent rounded-md hover:bg-champagne-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-champagne-500"
              >
                {loading ? 'Salvando...' : `Salvar ${novaCategoria.parent_id ? 'Subcategoria' : 'Categoria'}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (verificandoAdmin) {
    return <div>Verificando permissões...</div>;
  }

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
      
      <form onSubmit={(e) => { e.preventDefault(); salvarProdutoCompleto(); }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna da esquerda - Upload de imagens */}
          <div className="md:col-span-1 space-y-4">
            <div className="border-b pb-2 mb-4">
              <h2 className="font-medium text-lg">Imagens do Produto</h2>
              <p className="text-sm text-gray-500">Adicione imagens gerais do produto</p>
              <p className="text-xs text-red-500 mt-1">* Obrigatório - Adicione pelo menos uma imagem</p>
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
                <p className="text-xs text-red-500 mt-1">* Obrigatório - Adicione pelo menos uma cor</p>
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
                    <button
                      type="button"
                      onClick={adicionarCor}
                      className="bg-champagne-500 text-white text-sm py-2 px-4 rounded-md hover:bg-champagne-600"
                    >
                      Adicionar
                    </button>
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
                <p className="text-xs text-red-500 mt-1">* Obrigatório - Adicione pelo menos um tamanho</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto
                  <span className="text-red-500 ml-1">*</span>
                </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço (R$)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formProduto.price || ''}
                    onChange={(e) => {
                      const valor = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      console.log('Preço alterado:', valor, 'valor original:', e.target.value);
                      setFormProduto({...formProduto, price: isNaN(valor) ? 0 : valor});
                    }}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={formProduto.category_id || ''}
                      onChange={(e) => setFormProduto({ ...formProduto, category_id: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categoriasData.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.displayName || categoria.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setModalCategoriaAberto(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-champagne-600 hover:bg-champagne-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-champagne-500"
                    >
                      <Plus className="h-5 w-5 mr-1" />
                      Nova
                    </button>
                  </div>
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
                    onClick={salvarProdutoCompleto}
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
      </form>

      {renderModalCategoria()}
    </div>
  );
};

export default NovoProduto; 