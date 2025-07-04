import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, CreditCard, QrCode, Banknote, AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { paymentService } from '../lib/services';
import '../styles/pagarme-checkout.css';

// Tipo para dados do cartão
interface CardData {
  number: string;
  holder_name: string;
  exp_month: number;
  exp_year: number;
  cvv: string;
}

// Tipo para dados do cliente
interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  phone: string;
}

// Tipo para dados de endereço
interface AddressData {
  zipcode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

// Tipo para item do carrinho
interface CartItem {
  product_id: string;
  product: {
    name: string;
    finalPrice: number;
  };
  quantity: number;
  itemTotal: number;
}

// Props do componente
interface PagarmeCheckoutProps {
  orderId: string;
  customer: CustomerData;
  shippingAddress: AddressData;
  shippingCost: number;
  items: CartItem[];
  cartTotal: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

// Componente de Checkout do Pagar.me
const PagarmeCheckout: React.FC<PagarmeCheckoutProps> = ({
  orderId,
  customer,
  shippingAddress,
  shippingCost,
  items,
  cartTotal,
  onSuccess,
  onError
}) => {
  const navigate = useNavigate();
  
  // Estados do componente
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'boleto'>('credit_card');
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    holder_name: '',
    exp_month: 0,
    exp_year: 0,
    cvv: ''
  });
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Total da compra (carrinho + frete)
  const total = cartTotal + shippingCost;
  
  // Função para processar o pagamento
  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validar os dados com base no método de pagamento
      if (paymentMethod === 'credit_card') {
        if (!validateCardData()) {
          setError('Preencha todos os dados do cartão corretamente');
          setLoading(false);
          return;
        }
      }
      
      // Preparar dados para o processamento
      const paymentData = {
        orderId,
        customer,
        payment_method: paymentMethod,
        installments,
        shipping: {
          address: shippingAddress,
          cost: shippingCost
        },
        items,
        // Incluir dados do cartão apenas se o método for cartão de crédito
        ...(paymentMethod === 'credit_card' && { card: cardData })
      };
      
      // Processar o pagamento
      const result = await paymentService.processPayment(paymentData);
      
      if (result.success) {
        setPaymentResult(result.paymentData);
        
        // Chamar callback de sucesso se fornecido
        if (onSuccess) {
          onSuccess(result.paymentData);
        }
        
        // Redirecionar com base no método de pagamento
        if (paymentMethod === 'credit_card') {
          navigate(`/sucesso?order=${orderId}&transaction=${result.paymentData.id}`);
        } else {
          // Para PIX e boleto, mostrar as instruções
          // O componente continuará mostrando os dados de pagamento
        }
      } else {
        setError('Erro ao processar pagamento: ' + (result.error?.message || 'Tente novamente'));
        
        // Chamar callback de erro se fornecido
        if (onError) {
          onError(result.error);
        }
      }
    } catch (err: any) {
      setError('Erro inesperado: ' + (err.message || 'Tente novamente'));
      
      // Chamar callback de erro se fornecido
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Validar dados do cartão
  const validateCardData = (): boolean => {
    const { number, holder_name, exp_month, exp_year, cvv } = cardData;
    
    if (!number || number.length < 16) return false;
    if (!holder_name) return false;
    if (!exp_month || exp_month < 1 || exp_month > 12) return false;
    if (!exp_year || exp_year < new Date().getFullYear()) return false;
    if (!cvv || cvv.length < 3) return false;
    
    return true;
  };
  
  // Manipulador para mudança de método de pagamento
  const handlePaymentMethodChange = (method: 'credit_card' | 'pix' | 'boleto') => {
    setPaymentMethod(method);
    setError(null);
    // Limpar o resultado do pagamento anterior ao trocar o método
    setPaymentResult(null);
  };
  
  // Manipulador para mudança nos campos do cartão
  const handleCardDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setCardData(prev => ({
      ...prev,
      [name]: name === 'exp_month' || name === 'exp_year' ? parseInt(value) || 0 : value
    }));
  };
  
  // Renderizar interface de pagamento com PIX
  const renderPixPayment = () => {
    if (!paymentResult) {
      return (
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <QrCode className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-medium mb-4">Pagamento via PIX</h3>
          <p className="text-sm text-gray-600 mb-4">
            Ao clicar em "Gerar PIX", você receberá um QR Code para pagamento instantâneo.
          </p>
          <Button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            {loading ? 'Gerando PIX...' : 'Gerar PIX'}
          </Button>
        </div>
      );
    }
    
    // Log completo da resposta para diagnóstico
    console.log('=== DIAGNÓSTICO PIX ===');
    console.log('Objeto completo:', paymentResult);
    console.log('Charges:', paymentResult.charges);
    console.log('Primeira charge:', paymentResult.charges?.[0]);
    console.log('Last transaction:', paymentResult.charges?.[0]?.last_transaction);
    console.log('QR Code data:', paymentResult.charges?.[0]?.last_transaction?.qr_code);
    console.log('======================');
    
    // Extração direta do código QR dos dados brutos
    // A estrutura real pode variar, então buscamos em diferentes possíveis caminhos
    
    // Verificar se temos a estrutura _pixData criada pelo serviço
    let pixData = paymentResult._pixData || {
      text: null,
      url: null,
      found: false
    };
    
    // Se o _pixData.found é false, mas temos qr_code na resposta da charge, pegamos de lá
    if (!pixData.found && paymentResult.charges && paymentResult.charges[0]?.last_transaction) {
      const lastTransaction = paymentResult.charges[0].last_transaction;
      
      if (lastTransaction.qr_code) {
        // Pode ser um objeto ou uma string
        if (typeof lastTransaction.qr_code === 'object') {
          // Formato objeto
          pixData.text = lastTransaction.qr_code.text;
          pixData.url = lastTransaction.qr_code.url;
          pixData.found = true;
        } else if (typeof lastTransaction.qr_code === 'string') {
          // Formato string
          pixData.text = lastTransaction.qr_code;
          pixData.found = true;
          
          // Verificar se temos URL em outra propriedade
          if (lastTransaction.qr_code_url) {
            pixData.url = lastTransaction.qr_code_url;
          }
        }
      } else if (lastTransaction.qr_code_url) {
        // Formato observado na resposta real: qr_code_url sem qr_code
        pixData.url = lastTransaction.qr_code_url;
        pixData.found = true;
      }
    }
    
    // Usar os valores extraídos
    const qrCodeText = pixData.text;
    const qrCodeUrl = pixData.url;
    const hasQrCodeData = pixData.found;
    
    // Alerta se não encontramos os dados do QR Code
    if (!hasQrCodeData) {
      console.error('ALERTA: Dados do QR Code PIX não encontrados na resposta');
    }
    
    return (
      <div className="bg-green-50 p-6 rounded-lg">
        <div className="text-center">
          <QrCode className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-medium mb-2">PIX Gerado com Sucesso!</h3>
          <p className="text-sm text-gray-600 mb-4">
            Escaneie o QR Code abaixo ou use o código para pagar
          </p>
        </div>
        
        {!hasQrCodeData && (
          <div className="text-center p-4 mb-4 bg-yellow-100 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-yellow-700 mb-2">
              Não foi possível gerar o QR Code PIX.
            </p>
            <p className="text-xs text-yellow-600">
              Por favor, tente novamente ou escolha outra forma de pagamento.
            </p>
          </div>
        )}
        
        {qrCodeUrl ? (
          <div className="flex justify-center mb-4">
            <img 
              src={qrCodeUrl} 
              alt="QR Code PIX" 
              className="w-48 h-48 border p-2 rounded-lg"
            />
          </div>
        ) : (
          <div className="text-center p-3 bg-yellow-50 border border-yellow-100 rounded-md mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-yellow-700">QR Code não disponível. Use o código abaixo para pagar.</p>
          </div>
        )}
        
        {qrCodeText ? (
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">Código PIX Copia e Cola:</p>
            <div className="relative">
              <textarea 
                readOnly 
                value={qrCodeText}
                className="w-full p-3 bg-white border rounded-md text-xs h-24"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrCodeText);
                  alert('Código PIX copiado!');
                }}
                className="absolute right-2 top-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                Copiar
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-3 bg-yellow-50 border border-yellow-100 rounded-md mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-yellow-700">Código PIX não disponível. Tente gerar novamente.</p>
          </div>
        )}
        
        <div className="bg-white p-4 rounded-md border mt-4">
          <h4 className="text-sm font-medium mb-2">Instruções:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>1. Abra o aplicativo do seu banco</li>
            <li>2. Acesse a área PIX ou escaneie o QR Code</li>
            <li>3. Confirme os dados e finalize o pagamento</li>
            <li>4. Guarde o comprovante</li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            O pagamento pode levar alguns instantes para ser confirmado. 
            Assim que confirmado, você receberá uma notificação.
          </p>
        </div>
        
        <div className="mt-4">
          <Button 
            onClick={() => handlePayment()}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            {loading ? 'Gerando PIX...' : 'Gerar novo PIX'}
          </Button>
        </div>
      </div>
    );
  };
  
  // Renderizar interface de pagamento com Boleto
  const renderBoletoPayment = () => {
    if (!paymentResult) {
      return (
        <div className="bg-yellow-50 p-6 rounded-lg text-center">
          <Banknote className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-medium mb-4">Pagamento via Boleto</h3>
          <p className="text-sm text-gray-600 mb-4">
            Ao clicar em "Gerar Boleto", você receberá um boleto bancário para pagamento.
          </p>
          <Button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            {loading ? 'Gerando Boleto...' : 'Gerar Boleto'}
          </Button>
        </div>
      );
    }
    
    // Log completo da resposta para diagnóstico
    console.log('=== DIAGNÓSTICO BOLETO ===');
    console.log('Objeto completo:', paymentResult);
    console.log('Charges:', paymentResult.charges);
    console.log('Primeira charge:', paymentResult.charges?.[0]);
    console.log('Last transaction:', paymentResult.charges?.[0]?.last_transaction);
    console.log('======================');
    
    // Mostrar boleto e instruções após processamento
    const boletoData = paymentResult.charges?.[0]?.last_transaction || {};
    
    // Extrair a linha digitável (código numérico) e a URL do boleto
    const boletoUrl = boletoData.url || '';
    const barcodeImage = boletoData.barcode || '';
    const linhaDigitavel = boletoData.line || boletoData.digitable_line || '';
    
    // Verificar se temos dados do boleto
    const hasBoletoData = !!boletoUrl;
    
    return (
      <div className="bg-yellow-50 p-6 rounded-lg">
        <div className="text-center">
          <Banknote className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-medium mb-2">Boleto Gerado com Sucesso!</h3>
          <p className="text-sm text-gray-600 mb-4">
            Use o link abaixo para visualizar e imprimir seu boleto
          </p>
        </div>
        
        {!hasBoletoData && (
          <div className="text-center p-4 mb-4 bg-yellow-100 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-yellow-700 mb-2">
              Não foi possível gerar o boleto.
            </p>
            <p className="text-xs text-yellow-600">
              Por favor, tente novamente ou escolha outra forma de pagamento.
            </p>
          </div>
        )}
        
        {boletoUrl && (
          <div className="mb-4">
            <a 
              href={boletoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white border border-yellow-300 text-center p-3 rounded-md hover:bg-yellow-100 transition-colors"
            >
              Visualizar / Imprimir Boleto
            </a>
          </div>
        )}
        
        {/* Imagem do código de barras */}
        {barcodeImage && barcodeImage.includes('api.pagar.me') && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Código de Barras:</p>
            <div className="bg-white border rounded-lg p-4 flex justify-center">
              <img 
                src={barcodeImage}
                alt="Código de barras do boleto"
                className="max-w-full h-auto"
              />
            </div>
          </div>
        )}
        
        {/* Linha digitável (código numérico) */}
        {linhaDigitavel ? (
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">Linha Digitável:</p>
            <div className="relative">
              <input 
                readOnly 
                value={linhaDigitavel}
                className="w-full p-3 bg-white border rounded-md text-xs"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(linhaDigitavel);
                  alert('Código copiado!');
                }}
                className="absolute right-2 top-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                Copiar
              </button>
            </div>
          </div>
        ) : barcodeImage && !barcodeImage.includes('api.pagar.me') ? (
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">Código de Barras:</p>
            <div className="relative">
              <input 
                readOnly 
                value={barcodeImage}
                className="w-full p-3 bg-white border rounded-md text-xs"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(barcodeImage);
                  alert('Código copiado!');
                }}
                className="absolute right-2 top-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                Copiar
              </button>
            </div>
          </div>
        ) : null}
        
        <div className="bg-white p-3 rounded-md border border-yellow-200 mb-4">
          <h4 className="font-medium text-sm mb-1">Instruções:</h4>
          <ol className="text-xs text-gray-700 list-decimal pl-4 space-y-1">
            <li>Imprima o boleto ou utilize o código de barras</li>
            <li>Pague no banco, internet banking ou casa lotérica</li>
            <li>O pagamento pode levar até 3 dias úteis para ser processado</li>
            <li>Guarde o comprovante</li>
          </ol>
        </div>
        
        <p className="text-xs text-gray-500 text-center">
          O vencimento do boleto é de 3 dias. Após essa data, o pedido será cancelado.
        </p>
      </div>
    );
  };
  
  // Renderizar interface de pagamento com Cartão
  const renderCreditCardPayment = () => {
    return (
      <div className="bg-blue-50 p-6 rounded-lg">
        <div className="text-center mb-6">
          <CreditCard className="h-12 w-12 mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-medium">Pagamento com Cartão de Crédito</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número do Cartão
            </label>
            <input
              type="text"
              name="number"
              value={cardData.number}
              onChange={handleCardDataChange}
              placeholder="0000 0000 0000 0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              maxLength={16}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome no Cartão
            </label>
            <input
              type="text"
              name="holder_name"
              value={cardData.holder_name}
              onChange={handleCardDataChange}
              placeholder="Nome como está no cartão"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mês
              </label>
              <input
                type="number"
                name="exp_month"
                value={cardData.exp_month || ''}
                onChange={handleCardDataChange}
                placeholder="MM"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min={1}
                max={12}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano
              </label>
              <input
                type="number"
                name="exp_year"
                value={cardData.exp_year || ''}
                onChange={handleCardDataChange}
                placeholder="AAAA"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 20}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                name="cvv"
                value={cardData.cvv}
                onChange={handleCardDataChange}
                placeholder="123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                maxLength={4}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parcelas
            </label>
            <select
              value={installments}
              onChange={(e) => setInstallments(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}x de R$ {(total / num).toFixed(2)}{num === 1 ? ' à vista' : ' sem juros'}
                </option>
              ))}
            </select>
          </div>
          
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? 'Processando...' : `Pagar R$ ${total.toFixed(2)}`}
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="pagarme-checkout">
      {/* Seleção de método de pagamento */}
      <div className="payment-methods mb-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            type="button"
            onClick={() => handlePaymentMethodChange('credit_card')}
            className={`method-btn ${paymentMethod === 'credit_card' ? 'active' : ''}`}
          >
            <CreditCard className="h-6 w-6 mb-2" />
            <span>Cartão de Crédito</span>
          </button>
          
          <button
            type="button"
            onClick={() => handlePaymentMethodChange('pix')}
            className={`method-btn ${paymentMethod === 'pix' ? 'active' : ''}`}
          >
            <QrCode className="h-6 w-6 mb-2" />
            <span>PIX</span>
          </button>
          
          <button
            type="button"
            onClick={() => handlePaymentMethodChange('boleto')}
            className={`method-btn ${paymentMethod === 'boleto' ? 'active' : ''}`}
          >
            <Banknote className="h-6 w-6 mb-2" />
            <span>Boleto</span>
          </button>
        </div>
      </div>
      
      {/* Mensagens de erro */}
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 p-3 rounded-md mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Formulário do método de pagamento selecionado */}
      <div className="payment-form">
        {paymentMethod === 'credit_card' && renderCreditCardPayment()}
        {paymentMethod === 'pix' && renderPixPayment()}
        {paymentMethod === 'boleto' && renderBoletoPayment()}
      </div>
      
      {/* Informações de segurança */}
      <div className="security-info mt-6 text-xs text-gray-500">
        <div className="flex items-center mb-2">
          <Shield className="h-4 w-4 mr-1 text-green-500" />
          <span>Pagamento processado com segurança pelo Pagar.me</span>
        </div>
        <p>Seus dados são protegidos por criptografia e não são armazenados em nosso servidor.</p>
      </div>
    </div>
  );
};

export default PagarmeCheckout; 