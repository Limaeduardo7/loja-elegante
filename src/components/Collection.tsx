import { useState, useEffect } from 'react';
import { ShoppingBag, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../lib/services';
import { getOrCreateCart, addToCart } from '../lib/services/cartService';
import { Product, Category } from '../types/product';
import { PromoCards } from './PromoBanner';
import { toast } from 'react-hot-toast';
// Tipo para filtros
type FilterOptions = {
  categories: string[];
  priceRange: { min: number; max: number };
  tags: string[];
  material: string | null;
  sizes: string[];
  colors: string[];
};

// Tamanhos disponíveis
const availableSizes = ["P", "M", "G", "GG", "35", "36", "37", "38", "39", "40", "42", "44"];

const ProductCard = ({ product, onAddToCart }: { product: Product, onAddToCart: (productId: string) => void }) => {
  const [hovering, setHovering] = useState(false);
  const navigate = useNavigate();
  
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);
  
  // Calcular preço com desconto, se houver
  const finalPrice = product.discount_percent 
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;
    
  // Formatar preço com desconto
  const discountedPrice = product.discount_percent 
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(finalPrice)
    : null;
    
  // Calcular e formatar valor parcelado em 10x sem juros
  const installmentPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(finalPrice / 10);
  const handleClick = () => {
    navigate(`/produto/${product.id}`);
  };
  
  return (
    <div 
      className="relative group overflow-hidden h-full cursor-pointer"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Badges / Etiquetas */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.is_new && (
          <div className="bg-champagne-500 text-white text-xs px-2 py-1">
            Novo
          </div>
        )}
        {product.features?.includes('destaque') && (
          <div className="bg-champagne-600 text-white text-xs px-2 py-1">
            Mais Vendido
          </div>
        )}
        {!product.in_stock && (
          <div className="bg-red-600 text-white text-xs px-2 py-1">
            Esgotado
          </div>
        )}
        {product.discount_percent && (
          <div className="bg-champagne-500 text-white text-xs px-2 py-1">
            {product.discount_percent}% OFF
          </div>
        )}
      </div>

      {/* Imagem do produto */}
      <div className="aspect-[3/4] overflow-hidden bg-gray-50">
        <img
          onClick={handleClick}
          src={product.mainImage || ''}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            hovering ? 'scale-110' : 'scale-100'
          }`}
        />
      </div>

      {/* Informações do produto */}
      <div className="p-4 bg-white">
        {/* Categoria */}
        <div className="mb-1">
          <span className="text-xs text-gray-500">
            {product.category?.name || 'Sem categoria'}
          </span>
        </div>

        <h3 
          onClick={handleClick}
          className="text-gray-800 font-light text-md mb-1 hover:text-champagne-500 transition-colors font-title text-left"
        >
          {product.name}
        </h3>
        
        <div className="flex flex-col items-start">
          <div className="flex items-center space-x-2">
            {discountedPrice ? (
              <>
                <span className="text-champagne-600 font-bold">{discountedPrice}</span>
                <span className="text-gray-400 text-sm line-through">{formattedPrice}</span>
              </>
            ) : (
              <span className="text-gray-800 font-bold">{formattedPrice}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 font-text text-left">
            ou 10x de {installmentPrice} sem juros
          </p>
        </div>
      </div>

      {/* Botão de adicionar ao carrinho (aparece no hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(product.id);
        }}
        className={`absolute bottom-0 left-0 right-0 bg-black text-white py-3 flex justify-center items-center space-x-2 transition-transform duration-300 ${
          hovering ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <ShoppingBag size={16} />
        <span className="text-sm font-medium">Adicionar ao Carrinho</span>
      </button>
    </div>
  );
};
const Collection = () => {
  const [searchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: { min: 0, max: 5000 },
    tags: [],
    material: null,
    sizes: [],
    colors: []
  });
  
  // Estados para produtos e categorias
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const productsPerPage = 9;

  // Estados para dados dos filtros
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  // Obter categoria da URL
  const categoriaSlug = searchParams.get('categoria');

  // Marcar categoria nos filtros quando vier pela URL
  useEffect(() => {
    if (categoriaSlug && categories.length > 0) {
      // Procurar a categoria pelo slug
      const category = categories.find(cat => cat.slug === categoriaSlug);
      if (category) {
        // Se encontrou a categoria, marcar ela nos filtros
        setFilters(prev => ({
          ...prev,
          categories: [category.id]
        }));
      } else {
        // Se não encontrou como categoria principal, procurar nas subcategorias
        for (const mainCategory of categories) {
          const subcategory = mainCategory.subcategories?.find(sub => sub.slug === categoriaSlug);
          if (subcategory) {
            // Se encontrou a subcategoria, marcar ela nos filtros
            setFilters(prev => ({
              ...prev,
              categories: [subcategory.id]
            }));
            break;
          }
        }
      }
    }
  }, [categoriaSlug, categories]);

  // Limpar filtros quando a URL mudar
  useEffect(() => {
    // Se não tiver categoria na URL, limpar os filtros
    if (!categoriaSlug) {
      setFilters({
        categories: [],
        priceRange: { min: 0, max: 5000 },
        tags: [],
        material: null,
        sizes: [],
        colors: []
      });
    }
  }, [categoriaSlug]);

  // Carregar produtos e categorias do banco de dados
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Buscar categorias
        const { data: categoriesData, error: categoriesError } = await getCategories();
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Encontrar o ID da categoria pelo slug
        let categoryId = null;
        if (categoriaSlug) {
          const category = categoriesData?.find((cat: Category) => cat.slug === categoriaSlug);
          if (category) {
            categoryId = category.id.toString();
          }
        }
        
        // Verificar se há filtros ativos para aplicá-los à consulta
        const hasActiveFilters = 
          filters.categories.length > 0 || 
          filters.tags.length > 0 ||
          filters.material !== null ||
          filters.sizes.length > 0 || 
          filters.colors.length > 0;
        
        console.log('Filtros ativos:', hasActiveFilters, filters);
        
        // Buscar produtos com filtros aplicados
        const { data: productsData, count, totalPages: pages, error: productsError } = await getProducts({
          page: currentPage,
          categoryId: categoryId,
          categoryIds: hasActiveFilters && filters.categories.length > 0 ? filters.categories : null,
          orderBy: 'created_at',
          orderDirection: 'desc',
          priceRange: filters.priceRange,
          tags: filters.tags,
          material: filters.material,
          sizes: filters.sizes,
          colors: filters.colors
        });
        
        if (productsError) throw productsError;
        
        console.log('Produtos carregados na coleção:', productsData?.length || 0);
        setProducts(productsData || []);
        setTotalItems(count || 0);
        setTotalPages(pages || 1);

        // Extrair dados únicos para os filtros
        const uniqueTags = new Set<string>();
        const uniqueMaterials = new Set<string>();
        const uniqueSizes = new Set<string>();
        const uniqueColors = new Set<string>();

        productsData?.forEach((product: Product) => {
          // Tags
          product.tags?.forEach((tag: string) => uniqueTags.add(tag));
          
          // Material
          if (product.material) {
            uniqueMaterials.add(product.material);
          }
          
          // Sizes
          product.sizes?.forEach((size: string) => uniqueSizes.add(size));
          
          // Colors
          product.colors?.forEach((color: string) => uniqueColors.add(color));
        });

        setAvailableTags(Array.from(uniqueTags).sort());
        setAvailableMaterials(Array.from(uniqueMaterials).sort());
        setAvailableSizes(Array.from(uniqueSizes).sort());
        setAvailableColors(Array.from(uniqueColors).sort());

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar produtos. Por favor, tente novamente.');
      }
      setLoading(false);
    };
    
    fetchData();
  }, [currentPage, filters, categoriaSlug]);  // Mudar página
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Próxima página
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Página anterior
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Quando os filtros mudam, resetar para a primeira página
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const toggleCategory = (categoryId: string) => {
    setFilters(prev => ({
          ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: { min: 0, max: 5000 },
      tags: [],
      material: null,
      sizes: [],
      colors: []
    });
  };

  // Funções auxiliares para manipulação dos filtros
  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const toggleSize = (size: string) => {
    setFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const toggleColor = (color: string) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const { cart } = await getOrCreateCart();
      if (!cart) {
        throw new Error('Não foi possível obter o carrinho');
      }
      
      const { success, error } = await addToCart(cart.id, productId, 1);
      if (!success) {
        throw error;
      }
      
      toast.success('Produto adicionado ao carrinho!');
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      toast.error('Erro ao adicionar produto ao carrinho');
    }
  };  // Componente de painel de filtros
  const FilterPanel = () => (
    <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-sm">
      {/* Categorias */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Categorias</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category.id} className="space-y-2">
              <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-champagne-500 rounded focus:ring-champagne-500"
                checked={filters.categories.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
              />
                <span className="ml-2 text-gray-700 font-medium">{category.name}</span>
              </label>
              
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="ml-6 space-y-2">
                  {category.subcategories.map(subcategory => (
                    <label key={subcategory.id} className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-champagne-500 rounded focus:ring-champagne-500"
                        checked={filters.categories.includes(subcategory.id)}
                        onChange={() => toggleCategory(subcategory.id)}
                      />
                      <span className="ml-2 text-gray-700 font-light">{subcategory.name}</span>
            </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Preço */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Preço</h3>
        <div className="px-2">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">R$ {filters.priceRange.min}</span>
            <span className="text-sm text-gray-500">R$ {filters.priceRange.max}</span>
          </div>
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={filters.priceRange.max}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              priceRange: { ...prev.priceRange, max: parseInt(e.target.value) }
            }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-champagne-500"
          />
        </div>
      </div>
      
      {/* Tags */}
      {availableTags.length > 0 && (
      <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Tags</h3>
        <div className="space-y-2">
            {availableTags.map(tag => (
              <label key={tag} className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-champagne-500 rounded focus:ring-champagne-500"
                  checked={filters.tags.includes(tag)}
                  onChange={() => toggleTag(tag)}
            />
                <span className="ml-2 text-gray-700 font-light">{tag}</span>
          </label>
            ))}
          </div>
        </div>
      )}

      {/* Material */}
      {availableMaterials.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Material</h3>
          <div className="space-y-2">
            {availableMaterials.map(material => (
              <label key={material} className="flex items-center">
            <input
                  type="radio"
                  className="form-radio h-4 w-4 text-champagne-500 rounded focus:ring-champagne-500"
                  checked={filters.material === material}
                  onChange={() => setFilters(prev => ({ ...prev, material }))}
            />
                <span className="ml-2 text-gray-700 font-light">{material}</span>
          </label>
            ))}
          </div>
        </div>
      )}
      
      {/* Tamanhos */}
      {availableSizes.length > 0 && (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Tamanhos</h3>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`h-8 w-10 text-xs border rounded-md ${
                filters.sizes.includes(size)
                  ? 'bg-champagne-500 text-white border-champagne-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-champagne-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      )}
      
      {/* Cores */}
      {availableColors.length > 0 && (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Cores</h3>
        <div className="flex flex-wrap gap-2">
          {availableColors.map(color => (
            <button
              key={color}
              onClick={() => toggleColor(color)}
              className={`h-6 w-6 rounded-full border ${
                filters.colors.includes(color) ? 'ring-2 ring-champagne-500 ring-offset-2' : ''
              }`}
              style={{ backgroundColor: color.toLowerCase() }}
              title={color}
            />
          ))}
        </div>
      </div>
      )}
      
      {/* Botões de ação */}
      <div className="space-y-2">
        <button
          onClick={clearFilters}
          className="w-full py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Limpar Filtros
        </button>
        
        <button
          onClick={() => setFilters({
            categories: [],
            priceRange: { min: 0, max: 5000 },
            tags: [],
            material: null,
            sizes: [],
            colors: []
          })}
          className="w-full py-2 bg-champagne-500 text-white rounded-md hover:bg-champagne-600 transition-colors"
        >
          Mostrar Todos os Produtos
        </button>
      </div>
    </div>
  );  return (
    <section className="py-16 bg-white mt-16">
      {/* SEO: Meta título e descrição */}
      <div className="hidden">
        <h1>Coleção Exclusiva de Moda Feminina - Use Lamone</h1>
        <meta name="description" content="Descubra nossa coleção exclusiva de peças femininas elegantes. Vestidos, blusas, calças e acessórios com qualidade premium e estilo atemporal." />
      </div>
      
      {/* Cabeçalho da Coleção */}
      <div className="container-custom mb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-light text-center mb-4 tracking-wider">
          Nossa <span className="text-champagne-500">Coleção</span>
        </h1>
        <p className="text-gray-600 text-center max-w-3xl mx-auto font-light">
          Explore nossa coleção exclusiva de peças elegantes e sofisticadas, 
          criadas para mulheres que valorizam qualidade e estilo atemporal.
        </p>
      </div>

      {/* Faixa promocional com três cards */}
      <PromoCards />

      <div className="container-custom px-4 mt-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros - Versão Desktop */}
          <div className="hidden lg:block lg:w-1/4">
            <FilterPanel />
          </div>

          {/* Produtos */}
          <div className="lg:w-3/4">
            {/* Barra superior com contagem e botão de filtro mobile */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600 font-light">
                Exibindo <span className="font-medium">{totalItems}</span> produtos
                {filters.categories.length > 0 && (
                  <span className="ml-2">(Filtrado por categoria)</span>
                )}
              </p>
              <button 
                className="lg:hidden flex items-center text-sm bg-white border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <Filter size={16} className="mr-2" />
                Filtros
              </button>
            </div>

            {/* Estado de carregamento */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin border-t-2 border-b-2 border-rose-300"></div>
              </div>
            )}

            {/* Mensagem de erro */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-champagne-500 text-white rounded-md hover:bg-champagne-600"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Grade de produtos */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

            {/* Mensagem quando não há produtos */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 font-light">
                  Nenhum produto encontrado com os filtros selecionados.
                </p>
                <button 
                  onClick={clearFilters}
                  className="mt-4 text-champagne-500 underline font-light"
                >
                  Limpar filtros
                </button>
              </div>
            )}
            
            {/* Paginação */}
            {!loading && !error && products.length > 0 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full border ${
                      currentPage === 1 
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
                        : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  {/* Números de página */}
                  {Array.from({ length: totalPages }).map((_, index) => {
                    // Mostrar apenas 5 páginas no máximo
                    if (
                      index === 0 || 
                      index === totalPages - 1 || 
                      (index >= currentPage - 2 && index <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`w-8 h-8 flex items-center justify-center rounded ${
                            currentPage === index + 1
                              ? 'bg-champagne-500 text-white'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      );
                    } else if (
                      (index === currentPage - 3 && currentPage > 3) || 
                      (index === currentPage + 3 && currentPage < totalPages - 2)
                    ) {
                      return <span key={index} className="text-gray-500">...</span>;
                    } else {
                      return null;
                    }
                  })}
                  
                  <button 
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full border ${
                      currentPage === totalPages 
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
                        : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de filtros mobile */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-80 h-full overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-medium">Filtros</h2>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <FilterPanel />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Collection;