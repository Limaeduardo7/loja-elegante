// Configurações globais do React
window.React = require('react');
window.ReactDOM = require('react-dom/client');

// Garantir que o erro do React seja exibido claramente
window.addEventListener('error', function(event) {
  if (event.error && event.error.message && event.error.message.includes('React')) {
    console.error('Erro do React detectado:', event.error);
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="padding: 20px; color: #d00; background: #fff; font-family: sans-serif;">
          <h2>Erro ao renderizar a aplicação</h2>
          <p>${event.error.message}</p>
          <p>Verifique o console para mais detalhes.</p>
        </div>
      `;
    }
  }
}); 