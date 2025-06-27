# Solução para o Problema de Estoque na Tabela Products

## Problema

Na administração de produtos, ao tentar atualizar a quantidade de estoque de um produto, ocorre o seguinte erro:

```
Erro ao atualizar produto: {code: 'PGRST204', details: null, hint: null, message: "Could not find the 'stock' column of 'products' in the schema cache"}
```

Este erro ocorre porque a coluna `stock` está definida no código TypeScript que gerencia os produtos, mas essa coluna não existe no banco de dados Supabase.

## Solução

Existem duas maneiras de resolver este problema:

### Método 1: Executar script de migração via Node.js

Criamos dois arquivos para adicionar a coluna stock:

- `api/add-stock-column.sql`: script SQL para adicionar a coluna
- `api/run-stock-migration.js`: script JavaScript para executar a migração

#### Passos:

1. Abra o arquivo `api/run-stock-migration.js` e substitua `INSIRA_SUA_CHAVE_SUPABASE_AQUI` pela sua chave de serviço do Supabase (deve ser uma chave de acesso administrativo).

2. Execute o script de migração usando o comando:

   ```bash
   npm run add-stock-column
   ```

   ou

   ```bash
   node -r dotenv/config api/run-stock-migration.js
   ```

3. Verifique no console se a migração foi concluída com sucesso.

### Método 2: Executar SQL diretamente no painel do Supabase (RECOMENDADO)

Este método é mais simples e não requer configuração de chaves:

1. Acesse o painel de administração do Supabase (https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para a seção "SQL Editor" 
4. Clique em "New query"
5. Copie e cole o conteúdo do arquivo `api/add-stock-direct-sql.sql`
6. Clique em "Run" para executar a consulta
7. Verifique se a consulta foi executada com sucesso e se a coluna foi adicionada

## Verificação

Para verificar se a coluna foi adicionada corretamente, você pode:

1. Acessar o painel do Supabase
2. Ir para a seção "Table Editor"
3. Verificar a tabela "products"
4. Confirmar que a coluna "stock" está presente

Alternativamente, execute a seguinte consulta no SQL Editor do Supabase:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'stock';
```

## Explicação Técnica

O problema ocorre porque o código do frontend está tentando atualizar uma coluna que não existe na tabela do banco de dados. O erro `Could not find the 'stock' column of 'products' in the schema cache` indica que o Supabase não encontrou esta coluna.

Nossa solução adiciona a coluna `stock` como um número inteiro não nulo com valor padrão zero, o que permitirá o gerenciamento correto do estoque dos produtos.

## Atualização de Produtos Existentes

Depois de adicionar a coluna, você pode querer definir valores iniciais de estoque para produtos existentes. Você pode fazer isso através do painel administrativo ou executando este SQL:

```sql
-- Definir estoque inicial de 10 para todos os produtos
UPDATE products SET stock = 10 WHERE stock = 0;

-- OU definir estoque específico para um produto
UPDATE products SET stock = 25 WHERE id = 'ID_DO_PRODUTO';
```

---

Se o problema persistir após seguir estes passos, verifique se:

1. A chave do Supabase tem permissões adequadas (se usando o Método 1)
2. A coluna já não existe com outro nome (como "inventory" ou "quantity")
3. Não há erros no console durante a execução da migração 