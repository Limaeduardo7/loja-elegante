import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Número do WhatsApp (substitua pelo número desejado)
  const whatsappNumber = '5511987654321';
  const whatsappMessage = 'Olá! Estou interessado(a) nos produtos da Loja Elegante e gostaria de mais informações.';
  
  // URL para abrir o WhatsApp com mensagem pré-definida
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  
  // Controla a visibilidade do botão ao rolar a página
  useEffect(() => {
    const handleScroll = () => {
      // Mostrar o botão depois de rolar 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Verificar posição inicial
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-white shadow-lg transform transition-all duration-300 cursor-pointer hover:scale-110 ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-20 opacity-0'
      }`}
      aria-label="Entre em contato pelo WhatsApp"
    >
      <div className="absolute w-full h-full rounded-full bg-green-500 animate-ping opacity-30"></div>
      <MessageCircle size={30} strokeWidth={2} />
    </a>
  );
};

export default WhatsAppButton; 