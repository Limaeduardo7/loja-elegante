import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../lib/services/categoryService';
import { Category } from '../types/product';
import { CreditCard, Truck, Percent, ChevronLeft, ChevronRight } from 'lucide-react';

export const PromoCards = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef<number | null>(null);
  
  const promoItems = [
    {
      id: 1,
      title: 'GANHE 5% OFF NO PIX',
      subtitle: 'PAGAMENTO À VISTA',
      description: 'EM TODO SITE',
      icon: <Percent className="w-8 h-8 md:w-6 md:h-6 text-champagne-500" strokeWidth={1.5} />
    },
    {
      id: 2,
      title: 'FRETE GRÁTIS',
      subtitle: 'ACIMA DE R$300,00',
      description: 'PARA TODO BRASIL',
      icon: <Truck className="w-8 h-8 md:w-6 md:h-6 text-champagne-500" strokeWidth={1.5} />
    },
    {
      id: 3,
      title: 'PARCELAMENTO EM ATÉ 6X',
      subtitle: 'SEM JUROS',
      description: 'ACIMA DE R$500,00',
      icon: <CreditCard className="w-8 h-8 md:w-6 md:h-6 text-champagne-500" strokeWidth={1.5} />
    }
  ];
  
  const startSlideTimer = () => {
    stopSlideTimer();
    slideInterval.current = window.setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % promoItems.length);
    }, 4000);
  };
  
  const stopSlideTimer = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
  };
  
  useEffect(() => {
    // Iniciar o timer apenas se a tela for menor que 768px (mobile)
    const handleResize = () => {
      if (window.innerWidth < 768) {
        startSlideTimer();
      } else {
        stopSlideTimer();
      }
    };
    
    // Verificar o tamanho inicial
    handleResize();
    
    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', handleResize);
    
    // Limpar listener e timer
    return () => {
      window.removeEventListener('resize', handleResize);
      stopSlideTimer();
    };
  }, []);
  
  const goToPrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + promoItems.length) % promoItems.length);
    startSlideTimer();
  };
  
  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % promoItems.length);
    startSlideTimer();
  };
  
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    startSlideTimer();
  };

  // Função para renderizar um card de benefício
  const renderPromoCard = (item: typeof promoItems[0]) => (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="bg-white p-5 md:p-3 rounded-full mb-8 md:mb-6 shadow-sm border border-gray-50 inline-flex">
        {item.icon}
      </div>
      <div className="text-center">
        <h3 className="font-light text-lg md:text-sm lg:text-sm mb-3 md:mb-2 text-gray-800 tracking-wide">{item.title}</h3>
        <p className="text-gray-500 mb-2 text-xs md:text-[10px] lg:text-xs tracking-wider uppercase">{item.subtitle}</p>
        <p className="text-champagne-600 font-medium text-base md:text-xs lg:text-xs mt-2 md:mt-1">{item.description}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto mb-10 md:mb-8 mt-4 md:mt-6 px-4 max-w-7xl">
      <div className="relative bg-gray-50 rounded-xl shadow-sm py-10 md:py-8 px-4 md:px-6 border border-gray-100 md:h-48 mt-6">
        {/* Título da seção */}
        <div className="absolute -top-4 md:-top-3.5 left-1/2 transform -translate-x-1/2 bg-white px-5 md:px-6 py-2 md:py-1.5 rounded-full shadow-sm border border-gray-100">
          <h2 className="text-xs md:text-xs font-light tracking-widest text-gray-500 whitespace-nowrap">BENEFÍCIOS</h2>
        </div>
        
        {/* Desktop - Todos os cards visíveis */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-4 h-full w-full">
          {promoItems.map((item, index) => (
            <div 
              key={item.id} 
              className={`h-full flex items-center justify-center ${
                index === 1 ? 'border-l border-r border-gray-200' : ''
              }`}
            >
              {renderPromoCard(item)}
            </div>
          ))}
        </div>
        
        {/* Mobile - Carrossel */}
        <div className="md:hidden relative overflow-hidden min-h-[240px] pb-12">
          {promoItems.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-full -z-10'
              }`}
            >
              <div className="h-full flex flex-col items-center justify-center">
                {renderPromoCard(item)}
              </div>
            </div>
          ))}
          
          {/* Indicadores - apenas mobile */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 z-20">
            {promoItems.map((_, index) => (
              <button
                key={index}
                className={`transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-6 h-2 bg-champagne-500 rounded-full' 
                    : 'w-2 h-2 bg-gray-300 rounded-full'
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PromoBanner = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await getCategories();
        
        if (error) throw error;
        
        // Filtrar apenas categorias que estão ativas
        const activeCategories = data?.filter((category: Category) => category.is_active) || [];
        setCategories(activeCategories);
      } catch (err) {
        console.error('Erro ao carregar categorias para banner:', err);
        setError('Falha ao carregar categorias');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Se estiver carregando, mostrar um indicador
  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="container-custom">
          <div className="flex justify-center">
            <div className="animate-pulse text-champagne-500">Carregando categorias em destaque...</div>
          </div>
        </div>
      </section>
    );
  }

  // Se houver erro ou nenhuma categoria, não exibir a seção
  if (error || !categories.length) {
    return null;
  }

  // Pegar as três primeiras categorias (ou menos se não houver três)
  const mainCategory = categories[0] || null;
  const secondaryCategory1 = categories[1] || null;
  const secondaryCategory2 = categories[2] || null;

  // Se não tiver pelo menos uma categoria, não mostrar nada
  if (!mainCategory) {
    return null;
  }

  return (
    <section className="bg-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row gap-0">
          {/* Banner principal (primeira categoria) */}
          <div 
            className="md:w-2/3 relative overflow-hidden group cursor-pointer"
            onClick={() => navigate(`/colecao?categoria=${mainCategory.slug}`)}
          >
            <div className="h-[90vh] overflow-hidden">
              <img 
                src={mainCategory.image_url || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070"} 
                alt={mainCategory.name} 
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-102"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-8">
              <div className="transform transition-transform duration-300">
                <span className="bg-champagne-500 text-white text-sm px-3 py-1 mb-4 inline-block font-light">CATEGORIA EM DESTAQUE</span>
                <h3 className="text-3xl md:text-4xl font-light text-white mb-3 tracking-wider">{mainCategory.name}</h3>
                <button className="bg-white hover:bg-champagne-400 text-black hover:text-white py-3 px-8 inline-block transition-colors duration-300 font-light">
                  Explorar Categoria
                </button>
              </div>
            </div>
          </div>
          
          {/* Banners verticais laterais (segunda e terceira categorias) */}
          <div className="md:w-1/3 flex flex-col">
            {secondaryCategory1 && (
              <div 
                className="relative overflow-hidden group h-[45vh] cursor-pointer"
                onClick={() => navigate(`/colecao?categoria=${secondaryCategory1.slug}`)}
              >
                <img 
                  src={secondaryCategory1.image_url || "https://images.unsplash.com/photo-1722340321190-1c7b7384e89b?q=80&w=2070"} 
                  alt={secondaryCategory1.name} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6">
                  <div>
                    <h3 className="text-xl font-light text-white mb-2 tracking-wider">{secondaryCategory1.name}</h3>
                    <button className="text-white hover:text-champagne-400 text-sm font-light flex items-center transition-colors duration-300">
                      Ver Categoria
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {secondaryCategory2 && (
              <div 
                className="relative overflow-hidden group h-[45vh] cursor-pointer"
                onClick={() => navigate(`/colecao?categoria=${secondaryCategory2.slug}`)}
              >
                <img 
                  src={secondaryCategory2.image_url || "https://images.unsplash.com/photo-1632761298177-51e35403e27e?q=80&w=1952"} 
                  alt={secondaryCategory2.name} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6">
                  <div>
                    <h3 className="text-xl font-light text-white mb-2 tracking-wider">{secondaryCategory2.name}</h3>
                    <button className="text-white hover:text-champagne-400 text-sm font-light flex items-center transition-colors duration-300">
                      Ver Categoria
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner; 