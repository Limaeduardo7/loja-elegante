import { MercadoPagoConfig, CardToken, Payment } from 'mercadopago';

// Configuração do SDK do Mercado Pago
// Na produção, esses valores devem vir de variáveis de ambiente
const MERCADO_PAGO_PUBLIC_KEY = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY || ''; 
const MERCADO_PAGO_ACCESS_TOKEN = import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN || '';

// Configurar as credenciais utilizando a versão mais recente da API
const mercadopago = new MercadoPagoConfig({ 
  accessToken: MERCADO_PAGO_ACCESS_TOKEN
});

export const mercadoPagoPublicKey = MERCADO_PAGO_PUBLIC_KEY;

export default mercadopago; 