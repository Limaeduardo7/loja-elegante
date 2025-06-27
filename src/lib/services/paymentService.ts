import { supabase } from '../supabase';
import pagarmeApiService from './pagarmeApiService';

// Obter a URL base do site
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
};

/**
 * Processa um pagamento com Pagar.me seguindo o fluxo oficial da documentação
 * https://docs.pagar.me/page/criação-de-pedidos
 */
export async function processPayment(
  orderData: {
    orderId: string;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
      cpf: string;
      phone: string;
    };
    card?: {
      number: string;
      holder_name: string;
      exp_month: number;
      exp_year: number;
      cvv: string;
    };
    payment_method: 'credit_card' | 'pix' | 'boleto';
    installments?: number;
    shipping: {
      address: {
        zipcode: string;
        street: string;
        number: string;
        complement: string;
        neighborhood: string;
        city: string;
        state: string;
      };
      cost: number;
    };
    items: Array<{
      product_id: string;
      product: {
        name: string;
        finalPrice: number;
      };
      quantity: number;
      itemTotal: number;
    }>;
  }
): Promise<{ success: boolean; orderId: string; paymentData?: any; error?: any }> {
  try {
    console.log('Iniciando processamento de pagamento com Pagar.me:', orderData);
    
    // 1. Criar o cliente
    const customerData = {
      name: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
      email: orderData.customer.email,
      type: 'individual' as const,
      document: orderData.customer.cpf.replace(/\D/g, ''),
      phones: {
        mobile_phone: {
          country_code: '55',
          area_code: orderData.customer.phone.substring(0, 2),
          number: orderData.customer.phone.substring(2).replace(/\D/g, '')
        }
      }
    };
    
    const customerId = await pagarmeApiService.createCustomer(customerData);
    console.log('Customer ID criado:', customerId);
    
    // Preparar o endereço em formato Pagar.me
    const shippingAddress = {
      line_1: `${orderData.shipping.address.street}, ${orderData.shipping.address.number}`,
      line_2: orderData.shipping.address.complement || orderData.shipping.address.neighborhood,
      zip_code: orderData.shipping.address.zipcode.replace(/\D/g, ''),
      city: orderData.shipping.address.city,
      state: orderData.shipping.address.state,
      country: 'BR'
    };
    
    // Formatar os itens para o padrão do Pagar.me
    const pagarmeItems = orderData.items.map((item, index) => ({
      amount: Math.round(item.product.finalPrice * 100), // Em centavos
      description: item.product.name,
      quantity: item.quantity,
      code: item.product_id.toString()
    }));
    
    let paymentResponse;
    
    // Com base no método de pagamento, escolher o fluxo apropriado
    if (orderData.payment_method === 'credit_card' && orderData.card) {
      try {
        // SOLUÇÃO ALTERNATIVA: Criar o pedido diretamente com os dados do cartão
        // Isso elimina a necessidade do endpoint de tokens que está retornando 401
        console.log('Usando fluxo alternativo para cartão de crédito (sem token)');
        
        paymentResponse = await pagarmeApiService.createOrderWithCard({
          customer_id: customerId,
          items: pagarmeItems,
          payments: [
            {
              payment_method: 'credit_card',
              credit_card: {
                // Em vez de token, enviar dados do cartão diretamente
                // Isso será processado pelo proxy serverless que já usa a chave secreta
                installments: orderData.installments || 1,
                statement_descriptor: 'LOJA ELEGANTE',
                card: {
                  number: orderData.card.number,
                  holder_name: orderData.card.holder_name,
                  exp_month: orderData.card.exp_month,
                  exp_year: orderData.card.exp_year,
                  cvv: orderData.card.cvv
                },
                billing_address: shippingAddress
              }
            }
          ],
          shipping: {
            amount: Math.round(orderData.shipping.cost * 100),
            description: 'Frete',
            address: shippingAddress
          }
        });
      } catch (cardError) {
        console.error('Erro no fluxo alternativo de cartão:', cardError);
        throw cardError;
      }
    } else if (orderData.payment_method === 'pix') {
      // Criar pedido com PIX
      paymentResponse = await pagarmeApiService.createOrderWithPix({
        customer_id: customerId,
        items: pagarmeItems,
        payments: [
          {
            payment_method: 'pix',
            pix: {
              expires_in: 86400 // 24 horas
            }
          }
        ],
        shipping: {
          amount: Math.round(orderData.shipping.cost * 100),
          description: 'Frete',
          address: shippingAddress
        }
      });
      
      // Logs específicos para depuração de PIX
      console.log('Resposta PIX do Pagar.me completa:', JSON.stringify(paymentResponse));
      console.log('Dados do QR Code PIX:', paymentResponse.charges?.[0]?.last_transaction?.qr_code);
      console.log('Estrutura de charges:', paymentResponse.charges?.map((c: any) => ({
        charge_id: c.id,
        status: c.status,
        has_qr_code: !!c.last_transaction?.qr_code,
        qr_code_props: c.last_transaction?.qr_code ? Object.keys(c.last_transaction.qr_code) : null
      })));
    } else if (orderData.payment_method === 'boleto') {
      // Criar pedido com Boleto
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3); // Vencimento em 3 dias
      
      paymentResponse = await pagarmeApiService.createOrderWithBoleto({
        customer_id: customerId,
        items: pagarmeItems,
        payments: [
          {
            payment_method: 'boleto',
            boleto: {
              due_at: dueDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
              instructions: 'Pagar até a data de vencimento'
            }
          }
        ],
        shipping: {
          amount: Math.round(orderData.shipping.cost * 100),
          description: 'Frete',
          address: shippingAddress
        }
      });
    } else {
      throw new Error(`Método de pagamento não suportado: ${orderData.payment_method}`);
    }
    
    console.log('Resposta do Pagar.me:', paymentResponse);
    
    // Registrar transação no banco de dados
    try {
      const { error: transactionError } = await supabase
        .from('pagarme_transactions')
        .insert({
          order_id: orderData.orderId,
          transaction_id: paymentResponse.id,
          external_reference: orderData.orderId,
          status: 'pending',
          transaction_amount: orderData.items.reduce((total, item) => 
            total + (item.product.finalPrice * item.quantity), 0) + orderData.shipping.cost,
          payment_data: paymentResponse
        });

      if (transactionError) {
        console.error('Erro ao registrar transação:', transactionError);
      }
    } catch (dbError) {
      console.error('Erro ao acessar tabela de transações:', dbError);
    }
    
    // Atualizar status do pedido no banco de dados
    try {
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          payment_id: paymentResponse.id,
          payment_method: orderData.payment_method,
          payment_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderData.orderId);

      if (orderError) {
        console.error('Erro ao atualizar status do pedido:', orderError);
      }
    } catch (orderError) {
      console.error('Erro ao atualizar pedido:', orderError);
    }
    
    return {
      success: true,
      orderId: orderData.orderId,
      paymentData: paymentResponse
    };
  } catch (error) {
    console.error('Erro no serviço de pagamento:', error);
    return {
      success: false,
      orderId: orderData.orderId,
      error: error
    };
  }
}

/**
 * Processa uma notificação de pagamento do Pagar.me webhook
 */
export async function processPaymentNotification(
  payload: any
): Promise<{ success: boolean; error: any }> {
  try {
    // Registrar a notificação
    try {
    const { error: notificationError } = await supabase
        .from('pagarme_notifications')
      .insert({
          transaction_id: payload.id,
          current_status: payload.data?.status || payload.type,
          old_status: payload.data?.old_status || null,
          raw_data: payload,
        processed: false
      });

      if (notificationError) {
        console.error('Erro ao registrar notificação:', notificationError);
      }
    } catch (notificationError) {
      console.error('Erro ao acessar tabela de notificações:', notificationError);
    }

    // Atualizar status da transação e do pedido
    if (payload.data && payload.data.status) {
      await updateTransactionStatus(
        payload.id,
        payload.data.status,
        payload
      );
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao processar notificação de pagamento:', error);
    return { success: false, error };
  }
}

/**
 * Atualiza o status de uma transação
 */
async function updateTransactionStatus(
  transactionId: string,
  status: string,
  transactionData?: any
): Promise<void> {
  try {
    // Buscar transação pelo transaction_id
    const { data: transaction, error } = await supabase
      .from('pagarme_transactions')
      .select('id, order_id')
      .eq('transaction_id', transactionId)
      .single();

    if (error) {
      console.error('Erro ao buscar transação:', error);
      return;
    }

    if (transaction) {
      // Atualizar transação
      const { error: updateError } = await supabase
        .from('pagarme_transactions')
        .update({
          status,
          payment_data: transactionData || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('Erro ao atualizar transação:', updateError);
      }

      // Atualizar status do pedido baseado no status do pagamento
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
          payment_id: transactionId,
          payment_date: status === 'paid' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.order_id);

      if (orderError) {
        console.error('Erro ao atualizar status do pedido:', orderError);
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar status da transação:', error);
  }
}

/**
 * Calcula o total de itens para o pagamento
 */
function calculateTotal(items: any[]): number {
  return items.reduce((total, item) => 
    total + (item.product.finalPrice * item.quantity), 0);
} 

export default {
  processPayment,
  processPaymentNotification
}; 