import { supabase } from '../supabase';
import { Product, ProductWithDetails } from '../../types/product';

const ITEMS_PER_PAGE = 12;
const CACHE_TIME = 5 * 60 * 1000; // 5 minutos em milissegundos
let productCache: Record<string, { data: any; timestamp: number }> = {};

/**
 * Busca produtos com paginação e filtros opcionais
 */
export async function getProducts({
  page = 1,
  categoryId = null,
  categoryIds = null,
  search = '',
  orderBy = 'created_at',
  orderDirection = 'desc',
  priceRange = null,
  tags = [],
  material = null,
  sizes = [],
  colors = []
}: {
  page?: number;
  categoryId?: string | null;
  categoryIds?: string[] | null;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  priceRange?: { min: number; max: number } | null;
  tags?: string[];
  material?: string | null;
  sizes?: string[];
  colors?: string[];
}) {
  // Cache key baseado nos parâmetros da consulta
  const cacheKey = `products_${page}_${categoryId}_${categoryIds?.join(',')}_${search}_${orderBy}_${orderDirection}_${JSON.stringify(priceRange)}_${tags.join(',')}_${material}_${sizes.join(',')}_${colors.join(',')}`;
  
  console.log('[getProducts] Parâmetros de busca:', { 
    page, categoryId, categoryIds, search, orderBy, orderDirection,
    priceRange, tags, material, sizes, colors
  });
  
  // Verificar se temos uma versão em cache válida
  const cachedData = productCache[cacheKey];
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TIME) {
    console.log('[getProducts] Retornando dados do cache, total:', cachedData.data.length);
    return { data: cachedData.data, count: cachedData.data.length, error: null };
  }

  try {
    console.log('[getProducts] Construindo query...');
    
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories!inner(*),
        images:product_images(id, url, alt_text, is_main),
        variants:color_size_variants(stock_quantity)
      `, { count: 'exact' })
      .eq('is_active', true)
      .eq('in_stock', true);

    // Aplicar filtros existentes
    if (categoryIds && categoryIds.length > 0) {
      query = query.in('category_id', categoryIds);
    } else if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Novos filtros
    if (priceRange) {
      query = query
        .gte('price', priceRange.min)
        .lte('price', priceRange.max);
    }

    if (tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    if (material) {
      query = query.eq('material', material);
    }

    if (sizes.length > 0) {
      query = query.overlaps('sizes', sizes);
    }

    if (colors.length > 0) {
      query = query.overlaps('colors', colors);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Aplicar ordenação
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    // Aplicar paginação
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    
    console.log('[getProducts] Executando query com range:', from, 'a', to);
    
    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('[getProducts] Erro na query:', error);
      throw error;
    }

    console.log('[getProducts] Resultados encontrados:', data?.length || 0, 'de total:', count);

    // Filtrar produtos que têm estoque nas variantes
    const productsWithStock = data?.filter(product => {
      // Se não tem variantes, considerar em estoque se in_stock = true
      if (!product.variants || product.variants.length === 0) {
        return product.in_stock;
      }
      
      // Se tem variantes, verificar se pelo menos uma tem estoque > 0
      const totalStock = product.variants.reduce((sum: number, variant: any) => 
        sum + (variant.stock_quantity || 0), 0
      );
      
      return totalStock > 0;
    });

    console.log('[getProducts] Produtos com estoque após filtro:', productsWithStock?.length || 0);

    // Processar os dados para um formato mais amigável
    const processedData = productsWithStock?.map(product => {
      // Encontrar imagem principal
      let mainImage = null;
      if (product.images && product.images.length > 0) {
        const mainImg = product.images.find((img: any) => img.is_main === true);
        mainImage = mainImg ? mainImg.url : product.images[0].url;
      }
      
      // Calcular estoque total
      const totalStock = product.variants?.reduce((sum: number, variant: any) => 
        sum + (variant.stock_quantity || 0), 0) || 0;
      
      return {
      ...product,
        mainImage,
        images: product.images,
        totalStock
      };
    });

    // Armazenar em cache
    productCache[cacheKey] = { data: processedData, timestamp: Date.now() };

    return { 
      data: processedData, 
      count: productsWithStock?.length || 0, 
      error: null,
      totalPages: productsWithStock ? Math.ceil(productsWithStock.length / ITEMS_PER_PAGE) : 0
    };
  } catch (error) {
    console.error('[getProducts] Erro ao buscar produtos:', error);
    return { data: null, count: 0, error };
  }
}

/**
 * Busca detalhes completos de um produto com todas as relações
 */
export async function getProductDetails(productId: string): Promise<{ data: ProductWithDetails | null; error: any }> {
  const cacheKey = `product_${productId}`;
  
  // Verificar cache
  const cachedData = productCache[cacheKey];
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TIME) {
    return { data: cachedData.data, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        colors:product_colors(*),
        sizes:product_sizes(*),
        reviews(*)
      `)
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    if (!data) {
      return { data: null, error: new Error('Produto não encontrado') };
    }

    // Buscar estoque para as variantes do produto
    const { data: stockData, error: stockError } = await supabase
      .from('color_size_variants')
      .select('*')
      .eq('product_id', productId);

    if (stockError) throw stockError;

    // Organizar os dados para um formato mais amigável para o frontend
    const processedProduct = {
      ...data,
      mainImage: data.images.find(img => img.is_main)?.url || data.images[0]?.url,
      variants: stockData || [],
      related_products: [] // Campo vazio até que seja configurado corretamente no banco
    };

    // Armazenar em cache
    productCache[cacheKey] = { data: processedProduct, timestamp: Date.now() };

    return { data: processedProduct, error: null };
  } catch (error) {
    console.error('Erro ao buscar detalhes do produto:', error);
    return { data: null, error };
  }
}

/**
 * Limpa o cache de produtos
 */
export function clearProductCache(productId?: string) {
  if (productId) {
    // Limpar apenas cache específico deste produto
    Object.keys(productCache).forEach(key => {
      if (key === `product_${productId}` || key.includes('products_')) {
        delete productCache[key];
      }
    });
  } else {
    // Limpar todo o cache
    productCache = {};
  }
}

/**
 * Verifica se um produto tem 'destaque' em suas features independente do formato
 */
function isProdutoDestaque(product: any): boolean {
  if (!product) return false;
  
  // Se features for um array, verifica se 'destaque' está presente
  if (Array.isArray(product.features)) {
    return product.features.includes('destaque');
  }
  
  // Se features for uma string JSON, tenta convertar para array
  if (typeof product.features === 'string') {
    try {
      const featuresArray = JSON.parse(product.features);
      if (Array.isArray(featuresArray)) {
        return featuresArray.includes('destaque');
      }
    } catch (e) {
      // Ignora erro de parse
    }
  }
  
  // Verifica se o produto possui a propriedade is_featured
  if (product.is_featured === true) {
    return true;
  }
  
  return false;
}

/**
 * Busca produtos em destaque para a página inicial
 */
export async function getFeaturedProducts(limit = 6) {
  const cacheKey = `featured_products_${limit}`;
  const cachedData = productCache[cacheKey];
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TIME) {
    console.log('[getFeaturedProducts] Retornando dados do cache:', cachedData.data?.length || 0, 'produtos');
    return { data: cachedData.data, error: null };
  }

  try {
    console.log('[getFeaturedProducts] Buscando produtos em destaque...');
    
    // Buscar produtos ativos e em estoque
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name),
        images:product_images(url, is_main),
        variants:color_size_variants(stock_quantity)
      `)
      .eq('is_active', true)
      .eq('in_stock', true)
      .order('created_at', { ascending: false })
      .limit(limit * 3); // Busca mais produtos porque vamos filtrar depois

    if (error) {
      console.error('[getFeaturedProducts] Erro na consulta:', error);
      throw error;
    }

    console.log('[getFeaturedProducts] Total de produtos ativos encontrados:', data?.length || 0);

    // Filtrar produtos que têm estoque nas variantes
    const productsWithStock = data?.filter(product => {
      // Se não tem variantes, considerar em estoque se in_stock = true
      if (!product.variants || product.variants.length === 0) {
        return product.in_stock;
      }
      
      // Se tem variantes, verificar se pelo menos uma tem estoque > 0
      const totalStock = product.variants.reduce((sum: number, variant: any) => 
        sum + (variant.stock_quantity || 0), 0
      );
      
      return totalStock > 0;
    });

    // Filtrar produtos em destaque usando a função de verificação
    const featuredProducts = productsWithStock?.filter(product => {
      const isFeature = isProdutoDestaque(product);
      console.log(`[getFeaturedProducts] Produto ${product.id} - ${product.name} - features:`, product.features, 'É destaque:', isFeature);
      return isFeature;
    }).slice(0, limit); // Limita ao número solicitado

    console.log('[getFeaturedProducts] Produtos em destaque após filtro:', featuredProducts?.length || 0);

    // Processar dados para incluir imagem principal
    const processedData = featuredProducts?.map(product => {
      // Encontrar imagem principal
      let mainImage = null;
      if (product.images && product.images.length > 0) {
        const mainImg = product.images.find((img: any) => img.is_main === true);
        mainImage = mainImg ? mainImg.url : product.images[0].url;
      }
      
      console.log(`[getFeaturedProducts] Imagem principal para ${product.name}:`, mainImage);
      return {
        ...product,
        mainImage
      };
    });

    // Armazenar em cache
    productCache[cacheKey] = { data: processedData, timestamp: Date.now() };

    return { data: processedData, error: null };
  } catch (error) {
    console.error('[getFeaturedProducts] Erro ao buscar produtos em destaque:', error);
    return { data: null, error };
  }
}

/**
 * Limpa o cache de produtos em destaque
 */
export function clearFeaturedProductCache() {
  Object.keys(productCache).forEach(key => {
    if (key.startsWith('featured_products_')) {
      delete productCache[key];
    }
  });
} 