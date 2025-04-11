import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import FeaturedProducts from './components/FeaturedProducts'
import Categories from './components/Categories'
import PromoBanner from './components/PromoBanner'
import VerticalCategoryCarousel from './components/VerticalCategoryCarousel'
import InstagramFeed from './components/InstagramFeed'
import Footer from './components/Footer'
import Collection from './components/Collection'
import ProductDetail from './pages/ProductDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import Auth from './pages/Auth'
import { AuthProvider } from './contexts/AuthContext'
import WhatsAppButton from './components/WhatsAppButton'

// Componente Home que inclui todos os componentes da página inicial
const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Hero />
      <FeaturedProducts onViewAllClick={() => navigate('/colecao')} />
      <Categories />
      <PromoBanner />
      <VerticalCategoryCarousel />
      <InstagramFeed />
    </>
  );
};

// Tipo para as páginas disponíveis
type Page = 'home' | 'collection' | 'about' | 'contact';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Carregar recursos importantes antes de renderizar
  useEffect(() => {
    // Pré-carregar imagens importantes
    const preloadImages = [
      'https://i.imgur.com/B9Vn5kP.png', // Logo
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
        <div className="animate-pulse text-gold-500 text-2xl">Carregando...</div>
      </div>
    );
  }

  // Componente Layout que contém o cabeçalho e rodapé comum a todas as páginas
  const Layout = () => {
    const location = useLocation();
    const currentPage = 
      location.pathname === '/colecao' ? 'collection' : 
      location.pathname === '/sobre' ? 'about' : 
      location.pathname === '/contato' ? 'contact' : 'home';
    
    return (
      <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
        <Header currentPage={currentPage as Page} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/colecao" element={<Collection />} />
            <Route path="/produto/:id" element={<ProductDetail />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/conta" element={<Auth />} />
            <Route path="/atualizar-senha" element={<Auth resetMode={true} />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  };

  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  )
}

export default App
