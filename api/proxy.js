// Função serverless para servir como proxy para a API do Pagar.me
// Resolve o problema de CORS ao fazer as requisições server-to-server

const fetch = require('node-fetch');

// URLs da API do Pagar.me
const API_URL = 'https://api.pagar.me/core/v5';
const ROUTES = {
  customers: `${API_URL}/customers`,
  tokens: `${API_URL}/tokens`,
  cards: `${API_URL}/customers/:customer_id/cards`,
  orders: `${API_URL}/orders`,
};

// Headers permitidos nas requisições
const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
];

// Melhor formatação para o header de autorização
const formatAuth = (apiKey) => {
  if (!apiKey) return '';
  
  // Verificar se a chave já está em formato Base64
  if (apiKey.includes(':')) {
    return `Basic ${Buffer.from(apiKey).toString('base64')}`;
  }
  
  // Se não tiver ":", assume que é apenas a chave e adiciona ":"
  return `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;
};

exports.handler = async function(event, context) {
  // Suporte para preflight OPTIONS requests (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: ''
    };
  }
  
  // Permitir apenas métodos POST para segurança
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }

  try {
    console.log('Recebida requisição para proxy Pagar.me');
    
    // Extrair dados da requisição
    const requestData = JSON.parse(event.body);
    const { endpoint, data, apiKey, customerId } = requestData;

    // Validar dados recebidos
    if (!endpoint || !ROUTES[endpoint]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Endpoint inválido', endpoint }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    }

    if (!apiKey) {
      console.log('API key não fornecida');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'API key não fornecida' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    }

    // Construir URL para a requisição
    let apiUrl = ROUTES[endpoint];
    if (endpoint === 'cards' && customerId) {
      apiUrl = apiUrl.replace(':customer_id', customerId);
    }

    // Formatar o header de autorização corretamente
    const authHeader = formatAuth(apiKey);
    
    console.log(`Enviando requisição para ${endpoint} no Pagar.me, URL: ${apiUrl}`);
    console.log(`Auth header (primeiros 20 caracteres): ${authHeader.substring(0, 20)}...`);
    
    // Fazer a requisição para a API do Pagar.me
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(data),
    });

    // Log da resposta para diagnóstico
    console.log(`Resposta do Pagar.me: status ${response.status}`);
    
    // Obter dados da resposta como texto primeiro para diagnóstico
    const responseText = await response.text();
    
    try {
      // Tentar fazer parse do texto como JSON
      const responseData = JSON.parse(responseText);
      
      // Retornar resultado para o cliente
      return {
        statusCode: response.status,
        body: JSON.stringify(responseData),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
        },
      };
    } catch (jsonError) {
      // Se não for JSON válido, retornar o texto da resposta para debug
      console.error('Erro ao parsear resposta JSON:', jsonError);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: 'Resposta inválida da API',
          rawResponse: responseText.substring(0, 200) + '...' // Limitar tamanho
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    }
  } catch (error) {
    // Tratar erros
    console.error('Erro no proxy do Pagar.me:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Erro ao processar requisição',
        message: error.message || 'Erro desconhecido'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
}; 