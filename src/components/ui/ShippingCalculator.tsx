import React, { useState } from 'react';
import { Truck, Loader2 } from 'lucide-react';
import { 
  calculateShipping,
  prepareProductsForShipping,
  isValidCEP,
  formatCEP,
  ShippingQuoteResponse,
  ShippingProduct
} from '../../lib/services/melhorEnvio';

interface ShippingCalculatorProps {
  products: any[];
  onSelectShipping?: (option: ShippingQuoteResponse) => void;
  selectedShippingId?: number;
  compact?: boolean; // Para versão reduzida na página de produto
}

const ShippingCalculator: React.FC<ShippingCalculatorProps> = ({
  products,
  onSelectShipping,
  selectedShippingId,
  compact = false
}) => {
  const [cep, setCep] = useState('');
  const [formattedCep, setFormattedCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingQuoteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    
    // Limitar a 8 dígitos
    if (value.length <= 8) {
      setCep(value);
      
      // Formatar CEP no padrão 00000-000
      if (value.length <= 5) {
        setFormattedCep(value);
      } else {
        setFormattedCep(`${value.slice(0, 5)}-${value.slice(5)}`);
      }
    }
  };

  const calculateShippingRate = async () => {
    if (!isValidCEP(formattedCep)) {
      setError('CEP inválido. Digite um CEP no formato 00000-000.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar produtos para API
      const shippingProducts = prepareProductsForShipping(products);
      
      // Calcular opções de frete
      const options = await calculateShipping(formattedCep, shippingProducts);
      setShippingOptions(options);
      
      // Se não houver opções
      if (options.length === 0) {
        setError('Não encontramos opções de frete para este CEP.');
      }
    } catch (err) {
      console.error('Erro ao calcular frete:', err);
      setError('Erro ao calcular o frete. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateShippingRate();
  };

  const handleSelectOption = (option: ShippingQuoteResponse) => {
    if (onSelectShipping) {
      onSelectShipping(option);
    }
  };

  // Formatação do valor do frete para exibição
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(price));
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${compact ? 'text-sm' : ''}`}>
      <h3 className={`font-medium ${compact ? 'mb-2 text-base' : 'mb-4 text-lg'} flex items-center`}>
        <Truck className="inline-block mr-2" size={compact ? 16 : 20} />
        Calcular Frete
      </h3>
      
      <form onSubmit={handleSubmit} className="flex items-start mb-4">
        <div className="flex-grow">
          <label htmlFor="cep" className="sr-only">CEP</label>
          <input
            type="text"
            id="cep"
            value={formattedCep}
            onChange={handleCepChange}
            placeholder="00000-000"
            className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
            maxLength={9}
          />
        </div>
        <button
          type="submit"
          disabled={loading || cep.length !== 8}
          className={`px-4 py-2 rounded-r-md text-white ${
            loading || cep.length !== 8
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-champagne-500 hover:bg-champagne-600'
          } transition-colors`}
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'Calcular'}
        </button>
      </form>

      {error && (
        <div className="text-red-500 text-sm mb-3">{error}</div>
      )}

      {shippingOptions.length > 0 && (
        <div className={`space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          <p className="text-gray-700 font-medium">Opções de envio para: {formattedCep}</p>
          
          <div className="divide-y divide-gray-100">
            {shippingOptions.map((option) => (
              <div 
                key={option.id}
                className={`py-2 ${onSelectShipping ? 'cursor-pointer hover:bg-gray-50' : ''} ${
                  selectedShippingId === option.id ? 'bg-champagne-50' : ''
                }`}
                onClick={() => onSelectShipping && handleSelectOption(option)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {!compact && (
                      <input
                        type="radio"
                        name="shipping-option"
                        checked={selectedShippingId === option.id}
                        onChange={() => handleSelectOption(option)}
                        className="form-radio text-champagne-500 h-4 w-4"
                        id={`shipping-option-${option.id}`}
                      />
                    )}
                    <div>
                      <span className="font-medium">{option.name}</span>
                      <span className="text-gray-500 ml-1">
                        ({option.company.name})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-champagne-600">
                      {formatPrice(option.price)}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {option.delivery_time === 1
                        ? 'Entrega em 1 dia útil'
                        : `Entrega em ${option.delivery_time} dias úteis`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!error && !loading && shippingOptions.length === 0 && formattedCep && (
        <p className="text-gray-500 text-sm">
          Digite seu CEP para calcular opções de frete
        </p>
      )}
      
      <div className="mt-3 text-xs text-gray-500">
        *Prazos de entrega iniciam a partir da confirmação do pagamento
      </div>
    </div>
  );
};

export default ShippingCalculator; 