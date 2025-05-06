// Configuração do SDK do Pagar.me para o frontend
// Na produção, esses valores devem vir de variáveis de ambiente
const PAGARME_PUBLIC_KEY = import.meta.env.VITE_PAGARME_PUBLIC_KEY || 'pk_RdWl892Iz8Tk9Brn';
const PAGARME_ACCOUNT_ID = import.meta.env.VITE_PAGARME_ACCOUNT_ID || 'acc_DwJl0PnIzcgPZz2d';

// Exporta a chave pública para uso com o checkout.js
export const pagarmePublicKey = PAGARME_PUBLIC_KEY;
export const pagarmeAccountId = PAGARME_ACCOUNT_ID;

// Exporta os valores padrão
export default {
  pagarmePublicKey,
  pagarmeAccountId
}; 