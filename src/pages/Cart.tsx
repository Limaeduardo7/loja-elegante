import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';

// Interface para os itens do carrinho
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color: string;
  size: string;
}

const Cart = () => {
  const navigate = useNavigate();
  
  // Exemplo de itens no carrinho (em um app real viria de um contexto ou estado global)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Vestido Elegante Floral',
      price: 289.90,
      image: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=1976&auto=format&fit=crop',
      quantity: 1,
      color: 'Azul',
      size: 'M'
    },
    {
      id: '2',
      name: 'Blusa de Seda Premium',
      price: 159.90,
      image: 'https://images.unsplash.com/photo-1551163943-3f7e29e5ed20?q=80&w=1964&auto=format&fit=crop',
      quantity: 2,
      color: 'Branco',
      size: 'P'
    }
  ]);

  // Cálculos do carrinho
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 300 ? 0 : 29.90;
  const total = subtotal + shipping;

  // Função para atualizar a quantidade
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Função para remover item
  const removeItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 pb-16 pt-28 md:pt-32">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-gold-500 transition-colors">
            Início
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Carrinho</span>
        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light mb-6 text-gray-900">
            Seu <span className="text-gold-500">Carrinho</span>
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
              className="py-3 px-6 bg-gold-500 hover:bg-gold-600 text-white text-base font-light tracking-wide"
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
                          src={item.image} 
                          alt={item.name} 
                          className="w-24 h-32 md:w-28 md:h-36 object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="md:ml-6 flex-grow">
                        <div className="flex flex-col md:flex-row md:justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">{item.name}</h3>
                            <p className="text-gray-500 text-sm mb-2">
                              Cor: {item.color} | Tamanho: {item.size}
                            </p>
                            <p className="text-gold-600 font-medium mb-4">
                              R$ {item.price.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between">
                            <div className="flex items-center border border-gray-200 rounded-md">
                              <button 
                                className="px-3 py-1 text-gray-500 hover:text-gold-500 transition-colors"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </button>
                              <span className="px-3 py-1 text-gray-800">{item.quantity}</span>
                              <button 
                                className="px-3 py-1 text-gray-500 hover:text-gold-500 transition-colors"
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
                
                <div className="p-6 bg-gray-50 rounded-b-lg">
                  <Button
                    onClick={() => navigate('/colecao')}
                    className="flex items-center justify-center text-gray-700 hover:text-gold-500 bg-white border border-gray-200 hover:border-gold-200 transition-colors py-2 px-4 rounded-md text-sm font-light"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Continuar Comprando
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
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-gray-600 font-light">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600 font-light">
                    <span>Frete</span>
                    <span>{shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}</span>
                  </div>
                  
                  {shipping === 0 && (
                    <div className="text-green-600 text-sm bg-green-50 p-2 rounded-md">
                      Você ganhou frete grátis em compras acima de R$ 300,00!
                    </div>
                  )}
                  
                  <div className="border-t border-gray-100 pt-4 mt-4"></div>
                  
                  <div className="flex justify-between text-gray-900 font-medium">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="p-6 pt-0">
                  <Button
                    onClick={() => navigate('/checkout')}
                    className="py-4 px-6 bg-gold-500 hover:bg-gold-600 text-white text-base font-light tracking-wide w-full flex items-center justify-center"
                  >
                    <CreditCard className="h-5 w-5 mr-2" /> Finalizar Compra
                  </Button>
                  
                  <div className="mt-4 text-center">
                    <p className="text-gray-500 text-xs">
                      Pagamentos seguros processados por gateways confiáveis.
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