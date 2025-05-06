// Função serverless para webhook de notificações do Pagar.me
const { createClient } = require('@supabase/supabase-js');

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

  // Iniciar cliente do Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Configuração do Supabase ausente');
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Configuração do servidor incompleta', 
        message: 'Variáveis do Supabase não configuradas' 
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Obter dados da notificação
    const data = JSON.parse(event.body);
    console.log('Notificação recebida:', JSON.stringify(data, null, 2));
    
    // Verificar se é uma notificação válida
    if (!data.id || !data.type) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Notificação inválida' }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
    
    // Registrar a notificação no banco de dados
    try {
      const { error: notificationError } = await supabase
        .from('pagarme_notifications')
        .insert({
          transaction_id: data.id,
          current_status: data.data?.status || data.type,
          old_status: data.data?.old_status || null,
          raw_data: data,
          processed: false
        });

      if (notificationError) {
        console.error('Erro ao registrar notificação:', notificationError);
      }
    } catch (dbError) {
      console.error('Erro ao acessar banco de dados:', dbError);
    }
    
    // Se for uma mudança de status de pagamento, atualizar o pedido
    if (data.type === 'order.paid' || 
        data.type === 'order.payment_failed' ||
        data.type.includes('status')) {
      
      const orderId = data.data?.metadata?.order_id || 
                     data.data?.order?.metadata?.order_id ||
                     null;
      
      if (!orderId) {
        console.warn('ID do pedido não encontrado na notificação');
      } else {
        // Mapear status do Pagar.me para status do sistema
        let orderStatus = 'aguardando_pagamento';
        let paymentStatus = data.data?.status || 'unknown';
        
        if (data.type === 'order.paid' || paymentStatus === 'paid') {
          orderStatus = 'pagamento_aprovado';
        } else if (data.type === 'order.payment_failed' || 
                  ['refused', 'failed', 'canceled'].includes(paymentStatus)) {
          orderStatus = 'cancelado';
        }
        
        // Atualizar o pedido
        try {
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              status: orderStatus,
              payment_status: paymentStatus,
              payment_id: data.id,
              payment_date: paymentStatus === 'paid' ? new Date().toISOString() : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId);
          
          if (updateError) {
            console.error('Erro ao atualizar pedido:', updateError);
          } else {
            console.log(`Pedido ${orderId} atualizado para status: ${orderStatus}`);
          }
        } catch (updateError) {
          console.error('Erro ao atualizar status do pedido:', updateError);
        }
      }
    }
    
    // Marcar a notificação como processada
    try {
      await supabase
        .from('pagarme_notifications')
        .update({ processed: true })
        .eq('transaction_id', data.id);
    } catch (markError) {
      console.error('Erro ao marcar notificação como processada:', markError);
    }
    
    // Retornar resposta de sucesso para o Pagar.me
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    console.error('Erro no processamento do webhook:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Erro interno no servidor',
        message: error.message
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
}; 