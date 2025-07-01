import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import FeaturedProducts from './components/FeaturedProducts'
import Categories from './components/Categories'
import PromoBanner from './components/PromoBanner'
import { PromoCards } from './components/PromoBanner'
import VerticalCategoryCarousel from './components/VerticalCategoryCarousel'
import InstagramFeed from './components/InstagramFeed'
import Footer from './components/Footer'
import Collection from './components/Collection'
import WhatsAppButton from './components/WhatsAppButton'
import { PrivateRoute } from './components/PrivateRoute'
import PromoStrip from './components/PromoStrip'
import DiscountPopup from './components/DiscountPopup'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'

// Importar páginas do arquivo de índice
import {
  About,
  AdminPanel,
  AdminProdutos,
  AdminUsuarios,
  AdminCategorias,
  Auth,
  Cart,
  Checkout,
  Configuracoes,
  Contact,
  NovaCategoria,
  NovoProduto,
  PaymentFailure,
  PaymentPending,
  PaymentSuccess,
  ProductDetail,
  Profile,
  Promocoes,
  GerenciarBanners
} from './pages'

// Importar AdminPedidos diretamente para evitar problemas
import AdminPedidos from './pages/admin/Pedidos';

// Importar página de teste do PIX
import TestPix from './pages/payment/TestPix';

// Importar NovoEndereco de forma mais robusta
import NovoEndereco from './pages/NovoEndereco';
// Importar fallback em caso de falha
import NovoEnderecoFallback from './pages/NovoEndereco/index';

// Componente Home que inclui todos os componentes da página inicial
const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Hero />
      <div className="pt-10">
        <PromoCards />
      </div>
      <FeaturedProducts onViewAllClick={() => navigate('/colecao')} />
      <PromoBanner />
      <VerticalCategoryCarousel />
      <InstagramFeed />
    </>
  );
};

// Tipo para as páginas disponíveis
type Page = 'home' | 'collection' | 'about' | 'contact' | 'profile' | 'admin';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Carregar recursos importantes antes de renderizar
  useEffect(() => {
    // Pré-carregar imagens importantes
    const preloadImages = [
      'https://plrojewhtzgsmehkxlxu.supabase.co/storage/v1/object/public/images//Design%20sem%20nome%20(57).png', // Logo
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1374' // Primeiro slide
    ];
    
    Promise.all(
      preloadImages.map(src => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      })
    )
    .then(() => setIsLoading(false))
    .catch(() => setIsLoading(false)); // Mostrar mesmo com erros
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <img 
          src="https://plrojewhtzgsmehkxlxu.supabase.co/storage/v1/object/public/images//Design%20sem%20nome%20(58).png" 
          alt="Use Lamone Logo" 
          className="w-36 h-auto animate-pulse" 
        />
      </div>
    );
  }

  // Componente Layout que contém o cabeçalho e rodapé comum a todas as páginas
  const Layout = () => {
    const location = useLocation();
    const currentPage = 
      location.pathname === '/colecao' ? 'collection' : 
      location.pathname === '/sobre' ? 'about' : 
      location.pathname === '/contato' ? 'contact' :
      location.pathname === '/perfil' ? 'profile' :
      location.pathname === '/admin' ? 'admin' : 'home';
    
    return (
      <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
        <Header currentPage={currentPage as Page} />
        <PromoStrip text="10% de desconto na sua primeira compra! use o cupom uselamone10" />
        <main className="flex-grow pt-[5.5rem]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/colecao" element={<Collection />} />
            <Route path="/produto/:id" element={<ProductDetail />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/sucesso" element={<PaymentSuccess />} />
            <Route path="/falha" element={<PaymentFailure />} />
            <Route path="/pendente" element={<PaymentPending />} />
            <Route path="/conta" element={<Auth />} />
            <Route 
              path="/perfil" 
              element={
                <PrivateRoute>
                  <ProfileCheckAndRedirect />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/endereco/novo" 
              element={
                <PrivateRoute>
                  <NovoEnderecoFallback />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminPanel />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/produtos" 
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminProdutos />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/produtos/novo" 
              element={
                <PrivateRoute adminOnly={true}>
                  <NovoProduto />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/categorias/nova" 
              element={
                <PrivateRoute adminOnly={true}>
                  <NovaCategoria />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/promocoes" 
              element={
                <PrivateRoute adminOnly={true}>
                  <Promocoes />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/banners" 
              element={
                <PrivateRoute adminOnly={true}>
                  <GerenciarBanners />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/configuracoes" 
              element={
                <PrivateRoute adminOnly={true}>
                  <Configuracoes />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/pedidos" 
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminPedidos />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/usuarios" 
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminUsuarios />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/categorias" 
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminCategorias />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/conta/perfil" 
              element={<Navigate to="/perfil" replace />} 
            />
            <Route path="/atualizar-senha" element={<Auth resetMode={true} />} />
            
            {/* Página de teste do PIX */}
            <Route path="/teste-pix" element={<TestPix />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppButton />
        <DiscountPopup />
      </div>
    );
  };

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout />
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

// Componente para decidir se mostra perfil ou painel admin
const ProfileOrAdmin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  console.log('ProfileOrAdmin - Montado com status:', {
    userEmail: user?.email,
    isAdmin,
    authenticated: !!user
  });

  useEffect(() => {
    console.log('ProfileOrAdmin - verificando status de admin:', { email: user?.email, isAdmin });
    
    if (isAdmin) {
      console.log('Usuário é admin, redirecionando para /admin');
      // Usar redirecionamento que força recarga da página
      window.location.href = '/admin';
    } else {
      console.log('Usuário não é admin, mostrando perfil regular');
    }
  }, [isAdmin, user]);

  // Se o usuário é admin, podemos retornar null enquanto o redirecionamento é processado
  if (isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin border-t-2 border-b-2 border-rose-300"></div>
        <p className="ml-3 text-champagne-500">Redirecionando para o painel administrativo...</p>
      </div>
    );
  }

  // Se não for admin, mostrar a página de perfil normal
  return <Profile />;
};

// Componente para verificação e redirecionamento imediato
const ProfileCheckAndRedirect = () => {
  const { isAdmin } = useAuth();
  
  console.log('ProfileCheckAndRedirect - Verificando status de admin:', isAdmin);
  
  // Verificar imediatamente e redirecionar se necessário
  useEffect(() => {
    if (isAdmin) {
      console.log('Redirecionando para admin...');
      window.location.href = '/admin';
    }
  }, [isAdmin]);
  
  // Usar o ProfileOrAdmin como fallback, que também tem lógica de redirecionamento
  return <ProfileOrAdmin />;
};

export default App
