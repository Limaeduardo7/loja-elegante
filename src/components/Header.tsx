import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Search, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SearchModal from './SearchModal';
import CategoryDropdown from './CategoryDropdown';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

// Tipo para as páginas
type Page = 'home' | 'collection' | 'about' | 'contact' | 'profile' | 'admin';

// Props para o componente Header
interface HeaderProps {
  currentPage?: Page;
}

const Header = ({ currentPage = 'home' }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showingSubcategories, setShowingSubcategories] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { cartItemsCount } = useCart();

  // Classes para estilização consistente
  const userLinkClass = `flex items-center text-black hover:text-champagne-500 transition-colors ${
    currentPage === 'profile' || currentPage === 'admin' ? 'text-champagne-500' : ''
  }`;

  // Detectar scroll para aplicar efeito ao header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Limpar event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Função para fechar o menu mobile após navegação
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Determinar estilo do cabeçalho com base na página atual e scroll
  const headerClassName = currentPage === 'home'
    ? scrolled 
      ? "fixed top-0 left-0 right-0 bg-white z-50 shadow-md transition-all duration-300"
      : "fixed top-0 left-0 right-0 bg-white bg-opacity-95 z-50 transition-all duration-300"
    : "fixed top-0 left-0 right-0 bg-white z-50 shadow-sm transition-all duration-300";

  // Renderiza o ícone de usuário com o texto apropriado de acordo com o status de autenticação
  const renderUserLink = () => {
    // No cabeçalho desktop
    if (!isMenuOpen) {
      if (isAdmin) {
        return (
          <Link to="/admin" className={`${userLinkClass}`}>
            <User className="h-5 w-5 mr-2" />
            <span className="hidden md:inline">Admin</span>
          </Link>
        );
      }
      
      if (user) {
        return (
          <Link to="/perfil" className={`${userLinkClass}`}>
            <User className="h-5 w-5" />
          </Link>
        );
      }
      
      return (
        <Link to="/conta" className={`${userLinkClass}`}>
          <User className="h-5 w-5 mr-2" />
          <span className="hidden md:inline">Entrar</span>
        </Link>
      );
    } 
    // No menu mobile - centralizado como os outros ícones
    else {
      if (isAdmin) {
        return (
          <Link 
            to="/admin" 
            className="text-black font-light hover:text-champagne-500 transition-colors cursor-pointer py-2 flex items-center justify-center"
            onClick={() => setIsMenuOpen(false)}
          >
            <User className="h-5 w-5 mr-3" />
            Admin
          </Link>
        );
      }
      
      if (user) {
        return (
          <Link 
            to="/perfil" 
            className="text-black font-light hover:text-champagne-500 transition-colors cursor-pointer py-2 flex items-center justify-center"
            onClick={() => setIsMenuOpen(false)}
          >
            <User className="h-5 w-5 mr-3" />
            Minha Conta
          </Link>
        );
      }
      
      return (
        <Link 
          to="/conta" 
          className="text-black font-light hover:text-champagne-500 transition-colors cursor-pointer py-2 flex items-center justify-center"
          onClick={() => setIsMenuOpen(false)}
        >
          <User className="h-5 w-5 mr-3" />
          Entrar
        </Link>
      );
    }
  };

  return (
    <header className={headerClassName}>
      <div className="container-custom px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center cursor-pointer">
              <img 
                src="https://plrojewhtzgsmehkxlxu.supabase.co/storage/v1/object/public/images//Design%20sem%20nome%20(57).png" 
                alt="Use Lamone" 
                className="h-10 object-contain" 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`${currentPage === 'home' ? 'text-champagne-500' : 'text-black'} font-light hover:text-champagne-500 transition-colors cursor-pointer`}
            >
              Início
            </Link>
            <CategoryDropdown />
            <Link 
              to="/colecao" 
              className={`${currentPage === 'collection' ? 'text-champagne-500' : 'text-black'} font-light hover:text-champagne-500 transition-colors cursor-pointer`}
            >
              Coleção
            </Link>
            <Link 
              to="/sobre" 
              className={`${currentPage === 'about' ? 'text-champagne-500' : 'text-black'} font-light hover:text-champagne-500 transition-colors cursor-pointer`}
            >
              Sobre
            </Link>
            <Link 
              to="/contato" 
              className={`${currentPage === 'contact' ? 'text-champagne-500' : 'text-black'} font-light hover:text-champagne-500 transition-colors cursor-pointer`}
            >
              Contato
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button 
              className="text-black hover:text-champagne-500 transition-colors"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Pesquisar"
            >
              <Search size={20} />
            </button>
            {renderUserLink()}
            <Link to="/carrinho" className="text-black hover:text-champagne-500 transition-colors relative">
              <ShoppingBag size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-champagne-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </Link>
            <button
              className="md:hidden text-black hover:text-champagne-500 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="container mx-auto px-4 py-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <img 
                src="https://plrojewhtzgsmehkxlxu.supabase.co/storage/v1/object/public/images//Design%20sem%20nome%20(57).png" 
                alt="Use Lamone" 
                className="h-8 object-contain" 
              />
              <button
                className="text-black hover:text-champagne-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col flex-grow">
              <div className="space-y-4 mb-8">
                {!showingSubcategories && (
                  <Link 
                    to="/" 
                    className={`${currentPage === 'home' ? 'text-champagne-500' : 'text-black'} font-light hover:text-champagne-500 transition-colors cursor-pointer py-2 block`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Início
                  </Link>
                )}
                <CategoryDropdown 
                  isMobile 
                  onSelect={() => setIsMenuOpen(false)} 
                  onShowingSubcategories={setShowingSubcategories}
                />
                {!showingSubcategories && (
                  <>
                    <Link 
                      to="/colecao" 
                      className={`${currentPage === 'collection' ? 'text-champagne-500' : 'text-black'} font-light hover:text-champagne-500 transition-colors cursor-pointer py-2 block`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Coleção
                    </Link>
                    <Link 
                      to="/sobre" 
                      className={`${currentPage === 'about' ? 'text-champagne-500' : 'text-black'} font-light hover:text-champagne-500 transition-colors cursor-pointer py-2 block`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sobre
                    </Link>
                    <Link 
                      to="/contato" 
                      className={`${currentPage === 'contact' ? 'text-champagne-500' : 'text-black'} font-light hover:text-champagne-500 transition-colors cursor-pointer py-2 block`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Contato
                    </Link>
                  </>
                )}
              </div>
              
              {!showingSubcategories && (
                <>
                  <div className="border-t border-gray-100 my-4"></div>
                  
                  {/* Ícones centralizados verticalmente */}
                  <div className="flex flex-col space-y-6 my-auto">
                    <button
                      className="text-black font-light hover:text-champagne-500 transition-colors cursor-pointer py-2 flex items-center justify-center"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsSearchOpen(true);
                      }}
                    >
                      <Search size={20} className="mr-3" />
                      Pesquisar
                    </button>
                    {renderUserLink()}
                    <Link 
                      to="/carrinho" 
                      className={`text-black font-light hover:text-champagne-500 transition-colors cursor-pointer py-2 flex items-center justify-center`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingBag size={20} className="mr-3" />
                      Carrinho
                      {cartItemsCount > 0 && (
                        <span className="ml-3 bg-champagne-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cartItemsCount > 99 ? '99+' : cartItemsCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Modal de Pesquisa */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </header>
  );
};

export default Header; 