import React, { useState } from 'react';
import { QrCode, AlertCircle, RotateCw, ArrowLeft, Download, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';

// URL base do proxy serverless
const isProduction = import.meta.env.PROD;
const currentUrl = window.location.origin;
const BASE_URL = isProduction ? '/.netlify/functions' : `${currentUrl}/.netlify/functions`;

const TestPix: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Testar geração de PIX
  const testPixGeneration = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Chamar a função de teste
      const response = await fetch(`${BASE_URL}/test-pix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      // Log para diagnóstico
      console.log('Resposta do teste PIX:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro desconhecido');
      }
      
      setTestResult(data);
      
    } catch (err: any) {
      console.error('Erro ao testar PIX:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };
  
  // Preparar objeto para salvar como JSON
  const prepareJsonDownload = () => {
    const dataStr = JSON.stringify(testResult, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `pix-test-result-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };
  
  return (
    <div className="bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Cabeçalho */}
          <div className="mb-8">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center text-sm text-gray-500 hover:text-champagne-600 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </button>
            
            <h1 className="text-2xl font-medium text-gray-800 mb-2">
              Teste de Integração PIX
            </h1>
            <p className="text-gray-600">
              Esta página permite testar a geração de QR Code PIX com a API do Pagar.me
            </p>
          </div>
          
          {/* Área de teste */}
          <div className="bg-gray-50 border rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center mb-6">
              <QrCode className="h-16 w-16 text-green-500" />
            </div>
            
            <p className="text-center text-gray-700 mb-6">
              Clique no botão abaixo para testar a geração de um QR Code PIX de teste.
              <br />
              Isso ajudará a diagnosticar problemas com a integração.
            </p>
            
            <div className="flex justify-center">
              <Button
                onClick={testPixGeneration}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Gerando PIX...
                  </>
                ) : (
                  'Testar Geração de PIX'
                )}
              </Button>
            </div>
          </div>
          
          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Erro ao testar PIX
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Resultado do teste */}
          {testResult && (
            <div className="bg-white border rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-800">
                  Resultado do Teste
                </h2>
                <Button
                  onClick={prepareJsonDownload}
                  variant="outline"
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Baixar JSON
                </Button>
              </div>
              
              {/* Informação sobre sucesso/falha */}
              <div className={`p-4 rounded-md mb-6 ${testResult.pixInfoFound ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <div className="flex items-center">
                  {testResult.pixInfoFound ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  )}
                  <p className={`text-sm ${testResult.pixInfoFound ? 'text-green-700' : 'text-yellow-700'}`}>
                    {testResult.pixInfoFound
                      ? 'QR Code PIX encontrado com sucesso na resposta!'
                      : 'QR Code PIX não encontrado na estrutura esperada.'}
                  </p>
                </div>
              </div>
              
              {/* Estrutura da resposta */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Estrutura da Resposta
                </h3>
                <div className="bg-gray-50 rounded-md p-3 text-xs font-mono">
                  <div>hasCharges: {testResult.orderStructure.hasCharges ? 'sim' : 'não'}</div>
                  <div>chargesCount: {testResult.orderStructure.chargesCount}</div>
                  <div>firstChargeId: {testResult.orderStructure.firstChargeId || 'N/A'}</div>
                  <div>hasLastTransaction: {testResult.orderStructure.hasLastTransaction ? 'sim' : 'não'}</div>
                  <div>lastTransactionType: {testResult.orderStructure.lastTransactionType || 'N/A'}</div>
                  <div>hasQrCode: {testResult.orderStructure.hasQrCode ? 'sim' : 'não'}</div>
                </div>
              </div>
              
              {/* QR Code */}
              {testResult.qrCodeData && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    QR Code PIX
                  </h3>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* QR Code imagem */}
                    {testResult.qrCodeData.url ? (
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-2">QR Code (imagem):</p>
                        <div className="bg-white border rounded-lg p-4 flex justify-center">
                          <img
                            src={testResult.qrCodeData.url}
                            alt="QR Code PIX"
                            className="w-48 h-48"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-2">QR Code (imagem):</p>
                        <div className="bg-gray-50 border rounded-lg p-4 flex justify-center items-center h-48">
                          <p className="text-sm text-gray-400">Imagem não disponível</p>
                        </div>
                      </div>
                    )}
                    
                    {/* QR Code texto */}
                    {testResult.qrCodeData.text ? (
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-2">Código PIX (copia e cola):</p>
                        <div className="relative">
                          <textarea
                            readOnly
                            value={testResult.qrCodeData.text}
                            className="w-full p-3 bg-white border rounded-md text-xs h-48 font-mono"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(testResult.qrCodeData.text);
                              alert('Código PIX copiado!');
                            }}
                            className="absolute right-2 top-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                          >
                            Copiar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-2">Código PIX (copia e cola):</p>
                        <div className="bg-gray-50 border rounded-lg p-4 flex justify-center items-center h-48">
                          <p className="text-sm text-gray-400">Código não disponível</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  O que fazer com estas informações?
                </h3>
                <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                  <li>Verifique se o QR Code foi gerado corretamente</li>
                  <li>Confirme se tanto a imagem quanto o texto do código estão disponíveis</li>
                  <li>Se os dados do QR Code não forem encontrados, verifique a estrutura da resposta</li>
                  <li>Baixe o JSON completo para análise detalhada</li>
                  <li>Compartilhe essas informações com o suporte técnico se necessário</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPix; 