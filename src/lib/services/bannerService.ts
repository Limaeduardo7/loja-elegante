import { supabase } from '../supabase';

export interface HeroBanner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  button_text: string;
  button_link: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Busca todos os banners ativos ordenados por order_index
 */
export async function getActiveBanners() {
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data as HeroBanner[];
}

/**
 * Busca todos os banners (ativos e inativos) para administração
 */
export async function getAllBanners() {
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data as HeroBanner[];
}

/**
 * Cria um novo banner
 */
export async function createBanner(banner: Omit<HeroBanner, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('hero_banners')
    .insert([banner])
    .select()
    .single();

  if (error) throw error;
  return data as HeroBanner;
}

/**
 * Atualiza um banner existente
 */
export async function updateBanner(id: string, banner: Partial<HeroBanner>) {
  const { data, error } = await supabase
    .from('hero_banners')
    .update(banner)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as HeroBanner;
}

/**
 * Exclui um banner
 */
export async function deleteBanner(id: string) {
  const { error } = await supabase
    .from('hero_banners')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Atualiza a ordem dos banners
 */
export async function updateBannersOrder(bannerIds: string[]) {
  const updates = bannerIds.map((id, index) => ({
    id,
    order_index: index + 1
  }));

  const { error } = await supabase
    .from('hero_banners')
    .upsert(updates);

  if (error) throw error;
} 