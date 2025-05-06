// Função serverless para verificar variáveis de ambiente no Netlify
const fetch = require('node-fetch');

// Formatar chave para exibição segura
const maskKey = (key) => {
  if (!key) return 'Não definida';
  if (key.length <= 8) return key;
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
};

// Testar formato da chave
const testKeyFormat = (key) => {
  if (!key) return { valid: false, message: 'Chave não definida' };
  
  // Verificar formato da chave pública (geralmente começa com pk_)
  if (key.startsWith('pk_') || key.startsWith('sk_')) {
    return { valid: true, message: 'Formato correto de chave Pagar.me' };
  }

  return { valid: false, message: 'Formato de chave não reconhecido' };
};

// Testar conexão com Pagar.me
const testPagarmeConnection = async (apiKey) => {
  // Não testar se não tiver chave
  if (!apiKey) {
    return { success: false, message: 'Chave não fornecida' };
  }
  
  try {
    // Formatar autenticação
    const keyWithColon = apiKey.endsWith(':') ? apiKey : `${apiKey}:`;
    const base64Key = Buffer.from(keyWithColon).toString('base64');
    
    // Fazer uma simples requisição de teste
    const response = await fetch('https://api.pagar.me/core/v5/customers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${base64Key}`
      }
    });
    
    if (response.ok) {
      return { success: true, message: `Conexão bem-sucedida (${response.status})` };
    } else {
      const data = await response.text();
      return { 
        success: false, 
        message: `Erro na conexão: HTTP ${response.status}`,
        details: data.substring(0, 200)
      };
    }
  } catch (error) {
    return { success: false, message: `Erro: ${error.message}` };
  }
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
    // Obter as variáveis de ambiente
    const publicKey = process.env.VITE_PAGARME_PUBLIC_KEY || '';
    const secretKey = process.env.VITE_PAGARME_SECRET_KEY || '';
    
    // Testar o formato das chaves
    const publicKeyFormat = testKeyFormat(publicKey);
    const secretKeyFormat = testKeyFormat(secretKey);
    
    // Testar a conexão com a API do Pagar.me (só com a chave secreta para evitar exposição)
    const connectionTest = await testPagarmeConnection(secretKey);
    
    // Montar resultado
    const result = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      site_url: process.env.URL || 'desconhecido',
      deploy_id: process.env.DEPLOY_ID || 'desconhecido',
      chaves: {
        publicKey: {
          masked: maskKey(publicKey),
          defined: !!publicKey,
          format: publicKeyFormat
        },
        secretKey: {
          masked: maskKey(secretKey),
          defined: !!secretKey,
          format: secretKeyFormat
        }
      },
      teste_conexao: connectionTest
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        message: 'Verificação de variáveis de ambiente concluída',
        data: result
      })
    };
  } catch (error) {
    console.error('Erro ao verificar variáveis:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: 'Erro ao verificar variáveis de ambiente',
        error: error.message
      })
    };
  }
}; 