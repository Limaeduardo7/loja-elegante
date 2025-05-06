import { supabase } from '../supabase';
import { getProductDetails } from './productService';

interface CartItem {
  id?: string;
  cart_id: string;
  product_id: string;
  color_size_id?: string;
  quantity: number;
  product?: any;
  variant?: any;
}

interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  items?: CartItem[];
  subtotal?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Gera um ID de sessão para usuários não logados
 */
function getSessionId(): string {
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Cria ou recupera o carrinho para o usuário atual
 */
export async function getOrCreateCart(userId?: string): Promise<{ cart: Cart | null; error: any }> {
  try {
    // Tentar obter o carrinho existente
    let cart;
    const sessionId = getSessionId();

    if (userId) {
      // Se o usuário está logado, buscar carrinho pelo user_id
      const { data, error } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      cart = data;
    } 
    
    if (!cart) {
      // Se não encontrou pelo user_id, buscar pelo session_id
      const { data, error } = await supabase
        .from('carts')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      cart = data;
    }

    // Se ainda não há carrinho, criar um novo
    if (!cart) {
      const { data, error } = await supabase
        .from('carts')
        .insert({
          user_id: userId || null,
          session_id: userId ? null : sessionId
        })
        .select()
        .single();

      if (error) throw error;
      cart = data;
    } else if (userId && !cart.user_id) {
      // Se o usuário logou e o carrinho está vinculado apenas à sessão, atualizar
      const { data, error } = await supabase
        .from('carts')
        .update({ user_id: userId, session_id: null })
        .eq('id', cart.id)
        .select()
        .single();

      if (error) throw error;
      cart = data;
    }

    return { cart, error: null };
  } catch (error) {
    console.error('Erro ao gerenciar carrinho:', error);
    return { cart: null, error };
  }
}

/**
 * Busca os itens do carrinho com detalhes de produto
 */
export async function getCartItems(cartId: string): Promise<{ items: any[]; subtotal: number; error: any }> {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(id, name, price, discount_percent, images:product_images(url, is_main))
      `)
      .eq('cart_id', cartId);

    if (error) throw error;

    // Buscar informações do variant para cada item
    let cartItems = [];
    for (const item of data || []) {
      let variantInfo = null;

      if (item.color_size_id) {
        const { data: variantData, error: variantError } = await supabase
          .from('color_size_variants')
          .select(`
            *,
            color:product_colors(*),
            size:product_sizes(*)
          `)
          .eq('id', item.color_size_id)
          .single();

        if (variantError) throw variantError;
        variantInfo = variantData;
      }

      // Calcular preço final com desconto
      const product = item.product;
      const price = product.price;
      const discountPercent = product.discount_percent || 0;
      const finalPrice = price - (price * (discountPercent / 100));
      
      // Encontrar imagem principal
      const mainImage = product.images?.find((img: any) => img.is_main)?.url 
                      || product.images?.[0]?.url;

      cartItems.push({
        ...item,
        product: {
          ...product,
          mainImage,
          finalPrice
        },
        variant: variantInfo,
        itemTotal: finalPrice * item.quantity
      });
    }

    // Calcular subtotal
    const subtotal = cartItems.reduce((acc, item) => acc + item.itemTotal, 0);

    return { items: cartItems, subtotal, error: null };
  } catch (error) {
    console.error('Erro ao buscar itens do carrinho:', error);
    return { items: [], subtotal: 0, error };
  }
}

/**
 * Adiciona um item ao carrinho
 */
export async function addToCart(
  cartId: string, 
  productId: string, 
  quantity: number, 
  colorSizeId?: string
): Promise<{ success: boolean; error: any }> {
  try {
    // Verificar se o produto existe e está disponível
    const { data: product, error: productError } = await getProductDetails(productId);
    if (productError || !product) {
      throw new Error('Produto não encontrado ou indisponível');
    }

    // Verificar o estoque da variante específica
    if (colorSizeId) {
      const { data: variant, error: variantError } = await supabase
        .from('color_size_variants')
        .select('stock_quantity')
        .eq('id', colorSizeId)
        .single();

      if (variantError) throw variantError;

      if (!variant || variant.stock_quantity < quantity) {
        throw new Error('Quantidade solicitada indisponível no estoque');
      }
    }

    // Verificar se o item já existe no carrinho
    const { data: existingItem, error: existingError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .is('color_size_id', colorSizeId ? colorSizeId : null)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingItem) {
      // Atualizar quantidade do item existente
      const newQuantity = existingItem.quantity + quantity;
      
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);

      if (updateError) throw updateError;
    } else {
      // Adicionar novo item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: productId,
          color_size_id: colorSizeId || null,
          quantity
        });

      if (insertError) throw insertError;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao adicionar item ao carrinho:', error);
    return { success: false, error };
  }
}

/**
 * Remove um item do carrinho
 */
export async function removeFromCart(cartItemId: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao remover item do carrinho:', error);
    return { success: false, error };
  }
}

/**
 * Atualiza a quantidade de um item no carrinho
 */
export async function updateCartItemQuantity(
  cartItemId: string, 
  quantity: number
): Promise<{ success: boolean; error: any }> {
  try {
    if (quantity < 1) {
      return removeFromCart(cartItemId);
    }

    // Obter informações do item para verificar estoque
    const { data: item, error: itemError } = await supabase
      .from('cart_items')
      .select('product_id, color_size_id')
      .eq('id', cartItemId)
      .single();

    if (itemError) throw itemError;

    // Verificar estoque se for variante
    if (item.color_size_id) {
      const { data: variant, error: variantError } = await supabase
        .from('color_size_variants')
        .select('stock_quantity')
        .eq('id', item.color_size_id)
        .single();

      if (variantError) throw variantError;

      if (variant.stock_quantity < quantity) {
        throw new Error(`Apenas ${variant.stock_quantity} unidades disponíveis`);
      }
    }

    // Atualizar quantidade
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId);

    if (updateError) throw updateError;

    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao atualizar quantidade:', error);
    return { success: false, error };
  }
}

/**
 * Limpa o carrinho
 */
export async function clearCart(cartId: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error);
    return { success: false, error };
  }
} 