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
  search = '',
  isFeatured = false,
  orderBy = 'created_at',
  orderDirection = 'desc'
}: {
  page?: number;
  categoryId?: string | null;
  search?: string;
  isFeatured?: boolean;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}) {
  // Cache key baseado nos parâmetros da consulta
  const cacheKey = `products_${page}_${categoryId}_${search}_${isFeatured}_${orderBy}_${orderDirection}`;
  
  console.log('[getProducts] Parâmetros de busca:', { page, categoryId, search, isFeatured, orderBy, orderDirection });
  
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
        images:product_images(id, url, alt_text, is_main)
      `, { count: 'exact' })
      .eq('is_active', true);

    // Aplicar filtros se fornecidos
    if (categoryId) {
      console.log('[getProducts] Aplicando filtro de categoria:', categoryId);
      query = query.eq('category_id', categoryId);
    }

    if (isFeatured) {
      console.log('[getProducts] Aplicando filtro de destaque');
      // Verificar produtos que têm "destaque" no array features
      query = query.contains('features', ['destaque']);
    }

    if (search) {
      console.log('[getProducts] Aplicando filtro de busca:', search);
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

    // Processar os dados para um formato mais amigável
    const processedData = data?.map(product => ({
      ...product,
      mainImage: product.images?.find((img: { is_main: boolean; url: string }) => img.is_main)?.url || product.images?.[0]?.url,
      images: product.images
    }));

    // Armazenar em cache
    productCache[cacheKey] = { data: processedData, timestamp: Date.now() };

    return { 
      data: processedData, 
      count, 
      error: null,
      totalPages: count ? Math.ceil(count / ITEMS_PER_PAGE) : 0
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
    
    // Buscar todos os produtos ativos
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name),
        images:product_images(url, is_main)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit * 3); // Busca mais produtos porque vamos filtrar depois

    if (error) {
      console.error('[getFeaturedProducts] Erro na consulta:', error);
      throw error;
    }

    console.log('[getFeaturedProducts] Total de produtos ativos encontrados:', data?.length || 0);
    console.log('[getFeaturedProducts] Estrutura do primeiro produto:', data && data.length > 0 ? JSON.stringify(data[0], null, 2) : 'Nenhum produto');

    // Filtrar produtos em destaque usando a função de verificação
    const featuredProducts = data?.filter(product => {
      const isFeature = isProdutoDestaque(product);
      console.log(`[getFeaturedProducts] Produto ${product.id} - ${product.name} - features:`, product.features, 'É destaque:', isFeature);
      return isFeature;
    }).slice(0, limit); // Limita ao número solicitado

    console.log('[getFeaturedProducts] Produtos em destaque após filtro:', featuredProducts?.length || 0);

    // Processar dados para incluir imagem principal
    const processedData = featuredProducts?.map(product => {
      const mainImage = product.images?.find((img: any) => img.is_main)?.url || product.images?.[0]?.url;
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