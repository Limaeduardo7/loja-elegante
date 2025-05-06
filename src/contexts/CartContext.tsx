import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getOrCreateCart, getCartItems } from '../lib/services/cartService';

interface CartContextType {
  cartItemsCount: number;
  updateCartItemsCount: () => Promise<void>;
  isCartLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [isCartLoading, setIsCartLoading] = useState(true);

  // Função para atualizar a contagem de itens no carrinho
  const updateCartItemsCount = async () => {
    try {
      setIsCartLoading(true);
      
      // Obter ou criar carrinho
      const { cart, error } = await getOrCreateCart();
      
      if (error || !cart) {
        console.error('Erro ao carregar carrinho:', error);
        setCartItemsCount(0);
        setIsCartLoading(false);
        return;
      }
      
      // Obter itens do carrinho
      const { items, error: itemsError } = await getCartItems(cart.id);
      
      if (itemsError) {
        console.error('Erro ao carregar itens do carrinho:', itemsError);
        setCartItemsCount(0);
      } else {
        // Calcular o total de itens (somando as quantidades)
        const itemCount = items.reduce((total, item) => total + item.quantity, 0);
        setCartItemsCount(itemCount);
      }
    } catch (error) {
      console.error('Erro ao atualizar contagem do carrinho:', error);
      setCartItemsCount(0);
    } finally {
      setIsCartLoading(false);
    }
  };

  // Carregar dados do carrinho na inicialização
  useEffect(() => {
    updateCartItemsCount();
  }, []);

  return (
    <CartContext.Provider value={{ 
      cartItemsCount, 
      updateCartItemsCount,
      isCartLoading 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 