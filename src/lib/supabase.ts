import { createClient, User } from '@supabase/supabase-js';

/*
 * Configuração do Supabase
 *
 * Em um ambiente de produção, estas chaves devem ser obtidas de variáveis de ambiente.
 * Para configurar no Supabase:
 * 1. Crie uma conta em https://supabase.com
 * 2. Crie um novo projeto
 * 3. Vá para Settings > API e copie a URL e a anon key
 * 4. No arquivo .env.local, defina:
 *    VITE_SUPABASE_URL=sua_url
 *    VITE_SUPABASE_ANON_KEY=sua_chave_anônima
 * 
 * IMPORTANTE: Para testar localmente, você pode substituir os valores abaixo
 * pelas suas credenciais do Supabase, mas NUNCA envie estas chaves para o repositório.
 */

// Idealmente, essas variáveis devem vir de um arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://plrojewhtzgsmehkxlxu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBscm9qZXdodHpnc21laGt4bHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDgxNjQ1MzEsImV4cCI6MTk2Mzc0MDUzMX0.CJHYoHnkK1hYP4zMddBHcCCCtRH-1_8AdQnF8_XHCBU';

// Verifica se as credenciais foram definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Atenção: As variáveis de ambiente do Supabase não foram encontradas.');
  console.error('Para desenvolvimento, valores padrão temporários estão sendo usados.');
  console.error('Para produção, crie um arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
} else {
  console.log('Usando credenciais do Supabase configuradas em variáveis de ambiente.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções de autenticação
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://uselamone.com.br/conta',
        data: {
          confirmed_at: new Date().toISOString(), // Auto-confirma o email
        }
      }
    });

    if (error) {
      console.error('Erro ao registrar usuário:', error);
      return { data, error };
    }
    
    // Inserir diretamente na tabela users
    if (data?.user) {
      console.log('Inserindo usuário diretamente na tabela users...');
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email || email,
          password: '******',
          first_name: email.split('@')[0], // Nome padrão do email
          last_name: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email_confirmed: true // Já marca como confirmado
        });
      
      if (insertError) {
        console.error('Erro ao inserir usuário na tabela users:', insertError);
      } else {
        console.log('Usuário inserido com sucesso na tabela users');
      }
    }

    return { data, error };
  } catch (e) {
    console.error('Erro inesperado ao registrar usuário:', e);
    return { data: null, error: e };
  }
};

// Função para forçar inserção de um usuário existente na tabela users
export const forceCreateUserRecord = async (user: User) => {
  if (!user || !user.id || !user.email) return { success: false, error: 'Dados de usuário inválidos' };
  
  try {
    // Verifica se o usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();
      
    if (existingUser) {
      console.log('Usuário já existe na tabela users');
      return { success: true };
    }
    
    // Insere o usuário na tabela users
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        password: '******',
        first_name: user.email.split('@')[0],
        last_name: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed: user.email_confirmed_at !== null
      });
      
    if (insertError) {
      console.error('Erro ao inserir usuário na tabela users:', insertError);
      return { success: false, error: insertError };
    }
    
    console.log('Usuário inserido com sucesso na tabela users');
    return { success: true };
  } catch (error) {
    console.error('Erro ao forçar criação de usuário:', error);
    return { success: false, error };
  }
};

// Função para criar registro de usuário na tabela 'users'
export const createUserRecord = async (userId: string, email: string, name: string = '') => {
  try {
    console.log(`Tentando criar/verificar usuário na tabela users: ID=${userId}, Email=${email}`);
    
    // Verifica se o usuário já existe na tabela users
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (selectError) {
      console.error('Erro ao verificar usuário existente:', selectError);
      // Se o erro for NotFound, prosseguir com a criação
      if (selectError.code !== 'PGRST116') {
        return { success: false, error: selectError };
      }
    }

    if (existingUser) {
      console.log('Usuário já existe na tabela users, pulando criação');
      return { success: true };
    }

    // Vamos primeiro testar a conexão com a tabela users
    const { data: usersTest, error: usersTestError } = await supabase
      .from('users')
      .select('count(*)');
      
    if (usersTestError) {
      console.error('Erro ao acessar tabela users:', usersTestError);
      return { success: false, error: usersTestError };
    } else {
      console.log('Tabela users acessível. Prosseguindo com inserção.');
    }

    // Insere o usuário na tabela users
    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        name: name || email.split('@')[0], // Usa a parte antes do @ como nome provisório
        password: '**********' // Senha fictícia, já que a real está no auth
      });

    if (error) {
      console.error('Erro ao criar registro de usuário:', error);
      
      // Detalhar o erro para debug
      console.error('Detalhe do erro:', JSON.stringify({
        código: error.code,
        mensagem: error.message,
        detalhes: error.details,
        tabela: 'users',
        dados: {
          id: userId,
          email,
          name: name || email.split('@')[0]
        }
      }));
      
      return { success: false, error };
    }

    console.log('Usuário criado com sucesso na tabela users');
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar registro de usuário:', error);
    return { success: false, error };
  }
};

// Função para depuração da tabela users
export const debugUsersTable = async () => {
  try {
    console.log('Iniciando diagnóstico da tabela users...');
    
    // Verificar se a tabela existe
    const { data: tableList, error: tableError } = await supabase
      .rpc('exec', {
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND table_name = 'users';
        `
      });
      
    if (tableError) {
      console.error('Erro ao verificar existência da tabela:', tableError);
      return { error: tableError };
    }
    
    console.log('Resultado verificação tabela:', tableList);
    
    // Verificar estrutura da tabela
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec', {
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' 
            AND table_name = 'users';
        `
      });
      
    if (columnsError) {
      console.error('Erro ao verificar colunas da tabela:', columnsError);
      return { error: columnsError };
    }
    
    console.log('Estrutura da tabela users:', columns);
    
    // Verificar contagem
    const { data: count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Erro ao contar registros:', countError);
      return { error: countError };
    }
    
    console.log(`Número de registros na tabela users: ${count}`);
    
    return { success: true };
  } catch (error) {
    console.error('Erro geral ao diagnosticar tabela users:', error);
    return { error };
  }
};

// Adicionar função para verificar e criar usuário se necessário após login
export const checkAndCreateUserAfterLogin = async (user: User) => {
  if (!user || !user.id || !user.email) return;
  
  try {
    await createUserRecord(user.id, user.email);
  } catch (error) {
    console.error('Erro ao verificar/criar usuário após login:', error);
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data?.user) {
      // Verifica e cria o usuário na tabela 'users' se necessário
      await checkAndCreateUserAfterLogin(data.user);
    }

    return { data, error };
  } catch (e) {
    console.error('Erro ao fazer login:', e);
    return { data: null, error: e };
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/atualizar-senha`,
  });
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
};

// Verifica se um usuário é administrador
export const isUserAdmin = async (email: string) => {
  if (!email) return { data: false, error: 'Email não fornecido' };
  
  try {
    // Lista de emails de administradores para desenvolvimento
    const adminEmails = ['admin@example.com', 'seu@email.com', 'tatiane.assessoria@gmail.com', 'nasklima@gmail.com', 'grupomeraki7@gmail.com'];
    
    // Verificar se o email está na lista de admins
    if (adminEmails.includes(email)) {
      console.log('Usuário é admin pela lista de emails permitidos:', email);
      return { data: true, error: null };
    }
    
    // Primeiro verifica na tabela auth.users se o usuário tem is_admin: true no metadata
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Erro ao obter dados do usuário:', userError);
      return { data: false, error: userError };
    }
    
    // Verificar no metadata do usuário
    const metadata = userData?.user?.user_metadata;
    if (metadata && metadata.is_admin === true) {
      return { data: true, error: null };
    }
    
    if (!userData?.user?.id) {
      return { data: false, error: 'Usuário não encontrado' };
    }

    try {
      // Verificar usando a função RPC verificar_admin
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('verificar_admin', { user_uuid: userData.user.id });
        
      if (adminError) {
        console.error('Erro ao verificar função admin:', adminError);
        // Se a função RPC falhar, tentaremos verificar diretamente na tabela user_roles
        console.log('Tentando verificar admin através da tabela user_roles...');
        
        // Obter ID do papel de admin
        const { data: adminRoleData, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'admin')
          .single();
          
        if (roleError) {
          console.error('Erro ao obter role_id:', roleError);
          return { data: false, error: roleError };
        }
        
        // Verificar se o usuário tem o papel de admin
        const { data: userRoleData, error: userRoleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('role_id', adminRoleData.id)
          .maybeSingle();
          
        if (userRoleError) {
          console.error('Erro ao verificar user_roles:', userRoleError);
          return { data: false, error: userRoleError };
        }
        
        return { data: !!userRoleData, error: null };
      }
      
      return { data: !!isAdmin, error: null };
    } catch (rpcError) {
      console.error('Erro na execução da verificação de admin:', rpcError);
      return { data: false, error: rpcError };
    }
  } catch (error) {
    console.error('Erro geral ao verificar status de administrador:', error);
    return { data: false, error };
  }
};

// Função para forçar a definição de um usuário como admin
export const setUserAsAdmin = async (email: string) => {
  if (!email) return { success: false, error: 'Email não fornecido' };
  
  try {
    console.log(`Tentando definir usuário ${email} como admin via metadados`);
    
    // Primeiro verificar se o usuário existe
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Erro ao obter dados do usuário:', userError);
      return { success: false, error: userError };
    }
    
    if (!userData?.user?.id) {
      console.error('Usuário não encontrado para definir como admin');
      return { success: false, error: 'Usuário não encontrado' };
    }
    
    // Atualizar metadados para incluir is_admin: true
    const { data, error } = await supabase.auth.updateUser({
      data: { is_admin: true }
    });
    
    if (error) {
      console.error('Erro ao definir usuário como admin:', error);
      return { success: false, error };
    }
    
    console.log('Usuário definido como admin com sucesso via metadados');
    
    // Adicionar também à tabela user_roles
    try {
      // Verificar se existe a tabela roles e o papel admin
      const { data: adminRoleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'admin')
        .maybeSingle();
      
      if (!roleError && adminRoleData?.id) {
        // Inserir na tabela user_roles
        await supabase
          .from('user_roles')
          .upsert({
            user_id: userData.user.id,
            role_id: adminRoleData.id
          }, { onConflict: 'user_id,role_id' });
          
        console.log('Usuário adicionado à tabela user_roles como admin');
      } else {
        console.log('Tabela roles não encontrada ou papel admin não existe');
      }
    } catch (roleError) {
      console.error('Erro ao adicionar papel admin na tabela user_roles:', roleError);
      // Continuamos mesmo com erro ao adicionar à tabela user_roles
    }
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Erro geral ao definir usuário como admin:', error);
    return { success: false, error };
  }
};

// Função para criar as tabelas necessárias
export const initializeDatabase = async () => {
  try {
    console.log('Inicializando banco de dados...');

    // Criar tabela de usuários
    await supabase.rpc('create_users_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          phone TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    // Criar tabela de endereços
    await supabase.rpc('create_addresses_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS addresses (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          street TEXT NOT NULL,
          number TEXT NOT NULL,
          complement TEXT,
          district TEXT NOT NULL,
          city TEXT NOT NULL,
          state TEXT NOT NULL,
          zip_code TEXT NOT NULL,
          user_id UUID REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    // Criar tabela de categorias
    await supabase.rpc('create_categories_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS categories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          image TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    // Criar tabela de produtos
    await supabase.rpc('create_products_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          images TEXT[],
          category_id UUID REFERENCES categories(id),
          features TEXT[],
          material TEXT NOT NULL,
          sizes TEXT[],
          colors TEXT[],
          discount FLOAT,
          is_new BOOLEAN DEFAULT false,
          tags TEXT[],
          stock INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    // Criar tabela de carrinhos
    await supabase.rpc('create_carts_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS carts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID UNIQUE REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    // Criar tabela de itens do carrinho
    await supabase.rpc('create_cart_items_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS cart_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          cart_id UUID REFERENCES carts(id),
          product_id UUID REFERENCES products(id),
          quantity INTEGER NOT NULL,
          size TEXT NOT NULL,
          color TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    // Criar enum para status do pedido
    await supabase.rpc('create_order_status_enum', {
      sql: `
        DO $$ BEGIN
          CREATE TYPE order_status AS ENUM (
            'PENDING',
            'PAID',
            'PROCESSING',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED'
          );
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    });

    // Criar tabela de pedidos
    await supabase.rpc('create_orders_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id),
          status order_status DEFAULT 'PENDING',
          total DECIMAL(10,2) NOT NULL,
          payment_method TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    // Criar tabela de itens do pedido
    await supabase.rpc('create_order_items_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS order_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          order_id UUID REFERENCES orders(id),
          product_id UUID REFERENCES products(id),
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          size TEXT NOT NULL,
          color TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    // Criar tabela de admins se não existir - com permissões adequadas
    await supabase.rpc('exec', {
      query: `
        -- Criar tabela de roles se não existir
        CREATE TABLE IF NOT EXISTS public.roles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar tabela de user_roles se não existir
        CREATE TABLE IF NOT EXISTS public.user_roles (
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (user_id, role_id)
        );
        
        -- Inserir role de admin se não existir
        INSERT INTO public.roles (name, description)
        VALUES ('admin', 'Administrador do sistema')
        ON CONFLICT (name) DO NOTHING;
      `
    });

    // Adicionar administrador inicial se a tabela estiver vazia
    // Primeiro, obter o ID do papel de administrador
    const { data: adminRoleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();

    if (roleError) {
      console.error('Erro ao buscar role_id de administrador:', roleError);
    } else {
      // Agora, verificar se já existe algum administrador
      const { count, error: countError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', adminRoleData.id);

      if (countError) {
        console.error('Erro ao verificar administradores existentes:', countError);
      } else if (count === 0) {
        // Obtenha o email do administrador de variável de ambiente ou use um padrão
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'nasklima@gmail.com';
        
        // Verificar se o usuário existe
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Erro ao buscar usuário para admin:', userError);
        } else if (userData?.user?.email === adminEmail) {
          // Inserir como admin
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: userData.user.id,
              role_id: adminRoleData.id
            });
            
          if (insertError) {
            console.error('Erro ao inserir admin inicial:', insertError);
          } else {
            console.log(`Administrador inicial (${adminEmail}) configurado com sucesso`);
            
            // Não é possível atualizar metadata pelo cliente, será feito manualmente
            console.log('Lembre-se de atualizar os metadados do usuário no painel do Supabase');
          }
        } else {
          console.warn(`Usuário atual (${userData?.user?.email}) não corresponde ao admin ${adminEmail}`);
        }
      }
    }

    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
};

// Função para inicializar a tabela de endereços
export const initializeEnderecosTable = async () => {
  try {
    console.log('Verificando tabela de endereços...');
    
    // Tenta fazer uma consulta para testar se a tabela exists usando 'addresses' em vez de 'enderecos'
    const { error } = await supabase
      .from('addresses')
      .select('*', { count: 'exact', head: true });
    
    // Se não houver erro, a tabela existe
    if (!error) {
      console.log('Tabela de endereços (addresses) já existe.');
      return { success: true };
    }
    
    // Se erro for 404, a tabela não existe
    if (error && (error.code === '404' || error.message?.includes('relation "addresses" does not exist'))) {
      console.log('Tabela addresses não encontrada. Você precisa criá-la através do Supabase Dashboard.');
      console.error('Para criar a tabela, acesse o painel do Supabase, vá em SQL Editor e execute o script:');
      console.error(`
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  street VARCHAR(255) NOT NULL,
  number VARCHAR(30) NOT NULL,
  complement VARCHAR(255),
  district VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adiciona índice para melhorar performance de consultas por user_id
CREATE INDEX idx_addresses_user ON public.addresses(user_id);

-- Adiciona políticas de segurança RLS (Row Level Security)
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Política para permitir usuários verem apenas seus próprios endereços
CREATE POLICY "Users can view own addresses" 
ON public.addresses FOR SELECT 
USING (auth.uid() = user_id);

-- Política para permitir usuários inserirem seus próprios endereços
CREATE POLICY "Users can insert own addresses" 
ON public.addresses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para permitir usuários atualizarem seus próprios endereços
CREATE POLICY "Users can update own addresses" 
ON public.addresses FOR UPDATE 
USING (auth.uid() = user_id);

-- Política para permitir usuários excluírem seus próprios endereços
CREATE POLICY "Users can delete own addresses" 
ON public.addresses FOR DELETE 
USING (auth.uid() = user_id);
      `);
      
      return { success: false, error: new Error('Tabela addresses não existe e não pode ser criada automaticamente') };
    }
    
    console.error('Erro ao verificar tabela addresses:', error);
    return { success: false, error };
  } catch (error) {
    console.error('Erro ao inicializar tabela de endereços:', error);
    return { success: false, error };
  }
};

// Função para inicializar o Storage do Supabase
export const initializeSupabaseStorage = async () => {
  try {
    console.log('Inicializando Storage do Supabase...');
    
    // Lista de buckets necessários para a aplicação
    const requiredBuckets = [
      { name: 'products', isPublic: true },
      { name: 'store-images', isPublic: true },
      { name: 'categories', isPublic: true }
    ];
    
    // Verificar buckets existentes
    const { data: existingBuckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Erro ao listar buckets do Supabase:', bucketsError);
      return { success: false, error: bucketsError };
    }
    
    console.log('Buckets existentes:', existingBuckets);
    
    // Criar buckets que não existem
    for (const bucket of requiredBuckets) {
      const bucketExists = existingBuckets?.some(b => b.name === bucket.name);
      
      if (!bucketExists) {
        console.log(`Criando bucket "${bucket.name}"...`);
        
        try {
          const { data, error } = await supabase.storage.createBucket(bucket.name, {
            public: bucket.isPublic
          });
          
          if (error) {
            console.error(`Erro ao criar bucket "${bucket.name}":`, error);
            
            // Se o erro for de permissão, mostrar mensagem detalhada
            if (error.message?.includes('permission') || error.message?.includes('policy') || (error as any).statusCode === 403) {
              console.error(`
                Erro de permissão ao criar bucket. Isso geralmente indica que:
                1. Sua chave de API não tem permissões suficientes
                2. A política de segurança (RLS) está impedindo a criação
                3. É necessário configurar as políticas no painel do Supabase
                
                Siga estes passos no painel do Supabase:
                1. Acesse https://app.supabase.com
                2. Selecione seu projeto
                3. Navegue até Storage > Policies
                4. Adicione uma política que permita INSERT, UPDATE e DELETE para storage.buckets
                5. Adicione políticas para cada bucket que permita operações com arquivos
              `);
            }
          } else {
            console.log(`Bucket "${bucket.name}" criado com sucesso!`);
          }
        } catch (e) {
          console.error(`Exceção ao criar bucket "${bucket.name}":`, e);
        }
      } else {
        console.log(`Bucket "${bucket.name}" já existe.`);
        
        // Verificar permissões do bucket
        try {
          const { data: publicUrl } = supabase.storage.from(bucket.name).getPublicUrl('test.txt');
          console.log(`URL pública para ${bucket.name}:`, publicUrl);
        } catch (e) {
          console.error(`Erro ao verificar URL pública para ${bucket.name}:`, e);
        }
      }
    }
    
    console.log('Inicialização do Storage concluída!');
    return { success: true };
  } catch (error) {
    console.error('Erro ao inicializar Storage:', error);
    return { success: false, error };
  }
};

// Função para fazer upload de uma imagem com tratamento de erro detalhado
export const uploadImageToStorage = async (
  file: File | string, 
  bucketName: string, 
  folder: string,
  fileName?: string
): Promise<{ url: string | null; error: any }> => {
  try {
    // Inicializar storage
    const storageInit = await initializeSupabaseStorage();
    if (!storageInit.success) {
      console.error('Erro ao inicializar storage');
    }
    
    let fileToUpload: File;
    
    // Se for uma string base64
    if (typeof file === 'string' && file.startsWith('data:')) {
      // Converter base64 para File
      const res = await fetch(file);
      const blob = await res.blob();
      const type = blob.type;
      const extension = type.split('/')[1] || 'png';
      fileToUpload = new File([blob], fileName || `image-${Date.now()}.${extension}`, { type });
    } else if (file instanceof File) {
      fileToUpload = file;
    } else {
      return { url: null, error: 'Formato de arquivo inválido' };
    }
    
    const finalFileName = fileName || `${Date.now()}-${fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const filePath = folder ? `${folder}/${finalFileName}` : finalFileName;
    
    console.log(`Iniciando upload para ${bucketName}/${filePath}...`);
    
    // Verificar se o bucket existe
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} não existe. Tentando criar...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, { public: true });
      
      if (createError) {
        console.error(`Erro ao criar bucket ${bucketName}:`, createError);
        return { 
          url: null, 
          error: {
            message: `Não foi possível criar o bucket ${bucketName}. Verifique as permissões no painel do Supabase.`,
            details: createError
          }
        };
      }
    }
    
    // Tentar fazer o upload
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: true,
        contentType: fileToUpload.type
      });
    
    if (error) {
      console.error('Erro no upload:', error);
      
      return { 
        url: null, 
        error: {
          message: 'Falha ao fazer upload da imagem',
          details: error
        }
      };
    }
    
    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    if (!urlData?.publicUrl) {
      return { 
        url: null, 
        error: {
          message: 'Não foi possível obter a URL pública da imagem',
          details: 'URL não retornada'
        }
      };
    }
    
    console.log('Upload concluído com sucesso! URL:', urlData.publicUrl);
    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Exceção no upload:', error);
    return { 
      url: null, 
      error: {
        message: 'Erro inesperado durante o upload',
        details: error
      }
    };
  }
}; 