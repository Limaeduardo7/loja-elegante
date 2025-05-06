// Função serverless para servir como proxy para a API do Pagar.me
// Resolve o problema de CORS e mantém as chaves da API seguras no servidor

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

// =====================================================================
// SEGURANÇA: AUTENTICAÇÃO DO PAGAR.ME
// =====================================================================
// IMPORTANTE: Para maior segurança, as chaves não devem aparecer no código-fonte.
// Configure as variáveis no painel do Netlify ou use a autenticação hardcoded abaixo.
//
// Para configurar autenticação hardcoded:
// 1. Acesse a página de diagnóstico: /diagnostico-api
// 2. Use a função "Gerar Token" e copie o resultado
// 3. Cole abaixo, substituindo 'Basic ' pelo valor copiado
const HARDCODED_AUTH = 'Basic '; // Ex: 'Basic c2tfdGVzdF8xMjM0NTY3ODphYmM='

exports.handler = async function(event, context) {
  // Log de requisição para debug
  console.log(`Requisição recebida: ${event.httpMethod} ${event.path}`);
  
  // Verificar variáveis de ambiente disponíveis
  console.log('DIAGNÓSTICO - Variáveis de ambiente:');
  console.log('- VITE_PAGARME_PUBLIC_KEY definida:', !!process.env.VITE_PAGARME_PUBLIC_KEY);
  console.log('- VITE_PAGARME_SECRET_KEY definida:', !!process.env.VITE_PAGARME_SECRET_KEY);
  
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
    const { endpoint, data, customerId, useSecretKey = true } = requestData;

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

    // Construir URL para a requisição
    let apiUrl = ROUTES[endpoint];
    if (endpoint === 'cards' && customerId) {
      apiUrl = apiUrl.replace(':customer_id', customerId);
    }

    // Resolver autenticação na seguinte ordem:
    // 1. Usar autenticação hardcoded (se definida)
    // 2. Usar a chave das variáveis de ambiente
    let authHeader = '';
    
    if (HARDCODED_AUTH && HARDCODED_AUTH !== 'Basic ') {
      console.log('Usando autenticação hardcoded');
      authHeader = HARDCODED_AUTH;
    } 
    else {
      console.log('Tentando usar chave das variáveis de ambiente');
      const envKey = useSecretKey ? process.env.VITE_PAGARME_SECRET_KEY : process.env.VITE_PAGARME_PUBLIC_KEY;
      
      if (envKey) {
        const keyWithColon = envKey.endsWith(':') ? envKey : `${envKey}:`;
        const base64Key = Buffer.from(keyWithColon).toString('base64');
        authHeader = `Basic ${base64Key}`;
      } else {
        return {
          statusCode: 401,
          body: JSON.stringify({ 
            error: 'Não foi possível obter autenticação válida',
            message: 'Configure as variáveis de ambiente ou defina HARDCODED_AUTH no proxy.js'
          }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        };
      }
    }
    
    console.log(`Enviando requisição para ${endpoint} no Pagar.me, URL: ${apiUrl}`);
    console.log(`Auth header (formato): ${authHeader.substring(0, 12)}...`);
    
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