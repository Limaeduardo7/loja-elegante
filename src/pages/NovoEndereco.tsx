import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface EnderecoForm {
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  zip_code: string;
  is_main: boolean;
}

// Número máximo de tentativas para verificar a tabela
const MAX_RETRIES = 3;

const NovoEndereco = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTableAvailable, setIsTableAvailable] = useState(true);
  const [currentRetry, setCurrentRetry] = useState(0);
  const [endereco, setEndereco] = useState<EnderecoForm>({
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
    zip_code: '',
    is_main: false
  });
  
  // Verificar se o usuário está autenticado e se a tabela existe ao carregar a página
  useEffect(() => {
    if (!user) {
      setErrorMessage('Usuário não autenticado. Redirecionando para login...');
      setTimeout(() => navigate('/conta'), 2000);
      return;
    }

    // Verificar se a tabela existe
    const checkTable = async () => {
      const tabelaExiste = await verificarTabelaEnderecos();
      setIsTableAvailable(tabelaExiste);
      
      if (!tabelaExiste) {
        // Tentar novamente se não atingimos o número máximo de tentativas
        if (currentRetry < MAX_RETRIES) {
          console.log(`Tentativa ${currentRetry + 1} de ${MAX_RETRIES} para verificar tabela`);
          setCurrentRetry(prev => prev + 1);
          // Tentar novamente após um delay crescente (exponential backoff)
          setTimeout(checkTable, 1000 * Math.pow(2, currentRetry));
          return;
        }
        
        setErrorMessage(
          isAdmin 
            ? 'A tabela "addresses" não existe no banco de dados. Como administrador, você precisa criá-la no Supabase.'
            : 'Sistema temporariamente indisponível. Entre em contato com o suporte.'
        );
      }
    };

    checkTable();
  }, [user, navigate, isAdmin, currentRetry]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setEndereco(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setEndereco(prev => ({
          ...prev,
          street: data.logradouro,
          district: data.bairro,
          city: data.localidade,
          state: data.uf
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  // Verificar se a tabela addresses existe
  const verificarTabelaEnderecos = async () => {
    try {
      console.log('Verificando existência da tabela de endereços...');
      
      // Tenta realizar uma consulta simples para verificar a tabela
      const { error } = await supabase
        .from('addresses')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        // Se o erro contém mensagem relacionada à relação não existente, é porque a tabela não existe
        if (error.code === '404' || error.message?.includes('relation "addresses" does not exist')) {
          console.error('A tabela de endereços não existe no banco de dados');
          return false;
        }
        console.error('Erro ao verificar tabela de endereços:', error);
        return false;
      }
      
      console.log('Tabela de endereços verificada com sucesso');
      // Retorna true se a consulta for bem-sucedida
      return true;
    } catch (error) {
      console.error('Falha ao verificar tabela de endereços:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setErrorMessage('Usuário não autenticado. Faça login e tente novamente.');
      setTimeout(() => navigate('/conta'), 2000);
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Verifica se a tabela existe antes de prosseguir
      const tabelaExiste = await verificarTabelaEnderecos();
      
      if (!tabelaExiste) {
        throw new Error('Sistema indisponível no momento. A tabela de endereços não está configurada corretamente no banco de dados.');
      }
      
      // Se o endereço for marcado como principal, atualiza todos os outros para não serem principais
      if (endereco.is_main) {
        const { error: updateError } = await supabase
          .from('addresses')
          .update({ is_main: false })
          .eq('user_id', user.id);
          
        if (updateError) {
          console.error('Erro ao atualizar endereços existentes:', updateError);
          // Não interrompe o fluxo, apenas loga o erro
        }
      }
      
      // Adiciona o novo endereço
      const { error } = await supabase
        .from('addresses')
        .insert([
          {
            user_id: user.id,
            street: endereco.street,
            number: endereco.number,
            complement: endereco.complement || '',
            district: endereco.district,
            city: endereco.city,
            state: endereco.state,
            zip_code: endereco.zip_code,
            is_main: endereco.is_main,
            created_at: new Date().toISOString()
          }
        ]);
      
      if (error) {
        console.error('Erro detalhado ao adicionar endereço:', JSON.stringify(error));
        
        if (error.code === '404' || error.message?.includes('relation "addresses" does not exist')) {
          throw new Error('A tabela de endereços não existe no banco de dados. Entre em contato com o suporte.');
        }
        
        throw new Error(`Erro ao adicionar endereço: ${error.message || 'Falha desconhecida'}`);
      }
      
      // Redireciona para a página de perfil
      navigate('/perfil');
    } catch (error: any) {
      console.error('Erro ao adicionar endereço:', error);
      setErrorMessage(error.message || 'Erro ao adicionar endereço. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-6">Adicionar Novo Endereço</h1>
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}

        {!isTableAvailable && isAdmin && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-md">
            <h3 className="font-bold mb-2">Instruções para criar a tabela:</h3>
            <p className="mb-2">Execute o seguinte SQL no Editor SQL do seu projeto Supabase:</p>
            <pre className="bg-gray-800 text-white p-3 rounded text-xs overflow-auto">
{`CREATE TABLE public.addresses (
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

-- Adiciona índice para melhorar performance
CREATE INDEX idx_addresses_user ON public.addresses(user_id);

-- Habilita segurança em nível de linha
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own addresses" 
ON public.addresses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" 
ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" 
ON public.addresses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" 
ON public.addresses FOR DELETE USING (auth.uid() = user_id);`}
            </pre>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* CEP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="zip_code">
                CEP
              </label>
              <input
                id="zip_code"
                name="zip_code"
                type="text"
                required
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-champagne-500 focus:border-champagne-500"
                placeholder="00000-000"
                value={endereco.zip_code}
                onChange={handleInputChange}
                onBlur={handleCepBlur}
              />
            </div>
            
            {/* Rua */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="street">
                Rua
              </label>
              <input
                id="street"
                name="street"
                type="text"
                required
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-champagne-500 focus:border-champagne-500"
                placeholder="Nome da rua"
                value={endereco.street}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Número */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="number">
                Número
              </label>
              <input
                id="number"
                name="number"
                type="text"
                required
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-champagne-500 focus:border-champagne-500"
                placeholder="123"
                value={endereco.number}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Complemento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="complement">
                Complemento
              </label>
              <input
                id="complement"
                name="complement"
                type="text"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-champagne-500 focus:border-champagne-500"
                placeholder="Apto 101, Bloco B, etc. (opcional)"
                value={endereco.complement}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Bairro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="district">
                Bairro
              </label>
              <input
                id="district"
                name="district"
                type="text"
                required
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-champagne-500 focus:border-champagne-500"
                placeholder="Nome do bairro"
                value={endereco.district}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Cidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">
                Cidade
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-champagne-500 focus:border-champagne-500"
                placeholder="Nome da cidade"
                value={endereco.city}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="state">
                Estado
              </label>
              <select
                id="state"
                name="state"
                required
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-champagne-500 focus:border-champagne-500"
                value={endereco.state}
                onChange={handleInputChange}
              >
                <option value="">Selecione um estado</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>
            
            {/* Endereço Principal */}
            <div className="flex items-center">
              <input
                id="is_main"
                name="is_main"
                type="checkbox"
                className="h-4 w-4 text-champagne-600 focus:ring-champagne-500 border-gray-300 rounded"
                checked={endereco.is_main}
                onChange={handleInputChange}
              />
              <label htmlFor="is_main" className="ml-2 block text-sm text-gray-700">
                Definir como endereço principal
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/perfil')}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-champagne-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-champagne-600 hover:bg-champagne-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-champagne-500 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Salvando...' : 'Salvar Endereço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovoEndereco; 