import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function webhooksHandler(req, res) {
  // Verificar método HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // Receber e validar payload do webhook
    const payload = req.body;

    // Verificar assinatura (em produção, você deve verificar a autenticidade do webhook)
    // Para o Pagar.me, isso geralmente envolve verificar o X-Hub-Signature no cabeçalho

    // Registrar notificação recebida
    const { error } = await supabase
      .from('pagarme_notifications')
      .insert({
        transaction_id: payload.id,
        current_status: payload.current_status,
        old_status: payload.old_status,
        raw_data: payload,
        processed: false
      });

    if (error) {
      throw new Error(`Erro ao registrar notificação: ${error.message}`);
    }

    // Encaminhar para processamento
    await fetch(`${process.env.API_URL}/pagarme/process-payment-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload }),
    });

    return res.status(200).json({ message: 'Webhook recebido com sucesso' });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return res.status(500).json({
      message: 'Erro ao processar webhook',
      error: error.message,
    });
  }
} 