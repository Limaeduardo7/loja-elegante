import { useEffect, useRef, useState, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const sliderItems = [
  {
    id: 1,
    title: 'Coleção Inverno 2025',
    description: 'Peças leves e elegantes para os dias mais frios',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1374',
    btnText: 'Explorar coleção',
    btnLink: '#'
  },
  {
    id: 2,
    title: 'Acessórios exclusivos',
    description: 'Complete seu look com nossas peças selecionadas',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1470',
    btnText: 'Ver acessórios',
    btnLink: '#'
  },
  {
    id: 3,
    title: 'Novas tendências',
    description: 'Descubra as peças que serão tendência nesta estação',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1470',
    btnText: 'Ver novidades',
    btnLink: '#'
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  const startSlideTimer = () => {
    stopSlideTimer();
    slideInterval.current = window.setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % sliderItems.length);
    }, 5000);
  };
  
  const stopSlideTimer = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
  };
  
  useEffect(() => {
    startSlideTimer();
    return () => stopSlideTimer();
  }, []);
  
  const goToPrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + sliderItems.length) % sliderItems.length);
    startSlideTimer();
  };
  
  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % sliderItems.length);
    startSlideTimer();
  };
  
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    startSlideTimer();
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
      goToNextSlide();
    } else if (touchDiff < -minSwipeDistance) {
      // Swipe para a direita - slide anterior
      goToPrevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden hero-slider"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {sliderItems.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="relative w-full h-full">
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center max-w-2xl px-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-light mb-4 tracking-wider">
                  {item.title}
                </h1>
                <p className="text-xl text-white font-light mb-8 tracking-wide">
                  {item.description}
                </p>
                <a
                  href={item.btnLink}
                  className="inline-block bg-white bg-opacity-70 hover:bg-opacity-90 text-black px-8 py-3 font-light tracking-wide rounded-full transition-all"
                >
                  {item.btnText}
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Controles de navegação - visíveis apenas em desktop */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-25 hover:bg-opacity-50 rounded-full p-2 text-white transition-all hidden md:block"
        onClick={goToPrevSlide}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-25 hover:bg-opacity-50 rounded-full p-2 text-white transition-all hidden md:block"
        onClick={goToNextSlide}
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicadores de slide */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {sliderItems.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white scale-110' : 'bg-white bg-opacity-50'
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero; 