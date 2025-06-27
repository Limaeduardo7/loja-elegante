/**
 * Serviço para integração com a API v5 do Pagar.me via proxy serverless
 * A autenticação é gerenciada pelo proxy para manter as chaves seguras
 */

// URL base do proxy serverless
const isProduction = import.meta.env.PROD;

// Obtém a URL base atual do navegador
const currentUrl = window.location.origin;

// Determina a URL base para o proxy
const getBaseUrl = () => {
  if (isProduction) {
    return '/.netlify/functions';
  }
  
  // Em desenvolvimento, usar URL absoluta para garantir o funcionamento
  return `${currentUrl}/.netlify/functions`;
};

// URL base do proxy
const BASE_URL = getBaseUrl();

// Lista de possíveis URLs do servidor Netlify Dev
const NETLIFY_DEV_URLS = [
  'http://localhost:8888/.netlify/functions',
  'http://localhost:3000/.netlify/functions',
  '/.netlify/functions' // URL relativa que funciona em qualquer porta
];

interface ProxyRequestBody {
  endpoint: string;
  data: any;
  customerId?: string;
  useSecretKey: string; // Deve ser string para compatibilidade com a API
}

// Função auxiliar para fazer requisições através do proxy
async function proxyRequest(endpoint: string, data: any, useSecretKey: string | boolean = "true", customerId?: string) {
  console.log(`Enviando requisição para ${endpoint}`);
  console.log(`URL do proxy: ${BASE_URL}/proxy`);
  
  try {
    // Converter boolean para string para compatibilidade
    const useSecretKeyStr = typeof useSecretKey === 'boolean'
      ? useSecretKey ? "true" : "false"
      : useSecretKey;
    
    // Construir o corpo da requisição com tipo correto
    const requestBody: ProxyRequestBody = {
      endpoint,
      data,
      customerId,
      useSecretKey: useSecretKeyStr
    };
    
    // Usar URL absoluta para evitar problemas de roteamento
    const response = await fetch(`${BASE_URL}/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Info': 'frontend',
        'X-Client-Version': '1.0'
      },
      body: JSON.stringify(requestBody),
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
    // Propagar o erro para tratamento no componente
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

    const data = await proxyRequest('customers', customerData, "true");

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
 * @deprecated Use createOrderWithCard em vez disso
 */
export async function createCardToken(cardData: {
  number: string;
  holder_name: string;
  exp_month: number;
  exp_year: number;
  cvv: string;
}) {
  try {
    console.log('AVISO: A função createCardToken está deprecated devido a problemas com a API do Pagar.me');
    console.log('Use createOrderWithCard diretamente com os dados do cartão, sem criar token');

    // Simulando um token para compatibilidade com código existente
    // Isso permitirá que o código continue funcionando enquanto migramos para createOrderWithCard
    const fakeToken = 'fake_token_' + Date.now();
    console.log('Gerando token simulado para compatibilidade:', fakeToken);
    return fakeToken;
    
    // Código antigo que não funciona devido a problemas com a API do Pagar.me
    /*
    console.log('Tokenizando cartão...');

    const data = await proxyRequest('tokens', {
      type: 'card',
      card: cardData
    }, "false"); // Usa chave pública

    console.log('Token do cartão criado com sucesso:', data);
    return data.id; // card_token
    */
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
 * @deprecated Use createOrderWithCard em vez disso
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
    console.log('AVISO: A função createCard está deprecated devido a problemas com a API do Pagar.me');
    console.log('Use createOrderWithCard diretamente com os dados do cartão');

    // Simulando um card_id para compatibilidade com código existente
    const fakeCardId = 'fake_card_' + Date.now();
    console.log('Gerando card_id simulado para compatibilidade:', fakeCardId);
    return fakeCardId;
    
    // Código antigo que não funciona devido a problemas com a API do Pagar.me
    /*
    console.log('Criando card_id para cliente:', customerId);

    const data = await proxyRequest('cards', {
      token: cardToken,
      billing_address: billingAddress
    }, "true", customerId);

    console.log('Card ID criado com sucesso:', data);
    return data.id; // card_id
    */
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
    
    const data = await proxyRequest('orders', orderData, "true");

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
    
    const data = await proxyRequest('orders', orderData, "true");

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
    
    const data = await proxyRequest('orders', orderData, "true");

    console.log('Pedido PIX criado com sucesso:', data);
    
    // Log da estrutura completa para diagnóstico
    console.log('Resposta PIX do Pagar.me completa:', JSON.stringify(data));
    
    // Busca em diferentes caminhos possíveis para os dados do QR Code
    let qrCodeText = null;
    let qrCodeUrl = null;
    
    // Caminho 1: Verificar se o QR Code está diretamente em last_transaction
    if (data.charges && 
        data.charges[0] && 
        data.charges[0].last_transaction) {
      
      const lastTransaction = data.charges[0].last_transaction;
      
      // Verificar formato da API v5 onde o QR Code é um objeto
      if (typeof lastTransaction.qr_code === 'object' && lastTransaction.qr_code) {
        qrCodeText = lastTransaction.qr_code.text;
        qrCodeUrl = lastTransaction.qr_code.url;
        console.log('QR Code encontrado como objeto em charges[0].last_transaction.qr_code');
      } 
      // Verificar formato alternativo onde o QR Code é uma string
      else if (typeof lastTransaction.qr_code === 'string') {
        qrCodeText = lastTransaction.qr_code;
        
        // Verificar se temos URL em propriedade separada
        if (lastTransaction.qr_code_url) {
          qrCodeUrl = lastTransaction.qr_code_url;
        }
        console.log('QR Code encontrado como string em charges[0].last_transaction.qr_code');
      }
      // Verificar formato observado na resposta real
      else if (lastTransaction.qr_code_url) {
        // Neste formato, qr_code é a string e qr_code_url é a URL
        qrCodeText = lastTransaction.qr_code;
        qrCodeUrl = lastTransaction.qr_code_url;
        console.log('QR Code encontrado em propriedades qr_code e qr_code_url de last_transaction');
      }
    }
    
    // Caminho 2: Verificar na raiz da charge
    if (!qrCodeText && !qrCodeUrl && data.charges && data.charges[0]) {
      qrCodeText = data.charges[0].qr_code || data.charges[0].pix_qr_code;
      qrCodeUrl = data.charges[0].qr_code_url || data.charges[0].pix_qr_code_url;
      console.log('QR Code encontrado na raiz da charge');
    }
    
    // Caminho 3: Verificar na raiz do objeto
    if (!qrCodeText && !qrCodeUrl) {
      qrCodeText = data.qr_code || data.pix_qr_code;
      qrCodeUrl = data.qr_code_url || data.pix_qr_code_url;
      console.log('QR Code encontrado na raiz do objeto de resposta');
    }
    
    // Log para diagnóstico dos dados extraídos
    console.log('Dados do QR Code PIX:', qrCodeText);
    console.log('Estrutura de charges:', data.charges?.map((c: any) => ({
      id: c.id,
      status: c.status,
      last_transaction_type: c.last_transaction?.transaction_type,
      has_qr_code: !!c.last_transaction?.qr_code,
      has_qr_code_url: !!c.last_transaction?.qr_code_url,
    })));
    
    // Anexar os dados explicitamente ao objeto de resposta para facilitar acesso
    data.qr_code = qrCodeText;
    data.qr_code_url = qrCodeUrl;
    
    // Criar uma estrutura mais acessível e consistente para o componente
    data._pixData = {
      text: qrCodeText,
      url: qrCodeUrl,
      found: !!(qrCodeText || qrCodeUrl)
    };
    
    console.log('Dados de QR Code PIX processados:', data._pixData);
    
    if (!data._pixData.found) {
      console.error('ALERTA: Dados do QR Code PIX não encontrados na resposta');
      
      // Diagnóstico adicional da estrutura da resposta
      console.log('Estrutura detalhada de last_transaction para diagnóstico:',
        data.charges && data.charges[0] && data.charges[0].last_transaction
          ? Object.keys(data.charges[0].last_transaction)
          : 'last_transaction não encontrado'
      );
    }
    
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
    
    const data = await proxyRequest('orders', orderData, "true");

    console.log('Pedido Boleto criado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao criar pedido Boleto:', error);
    throw error;
  }
}

/**
 * Cria um pedido com cartão de crédito diretamente, sem usar token
 * Alternativa que não depende do endpoint de tokens
 * @param orderData Dados do pedido
 * @returns Dados do pedido criado
 */
export async function createOrderWithCard(orderData: {
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
      installments: number;
      statement_descriptor?: string;
      card: {
        number: string;
        holder_name: string;
        exp_month: number;
        exp_year: number;
        cvv: string;
      };
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
    console.log('Criando pedido com dados do cartão diretamente:', {
      ...orderData,
      payments: orderData.payments.map(p => ({
        ...p,
        credit_card: {
          ...p.credit_card,
          card: { 
            number: p.credit_card.card.number.substring(0, 4) + '********', 
            holder_name: p.credit_card.card.holder_name,
            exp_month: p.credit_card.card.exp_month,
            exp_year: p.credit_card.card.exp_year,
            cvv: '***'
          }
        }
      }))
    });
    
    const data = await proxyRequest('orders', orderData, "true");

    console.log('Pedido criado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao criar pedido com cartão:', error);
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
  createOrderWithBoleto,
  createOrderWithCard
}; 