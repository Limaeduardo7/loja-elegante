import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root');

if (!root) {
  throw new Error('Elemento raiz não encontrado');
}

// Use a API de renderização mais recente
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
