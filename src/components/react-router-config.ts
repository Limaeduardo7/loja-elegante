import { lazy } from 'react';

// Importações das páginas
const AdminPanel = lazy(() => import('../pages/AdminPanel'));
const Produtos = lazy(() => import('../pages/admin/Produtos'));
const NovoProduto = lazy(() => import('../pages/admin/NovoProduto'));
const Categorias = lazy(() => import('../pages/admin/Categorias'));
const NovaCategoria = lazy(() => import('../pages/admin/NovaCategoria'));
const GerenciarBanners = lazy(() => import('../pages/admin/GerenciarBanners'));
const Promocoes = lazy(() => import('../pages/admin/Promocoes'));
const Pedidos = lazy(() => import('../pages/admin/Pedidos'));
const Usuarios = lazy(() => import('../pages/admin/Usuarios'));
const Configuracoes = lazy(() => import('../pages/admin/Configuracoes'));

// Configuração para React Router v7 (opcional)
// Isso elimina os avisos exibidos nos logs do console
export const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

export const adminRoutes = [
  {
    path: '/admin',
    element: AdminPanel,
  },
  {
    path: '/admin/produtos',
    element: Produtos,
  },
  {
    path: '/admin/produtos/novo',
    element: NovoProduto,
  },
  {
    path: '/admin/categorias',
    element: Categorias,
  },
  {
    path: '/admin/categorias/nova',
    element: NovaCategoria,
  },
  {
    path: '/admin/banners',
    element: GerenciarBanners,
  },
  {
    path: '/admin/promocoes',
    element: Promocoes,
  },
  {
    path: '/admin/pedidos',
    element: Pedidos,
  },
  {
    path: '/admin/usuarios',
    element: Usuarios,
  },
  {
    path: '/admin/configuracoes',
    element: Configuracoes,
  },
]; 