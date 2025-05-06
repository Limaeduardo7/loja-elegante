import pagarme from 'pagarme';
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Inicializar cliente Pagar.me
const pagarmeClient = pagarme.client.connect({
  api_key: process.env.PAGARME_API_KEY
});

export default async function processPaymentNotificationHandler(req, res) {
  // Verificar método HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { payload } = req.body;
    
    if (!payload || !payload.id) {
      return res.status(400).json({ message: 'Payload inválido' });
    }

    // Obter detalhes da transação do Pagar.me para confirmar
    const pagarme = await pagarmeClient;
    const transaction = await pagarme.transactions.find({ id: payload.id });

    // Verificar se a transação existe
    if (!transaction) {
      throw new Error(`Transação ${payload.id} não encontrada`);
    }

    // Mapear status do Pagar.me para o formato interno
    const status = transaction.status;
    const referenceKey = transaction.reference_key; // Referência ao ID do pedido

    // Atualizar status da transação no banco de dados
    const { error: transactionError } = await supabase
      .from('pagarme_transactions')
      .update({
        status: status,
        payment_data: transaction,
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', payload.id);

    if (transactionError) {
      throw new Error(`Erro ao atualizar transação: ${transactionError.message}`);
    }

    // Atualizar status do pedido
    let orderStatus = 'aguardando_pagamento';
    
    if (status === 'paid') {
      orderStatus = 'pagamento_aprovado';
    } else if (status === 'refused' || status === 'refunded' || status === 'chargedback') {
      orderStatus = 'cancelado';
    }

    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        payment_status: status,
        payment_id: payload.id,
        payment_date: status === 'paid' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', referenceKey);

    if (orderError) {
      throw new Error(`Erro ao atualizar pedido: ${orderError.message}`);
    }

    // Marcar notificação como processada
    await supabase
      .from('pagarme_notifications')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('transaction_id', payload.id)
      .eq('processed', false);

    return res.status(200).json({
      message: 'Notificação processada com sucesso',
      transactionId: payload.id,
      status: status,
      referenceKey: referenceKey
    });
  } catch (error) {
    console.error('Erro ao processar notificação de pagamento:', error);
    return res.status(500).json({
      message: 'Erro ao processar notificação de pagamento',
      error: error.message
    });
  }
} 