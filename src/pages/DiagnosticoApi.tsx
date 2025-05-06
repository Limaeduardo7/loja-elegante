import React, { useState, useEffect } from 'react';

type ApiStatus = {
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  message: string;
};

type TestResult = {
  name: string;
  success: boolean;
  message: string;
  details?: string;
};

type AuthToken = {
  original_key: string;
  formatted_key: string;
  base64_key: string;
  full_auth_header: string;
};

const DiagnosticoApi = () => {
  const [apiStatus, setApiStatus] = useState<ApiStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [manualApiKey, setManualApiKey] = useState('');
  const [manualTestResult, setManualTestResult] = useState<TestResult | null>(null);
  const [authToken, setAuthToken] = useState<AuthToken | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  useEffect(() => {
    // Lista de endpoints para testar
    const endpoints = [
      { name: 'Status API', url: '/.netlify/functions/status' },
      { name: 'Proxy API', url: '/.netlify/functions/proxy' },
      { name: 'Verificar Ambiente', url: '/.netlify/functions/verify-env' },
      { name: 'Gerar Token', url: '/.netlify/functions/generate-auth' }
    ];

    // Testar cada endpoint
    const testEndpoints = async () => {
      const results: ApiStatus[] = [];

      for (const endpoint of endpoints) {
        try {
          results.push({
            endpoint: endpoint.name,
            status: 'loading',
            message: 'Testando...'
          });
          setApiStatus([...results]);

          // Apenas testar disponibilidade, sem enviar dados reais
          const method = endpoint.name.includes('Proxy') ? 'POST' : 'GET';
          const body = method === 'POST' 
            ? JSON.stringify({ endpoint: 'customers', data: { name: 'Test User' } })
            : undefined;

          const response = await fetch(endpoint.url, {
            method,
            headers: {
              'Content-Type': 'application/json'
            },
            body
          });

          const index = results.findIndex(r => r.endpoint === endpoint.name);
          
          if (response.ok) {
            const responseText = await response.text();
            results[index] = {
              endpoint: endpoint.name,
              status: 'success',
              message: `Status: ${response.status}, Resposta: ${responseText.substring(0, 100)}...`
            };
          } else {
            const responseText = await response.text();
            results[index] = {
              endpoint: endpoint.name,
              status: 'error',
              message: `Erro ${response.status}: ${responseText.substring(0, 100)}...`
            };
          }
          
          setApiStatus([...results]);
        } catch (error: any) {
          const index = results.findIndex(r => r.endpoint === endpoint.name);
          results[index] = {
            endpoint: endpoint.name,
            status: 'error',
            message: `Erro: ${error.message}`
          };
          setApiStatus([...results]);
        }
      }
      
      setIsLoading(false);
    };

    testEndpoints();
  }, []);
  
  // Teste manual com chave fornecida pelo usuário
  const runManualTest = async () => {
    if (!manualApiKey) {
      setManualTestResult({
        name: 'Teste Manual',
        success: false,
        message: 'Digite uma chave de API para testar'
      });
      return;
    }
    
    try {
      const keyWithColon = manualApiKey.endsWith(':') ? manualApiKey : `${manualApiKey}:`;
      const base64Key = btoa(keyWithColon);
      
      const response = await fetch('https://api.pagar.me/core/v5/customers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${base64Key}`
        }
      });
      
      let details = '';
      try {
        const text = await response.text();
        details = text.substring(0, 200);
      } catch (e) {
        details = 'Não foi possível ler a resposta';
      }
      
      setManualTestResult({
        name: 'Teste Manual',
        success: response.ok,
        message: response.ok 
          ? `Sucesso! Status: ${response.status}` 
          : `Falha! Status: ${response.status}`,
        details
      });
    } catch (error: any) {
      setManualTestResult({
        name: 'Teste Manual',
        success: false,
        message: `Erro ao testar autenticação: ${error.message}`
      });
    }
  };
  
  // Gerar token de autenticação
  const generateAuthToken = async () => {
    if (!manualApiKey) {
      setManualTestResult({
        name: 'Geração de Token',
        success: false,
        message: 'Digite uma chave de API para gerar o token'
      });
      return;
    }
    
    setIsGeneratingToken(true);
    
    try {
      const response = await fetch(`/.netlify/functions/generate-auth?key=${encodeURIComponent(manualApiKey)}`);
      
      if (response.ok) {
        const data = await response.json();
        setAuthToken(data);
        
        setManualTestResult({
          name: 'Geração de Token',
          success: true,
          message: 'Token gerado com sucesso!'
        });
      } else {
        const text = await response.text();
        
        setManualTestResult({
          name: 'Geração de Token',
          success: false,
          message: `Erro ao gerar token: ${response.status}`,
          details: text
        });
      }
    } catch (error: any) {
      setManualTestResult({
        name: 'Geração de Token',
        success: false,
        message: `Erro ao gerar token: ${error.message}`
      });
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Copiado para a área de transferência!');
      })
      .catch(err => {
        console.error('Erro ao copiar:', err);
      });
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico da API Pagar.me</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Verificação de Funções Serverless</h2>
        <p className="text-sm text-gray-700 mb-3">
          Este diagnóstico verifica o estado das funções serverless que intermediam as chamadas à API do Pagar.me,
          sem exibir ou expor as chaves de API por questões de segurança.
        </p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Teste Manual e Geração de Token</h2>
        <div className="flex flex-col space-y-2">
          <p className="text-sm text-gray-600 mb-2">
            Digite uma chave secreta do Pagar.me (sk_...) para testar a autenticação diretamente:
          </p>
          <input 
            type="text"
            value={manualApiKey}
            onChange={(e) => setManualApiKey(e.target.value)}
            placeholder="sk_test_..."
            className="p-2 border rounded"
          />
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={runManualTest}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Testar Autenticação
            </button>
            
            <button 
              onClick={generateAuthToken}
              disabled={isGeneratingToken}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isGeneratingToken ? 'Gerando...' : 'Gerar Token para proxy.js'}
            </button>
          </div>
          
          {manualTestResult && (
            <div 
              className={`mt-4 p-3 rounded shadow-sm ${
                manualTestResult.success ? 'bg-green-50 border-l-4 border-green-500' :
                'bg-red-50 border-l-4 border-red-500'
              }`}
            >
              <p className={manualTestResult.success ? 'text-green-700' : 'text-red-700'}>
                {manualTestResult.message}
              </p>
              {manualTestResult.details && (
                <p className="text-gray-600 text-sm mt-1">
                  Detalhes: {manualTestResult.details}
                </p>
              )}
            </div>
          )}
          
          {authToken && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">Token de Autenticação Gerado</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-sm">Header de autenticação completo:</p>
                  <div className="flex items-center mt-1 bg-gray-100 p-2 rounded">
                    <code className="text-xs break-all">{authToken.full_auth_header}</code>
                    <button 
                      onClick={() => copyToClipboard(authToken.full_auth_header)}
                      className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>Como usar:</strong> Cole o valor acima na constante <code>HARDCODED_AUTH</code> no arquivo <code>api/pagarme/proxy.js</code>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Status das APIs</h2>
        
        {isLoading ? (
          <p>Verificando status das APIs...</p>
        ) : (
          <div className="space-y-4">
            {apiStatus.map((status, index) => (
              <div 
                key={index} 
                className={`p-3 rounded shadow-sm ${
                  status.status === 'success' ? 'bg-green-50 border-l-4 border-green-500' :
                  status.status === 'error' ? 'bg-red-50 border-l-4 border-red-500' :
                  'bg-yellow-50 border-l-4 border-yellow-500'
                }`}
              >
                <h3 className="font-medium">{status.endpoint}</h3>
                <p className={
                  status.status === 'success' ? 'text-green-700' :
                  status.status === 'error' ? 'text-red-700' : 
                  'text-yellow-700'
                }>
                  {status.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Como resolver problemas:</h2>
        <div className="bg-white p-4 rounded shadow-sm space-y-3">
          <div>
            <h3 className="font-medium">1. Segurança das chaves de API</h3>
            <p className="text-sm text-gray-700">
              As chaves de API do Pagar.me nunca devem estar expostas no frontend. 
              Use sempre o proxy serverless para intermediar as chamadas à API.
            </p>
          </div>
          <div>
            <h3 className="font-medium">2. Configuração correta no Netlify</h3>
            <p className="text-sm text-gray-700">
              Configure as variáveis de ambiente VITE_PAGARME_PUBLIC_KEY e VITE_PAGARME_SECRET_KEY no painel do Netlify em Site settings > Environment variables.
            </p>
          </div>
          <div>
            <h3 className="font-medium">3. Use a autenticação hardcoded</h3>
            <p className="text-sm text-gray-700">
              Gere o token de autenticação e cole-o na constante HARDCODED_AUTH no arquivo proxy.js.
            </p>
          </div>
          <div>
            <h3 className="font-medium">4. Limpe o cache de build</h3>
            <p className="text-sm text-gray-700">
              No painel do Netlify, vá para Site settings > Build & deploy > Clear cache and deploy site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticoApi; 