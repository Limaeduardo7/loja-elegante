import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { router as routerConfig } from './components/react-router-config'

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

// Note: Para remover totalmente os avisos, precisaríamos refatorar toda a aplicação
// para usar o createBrowserRouter em vez do BrowserRouter. Como isso seria uma mudança
// muito grande, estamos apenas adicionando a configuração como exemplo.
