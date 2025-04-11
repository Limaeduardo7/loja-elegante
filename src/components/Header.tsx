import { useState } from 'react';
import { Menu, X, ShoppingBag, Search, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SearchModal from './SearchModal';

// Tipo para as páginas
type Page = 'home' | 'collection' | 'about' | 'contact';

// Props para o componente Header
type HeaderProps = {
  currentPage: Page;
};

const Header = ({ currentPage }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  // Função para fechar o menu mobile após navegação
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Determinar estilo do cabeçalho com base na página atual
  const headerClassName = currentPage === 'home'
    ? "absolute top-0 left-0 right-0 bg-white z-50"
    : "fixed top-0 left-0 right-0 bg-white z-50 shadow-sm";

  return (
    <header className={headerClassName}>
      <div className="container-custom px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center cursor-pointer">
              <img 
                src="https://i.imgur.com/B9Vn5kP.png" 
                alt="Use Lamone" 
                className="h-10 object-contain" 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`${currentPage === 'home' ? 'text-gold-500' : 'text-black'} font-light hover:text-gold-500 transition-colors cursor-pointer`}
            >
              Início
            </Link>
            <Link 
              to="/colecao" 
              className={`${currentPage === 'collection' ? 'text-gold-500' : 'text-black'} font-light hover:text-gold-500 transition-colors cursor-pointer`}
            >
              Coleção
            </Link>
            <Link 
              to="/sobre" 
              className={`${currentPage === 'about' ? 'text-gold-500' : 'text-black'} font-light hover:text-gold-500 transition-colors cursor-pointer`}
            >
              Sobre
            </Link>
            <Link 
              to="/contato" 
              className={`${currentPage === 'contact' ? 'text-gold-500' : 'text-black'} font-light hover:text-gold-500 transition-colors cursor-pointer`}
            >
              Contato
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button 
              className="text-black hover:text-gold-500 transition-colors"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Pesquisar"
            >
              <Search size={20} />
            </button>
            <Link to="/conta" className="text-black hover:text-gold-500 transition-colors">
              <User size={20} />
            </Link>
            <Link to="/carrinho" className="text-black hover:text-gold-500 transition-colors relative">
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-gold-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </Link>
            <button
              className="md:hidden text-black hover:text-gold-500 transition-colors"
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
                src="https://i.imgur.com/B9Vn5kP.png" 
                alt="Use Lamone" 
                className="h-8 object-contain" 
              />
              <button
                className="text-black hover:text-gold-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col flex-grow">
              <div className="space-y-4 mb-8">
                <Link 
                  to="/" 
                  className={`${currentPage === 'home' ? 'text-gold-500' : 'text-black'} font-light hover:text-gold-500 transition-colors cursor-pointer py-2 block`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Início
                </Link>
                <Link 
                  to="/colecao" 
                  className={`${currentPage === 'collection' ? 'text-gold-500' : 'text-black'} font-light hover:text-gold-500 transition-colors cursor-pointer py-2 block`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Coleção
                </Link>
                <Link 
                  to="/sobre" 
                  className={`${currentPage === 'about' ? 'text-gold-500' : 'text-black'} font-light hover:text-gold-500 transition-colors cursor-pointer py-2 block`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sobre
                </Link>
                <Link 
                  to="/contato" 
                  className={`${currentPage === 'contact' ? 'text-gold-500' : 'text-black'} font-light hover:text-gold-500 transition-colors cursor-pointer py-2 block`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contato
                </Link>
              </div>
              
              <div className="border-t border-gray-100 my-4"></div>
              
              {/* Ícones centralizados verticalmente */}
              <div className="flex flex-col space-y-6 my-auto">
                <button
                  className="text-black font-light hover:text-gold-500 transition-colors cursor-pointer py-2 flex items-center justify-center"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                >
                  <Search size={20} className="mr-3" />
                  Pesquisar
                </button>
                <Link 
                  to="/conta" 
                  className={`text-black font-light hover:text-gold-500 transition-colors cursor-pointer py-2 flex items-center justify-center`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={20} className="mr-3" />
                  Minha Conta
                </Link>
                <Link 
                  to="/carrinho" 
                  className={`text-black font-light hover:text-gold-500 transition-colors cursor-pointer py-2 flex items-center justify-center`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingBag size={20} className="mr-3" />
                  Carrinho
                  <span className="ml-3 bg-gold-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    0
                  </span>
                </Link>
              </div>
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