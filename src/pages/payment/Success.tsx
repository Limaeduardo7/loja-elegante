import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home, Package, User } from 'lucide-react';
import { Button } from '../../components/ui/button';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // Extrair o ID do pedido da URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderParam = searchParams.get('order');
    
    if (orderParam) {
      setOrderId(orderParam);
    }
  }, [location]);
  
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 pb-16 pt-28 md:pt-32">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-champagne-500 transition-colors">
            Início
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Pagamento Aprovado</span>
        </div>
        
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white shadow-md rounded-lg p-8 border border-gray-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-light text-gray-900 mb-6">
              Pagamento <span className="text-green-600 font-medium">Aprovado</span>!
            </h1>
            
            <p className="text-lg text-gray-600 font-light leading-relaxed mb-8">
              Recebemos seu pagamento com sucesso! Seu pedido está sendo processado e você 
              receberá um e-mail de confirmação em breve.
            </p>
            
            {orderId && (
              <div className="bg-gray-50 p-6 rounded-md mb-8">
                <h2 className="text-xl font-medium text-gray-800 mb-2">Detalhes do Pedido</h2>
                <p className="text-gray-600 mb-4">
                  Número do pedido: <span className="font-medium">{orderId}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Um e-mail com os detalhes do seu pedido foi enviado para o endereço cadastrado.
                </p>
              </div>
            )}
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
              <Button
                onClick={() => navigate('/')}
                className="bg-gray-700 hover:bg-gray-800 text-white flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" /> Voltar à Loja
              </Button>
              
              <Button
                onClick={() => navigate('/perfil')}
                className="bg-champagne-500 hover:bg-champagne-600 text-white flex items-center justify-center"
              >
                <Package className="h-4 w-4 mr-2" /> Meus Pedidos
              </Button>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Dúvidas sobre seu pedido? Entre em contato conosco pelo <span className="text-champagne-500 hover:underline cursor-pointer">WhatsApp</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 