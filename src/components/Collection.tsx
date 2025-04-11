import { useState } from 'react';
import { ShoppingBag, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Tipos para o produto e filtros
type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
  isNew?: boolean;
  discount?: number;
};

type FilterOptions = {
  categories: string[];
  priceRange: [number, number];
  onlyNew: boolean;
  onlySale: boolean;
};

// Lista de produtos para a coleção
const collectionProducts: Product[] = [
  {
    id: 1,
    name: "Vestido Dourado Glamour",
    price: 1299.90,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1588",
    category: "Vestidos",
    tags: ["festa", "elegante"],
    isNew: true
  },
  {
    id: 2,
    name: "Conjunto Elegance",
    price: 1599.90,
    image: "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?q=80&w=1587",
    category: "Conjuntos",
    tags: ["casual", "versátil"],
    discount: 15
  },
  {
    id: 3,
    name: "Vestido Noite Estrelada",
    price: 1899.90,
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1587",
    category: "Vestidos",
    tags: ["festa", "noite"],
  },
  {
    id: 4,
    name: "Vestido Glam Noir",
    price: 1799.90,
    image: "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1635",
    category: "Vestidos",
    tags: ["social", "elegante"],
    isNew: true
  },
  {
    id: 5,
    name: "Blazer Moderno",
    price: 1499.90,
    image: "https://images.unsplash.com/photo-1598808503429-453a24b74e71?q=80&w=1635",
    category: "Blazers",
    tags: ["trabalho", "sofisticado"],
    discount: 10
  },
  {
    id: 6,
    name: "Calça Alfaiataria",
    price: 999.90,
    image: "https://images.unsplash.com/photo-1551854838-212c9a5ffde4?q=80&w=1635",
    category: "Calças",
    tags: ["trabalho", "clássico"],
  },
  {
    id: 7,
    name: "Blusa de Seda Premium",
    price: 899.90,
    image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=1635",
    category: "Blusas",
    tags: ["versatil", "elegante"],
    isNew: true
  },
  {
    id: 8,
    name: "Saia Midi Plissada",
    price: 1099.90,
    image: "https://images.unsplash.com/photo-1577900232427-18219b9166a0?q=80&w=1635",
    category: "Saias",
    tags: ["feminino", "sofisticado"],
    discount: 20
  },
  {
    id: 9,
    name: "Bolsa Elegance",
    price: 2199.90,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1635",
    category: "Acessórios",
    tags: ["acessórios", "luxo"],
    isNew: true
  },
  {
    id: 10,
    name: "Sapato Sofisticado",
    price: 1699.90,
    image: "https://images.unsplash.com/photo-1518049362265-d5b2a6e911b3?q=80&w=1635",
    category: "Calçados",
    tags: ["calçados", "salto"],
    discount: 5
  },
  {
    id: 11,
    name: "Colar Pérolas",
    price: 899.90,
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1635",
    category: "Acessórios",
    tags: ["jóias", "elegante"],
  },
  {
    id: 12,
    name: "Jaqueta Premium",
    price: 2299.90,
    image: "https://images.unsplash.com/photo-1548624313-0396c75e4b57?q=80&w=1635",
    category: "Jaquetas",
    tags: ["inverno", "casual"],
    isNew: true
  }
];

// Categorias disponíveis
const categories = [
  "Vestidos", "Conjuntos", "Blazers", "Calças", 
  "Blusas", "Saias", "Acessórios", "Calçados", "Jaquetas"
];

const ProductCard = ({ product }: { product: Product }) => {
  const [hovering, setHovering] = useState(false);
  const navigate = useNavigate();
  
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);
  
  const discountedPrice = product.discount 
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(product.price * (1 - product.discount / 100))
    : null;
  
  const handleClick = () => {
    navigate(`/produto/${product.id}`);
  };
  
  return (
    <div 
      className="relative group overflow-hidden h-full cursor-pointer"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={handleClick}
    >
      {product.isNew && (
        <div className="absolute top-3 left-3 z-10 bg-black text-white text-xs px-2 py-1">
          Novo
        </div>
      )}
      {product.discount && (
        <div className="absolute top-3 right-3 z-10 bg-gold-500 text-white text-xs px-2 py-1">
          -{product.discount}%
        </div>
      )}
      <div className="aspect-[2/3] overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className={`w-full h-full object-cover transition-all duration-700 ${hovering ? 'scale-110' : 'scale-100'}`}
        />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-3 transform transition-transform duration-300 translate-y-full group-hover:translate-y-0">
        <p className="text-sm font-light text-gold-600 mb-1">{product.category}</p>
        <h3 className="text-lg font-light mb-1 text-gray-900">{product.name}</h3>
        <div className="flex justify-between items-center">
          <div>
            {product.discount ? (
              <div>
                <p className="text-gray-500 font-light line-through text-sm">{formattedPrice}</p>
                <p className="text-gold-600 font-light">{discountedPrice}</p>
              </div>
            ) : (
              <p className="text-gold-600 font-light">{formattedPrice}</p>
            )}
          </div>
          <button 
            className="bg-gold-500 bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full transition-all"
            onClick={(e) => {
              e.stopPropagation(); // Evita que o clique se propague para o card
              alert(`Produto ${product.name} adicionado ao carrinho!`);
            }}
          >
            <ShoppingBag size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Collection = () => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, 5000],
    onlyNew: false,
    onlySale: false
  });

  // Aplicar os filtros na lista de produtos
  const filteredProducts = collectionProducts.filter(product => {
    // Filtro de categorias
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }
    
    // Filtro de faixa de preço
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }
    
    // Filtro de novidades
    if (filters.onlyNew && !product.isNew) {
      return false;
    }
    
    // Filtro de promoções
    if (filters.onlySale && !product.discount) {
      return false;
    }
    
    return true;
  });

  // Alternar filtro de categoria
  const toggleCategory = (category: string) => {
    setFilters(prev => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category]
        };
      }
    });
  };

  // Limpar todos os filtros
  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 5000],
      onlyNew: false,
      onlySale: false
    });
  };

  // Componente de filtros (versão desktop)
  const FilterPanel = () => (
    <div className="bg-white p-6 rounded-md border border-gray-100 shadow-sm h-fit sticky top-24">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-light text-black">Filtros</h3>
        <button 
          onClick={clearFilters}
          className="text-sm text-gold-500 hover:underline font-light"
        >
          Limpar
        </button>
      </div>
      
      {/* Categorias */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-800 mb-3">Categorias</h4>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${category}`}
                checked={filters.categories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="w-4 h-4 text-gold-500 rounded border-gray-300 focus:ring-gold-500"
              />
              <label 
                htmlFor={`category-${category}`}
                className="ml-2 text-sm font-light text-gray-700"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Faixa de preço */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-800 mb-3">Faixa de Preço</h4>
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={filters.priceRange[1]}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              priceRange: [prev.priceRange[0], parseInt(e.target.value)]
            }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">R$ 0</span>
            <span className="text-xs text-gray-500">
              R$ {filters.priceRange[1].toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
      
      {/* Outros filtros */}
      <div>
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="only-new"
            checked={filters.onlyNew}
            onChange={() => setFilters(prev => ({
              ...prev,
              onlyNew: !prev.onlyNew
            }))}
            className="w-4 h-4 text-gold-500 rounded border-gray-300 focus:ring-gold-500"
          />
          <label 
            htmlFor="only-new"
            className="ml-2 text-sm font-light text-gray-700"
          >
            Apenas Novidades
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="only-sale"
            checked={filters.onlySale}
            onChange={() => setFilters(prev => ({
              ...prev,
              onlySale: !prev.onlySale
            }))}
            className="w-4 h-4 text-gold-500 rounded border-gray-300 focus:ring-gold-500"
          />
          <label 
            htmlFor="only-sale"
            className="ml-2 text-sm font-light text-gray-700"
          >
            Apenas Promoções
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-16 bg-white mt-16">
      {/* Cabeçalho da Coleção */}
      <div className="container-custom mb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-light text-center mb-4 tracking-wider">
          Nossa <span className="text-gold-500">Coleção</span>
        </h1>
        <p className="text-gray-600 text-center max-w-3xl mx-auto font-light">
          Explore nossa coleção exclusiva de peças elegantes e sofisticadas, 
          criadas para mulheres que valorizam qualidade e estilo atemporal.
        </p>
      </div>

      <div className="container-custom px-4">
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
                Exibindo <span className="font-medium">{filteredProducts.length}</span> produtos
              </p>
              <button 
                className="lg:hidden flex items-center text-sm bg-white border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <Filter size={16} className="mr-2" />
                Filtros
              </button>
            </div>

            {/* Grade de produtos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Mensagem quando não há produtos */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 font-light">
                  Nenhum produto encontrado com os filtros selecionados.
                </p>
                <button 
                  onClick={clearFilters}
                  className="mt-4 text-gold-500 underline font-light"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de filtros mobile */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium">Filtros</h3>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <FilterPanel />
            <div className="mt-8 flex space-x-4">
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  // Aplicar filtros e fechar
                  setIsMobileFilterOpen(false);
                }}
                className="flex-1 py-2 bg-gold-500 text-white rounded-md"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Collection; 