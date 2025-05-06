-- Função para lidar com a inserção/atualização de usuários
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Verifica se o usuário já existe na tabela public.users
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    -- Insere o usuário na tabela public.users
    INSERT INTO public.users (
      id,
      email,
      name,
      password,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      '******', -- Senha fictícia, já que a real está no auth
      NEW.created_at,
      NEW.updated_at
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para novos usuários criados
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();

-- Trigger para usuários confirmados
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_auth_user_created();

-- Garante que todos os usuários existentes sejam sincronizados
DO $$
BEGIN
  INSERT INTO public.users (id, email, name, password, created_at, updated_at)
  SELECT 
    au.id, 
    au.email, 
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as name,
    '******' as password,
    au.created_at,
    au.updated_at
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
  );
END
$$; 