import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories } from '../lib/services/categoryService';
import { Category } from '../types/product';

const FeaturedCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await getCategories();
        
        if (error) throw error;
        
        // Obter até 3 categorias (ou menos se não houver 3)
        // Ideal seria ter um campo is_featured na tabela categories
        setCategories(data?.slice(0, 3) || []);
      } catch (err) {
        console.error('Erro ao carregar categorias em destaque:', err);
        setError('Falha ao carregar categorias em destaque');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Exibir um indicador de carregamento
  if (loading) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="container-custom px-4">
          <div className="text-center">
            <div className="animate-pulse text-champagne-500">Carregando categorias em destaque...</div>
          </div>
        </div>
      </section>
    );
  }

  // Exibir mensagem de erro, se houver
  if (error) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="container-custom px-4">
          <div className="text-center text-red-500">
            {error}
          </div>
        </div>
      </section>
    );
  }

  // Se não houver categorias, não exibe a seção
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="container-custom px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-3 tracking-wide">
            Categorias em <span className="text-champagne-500">Destaque</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto font-light">
            Explore nossas seleções especiais de produtos organizados para facilitar sua experiência de compra
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={category.image_url || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1374'} 
                  alt={category.name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-white text-champagne-600 font-semibold py-1 px-4 rounded-full text-sm">
                  {category.name}
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 font-light mb-4">
                  {category.description || `Explore nossa coleção de ${category.name.toLowerCase()}`}
                </p>
                <Link 
                  to={`/colecao?categoria=${category.slug}`}
                  className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors font-medium"
                >
                  Explorar <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories; 