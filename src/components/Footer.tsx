import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800">
      <div className="container-custom px-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex justify-center">
              <img 
                src="https://i.imgur.com/B9Vn5kP.png" 
                alt="Use Lamone" 
                className="h-10 object-contain" 
              />
            </div>
            <p className="text-gray-600 font-light">
              Moda refinada para mulheres que valorizam elegância atemporal e qualidade excepcional.
            </p>
            <div className="flex space-x-4 mt-4 justify-center">
              <a href="#" className="text-gray-500 hover:text-gold-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gold-500 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gold-500 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-light mb-3 tracking-wide">Compre</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gold-500 transition-colors font-light">Novidades</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gold-500 transition-colors font-light">Coleção</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gold-500 transition-colors font-light">Acessórios</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gold-500 transition-colors font-light">Promoções</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-light mb-3 tracking-wide">Informações</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gold-500 transition-colors font-light">Sobre nós</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gold-500 transition-colors font-light">Termos e Condições</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gold-500 transition-colors font-light">Política de Privacidade</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gold-500 transition-colors font-light">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-light mb-3 tracking-wide">Contato</h3>
            <address className="not-italic text-gray-600 font-light">
              Rua da Elegância, 123<br />
              Centro, São Paulo - SP<br />
              CEP: 01234-567<br />
              <a href="mailto:contato@uselamone.com" className="text-gold-500 hover:underline mt-2 inline-block">contato@uselamone.com</a>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-200 py-4">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-4">
            <p className="text-gray-600 text-sm font-light">© 2025 Use Lamone. Todos os direitos reservados.</p>
            <p className="text-gray-600 text-sm font-light">
              Feito por <a href="https://merakigroup.space" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:underline">Meraki Group</a>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 