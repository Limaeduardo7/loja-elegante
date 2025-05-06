// Endpoint para criar transações no Pagar.me
const axios = require('axios');

// Chaves do Pagar.me (substitua por suas chaves reais)
const PAGARME_API_KEY = process.env.PAGARME_API_KEY || 'sua_api_key';
const PAGARME_PUBLIC_KEY = process.env.PAGARME_PUBLIC_KEY || 'pk_RdWl892Iz8Tk9Brn';

exports.handler = async function(event, context) {
  // Verificar se é um método POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' }),
    };
  }

  try {
    // Obter dados do corpo da requisição
    const data = JSON.parse(event.body);
    
    console.log('Dados recebidos para criação de transação:', JSON.stringify(data, null, 2));
    
    // Para testes, vamos simular uma resposta bem-sucedida
    // Na implementação real, você chamaria a API do Pagar.me
    
    // Gerar um ID de transação aleatório para teste
    const transactionId = `trx_${Math.random().toString(36).substring(2, 15)}`;
    
    /*
    // Implementação real com Pagar.me API
    const response = await axios.post('https://api.pagar.me/v5/orders', {
      items: data.items,
      customer: {
        name: `${data.customer.firstName} ${data.customer.lastName}`,
        email: data.customer.email,
        document: data.customer.cpf,
        phones: {
          mobile_phone: {
            country_code: '55',
            number: data.customer.phone.replace(/\D/g, '')
          }
        }
      },
      shipping: {
        amount: Math.round(data.shipping.cost * 100),
        address: {
          street: data.shipping.address.street,
          number: data.shipping.address.number,
          zip_code: data.shipping.address.zipcode.replace(/\D/g, ''),
          city: data.shipping.address.city,
          state: data.shipping.address.state,
          country: 'BR',
          line_1: `${data.shipping.address.street}, ${data.shipping.address.number}`,
          line_2: data.shipping.address.complement || ''
        }
      },
      payments: [
        {
          payment_method: 'checkout',
          checkout: {
            expires_in: 120,
            billing_address_editable: false,
            customer_editable: false,
            accepted_payment_methods: ['credit_card', 'boleto', 'pix'],
            success_url: data.redirectUrls.success,
            skip_checkout_success_page: true
          }
        }
      ]
    }, {
      headers: {
        'Authorization': `Basic ${Buffer.from(PAGARME_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
    
    const transactionId = response.data.id;
    */
    
    // Retornar resposta
    return {
      statusCode: 200,
      body: JSON.stringify({
        transactionId: transactionId,
        status: 'created',
        message: 'Transação criada com sucesso'
      }),
    };
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Erro ao processar a solicitação',
        message: error.message
      }),
    };
  }
}; 