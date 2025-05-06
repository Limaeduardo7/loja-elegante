import { useEffect, useRef } from 'react';

interface PromoStripProps {
  text: string;
}

const PromoStrip = ({ text = '10% de desconto na sua primeira compra! use o cupom uselamone10' }: PromoStripProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Configuração da animação apenas para mobile
    const handleResize = () => {
      if (window.innerWidth < 768 && scrollRef.current && contentRef.current) {
        // Reinicia a animação se necessário
        const scrollElement = scrollRef.current;
        const contentElement = contentRef.current;
        
        // Duplica o conteúdo para criar um efeito infinito
        // A duplicação já está feita no JSX
      }
    };
    
    // Inicializar e adicionar o listener de resize
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="bg-black text-white py-2 w-full fixed top-16 left-0 right-0 z-40 shadow-sm">
      <div className="container-custom px-4">
        {/* Versão Desktop */}
        <div className="hidden md:flex justify-center items-center">
          <p className="text-center text-sm font-light tracking-wider uppercase flex items-center">
            <span className="text-champagne-400 mr-2">★</span>
            {text}
            <span className="text-champagne-400 ml-2">★</span>
          </p>
        </div>
        
        {/* Versão Mobile com animação */}
        <div 
          ref={scrollRef}
          className="md:hidden overflow-hidden whitespace-nowrap relative w-full"
        >
          <div 
            ref={contentRef}
            className="inline-block animate-marquee whitespace-nowrap"
          >
            <span className="text-sm font-light tracking-wider uppercase inline-block">
              <span className="text-champagne-400 mr-2">★</span>
              {text}
              <span className="text-champagne-400 ml-2">★</span>
            </span>
            <span className="text-sm font-light tracking-wider uppercase inline-block pl-12">
              <span className="text-champagne-400 mr-2">★</span>
              {text}
              <span className="text-champagne-400 ml-2">★</span>
            </span>
            <span className="text-sm font-light tracking-wider uppercase inline-block pl-12">
              <span className="text-champagne-400 mr-2">★</span>
              {text}
              <span className="text-champagne-400 ml-2">★</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoStrip; 