/**
 * Script para verificar a disponibilidade das funções Netlify
 * Executar com: node src/checkNetlifyFunctions.js
 */

// Usando require para compatibilidade com Node.js
const fetch = require('node-fetch');

// URLs para verificar
const urls = [
  'https://uselamone.netlify.app/.netlify/functions/status',
  'https://uselamone.netlify.app/.netlify/functions/proxy'
];

// Função para testar uma URL
async function testUrl(url) {
  console.log(`\nTestando URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: url.includes('proxy') ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: url.includes('proxy') ? JSON.stringify({
        endpoint: 'customers',
        data: { name: 'Test User' },
        apiKey: 'test_key_for_verification_only'
      }) : undefined
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    try {
      const data = await response.text();
      console.log('Resposta:', data.substring(0, 200) + (data.length > 200 ? '...' : ''));
    } catch (e) {
      console.log('Erro ao ler resposta:', e.message);
    }
  } catch (error) {
    console.error(`Erro ao acessar URL: ${error.message}`);
  }
}

// Função principal que testa todas as URLs
async function main() {
  console.log('Verificando disponibilidade das funções Netlify...');
  
  for (const url of urls) {
    await testUrl(url);
  }
}

// Executar a função principal
main().catch(error => {
  console.error('Erro geral:', error);
}); 