// Função serverless para verificar o status da aplicação e variáveis de ambiente
const fetch = require('node-fetch');

// Formatar as chaves para exibição segura
const maskApiKey = (key) => {
  if (!key) return 'Não definida';
  if (key.length <= 8) return key;
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
};

exports.handler = async function(event, context) {
  // Headers para CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  // Se for uma requisição OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  try {
    // Verificar variáveis de ambiente
    const publicKey = process.env.VITE_PAGARME_PUBLIC_KEY || '';
    const secretKey = process.env.VITE_PAGARME_SECRET_KEY || '';

    // Status da aplicação
    const status = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      environment_variables: {
        publicKey: maskApiKey(publicKey),
        secretKey: maskApiKey(secretKey),
        publicKeyDefined: !!publicKey,
        secretKeyDefined: !!secretKey
      }
    };

    // Adicionar informações sobre as variáveis de ambiente
    const envInfo = {};
    for (const key in process.env) {
      // Incluir apenas variáveis relevantes, excluindo chaves sensíveis
      if (key.startsWith('VITE_') && !key.includes('KEY') && !key.includes('SECRET')) {
        envInfo[key] = process.env[key];
      }
    }

    status.environment_variables.other = envInfo;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        message: 'API funcionando corretamente',
        data: status
      })
    };
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: 'Erro ao verificar status da API',
        error: error.message
      })
    };
  }
}; 