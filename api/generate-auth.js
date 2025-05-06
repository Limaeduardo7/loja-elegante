// Função auxiliar para gerar token de autenticação Base64 para Pagar.me

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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  try {
    let key = '';
    
    // Se for POST, pegar a chave do corpo
    if (event.httpMethod === 'POST') {
      try {
        const requestData = JSON.parse(event.body);
        key = requestData.key || '';
      } catch (e) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Formato de requisição inválido',
            message: 'Envie um JSON com a propriedade "key"'
          })
        };
      }
    } 
    // Se for GET, pegar a chave da query string
    else if (event.queryStringParameters && event.queryStringParameters.key) {
      key = event.queryStringParameters.key;
    }

    if (!key) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Chave não fornecida',
          message: 'Forneça uma chave para gerar o token'
        })
      };
    }

    // Formatar a chave conforme o padrão do Pagar.me (adicionando ":" no final)
    const keyWithColon = key.endsWith(':') ? key : `${key}:`;
    const base64Key = Buffer.from(keyWithColon).toString('base64');

    // Retornar os resultados
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        original_key: key,
        formatted_key: keyWithColon,
        base64_key: base64Key,
        full_auth_header: `Basic ${base64Key}`,
        usage_instructions: "Coloque o valor de 'full_auth_header' na constante DIRECT_AUTH_HEADER no arquivo proxy.js"
      })
    };
  } catch (error) {
    console.error('Erro ao gerar token:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro ao processar a requisição',
        message: error.message
      })
    };
  }
}; 