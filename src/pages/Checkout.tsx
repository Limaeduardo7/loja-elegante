import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, ShoppingBag, User, MapPin, Truck, 
  CheckCircle, AlertCircle, Clock, Shield, Banknote, QrCode, Phone
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { getCartItems, clearCart } from '../lib/services/cartService';
import { createOrder } from '../lib/services/orderService';
import { processPayment } from '../lib/services/paymentService';
import { useCart } from '../contexts/CartContext';
import PagarmeCheckout from '../components/PagarmeCheckout';

interface CheckoutForm {
  // Dados pessoais
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  phone: string;
  
  // Endereço de entrega (manter compatível com AddressData)
  zipcode: string;  // Renomeado de cep para zipcode para compatibilidade com AddressData
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(29.9);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    cpf: '',
    phone: '',
    zipcode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // Calcular total
  const total = cartTotal + shippingCost;
  
  // Carregar carrinho e informações salvas do usuário
  useEffect(() => {
    const loadCart = async () => {
      try {
        // Obter ID do carrinho do localStorage
        const cartId = localStorage.getItem('cart_id');
        
        if (!cartId) {
          navigate('/carrinho');
          return;
        }
        
        // Carregar itens do carrinho
        const { items, subtotal } = await getCartItems(cartId);
        
        if (!items || items.length === 0) {
          navigate('/carrinho');
          return;
        }
        
        setCartItems(items);
        setCartTotal(subtotal);
        
        // Frete grátis para compras acima de R$ 300
        if (subtotal > 300) {
          setShippingCost(0);
        }
        
        // Carregar dados do usuário se disponível
        const userData = localStorage.getItem('user_data');
        if (userData) {
          setFormData(prev => ({ ...prev, ...JSON.parse(userData) }));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        navigate('/carrinho');
      }
    };
    
    loadCart();
  }, [navigate]);
  
  // Manipuladores de formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Buscar CEP
  const handleCepBlur = async () => {
    if (formData.zipcode.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${formData.zipcode}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };
  
  // Validar formulário
  const validateForm = () => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'cpf', 'phone',
      'zipcode', 'street', 'number', 'neighborhood', 'city', 'state'
    ];
    
    return requiredFields.every(field => formData[field as keyof CheckoutForm]);
  };
  
  // Finalizar compra
  const handleCheckout = async () => {
    if (!validateForm()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // Salvar dados do usuário
    localStorage.setItem('user_data', JSON.stringify(formData));
    
    setProcessingPayment(true);
    
    try {
      // Obter ID do carrinho
      const cartId = localStorage.getItem('cart_id');
      
      if (!cartId) {
        throw new Error('Carrinho não encontrado');
      }
      
      // Criar pedido no banco de dados
      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          cpf: formData.cpf,
          phone: formData.phone
        },
        shipping: {
          address: {
            zipcode: formData.zipcode,
            street: formData.street,
            number: formData.number,
            complement: formData.complement || '',
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state
          },
          cost: shippingCost
        },
        items: cartItems,
        payment: {
          method: 'pagarme',
          status: 'pending'
        },
        total
      };
      
      // Criar pedido
      const { orderId, error } = await createOrder(orderData);
      
      if (error || !orderId) {
        throw new Error('Erro ao criar pedido');
      }
      
      // Salvar ID do pedido no localStorage para uso posterior
      localStorage.setItem('last_order_id', orderId);
      
      // Limpar carrinho
      await clearCart(cartId);
      
      // Marcar pedido como completo e armazenar orderId
      setOrderCompleted(true);
      setOrderId(orderId);
      
      // Rolar para o topo
      window.scrollTo(0, 0);
      
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      alert('Ocorreu um erro ao processar o pedido. Por favor, tente novamente.');
    } finally {
      setProcessingPayment(false);
    }
  };
  
  // Substitua o trecho que estava usando o script do Pagar.me
  // Encontre esta parte no useEffect
  useEffect(() => {
    // Implementar o checkout quando o pedido estiver completo
    if (orderCompleted && orderId) {
      // Não precisamos mais carregar o script externo
      console.log('Pedido criado, mostrando checkout interno do Pagar.me');
    }
  }, [orderCompleted, orderId]);
  
  if (loading) {
    return (
      <div className="bg-white pt-32 pb-16 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-champagne-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-light text-gray-800">Carregando informações...</h2>
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
          <button onClick={() => navigate('/carrinho')} className="hover:text-champagne-500 transition-colors">
            Carrinho
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Checkout</span>
        </div>
        
        {orderCompleted ? (
          // Confirmação do pedido
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-light text-gray-900 mb-4">
                Pedido Registrado com Sucesso!
              </h1>
              <p className="text-gray-600 mb-6">
                Seu pedido foi criado e está aguardando o pagamento. Escolha abaixo uma das opções de pagamento disponíveis.
              </p>
            </div>
            
            {/* Substitua o botão de pagamento pelo novo componente */}
            <div className="mb-8">
              <PagarmeCheckout 
                orderId={orderId || ''}
                customer={formData}
                shippingAddress={formData}
                shippingCost={shippingCost}
                items={cartItems}
                cartTotal={cartTotal}
                onSuccess={(data) => {
                  console.log('Pagamento processado com sucesso:', data);
                }}
                onError={(err) => {
                  console.error('Erro no pagamento:', err);
                }}
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600 mb-6">
              <p className="flex items-start mb-2">
                <Shield className="h-4 w-4 mr-2 text-champagne-500 mt-0.5" />
                <span>Todos os pagamentos são processados em ambiente seguro pelo Pagar.me.</span>
              </p>
              <p className="flex items-start mb-2">
                <Clock className="h-4 w-4 mr-2 text-champagne-500 mt-0.5" />
                <span>Seu pedido será processado assim que o pagamento for confirmado.</span>
              </p>
              <p className="flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 text-champagne-500 mt-0.5" />
                <span>Caso tenha alguma dúvida, entre em contato conosco pelo WhatsApp.</span>
              </p>
            </div>
            
            <div className="text-center">
              <Button
                onClick={() => navigate('/')}
                className="bg-champagne-500 hover:bg-champagne-600 text-white"
              >
                Continuar Comprando
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-light mb-6 text-gray-900">
                <span className="text-champagne-500">Checkout</span>
              </h1>
              <p className="max-w-3xl mx-auto text-gray-600 font-light leading-relaxed">
                Complete suas informações para finalizar sua compra.
              </p>
            </div>
            
            {/* Selos de segurança */}
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mb-12 bg-gray-50 py-4 px-6 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-champagne-500 mr-2" />
                <span className="text-sm font-medium">Site Seguro</span>
              </div>
              <div className="flex items-center">
                <CreditCard className="h-6 w-6 text-champagne-500 mr-2" />
                <span className="text-sm font-medium">Pagamentos Protegidos</span>
              </div>
              <div className="flex items-center">
                <Truck className="h-6 w-6 text-champagne-500 mr-2" />
                <span className="text-sm font-medium">Envio Rápido</span>
              </div>
              <div className="flex items-center">
                <QrCode className="h-6 w-6 text-champagne-500 mr-2" />
                <span className="text-sm font-medium">Pix</span>
              </div>
              <div className="flex items-center">
                <Banknote className="h-6 w-6 text-champagne-500 mr-2" />
                <span className="text-sm font-medium">Boleto</span>
              </div>
            </div>
            
            {/* Conteúdo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulário */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm mb-8">
                  {/* Informações Pessoais */}
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-light text-gray-900 flex items-center">
                      <User className="h-5 w-5 mr-2 text-champagne-500" /> Informações Pessoais
                    </h2>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome *
                        </label>
                        <input 
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-champagne-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sobrenome *
                        </label>
                        <input 
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-champagne-300"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-champagne-300"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CPF *
                        </label>
                        <input 
                          type="text"
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleInputChange}
                          placeholder="000.000.000-00"
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-champagne-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefone *
                        </label>
                        <input 
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(00) 00000-0000"
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-champagne-300"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Endereço de Entrega */}
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm mb-8">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-light text-gray-900 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-champagne-500" /> Endereço de Entrega
                    </h2>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CEP *
                        </label>
                        <input 
                          type="text"
                          name="zipcode"
                          value={formData.zipcode}
                          onChange={handleInputChange}
                          onBlur={handleCepBlur}
                          placeholder="00000-000"
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-champagne-300"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Digite o CEP e os dados serão preenchidos automaticamente
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rua/Avenida *
                      </label>
                      <input 
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-champagne-300"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número *
                        </label>
                        <input 
                          type="text"
                          name="number"
                          value={formData.number}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-champagne-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Complemento
                        </label>
                        <input 
                          type="text"
                          name="complement"
                          value={formData.complement}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-champagne-300"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bairro *
                      </label>
                      <input 
                        type="text"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-champagne-300"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cidade *
                        </label>
                        <input 
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-champagne-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado *
                        </label>
                        <input 
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-champagne-300"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Formas de pagamento */}
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm mb-8">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-light text-gray-900 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-champagne-500" /> Formas de Pagamento
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">
                      Ao finalizar o pedido, você poderá escolher entre as seguintes opções de pagamento:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center p-3 border border-gray-200 rounded-md">
                        <CreditCard className="h-6 w-6 text-blue-500 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium">Cartão de Crédito</h3>
                          <p className="text-xs text-gray-500">Até 10x sem juros</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 border border-gray-200 rounded-md">
                        <QrCode className="h-6 w-6 text-green-500 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium">Pix</h3>
                          <p className="text-xs text-gray-500">Pagamento instantâneo</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 border border-gray-200 rounded-md">
                        <Banknote className="h-6 w-6 text-yellow-500 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium">Boleto</h3>
                          <p className="text-xs text-gray-500">Prazo de compensação de 1-3 dias úteis</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
                      <p className="flex items-start mb-2">
                        <Shield className="h-4 w-4 mr-2 text-champagne-500 mt-0.5" />
                        <span>Todos os pagamentos são processados em ambiente seguro pelo Pagar.me.</span>
                      </p>
                      <p className="flex items-start">
                        <Clock className="h-4 w-4 mr-2 text-champagne-500 mt-0.5" />
                        <span>Seu pedido será processado assim que o pagamento for confirmado.</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Itens do pedido (visível apenas em mobile) */}
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm mb-8 lg:hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-light text-gray-900 flex items-center">
                      <ShoppingBag className="h-5 w-5 mr-2 text-champagne-500" /> Itens do Pedido
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="divide-y divide-gray-100">
                      {cartItems.map((item) => (
                        <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center">
                          <div className="flex-shrink-0">
                            <img 
                              src={item.product.mainImage} 
                              alt={item.product.name} 
                              className="w-16 h-20 object-cover rounded-md"
                            />
                          </div>
                          
                          <div className="ml-4 flex-grow">
                            <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                            {item.variant && (
                              <p className="text-xs text-gray-500">
                                {item.variant.color.name} | {item.variant.size.name}
                              </p>
                            )}
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-500">Qtd: {item.quantity}</span>
                              <span className="text-sm font-medium text-champagne-600">
                                R$ {item.itemTotal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Botão de finalização */}
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm">
                  <div className="p-6">
                    <Button
                      onClick={handleCheckout}
                      disabled={processingPayment}
                      className="w-full bg-champagne-500 hover:bg-champagne-600 text-white py-3 text-base"
                    >
                      {processingPayment ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processando...
                        </>
                      ) : (
                        <>
                          Finalizar Compra - R$ {total.toFixed(2)}
                        </>
                      )}
                    </Button>
                    
                    <button
                      onClick={() => navigate('/carrinho')}
                      className="w-full mt-3 text-gray-600 hover:text-gray-800 flex items-center justify-center"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para o carrinho
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Resumo da compra */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm sticky top-32">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-light text-gray-900">Resumo da Compra</h2>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between text-gray-600 font-light">
                      <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'produto' : 'produtos'}):</span>
                      <span className="font-medium">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-600 font-light">
                      <span>Frete:</span>
                      <span className="font-medium">
                        {shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                    
                    {shippingCost === 0 && (
                      <div className="text-green-600 text-sm bg-green-50 p-2 rounded-md">
                        <Truck className="h-4 w-4 inline-block mr-1" /> Você ganhou frete grátis!
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
                    
                    {/* Lista de itens (apenas no desktop) */}
                    <div className="hidden lg:block pt-4 mt-4 border-t border-gray-200">
                      <h3 className="font-medium text-sm mb-3 text-gray-900">Itens do Pedido:</h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center">
                            <div className="flex-shrink-0">
                              <img 
                                src={item.product.mainImage} 
                                alt={item.product.name} 
                                className="w-12 h-16 object-cover rounded-md"
                              />
                            </div>
                            <div className="ml-3 flex-grow">
                              <h4 className="text-xs font-medium text-gray-900 line-clamp-1">{item.product.name}</h4>
                              {item.variant && (
                                <p className="text-xs text-gray-500">
                                  {item.variant.color.name} | {item.variant.size.name}
                                </p>
                              )}
                              <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-500">Qtd: {item.quantity}</span>
                                <span className="text-xs font-medium text-champagne-600">
                                  R$ {item.itemTotal.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gray-50 rounded-b-lg space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Truck className="h-4 w-4 mr-2 text-champagne-500" />
                      <span>Entrega em todo o Brasil</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <CreditCard className="h-4 w-4 mr-2 text-champagne-500" />
                      <span>Pagamento seguro via Pagar.me</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="h-4 w-4 mr-2 text-champagne-500" />
                      <span>Compra protegida</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout; 