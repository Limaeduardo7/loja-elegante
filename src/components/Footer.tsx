import { Facebook, Instagram, MapPin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <>
      {/* Footer para dispositivos móveis */}
      <footer className="bg-white text-gray-800 border-t border-gray-100 block sm:hidden py-6">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
              <img 
                src="https://plrojewhtzgsmehkxlxu.supabase.co/storage/v1/object/public/images//Design%20sem%20nome%20(57).png" 
                alt="Use Lamone" 
              className="h-8 object-contain mx-auto mb-4" 
            />
            <div className="flex justify-center space-x-4 mb-4">
              <a href="https://www.facebook.com/profile.php?id=100084470989204&mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-champagne-500 transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://www.instagram.com/use.lamone?igsh=ZGUzMzM3NWJiOQ==" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-champagne-500 transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://www.tiktok.com/@use.lamone1?_t=ZM-8vyXqazzs9O&_r=1" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-champagne-500 transition-colors" aria-label="TikTok">
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Informações de contato centralizadas */}
          <div className="text-center mb-6">
            <ul className="space-y-3">
              <li className="flex flex-col items-center">
                <MapPin size={18} className="text-champagne-500 mb-1" />
                <span className="text-gray-600 font-light text-sm">
                  São Paulo - SP
                </span>
              </li>
              <li className="flex flex-col items-center">
                <Phone size={18} className="text-champagne-500 mb-1" />
                <a href="tel:+5511990012305" className="text-gray-600 text-sm hover:text-champagne-500 transition-colors font-light">(11) 99001-2305</a>
              </li>
              <li className="flex flex-col items-center">
                <Mail size={18} className="text-rose-300 mb-1" />
                <a href="mailto:contato@uselamone.com" className="text-gray-600 text-sm hover:text-rose-400 transition-colors font-light">contato@uselamone.com</a>
              </li>
            </ul>
          </div>
          
          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-gray-600 text-xs font-light">
              © 2025 Use Lamone. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Footer para desktop (existente) */}
      <footer className="bg-white text-gray-800 border-t border-gray-100 hidden sm:block">
        <div className="container-custom px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Coluna 1: Logo e descrição */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex justify-center md:justify-start">
                <img 
                  src="https://plrojewhtzgsmehkxlxu.supabase.co/storage/v1/object/public/images//Design%20sem%20nome%20(57).png" 
                  alt="Use Lamone" 
                  className="h-10 object-contain" 
                />
              </div>
              <p className="text-gray-600 font-light mb-6 pr-4 text-center md:text-left">
                Moda refinada para mulheres que valorizam elegância atemporal e qualidade excepcional. 
                Todas as nossas peças são cuidadosamente produzidas para oferecer o melhor em estilo e conforto.
              </p>
              <div className="flex justify-center md:justify-start space-x-4 mb-6">
                <a href="https://www.facebook.com/profile.php?id=100084470989204&mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-champagne-500 transition-colors" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="https://www.instagram.com/use.lamone?igsh=ZGUzMzM3NWJiOQ==" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-champagne-500 transition-colors" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="https://www.tiktok.com/@use.lamone1?_t=ZM-8vyXqazzs9O&_r=1" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-champagne-500 transition-colors" aria-label="TikTok">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Coluna 2: Links rápidos da loja */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-medium mb-4 tracking-wide text-gray-900">Loja</h3>
              <ul className="space-y-2">
                <li><Link to="/colecao" className="text-gray-600 hover:text-champagne-500 transition-colors font-light">Coleção Completa</Link></li>
                <li><Link to="/novidades" className="text-gray-600 hover:text-champagne-500 transition-colors font-light">Novidades</Link></li>
                <li><Link to="/mais-vendidos" className="text-gray-600 hover:text-champagne-500 transition-colors font-light">Mais Vendidos</Link></li>
                <li><Link to="/promocoes" className="text-gray-600 hover:text-champagne-500 transition-colors font-light">Promoções</Link></li>
                <li><Link to="/verao" className="text-gray-600 hover:text-champagne-500 transition-colors font-light">Looks de Verão</Link></li>
              </ul>
            </div>
            
            {/* Coluna 3: Informações */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-medium mb-4 tracking-wide text-gray-900">Informações</h3>
            <ul className="space-y-2">
                <li><Link to="/sobre" className="text-gray-600 hover:text-champagne-500 transition-colors font-light">Sobre nós</Link></li>
                <li><Link to="/termos" className="text-gray-600 hover:text-champagne-500 transition-colors font-light">Termos e Condições</Link></li>
                <li><Link to="/privacidade" className="text-gray-600 hover:text-champagne-500 transition-colors font-light">Política de Privacidade</Link></li>
                <li><Link to="/entrega" className="text-gray-600 hover:text-champagne-500 transition-colors font-light">Informações de Entrega</Link></li>
                <li><Link to="/faq" className="text-gray-600 hover:text-champagne-500 transition-colors font-light">Perguntas Frequentes</Link></li>
              </ul>
            </div>
            
            {/* Coluna 4: Contato */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-medium mb-4 tracking-wide text-gray-900">Contato</h3>
              <ul className="space-y-3">
                <li className="flex flex-col md:flex-row items-center md:items-start">
                  <MapPin size={20} className="text-champagne-500 mb-2 md:mr-2 md:mt-0.5 md:mb-0 flex-shrink-0" />
                  <span className="text-gray-600 font-light text-center md:text-left">
                    São Paulo - SP
                  </span>
                </li>
                <li className="flex flex-col md:flex-row items-center md:items-center">
                  <Phone size={20} className="text-champagne-500 mb-2 md:mr-2 md:mb-0 flex-shrink-0" />
                  <a href="tel:+5511990012305" className="text-gray-600 hover:text-champagne-500 transition-colors font-light">(11) 99001-2305</a>
                </li>
                <li className="flex flex-col md:flex-row items-center md:items-center">
                  <Mail size={20} className="text-rose-300 mb-2 md:mr-2 md:mb-0 flex-shrink-0" />
                  <a href="mailto:contato@uselamone.com.br" className="text-gray-600 hover:text-rose-400 transition-colors font-light">contato@uselamone.com</a>
                </li>
            </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-10 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 text-sm font-light text-center md:text-left">
                © 2025 Use Lamone. Todos os direitos reservados. 
                <span className="mx-1">|</span> 
                <a href="https://merakigroup.com.br" target="_blank" rel="noopener noreferrer" className="text-champagne-500 hover:underline">
                  Feito por Meraki Group
                </a>
              </p>
              <div className="mt-4 md:mt-0">
                <ul className="flex space-x-6 justify-center md:justify-start">
                  <li><Link to="/termos" className="text-gray-600 hover:text-champagne-500 text-sm transition-colors font-light">Termos</Link></li>
                  <li><Link to="/privacidade" className="text-gray-600 hover:text-champagne-500 text-sm transition-colors font-light">Privacidade</Link></li>
                  <li><Link to="/cookies" className="text-gray-600 hover:text-champagne-500 text-sm transition-colors font-light">Cookies</Link></li>
                </ul>
          </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer; 