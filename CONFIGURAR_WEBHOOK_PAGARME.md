# Configuração de Webhook do Pagar.me para a Loja Elegante

Este documento explica como configurar o webhook do Pagar.me para receber notificações de pagamentos em tempo real.

## O que são Webhooks?

Webhooks são chamadas HTTP que o Pagar.me faz para seu servidor sempre que ocorre uma mudança no status de uma transação, como pagamento aprovado, recusado, estornado, etc.

## Por que Webhooks são Necessários?

Para métodos de pagamento como PIX e Boleto, o cliente pode efetuar o pagamento horas ou dias depois da geração. Os webhooks permitem que a loja seja notificada automaticamente quando o pagamento é confirmado, sem precisar de verificação manual.

## Endereço do Webhook

O endpoint do webhook da Loja Elegante é:
```
https://seu-dominio.com.br/webhook/pagarme
```

> Substitua `seu-dominio.com.br` pelo domínio real onde a loja está hospedada.

## Passos para Configuração no Pagar.me

1. Acesse sua conta no [Dashboard do Pagar.me](https://dashboard.pagar.me/)
2. Vá para **Configurações > Webhooks**
3. Clique em **Adicionar Webhook**
4. Insira o endereço do webhook: `https://seu-dominio.com.br/webhook/pagarme`
5. Selecione os eventos que deseja receber notificações. Recomendamos:
   - `order.paid`
   - `order.payment_failed`
   - `charge.paid`
   - `charge.payment_failed`
   - `charge.refunded`
6. Defina os headers adicionais se necessário
7. Salve a configuração

## Validação e Segurança

O Pagar.me fornece uma assinatura em cada requisição de webhook para garantir a autenticidade. Para habilitar a verificação dessa assinatura, edite o arquivo `api/pagarme/webhook.js` e descomente o bloco de validação de assinatura.

Para adicionar a chave secreta do webhook, adicione a variável de ambiente:

```
PAGARME_WEBHOOK_SECRET=seu_segredo_aqui
```

## Testando o Webhook

Para testar se o webhook está configurado corretamente:

1. Realize uma compra de teste usando PIX ou Boleto
2. Efetue o pagamento
3. Verifique se o status do pedido é atualizado automaticamente no seu painel administrativo
4. Consulte os logs do Netlify para verificar se a requisição do webhook foi recebida e processada

## Verificando Notificações Recebidas

As notificações recebidas são registradas na tabela `pagarme_notifications` do banco de dados. Você pode consultar esta tabela para verificar se as notificações estão sendo recebidas corretamente.

## Solução de Problemas

Se os pedidos não estiverem sendo atualizados automaticamente, verifique:

1. Se o webhook está configurado corretamente no Pagar.me
2. Se a URL do webhook está acessível (não bloqueada por firewall)
3. Os logs do Netlify para identificar possíveis erros
4. A tabela `pagarme_notifications` para verificar se as notificações estão sendo recebidas
5. As tabelas `pagarme_transactions` e `orders` para confirmar que a atualização de status está funcionando

## Tipos de Status do Pagar.me

- `processing`: Pagamento em processamento
- `authorized`: Pagamento autorizado, mas ainda não capturado
- `paid`: Pagamento aprovado e finalizado
- `refunded`: Pagamento estornado
- `waiting_payment`: Aguardando pagamento (PIX/Boleto)
- `pending_refund`: Estorno em processamento
- `refused`: Pagamento recusado
- `chargedback`: Pagamento com chargeback
- `analyzing`: Em análise de risco/fraude
- `pending_review`: Em revisão manual

## Ambientes Disponíveis

- **Sandbox (Teste)**: `https://api.pagar.me/core/v5/webhooks`
- **Produção**: `https://api.pagar.me/core/v5/webhooks`

Certifique-se de configurar o webhook no mesmo ambiente que está utilizando para processar os pagamentos. 