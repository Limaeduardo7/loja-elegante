// Exportação de todos os serviços para facilitar a importação em componentes

// Serviço de produtos
export * from './productService';

// Serviço de categorias
export * from './categoryService';

// Serviço de carrinho
import * as cartService from './cartService';

// Serviço de pagamento
import * as paymentService from './paymentService';

// Versão específica para pagamentos Pagar.me
export * as PagarMeService from './paymentService';

import * as orderService from './orderService';
import pagarmeApiService from './pagarmeApiService';

export {
  cartService,
  orderService,
  paymentService,
  pagarmeApiService
};

export * from './bannerService';
export * from './cartService';
export * from './categoryService';
export * from './melhorEnvio';
export * from './orderService';
export * from './pagarmeApiService';
export * from './paymentService';
export * from './productService';
export * from './promotionService'; 