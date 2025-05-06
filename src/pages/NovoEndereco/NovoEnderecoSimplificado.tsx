import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NovoEnderecoSimplificado = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Verificar autenticação
  useEffect(() => {
    if (!user) {
      navigate('/conta');
    }
  }, [user, navigate]);

  const handleCancelar = () => {
    navigate('/perfil');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-6">Adicionar Novo Endereço</h1>
        
        {errorMessage ? (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errorMessage}
          </div>
        ) : (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-md">
            Ocorreu um problema ao carregar o formulário de endereço. Estamos trabalhando para resolver.
          </div>
        )}
        
        <div className="flex space-x-4 mt-6">
          <button
            type="button"
            onClick={handleCancelar}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Voltar para Perfil
          </button>
        </div>
      </div>
    </div>
  );
};

export default NovoEnderecoSimplificado; 