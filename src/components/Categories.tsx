import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../lib/services/categoryService';
import { Category } from '../types/product';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await getCategories();
        
        if (error) throw error;
        
        // Usar todas as categorias do banco de dados
        setCategories(data || []);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setError('Falha ao carregar categorias');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Exibir um indicador de carregamento
  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="container-custom">
          <div className="text-center">
            <div className="animate-pulse text-champagne-500">Carregando categorias...</div>
          </div>
        </div>
      </section>
    );
  }

  // Exibir mensagem de erro, se houver
  if (error) {
    return (
      <section className="bg-white py-16">
        <div className="container-custom">
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
    <section className="bg-white py-16">
      <div className="container-custom px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="relative group overflow-hidden rounded-lg h-80 cursor-pointer"
              onClick={() => navigate(`/colecao?categoria=${category.slug}`)}
            >
              <img
                src={category.image_url || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1374'} // Imagem padrão caso não tenha
                alt={category.name}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              />
              
              <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300 flex flex-col justify-end p-6">
                <div className="transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                  <h3 className="text-2xl font-light text-white mb-2 tracking-wider">{category.name}</h3>
                  <p className="text-white text-sm font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-4">{category.description || 'Explore nossa coleção exclusiva'}</p>
                  <button className="bg-champagne-500 hover:bg-champagne-600 text-white py-2 px-6 inline-block transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 font-light">
                    Explorar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories; 