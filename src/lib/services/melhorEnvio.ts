import axios from 'axios';

// Tipos para a API do Melhor Envio
export interface ShippingAddress {
  postal_code: string;
  address?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state_abbr?: string;
  country_id?: string;
}

export interface ShippingProduct {
  id: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value: number;
  quantity: number;
}

export interface ShippingQuoteRequest {
  from: ShippingAddress;
  to: ShippingAddress;
  products: ShippingProduct[];
  options?: {
    receipt?: boolean;
    own_hand?: boolean;
    collect?: boolean;
  };
}

export interface ShippingQuoteResponse {
  id: number;
  name: string;
  price: string;
  custom_price?: string;
  discount?: string;
  currency: string;
  delivery_time: number;
  delivery_range?: {
    min: number;
    max: number;
  };
  custom_delivery_time?: number;
  custom_delivery_range?: {
    min: number;
    max: number;
  };
  packages: any[];
  company: {
    id: number;
    name: string;
    picture: string;
  };
  error?: string;
}

// Configuração da loja
const STORE_CEP = '01310-100'; // CEP de origem
const STORE_ADDRESS = {
  postal_code: STORE_CEP,
  address: 'Av. Paulista',
  number: '1000',
  city: 'São Paulo',
  state_abbr: 'SP',
};

// Url da API
// Em produção, isso deveria estar em um servidor backend
const API_URL = 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

/**
 * Calcula o frete para um CEP e produtos
 * @param cep CEP de destino
 * @param products Lista de produtos
 * @returns Lista de opções de frete
 */
export async function calculateShipping(
  cep: string,
  products: ShippingProduct[]
): Promise<ShippingQuoteResponse[]> {
  try {
    // Em um cenário real, esta chamada deveria ser feita pelo backend
    // porque requer autenticação e não é seguro incluir tokens no frontend
    
    // Simulação de resposta para fins de demonstração
    // Normalmente, você faria uma chamada API real aqui
    return simulateShippingResponse(cep, products);
  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    throw error;
  }
}

/**
 * Função para simular uma resposta da API do Melhor Envio
 * (Isso seria substituído por uma chamada real à API em produção)
 */
function simulateShippingResponse(
  cep: string,
  products: ShippingProduct[]
): Promise<ShippingQuoteResponse[]> {
  return new Promise((resolve) => {
    // Calcular valor total dos produtos para base de seguro
    const totalValue = products.reduce(
      (sum, product) => sum + product.insurance_value * product.quantity, 
      0
    );
    
    // Calcula peso total para afetar o preço do frete
    const totalWeight = products.reduce(
      (sum, product) => sum + product.weight * product.quantity,
      0
    );
    
    // Variação de preço baseada no CEP (simulando distância)
    // Em uma implementação real, isso seria calculado pela API
    const cepNumeric = parseInt(cep.replace(/\D/g, ''));
    const distanceFactor = (cepNumeric % 10000) / 10000;
    
    // Simular resposta da API
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: 'PAC',
          price: String((15 + totalWeight * 2 + distanceFactor * 20).toFixed(2)),
          currency: 'BRL',
          delivery_time: 7 + Math.round(distanceFactor * 5),
          company: {
            id: 1,
            name: 'Correios',
            picture: 'https://www.melhorenvio.com.br/images/shipping-companies/correios.png'
          },
          packages: []
        },
        {
          id: 2,
          name: 'SEDEX',
          price: String((25 + totalWeight * 3 + distanceFactor * 30).toFixed(2)),
          currency: 'BRL',
          delivery_time: 3 + Math.round(distanceFactor * 3),
          company: {
            id: 1,
            name: 'Correios',
            picture: 'https://www.melhorenvio.com.br/images/shipping-companies/correios.png'
          },
          packages: []
        },
        {
          id: 3,
          name: 'Jadlog Package',
          price: String((20 + totalWeight * 2.5 + distanceFactor * 25).toFixed(2)),
          currency: 'BRL',
          delivery_time: 5 + Math.round(distanceFactor * 4),
          company: {
            id: 2,
            name: 'Jadlog',
            picture: 'https://www.melhorenvio.com.br/images/shipping-companies/jadlog.png'
          },
          packages: []
        }
      ]);
    }, 800); // Simular delay de rede
  });
}

/**
 * Prepara os dados de produtos do carrinho para o formato esperado pela API
 */
export function prepareProductsForShipping(
  cartProducts: any[]
): ShippingProduct[] {
  return cartProducts.map(item => ({
    id: item.id,
    width: item.width || 15, // largura em cm
    height: item.height || 5, // altura em cm
    length: item.length || 20, // comprimento em cm
    weight: item.weight || 0.5, // peso em kg
    insurance_value: item.price || 0, // valor para seguro
    quantity: item.quantity || 1
  }));
}

/**
 * Verifica se o CEP é válido
 */
export function isValidCEP(cep: string): boolean {
  const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
  return cepRegex.test(cep);
}

/**
 * Formata o CEP no padrão 00000-000
 */
export function formatCEP(cep: string): string {
  const numbersOnly = cep.replace(/\D/g, '');
  if (numbersOnly.length !== 8) return cep;
  return `${numbersOnly.slice(0, 5)}-${numbersOnly.slice(5)}`;
}

export default {
  calculateShipping,
  prepareProductsForShipping,
  isValidCEP,
  formatCEP
}; 