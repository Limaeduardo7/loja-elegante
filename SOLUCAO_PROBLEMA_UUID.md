# Solução para o Problema de Incompatibilidade de Tipos UUID

Este documento explica como resolver o problema "invalid input syntax for type uuid" que ocorre ao gerenciar administradores no sistema.

## Problema Identificado

O problema ocorre porque:

1. A coluna `role_id` na tabela `user_roles` é do tipo `UUID`
2. Nas consultas, estamos tentando usar o valor numérico "1" (um inteiro) para consultar essa coluna
3. O PostgreSQL não pode converter automaticamente um inteiro para UUID, gerando o erro:
   ```
   invalid input syntax for type uuid: "1"
   ```

## Solução Implementada

Para resolver esse problema, implementamos:

1. **Função RPC para verificar se um usuário é admin**:
   - `verificar_admin(user_uuid UUID)`: Verifica se o usuário possui o papel de admin de forma segura

2. **Funções RPCs para promoção e remoção de administradores**:
   - `promover_para_admin(user_uuid UUID)`: Promove um usuário a administrador
   - `remover_admin(user_uuid UUID)`: Remove privilégios de administrador de um usuário

3. **Atualização da interface de administração**:
   - Modificamos as funções que gerenciam usuários para usar as RPCs acima
   - Removemos as consultas diretas à tabela `user_roles` que causavam o erro

## Como Aplicar esta Solução

1. Execute o arquivo SQL que define as funções RPCs:
   ```
   migrations/rpc_admin_functions.sql
   ```

2. Já implementamos as mudanças necessárias no código React para usar essas funções.

## Explicação Técnica

O problema era que o Supabase cliente JavaScript não estava convertendo corretamente os tipos entre JavaScript e PostgreSQL quando se trata de UUIDs. 

As funções RPC que criamos resolvem isso:

1. Aceitam explicitamente parâmetros do tipo UUID (garantindo conversão correta)
2. Lidam com as consultas internamente no PostgreSQL (onde os tipos são tratados corretamente)
3. São definidas como `SECURITY DEFINER` para garantir que funcionem com as permissões necessárias

Além disso, agora usamos a view `v_admin_users` quando possível para simplificar as consultas e evitar problemas de tipo. 