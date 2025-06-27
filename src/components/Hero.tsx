import { useEffect, useRef, useState, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getActiveBanners, HeroBanner } from '../lib/services/bannerService';

const Hero = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const slideInterval = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getActiveBanners();
        setBanners(data);
      } catch (err) {
        console.error('Erro ao carregar banners:', err);
        setError('Erro ao carregar banners');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);
  
  const startSlideTimer = () => {
    stopSlideTimer();
    slideInterval.current = window.setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
    }, 5000);
  };
  
  const stopSlideTimer = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
  };
  
  useEffect(() => {
    if (banners.length > 0) {
      startSlideTimer();
    }
    return () => stopSlideTimer();
  }, [banners]);
  
  const goToPrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + banners.length) % banners.length);
    startSlideTimer();
  };
  
  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
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

  // Função para lidar com a navegação ao clicar no botão
  const handleButtonClick = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="relative w-full h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-champagne-500">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div 
      className="relative w-full h-screen overflow-hidden hero-slider"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="relative w-full h-full">
            <img
              src={banner.image_url}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center max-w-2xl px-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-light mb-4 tracking-wider font-title">
                  {banner.title}
                </h1>
                <p className="text-xl text-white font-light mb-8 tracking-wide font-text">
                  {banner.description}
                </p>
                <button
                  onClick={() => handleButtonClick(banner.button_link)}
                  className="inline-block bg-champagne-500 hover:bg-champagne-600 text-white px-8 py-4 font-medium tracking-wide rounded-full transition-all transform hover:scale-105 hover:shadow-lg"
                >
                  {banner.button_text}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Controles de navegação - visíveis apenas em desktop */}
      {banners.length > 1 && (
        <>
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
            {banners.map((_, index) => (
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
        </>
      )}
    </div>
  );
};

export default Hero; 