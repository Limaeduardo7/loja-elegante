// Função serverless para criar transações no Pagar.me
const axios = require('axios');

exports.handler = async function(event, context) {
  // Verificar se é um método POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }

  // Log para debugging (remover em produção)
  console.log('Iniciando processamento de transação');

  try {
    // Obter dados do corpo da requisição
    const data = JSON.parse(event.body);
    const apiKey = process.env.PAGARME_API_KEY;
    
    if (!apiKey) {
      console.error('Chave de API do Pagar.me não encontrada');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Configuração do servidor incompleta', 
          message: 'PAGARME_API_KEY não configurada' 
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
    
    console.log('Dados recebidos para transação:', JSON.stringify(data, null, 2));
    
    // Formatar os dados conforme a API v5 do Pagar.me
    const payload = {
      items: data.items.map(item => ({
        amount: Math.round(item.unit_price),
        description: item.title,
        quantity: item.quantity,
        code: String(item.id)
      })),
      customer: {
        name: `${data.customer.firstName} ${data.customer.lastName}`,
        email: data.customer.email,
        type: "individual",
        document: data.customer.cpf.replace(/\D/g, ''),
        phones: {
          mobile_phone: {
            country_code: "55",
            area_code: data.customer.phone.substring(0, 2),
            number: data.customer.phone.substring(2).replace(/\D/g, '')
          }
        }
      },
      payments: [
        {
          payment_method: "checkout",
          checkout: {
            expires_in: 120,
            default_payment_method: "credit_card",
            accepted_payment_methods: ["credit_card", "boleto", "pix"],
            success_url: data.redirectUrls.success,
            skip_checkout_success_page: true
          }
        }
      ],
      shipping: {
        amount: Math.round(data.shipping.cost * 100),
        description: "Frete",
        address: {
          country: "BR",
          state: data.shipping.address.state,
          city: data.shipping.address.city,
          zip_code: data.shipping.address.zipcode.replace(/\D/g, ''),
          line_1: `${data.shipping.address.street}, ${data.shipping.address.number}`,
          line_2: data.shipping.address.complement || data.shipping.address.neighborhood
        }
      },
      metadata: {
        order_id: data.orderId
      }
    };
    
    console.log('Enviando para Pagar.me:', JSON.stringify(payload, null, 2));
    
    // Chamar a API do Pagar.me
    const response = await axios.post('https://api.pagar.me/core/v5/orders', 
      payload, 
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Resposta do Pagar.me:', JSON.stringify(response.data, null, 2));
    
    // Retornar resposta com o ID da transação
    return {
      statusCode: 200,
      body: JSON.stringify({
        transactionId: response.data.id,
        status: 'created',
        checkoutUrl: response.data.checkouts[0]?.payment_url,
        message: 'Transação criada com sucesso'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    // Log detalhado do erro
    console.error('Erro ao criar transação:', error);
    console.error('Detalhes do erro:', error.response?.data || error.message);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Erro ao processar a solicitação',
        message: error.response?.data?.message || error.message,
        details: error.response?.data || null
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
}; 