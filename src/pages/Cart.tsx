import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, CreditCard, Tag, Truck, Calculator, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getCartItems, getOrCreateCart, updateCartItemQuantity, removeFromCart } from '../lib/services/cartService';
import { useCart } from '../contexts/CartContext';

// Interface para os itens do carrinho
interface CartItem {
  id: string;
  product: {
    name: string;
    finalPrice: number;
    mainImage: string;
  };
  variant?: {
    color: {
      name: string;
    };
    size: {
      name: string;
    };
  };
  quantity: number;
  itemTotal: number;
}

const Cart = () => {
  const navigate = useNavigate();
  const { updateCartItemsCount } = useCart();
  
  // Estados
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartId, setCartId] = useState<string | null>(null);
  
  // Estados para cupom e CEP
  const [couponCode, setCouponCode] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<{ type: string; price: number; days: string }[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<number | null>(null);

  // Cálculos do carrinho
  const subtotal = cartItems.reduce((total, item) => total + item.itemTotal, 0);
  const discount = couponApplied ? subtotal * 0.1 : 0; // 10% de desconto quando o cupom for aplicado
  const shipping = selectedShipping !== null ? shippingOptions[selectedShipping].price : (subtotal > 300 ? 0 : 29.90);
  const total = subtotal - discount + shipping;

  // Carregar itens do carrinho
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true);
        
        // Obter ou criar carrinho
        const { cart, error } = await getOrCreateCart();
        
        if (error || !cart) {
          console.error('Erro ao carregar carrinho:', error);
          setCartItems([]);
          setIsLoading(false);
          return;
        }
        
        setCartId(cart.id);
        localStorage.setItem('cart_id', cart.id);
        
        // Carregar itens do carrinho
        const { items, error: itemsError } = await getCartItems(cart.id);
        
        if (itemsError) {
          console.error('Erro ao carregar itens do carrinho:', itemsError);
          setCartItems([]);
        } else {
          setCartItems(items || []);
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCart();
  }, []);

  // Função para atualizar a quantidade
  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      const { success, error } = await updateCartItemQuantity(id, newQuantity);
      
      if (success) {
        // Atualizar o item localmente
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.id === id 
              ? { 
                  ...item, 
                  quantity: newQuantity,
                  itemTotal: item.product.finalPrice * newQuantity 
                } 
              : item
          )
        );
        
        // Atualizar a contagem no header
        await updateCartItemsCount();
      } else {
        console.error('Erro ao atualizar quantidade:', error);
        alert('Não foi possível atualizar a quantidade. ' + (error?.message || ''));
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    }
  };

  // Função para remover item
  const removeItem = async (id: string) => {
    try {
      const { success, error } = await removeFromCart(id);
      
      if (success) {
        // Remover o item localmente
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
        
        // Atualizar a contagem no header
        await updateCartItemsCount();
      } else {
        console.error('Erro ao remover item:', error);
        alert('Não foi possível remover o item. ' + (error?.message || ''));
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  // Função para aplicar cupom
  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'elegante10') {
      setCouponApplied(true);
      alert('Cupom ELEGANTE10 aplicado com sucesso! 10% de desconto.');
    } else {
      alert('Cupom inválido ou expirado.');
    }
  };

  // Função para calcular frete (simulação)
  const calculateShipping = () => {
    if (zipCode.length !== 8) {
      alert('Por favor, insira um CEP válido com 8 dígitos');
      return;
    }

    // Simulação de opções de frete
    setShippingOptions([
      { type: 'Econômico', price: 19.90, days: '6-8 dias úteis' },
      { type: 'Padrão', price: 29.90, days: '3-5 dias úteis' },
      { type: 'Expresso', price: 49.90, days: '1-2 dias úteis' }
    ]);
    setSelectedShipping(1); // Seleciona o padrão por default
  };

  if (isLoading) {
    return (
      <div className="bg-white">
        <div className="container mx-auto px-4 pb-16 pt-28 md:pt-32 flex justify-center">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-champagne-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-light text-gray-800">Carregando seu carrinho...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 pb-16 pt-28 md:pt-32">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-champagne-500 transition-colors">
            Início
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Carrinho</span>
        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light mb-6 text-gray-900">
            Seu <span className="text-champagne-500">Carrinho</span>
          </h1>
          <p className="max-w-3xl mx-auto text-gray-600 font-light leading-relaxed">
            Revise os itens em seu carrinho antes de finalizar a compra.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-4">
              <ShoppingBag className="w-16 h-16 text-gray-300" />
            </div>
            <h2 className="text-2xl font-light text-gray-800 mb-4">Seu carrinho está vazio</h2>
            <p className="text-gray-600 font-light mb-8">
              Parece que você ainda não adicionou nenhum produto ao seu carrinho.
            </p>
            <Button
              onClick={() => navigate('/colecao')}
              className="py-4 px-8 bg-rose-300 hover:bg-rose-400 text-white text-base font-light tracking-wide"
            >
              Explorar Coleção
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Produtos */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-100 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-light text-gray-900">Produtos ({cartItems.length})</h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6 flex flex-col md:flex-row">
                      <div className="flex-shrink-0 mb-4 md:mb-0">
                        <img 
                          src={item.product.mainImage} 
                          alt={item.product.name} 
                          className="w-32 h-44 md:w-40 md:h-56 object-cover rounded-md shadow-sm hover:shadow-md transition-shadow"
                        />
                      </div>
                      
                      <div className="md:ml-6 flex-grow">
                        <div className="flex flex-col md:flex-row md:justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">{item.product.name}</h3>
                            {item.variant && (
                              <p className="text-gray-500 text-sm mb-2">
                                Cor: <span className="font-medium text-gray-700">{item.variant.color.name}</span> | 
                                Tamanho: <span className="font-medium text-gray-700">{item.variant.size.name}</span>
                              </p>
                            )}
                            <p className="text-champagne-600 font-medium mb-4 text-lg">
                              R$ {item.product.finalPrice.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between">
                            <div className="flex items-center border border-gray-200 rounded-md">
                              <button 
                                className="px-3 py-1 text-gray-500 hover:text-champagne-500 transition-colors"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </button>
                              <span className="px-4 py-1 text-gray-800 font-medium">{item.quantity}</span>
                              <button 
                                className="px-3 py-1 text-gray-500 hover:text-champagne-500 transition-colors"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                            
                            <button 
                              className="text-gray-400 hover:text-red-500 transition-colors flex items-center mt-4 text-sm"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-6 bg-gray-50 rounded-b-lg flex justify-center">
                  <Button
                    onClick={() => navigate('/colecao')}
                    className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-md text-base font-medium shadow-sm hover:shadow transition-all"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" /> Continuar Comprando
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Resumo do Pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-100 rounded-lg shadow-sm sticky top-32">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-light text-gray-900">Resumo do Pedido</h2>
                </div>
                
                {/* Cupom de desconto */}
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-champagne-500" /> Cupom de Desconto
                  </h3>
                  <div className="flex">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="ELEGANTE10"
                      className="border border-gray-200 rounded-l-md px-3 py-2 w-full focus:outline-none focus:border-champagne-300"
                    />
                    <button 
                      className="bg-champagne-500 hover:bg-champagne-600 text-white px-3 py-2 rounded-r-md font-light"
                      onClick={applyCoupon}
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="text-green-600 text-sm mt-2 flex items-center">
                      <RefreshCw className="h-3 w-3 mr-1" /> Cupom aplicado: 10% de desconto
                    </p>
                  )}
                </div>
                
                {/* Calculadora de frete */}
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <Truck className="h-4 w-4 mr-2 text-champagne-500" /> Calcular Frete
                  </h3>
                  <div className="flex">
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').substring(0, 8))}
                      placeholder="00000000"
                      className="border border-gray-200 rounded-l-md px-3 py-2 w-full focus:outline-none focus:border-champagne-300"
                    />
                    <button 
                      className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-r-md font-light flex items-center"
                      onClick={calculateShipping}
                    >
                      <Calculator className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Digite apenas números (8 dígitos)</p>
                  
                  {shippingOptions.length > 0 && (
                    <div className="mt-4">
                      {shippingOptions.map((option, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input 
                            type="radio" 
                            id={`shipping-${index}`} 
                            name="shipping"
                            checked={selectedShipping === index}
                            onChange={() => setSelectedShipping(index)}
                            className="mr-2"
                          />
                          <label htmlFor={`shipping-${index}`} className="flex flex-grow justify-between text-sm">
                            <span>{option.type} ({option.days})</span>
                            <span className="font-medium">
                              {option.price === 0 ? 'Grátis' : `R$ ${option.price.toFixed(2)}`}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Valores */}
                <div className="p-6 space-y-4 bg-gray-50 rounded-b-lg">
                  <div className="flex justify-between text-gray-600 font-light">
                    <span>Subtotal:</span>
                    <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  
                  {couponApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto (10%):</span>
                      <span>- R$ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-600 font-light">
                    <span>Frete:</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {shipping === 0 && !selectedShipping && (
                    <div className="text-green-600 text-sm bg-green-50 p-2 rounded-md">
                      Você ganhou frete grátis em compras acima de R$ 300,00!
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4 mt-4"></div>
                  
                  <div className="flex justify-between text-gray-900 font-medium text-lg">
                    <span>Total:</span>
                    <span className="text-champagne-600">R$ {total.toFixed(2)}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-right">
                    ou 10x de R$ {(total / 10).toFixed(2)} sem juros
                  </div>
                </div>
                
                <div className="p-6 pt-0 bg-gray-50">
                  <Button
                    onClick={() => {
                      if (cartId) {
                        localStorage.setItem('cart_id', cartId);
                        navigate('/checkout');
                      } else {
                        alert('Erro ao acessar o carrinho. Por favor, tente novamente.');
                      }
                    }}
                    className="py-4 px-6 bg-rose-300 hover:bg-champagne-600 text-white text-base font-medium tracking-wide w-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                  >
                    <CreditCard className="h-5 w-5 mr-2" /> Finalizar Compra
                  </Button>
                  
                  <div className="mt-4 text-center">
                    <p className="text-gray-500 text-xs">
                      Pagamentos seguros processados por Mercado Pago.
                    </p>
                    <div className="flex justify-center space-x-2 mt-3">
                      <div className="w-8 h-5 bg-gray-200 rounded"></div>
                      <div className="w-8 h-5 bg-gray-200 rounded"></div>
                      <div className="w-8 h-5 bg-gray-200 rounded"></div>
                      <div className="w-8 h-5 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 