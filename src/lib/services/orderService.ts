import { supabase } from '../supabase';

/**
 * Cria um novo pedido no banco de dados
 */
export async function createOrder(orderData: {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    cpf: string;
    phone: string;
  };
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
  items: any[];
  payment: {
    method: string;
    status: string;
  };
  total: number;
}): Promise<{ orderId: string | null; error: any }> {
  try {
    // Gerar número do pedido
    const orderNumber = `ORD-${Math.floor(Date.now() / 1000)}-${Math.floor(Math.random() * 1000)}`;
    
    // Inserir o pedido principal
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
        customer_email: orderData.customer.email,
        customer_cpf: orderData.customer.cpf,
        customer_phone: orderData.customer.phone,
        shipping_address: `${orderData.shipping.address.street}, ${orderData.shipping.address.number}, ${orderData.shipping.address.neighborhood}, ${orderData.shipping.address.city}, ${orderData.shipping.address.state} - ${orderData.shipping.address.zipcode}`,
        shipping_complement: orderData.shipping.address.complement,
        shipping_cost: orderData.shipping.cost,
        total_amount: orderData.total,
        payment_method: orderData.payment.method,
        payment_status: orderData.payment.status,
        status: 'aguardando_pagamento',
        customer_data: orderData.customer,
        shipping_data: orderData.shipping
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    // Se o pedido foi criado com sucesso, inserir os itens do pedido
    const orderId = data.id;
    
    // Inserir os itens do pedido
    const orderItems = orderData.items.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product.name,
      variant_id: item.color_size_id || null,
      quantity: item.quantity,
      unit_price: item.product.finalPrice,
      total_price: item.itemTotal,
      product_data: {
        id: item.product_id,
        name: item.product.name,
        price: item.product.finalPrice,
        image: item.product.mainImage,
        variant: item.variant ? {
          color: item.variant.color?.name || '',
          size: item.variant.size?.name || ''
        } : null
      }
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    return { orderId, error: null };
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return { orderId: null, error };
  }
} 