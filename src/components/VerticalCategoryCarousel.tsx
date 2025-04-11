import { useState, useRef, useEffect, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  {
    id: 1,
    name: 'Vestidos',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1376',
    description: 'Elegância em cada detalhe'
  },
  {
    id: 2,
    name: 'Blusas',
    image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=1374',
    description: 'Conforto com estilo'
  },
  {
    id: 3,
    name: 'Acessórios',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=1374',
    description: 'Detalhes que fazem a diferença'
  },
  {
    id: 4,
    name: 'Calçados',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1480',
    description: 'Passos de sofisticação'
  },
  {
    id: 5,
    name: 'Bolsas',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1335',
    description: 'Praticidade elegante'
  },
  {
    id: 6,
    name: 'Jeans',
    image: 'https://images.unsplash.com/photo-1604176424472-4022da2d054a?q=80&w=1974',
    description: 'O clássico reinventado'
  }
];

const VerticalCategoryCarousel = () => {
  const [startIndex, setStartIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState(4);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const updateVisibleItems = () => {
      if (window.innerWidth >= 1280) {
        setVisibleItems(5);
      } else if (window.innerWidth >= 1024) {
        setVisibleItems(4);
      } else if (window.innerWidth >= 768) {
        setVisibleItems(3);
      } else if (window.innerWidth >= 640) {
        setVisibleItems(2);
      } else {
        setVisibleItems(1);
      }
    };

    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);
    
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, []);

  const scrollLeft = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    } else {
      setStartIndex(categories.length - visibleItems);
    }
  };

  const scrollRight = () => {
    if (startIndex < categories.length - visibleItems) {
      setStartIndex(startIndex + 1);
    } else {
      setStartIndex(0);
    }
  };

  const displayedCategories = () => {
    const items = [];
    for (let i = 0; i < visibleItems; i++) {
      const index = (startIndex + i) % categories.length;
      items.push(categories[index]);
    }
    return items;
  };

  // Funções para detectar gestos de swipe
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const touchDiff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (touchDiff > minSwipeDistance) {
      // Swipe para a esquerda - próximo slide
      scrollRight();
    } else if (touchDiff < -minSwipeDistance) {
      // Swipe para a direita - slide anterior
      scrollLeft();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section className="bg-white py-12">
      <div className="container-custom px-0">
        <h2 className="text-3xl md:text-4xl font-light text-center mb-8 tracking-wide">
          Categorias
        </h2>
        
        <div className="relative">
          <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 shadow-md text-black hidden md:block"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div 
            ref={carouselRef}
            className="flex overflow-hidden"
            style={{ transition: 'transform 0.5s ease' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {displayedCategories().map((category) => (
              <div key={category.id} className="min-w-[260px] flex-1">
                <div className="group overflow-hidden relative h-[500px]">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300 flex flex-col justify-end p-6">
                    <h3 className="text-white text-2xl font-light tracking-wider mb-1">
                      {category.name}
                    </h3>
                    <p className="text-white font-light opacity-90 mb-3">
                      {category.description}
                    </p>
                    <a
                      href="#"
                      className="inline-block bg-white bg-opacity-70 hover:bg-opacity-90 text-black py-2 px-6 font-light tracking-wide max-w-max rounded-full transition-all"
                    >
                      Explorar
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 shadow-md text-black hidden md:block"
            aria-label="Próximo"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default VerticalCategoryCarousel; 