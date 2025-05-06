import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFeaturedProducts, clearFeaturedProductCache } from '../lib/services/productService';
import { Product } from '../types/product';
import { supabase } from '../lib/supabase';

// Props para o componente
type FeaturedProductsProps = {
  onViewAllClick?: () => void;
};

// Tipo estendido para incluir propriedades da API
interface ProductWithCategory extends Product {
  category?: {
    id: string;
    name: string;
  };
}

const ProductCard = ({ product }: { product: ProductWithCategory }) => {
  const [hovering, setHovering] = useState(false);
  const navigate = useNavigate();
  
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);
  
  // Calcular preço final com desconto (se houver)
  const finalPrice = product.discount_percent
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;
    
  const formattedFinalPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(finalPrice);
  
  const handleClick = () => {
    navigate(`/produto/${product.id}`);
  };
  
  return (
    <div 
      className="relative group overflow-hidden cursor-pointer"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={handleClick}
    >
      <div className="aspect-[2/3] overflow-hidden">
        <img 
          src={product.mainImage || 'https://placehold.co/400x600/png?text=Imagem+não+disponível'} 
          alt={product.name} 
          className={`w-full h-full object-cover transition-all duration-700 ${hovering ? 'scale-110' : 'scale-100'}`}
        />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-3 transform transition-transform duration-300 translate-y-full group-hover:translate-y-0">
        {product.category?.name && (
          <p className="text-sm font-light text-champagne-600 mb-1">{product.category.name}</p>
        )}
        <h3 className="text-lg font-light mb-1 text-gray-900">{product.name}</h3>
        <div className="flex justify-between items-center">
          <div>
            {product.discount_percent ? (
              <div className="flex flex-col">
                <p className="text-gray-500 line-through text-xs">{formattedPrice}</p>
                <p className="text-champagne-600 font-light">{formattedFinalPrice}</p>
              </div>
            ) : (
              <p className="text-champagne-600 font-light">{formattedPrice}</p>
            )}
          </div>
          <button 
            className="bg-champagne-500 bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full transition-all"
            onClick={(e) => {
              e.stopPropagation();
              // Implementar adição ao carrinho aqui
            }}
          >
            <ShoppingBag size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

const FeaturedProducts = ({ onViewAllClick }: FeaturedProductsProps) => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const checkProductsDirectly = async () => {
    try {
      console.log("Verificando produtos diretamente no banco...");
      setDebugInfo("Verificando produtos...");

      // Buscar todos os produtos
      const { data: allProducts, error: productError } = await supabase
        .from('products')
        .select('id, name, features')
        .eq('is_active', true);

      if (productError) {
        console.error("Erro ao buscar produtos:", productError);
        setDebugInfo(`Erro: ${productError.message}`);
        return;
      }

      console.log("Total de produtos ativos:", allProducts?.length || 0);

      // Verificar features de cada produto
      const featuresInfo = allProducts?.map(p => ({
        id: p.id,
        name: p.name,
        features: p.features,
        isDestaque: Array.isArray(p.features) && p.features.includes('destaque')
      }));

      const featuredCount = featuresInfo?.filter(p => p.isDestaque).length || 0;

      console.log("Produtos com 'destaque' nas features:", featuredCount);
      console.log("Detalhes dos produtos:", featuresInfo);

      setDebugInfo(`Total: ${allProducts?.length || 0}, Em destaque: ${featuredCount}. Veja console para mais detalhes.`);

      // Se não encontrou produtos em destaque, vamos tentar recarregar
      if (featuredCount > 0 && products.length === 0) {
        console.log("Encontrou produtos em destaque no banco, mas não estão carregados. Tentando recarregar...");
        clearFeaturedProductCache();
        loadFeaturedProducts();
      }
    } catch (error) {
      console.error("Erro durante verificação:", error);
      setDebugInfo(`Erro durante verificação: ${(error as Error).message}`);
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      
      // Limpar o cache para garantir dados atualizados
      clearFeaturedProductCache();
      
      const { data, error } = await getFeaturedProducts(4); // Limite de 4 produtos
      
      if (error) throw error;
      
      setProducts(data || []);
      
      console.log('Produtos em destaque carregados:', data?.length || 0);
      if (data && data.length === 0) {
        console.log('Nenhum produto em destaque encontrado. Verifique se há produtos marcados com "destaque" no array features.');
      }
    } catch (err) {
      console.error('Erro ao carregar produtos em destaque:', err);
      setError('Não foi possível carregar os produtos em destaque');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-6 bg-white">
        <div className="container-custom px-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-wide">
              <span className="text-champagne-500">Destaques</span> da Coleção
            </h2>
          </div>
          <div className="flex justify-center items-center py-16">
            <div className="animate-pulse text-champagne-500">Carregando produtos em destaque...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !products.length) {
    return (
      <section className="py-6 bg-white">
        <div className="container-custom px-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-wide">
              <span className="text-champagne-500">Destaques</span> da Coleção
            </h2>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum produto em destaque disponível no momento.</p>
            
            <div className="mt-6">
              <button 
                onClick={checkProductsDirectly}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Verificar Produtos
              </button>
              
              {debugInfo && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md text-sm text-left">
                  <p className="font-semibold">Resultado da verificação:</p>
                  <p>{debugInfo}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 bg-white">
      <div className="container-custom px-0">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-wide">
            <span className="text-champagne-500">Destaques</span> da Coleção
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="text-center mt-8">
          <button 
            onClick={onViewAllClick}
            className="inline-block bg-white border border-champagne-500 bg-opacity-70 hover:bg-champagne-500 hover:bg-opacity-10 text-champagne-500 px-8 py-3 font-light tracking-wide rounded-full transition-all cursor-pointer"
          >
            Ver Todos
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts; 