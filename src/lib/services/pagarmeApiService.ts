/**
 * Serviço para integração com a API v5 do Pagar.me via proxy serverless
 * A autenticação é gerenciada pelo proxy para manter as chaves seguras
 */

// URL base do proxy serverless
const isProduction = import.meta.env.PROD;
const BASE_URL = isProduction 
  ? '/.netlify/functions/proxy' 
  : 'http://localhost:8888/.netlify/functions/proxy';

// Função auxiliar para fazer requisições através do proxy
async function proxyRequest(endpoint: string, data: any, useSecretKey = true, customerId?: string) {
  try {
    console.log(`Enviando requisição para ${endpoint}, método: ${useSecretKey ? 'SECRET' : 'PUBLIC'}`);
    console.log(`URL do proxy: ${BASE_URL}`);
    
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Adicionar informações do cliente para diagnóstico
        'X-Client-Info': 'frontend',
        'X-Client-Version': '1.0'
      },
      body: JSON.stringify({
        endpoint,
        data,
        customerId,
        useSecretKey // Indica ao proxy qual tipo de chave usar
      }),
    });

    // Log completo para diagnóstico
    console.log(`Resposta do servidor para ${endpoint}: status ${response.status}`);

    // Ler o corpo da resposta UMA ÚNICA VEZ
    const responseData = await response.json().catch(async (e) => {
      // Se não for JSON válido, tentar obter como texto
      const text = await response.text().catch(() => 'Não foi possível ler a resposta');
      return { error: 'Resposta não é JSON válido', message: text };
    });

    if (!response.ok) {
      console.error(`Erro na requisição para ${endpoint}:`, responseData);
      throw new Error(responseData.message || responseData.error || `Erro na requisição para ${endpoint}`);
    }

    return responseData;
  } catch (error) {
    console.error(`Erro ao fazer requisição para ${endpoint}:`, error);
    throw error;
  }
}

/**
 * 1. Cria um cliente no Pagar.me
 * @param customerData Dados do cliente
 * @returns ID do cliente criado
 */
export async function createCustomer(customerData: {
  name: string;
  email: string;
  type: 'individual';
  document: string;
  phones: {
    mobile_phone?: {
      country_code: string;
      area_code: string;
      number: string;
    };
    home_phone?: {
      country_code: string;
      area_code: string;
      number: string;
    };
  };
}) {
  try {
    console.log('Criando cliente no Pagar.me:', customerData);

    const data = await proxyRequest('customers', customerData, true);

    console.log('Cliente criado com sucesso:', data);
    return data.id; // customer_id
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
}

/**
 * 2. Cria um token de cartão
 * @param cardData Dados do cartão
 * @returns Token do cartão
 */
export async function createCardToken(cardData: {
  number: string;
  holder_name: string;
  exp_month: number;
  exp_year: number;
  cvv: string;
}) {
  try {
    console.log('Tokenizando cartão...');

    const data = await proxyRequest('tokens', {
      type: 'card',
      card: cardData
    }, false); // Usa chave pública

    console.log('Token do cartão criado com sucesso:', data);
    return data.id; // card_token
  } catch (error) {
    console.error('Erro ao criar token do cartão:', error);
    throw error;
  }
}

/**
 * 3. Cria um card_id (opcional, mas recomendado)
 * @param customerId ID do cliente
 * @param cardToken Token do cartão
 * @param billingAddress Endereço de cobrança
 * @returns ID do cartão
 */
export async function createCard(
  customerId: string,
  cardToken: string,
  billingAddress: {
    line_1: string;
    line_2: string;
    zip_code: string;
    city: string;
    state: string;
    country: string;
  }
) {
  try {
    console.log('Criando card_id para cliente:', customerId);

    const data = await proxyRequest('cards', {
      token: cardToken,
      billing_address: billingAddress
    }, true, customerId);

    console.log('Card_id criado com sucesso:', data);
    return data.id; // card_id
  } catch (error) {
    console.error('Erro ao criar card_id:', error);
    throw error;
  }
}

/**
 * 4. Cria um pedido com cartão de crédito usando card_token
 * @param orderData Dados do pedido
 * @returns Dados do pedido criado
 */
export async function createOrderWithCardToken(orderData: {
  customer_id: string;
  items: Array<{
    amount: number;
    description: string;
    quantity: number;
    code: string;
  }>;
  payments: Array<{
    payment_method: 'credit_card';
    credit_card: {
      token: string;
      installments: number;
      statement_descriptor?: string;
      billing_address: {
        line_1: string;
        line_2: string;
        zip_code: string;
        city: string;
        state: string;
        country: string;
      };
    };
  }>;
  shipping?: {
    amount: number;
    description: string;
    address: {
      line_1: string;
      line_2: string;
      zip_code: string;
      city: string;
      state: string;
      country: string;
    };
  };
}) {
  try {
    console.log('Criando pedido com card_token:', orderData);
    
    const data = await proxyRequest('orders', orderData, true);

    console.log('Pedido criado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
}

/**
 * 5. Cria um pedido com cartão de crédito usando card_id
 * @param orderData Dados do pedido
 * @returns Dados do pedido criado
 */
export async function createOrderWithCardId(orderData: {
  customer_id: string;
  items: Array<{
    amount: number;
    description: string;
    quantity: number;
    code: string;
  }>;
  payments: Array<{
    payment_method: 'credit_card';
    credit_card: {
      card_id: string;
      installments: number;
      statement_descriptor?: string;
    };
  }>;
  shipping?: {
    amount: number;
    description: string;
    address: {
      line_1: string;
      line_2: string;
      zip_code: string;
      city: string;
      state: string;
      country: string;
    };
  };
}) {
  try {
    console.log('Criando pedido com card_id:', orderData);
    
    const data = await proxyRequest('orders', orderData, true);

    console.log('Pedido criado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
}

/**
 * 6. Cria um pedido com PIX
 * @param orderData Dados do pedido
 * @returns Dados do pedido criado incluindo QR code PIX
 */
export async function createOrderWithPix(orderData: {
  customer_id: string;
  items: Array<{
    amount: number;
    description: string;
    quantity: number;
    code: string;
  }>;
  payments: Array<{
    payment_method: 'pix';
    pix: {
      expires_in: number;
    };
  }>;
  shipping?: {
    amount: number;
    description: string;
    address: {
      line_1: string;
      line_2: string;
      zip_code: string;
      city: string;
      state: string;
      country: string;
    };
  };
}) {
  try {
    console.log('Criando pedido com PIX:', orderData);
    
    const data = await proxyRequest('orders', orderData, true);

    console.log('Pedido PIX criado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao criar pedido PIX:', error);
    throw error;
  }
}

/**
 * 7. Cria um pedido com Boleto
 * @param orderData Dados do pedido
 * @returns Dados do pedido criado incluindo URL do boleto
 */
export async function createOrderWithBoleto(orderData: {
  customer_id: string;
  items: Array<{
    amount: number;
    description: string;
    quantity: number;
    code: string;
  }>;
  payments: Array<{
    payment_method: 'boleto';
    boleto: {
      due_at: string;
      instructions: string;
    };
  }>;
  shipping?: {
    amount: number;
    description: string;
    address: {
      line_1: string;
      line_2: string;
      zip_code: string;
      city: string;
      state: string;
      country: string;
    };
  };
}) {
  try {
    console.log('Criando pedido com Boleto:', orderData);
    
    const data = await proxyRequest('orders', orderData, true);

    console.log('Pedido Boleto criado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao criar pedido Boleto:', error);
    throw error;
  }
}

export default {
  createCustomer,
  createCardToken,
  createCard,
  createOrderWithCardToken,
  createOrderWithCardId,
  createOrderWithPix,
  createOrderWithBoleto
}; 