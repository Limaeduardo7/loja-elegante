# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# Loja Elegante

Uma loja virtual elegante para vendas de roupas e acessórios.

## Configuração de Desenvolvimento

Para desenvolver localmente:

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Inicie o servidor de desenvolvimento: `npm run dev`
4. Para testar as funções serverless: `npm run dev:netlify`

## Deploy na Netlify

Para fazer o deploy na Netlify:

1. Conecte o repositório ao Netlify
2. Configure as variáveis de ambiente no painel da Netlify:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_PAGARME_PUBLIC_KEY
   - VITE_PAGARME_SECRET_KEY

## Funções Serverless

A aplicação utiliza funções serverless para resolver problemas de CORS com a API do Pagar.me. Arquivos importantes:

- `api/proxy.js`: Função proxy para a API do Pagar.me
- `api/status.js`: Função para verificar se o deploy das funções está funcionando

### Troubleshooting

Se você encontrar erros como:
```
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

Isso indica que a função serverless não está sendo encontrada e o navegador está recebendo HTML em vez de JSON. Soluções:

1. **Verifique o caminho da função**: Certifique-se de que o URL no `pagarmeApiService.ts` aponte para `/.netlify/functions/proxy`
2. **Teste a função diretamente**: Acesse `https://seu-site.netlify.app/.netlify/functions/status` no navegador
3. **Verifique os logs da Netlify**: Veja se há erros de deploy ou função no painel
4. **Limpe o cache da build**: Vá para Site Settings > Build & Deploy > Clear cache and deploy site

Se nada funcionar, tente um deploy manual:
1. Execute `npm run build` localmente
2. Faça upload da pasta `dist` manualmente pelo painel da Netlify
3. Configure as variáveis de ambiente

## Configuração de Administrador

Para configurar um usuário como administrador, você tem duas opções:

### 1. Usando o SQL Editor do Supabase

Execute o seguinte SQL no Editor SQL do Supabase:

```sql
-- Inserir um usuário como administrador
INSERT INTO public.admins (user_id, email)
SELECT id, email FROM auth.users 
WHERE email = 'nasklima@gmail.com';

-- Atualizar os metadados do usuário (opcional, mas recomendado)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{is_admin}',
  'true'
)
WHERE email = 'nasklima@gmail.com';
```

### 2. Pelo Painel do Supabase

1. Acesse a seção "Authentication" > "Users"
2. Encontre o usuário que deseja tornar administrador
3. Clique nos três pontos (ações) e selecione "Edit User"
4. Na seção "Metadata", adicione: `{ "is_admin": true }`
5. Salve as alterações
6. Vá para a seção "Table Editor" > "admins"
7. Clique em "Insert Row" e preencha:
   - user_id: ID do usuário (da tabela auth.users)
   - email: email do usuário

## Primeiro Acesso como Administrador

Após configurar um usuário como administrador:

1. Faça logout se estiver logado
2. Faça login com as credenciais do administrador
3. Você será automaticamente redirecionado para o painel administrativo em `/admin`

## Outros recursos e configurações

[...]

## Recursos Implementados

### Upload de Imagens

A aplicação utiliza o Supabase Storage para armazenamento de imagens. Para garantir o funcionamento correto do upload de imagens, foi implementada uma solução robusta no arquivo `src/lib/supabase.ts`.

Principais funcionalidades:

- **Inicialização Automática**: Os buckets necessários (`products`, `store-images`, `categories`) são verificados e criados automaticamente na inicialização da aplicação
- **Função de Upload Centralizada**: `uploadImageToStorage` oferece uma interface unificada para upload de imagens
- **Suporte a Base64**: O sistema pode trabalhar com imagens tanto em formato File quanto em strings base64
- **Tratamento Gracioso de Falhas**: Em caso de erro no Supabase Storage, o sistema pode utilizar alternativas (ex: armazenar em base64)

Para detalhes sobre a configuração necessária no Supabase, consulte o arquivo `SOLUCAO_PROBLEMA_STORAGE.md`.
