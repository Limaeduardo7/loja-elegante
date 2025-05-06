import { supabase } from '../supabase';
import { Category } from '../../types/product';

const CACHE_TIME = 5 * 60 * 1000; // 5 minutos
let categoryCache: Record<string, { data: any; timestamp: number }> = {};

/**
 * Busca todas as categorias com possíveis subcategorias
 */
export async function getCategories(includeInactive = false) {
  const cacheKey = `categories_${includeInactive}`;
  
  // Verificar cache
  const cachedData = categoryCache[cacheKey];
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TIME) {
    return { data: cachedData.data, error: null };
  }

  try {
    let query = supabase
      .from('categories')
      .select('*, subcategories:categories(id, name, slug)');
      
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
      
    // Apenas categorias principais (sem parent_id)
    query = query.is('parent_id', null);
    
    const { data, error } = await query.order('name');

    if (error) throw error;

    // Armazenar em cache
    categoryCache[cacheKey] = { data, timestamp: Date.now() };

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return { data: null, error };
  }
}

/**
 * Busca uma categoria específica por slug
 */
export async function getCategoryBySlug(slug: string) {
  const cacheKey = `category_${slug}`;
  
  // Verificar cache
  const cachedData = categoryCache[cacheKey];
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TIME) {
    return { data: cachedData.data, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    // Armazenar em cache
    categoryCache[cacheKey] = { data, timestamp: Date.now() };

    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar categoria com slug ${slug}:`, error);
    return { data: null, error };
  }
}

/**
 * Limpa o cache de categorias
 */
export function clearCategoryCache() {
  categoryCache = {};
} 