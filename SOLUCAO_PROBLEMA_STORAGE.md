# Solução para Problemas de Permissão no Storage do Supabase

## Problema Encontrado
Ao tentar finalizar uma compra, ocorrem erros de violação das políticas RLS (Row-Level Security) do Supabase, impedindo:
- Criação de buckets (`products`, `store-images`, `categories`)
- Criação de pedidos na tabela `orders`

## Passo 1: Configurar Políticas para Buckets de Armazenamento

1. Acesse o painel do Supabase: https://app.supabase.com
2. Selecione seu projeto
3. Navegue até **Storage > Policies**
4. Adicione uma política para a tabela `storage.buckets`:

```sql
-- Permitir operações em buckets para usuários autenticados
CREATE POLICY "Permitir gerenciamento de buckets para usuários autenticados" 
ON storage.buckets
FOR ALL 
TO authenticated 
USING (true);

-- Se precisar permitir também para usuários não autenticados:
CREATE POLICY "Permitir acesso público para leitura de buckets" 
ON storage.buckets
FOR SELECT 
TO anon 
USING (true);
```

## Passo 2: Configurar Políticas para Objetos de Armazenamento

Para cada bucket, adicione políticas que permitam operações com arquivos:

```sql
-- Políticas para o bucket "products"
CREATE POLICY "Permitir acesso de leitura aos produtos" 
ON storage.objects 
FOR SELECT 
TO anon 
USING (bucket_id = 'products');

CREATE POLICY "Permitir gerenciamento de produtos para usuários autenticados" 
ON storage.objects
FOR ALL 
TO authenticated 
USING (bucket_id = 'products');

-- Repita para os outros buckets: "store-images" e "categories"
```

## Passo 3: Configurar Políticas para a Tabela de Pedidos

Navegue até **SQL Editor** no painel do Supabase e execute:

```sql
-- Permitir que usuários não autenticados criem pedidos (necessário para checkout)
CREATE POLICY "Permitir criação de pedidos" 
ON public.orders
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Permitir que usuários autenticados gerenciem pedidos
CREATE POLICY "Permitir gerenciamento de pedidos para usuários autenticados" 
ON public.orders
FOR ALL 
TO authenticated 
USING (true);
```

## Após aplicar essas mudanças:

1. Limpe o cache do navegador
2. Recarregue a página
3. Tente finalizar a compra novamente

Se o problema persistir, verifique os logs no console do navegador para identificar se há outros erros específicos. 