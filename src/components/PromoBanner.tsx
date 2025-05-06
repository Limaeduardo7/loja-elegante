import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../lib/services/categoryService';
import { Category } from '../types/product';

export const PromoCards = () => {
  return (
    <div className="container-custom mb-14 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Card 1 */}
        <div className="bg-white text-gray-800 p-6 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-gray-200 shadow-sm">
          <h3 className="font-medium text-lg mb-2">GANHE 5% OFF NO PIX</h3>
          <p className="text-gray-600 mb-1">PAGAMENTO À VISTA</p>
          <p className="text-champagne-600 font-semibold text-xl">EM TODO SITE</p>
        </div>
        
        {/* Card 2 */}
        <div className="bg-gray-100 text-gray-800 p-6 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-gray-200 shadow-sm">
          <h3 className="font-medium text-lg mb-2">FRETE GRÁTIS</h3>
          <p className="text-gray-600 mb-1">ACIMA DE R$300,00</p>
          <p className="text-champagne-600 font-semibold">PARA TODO BRASIL</p>
        </div>
        
        {/* Card 3 */}
        <div className="bg-white text-gray-800 p-6 flex flex-col justify-center items-center text-center shadow-sm">
          <h3 className="font-medium text-lg mb-2">PARCELAMENTO EM ATÉ 6X</h3>
          <p className="text-gray-600 mb-1">SEM JUROS</p>
          <p className="text-champagne-600 font-semibold">ACIMA DE R$500,00</p>
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