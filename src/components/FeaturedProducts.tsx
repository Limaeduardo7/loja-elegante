import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

// Tipo para o produto
type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
};

// Props para o componente
type FeaturedProductsProps = {
  onViewAllClick?: () => void;
};

const products: Product[] = [
  {
    id: 1,
    name: "Vestido Dourado Glamour",
    price: 1299.90,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1588",
    category: "Vestidos"
  },
  {
    id: 2,
    name: "Conjunto Elegance",
    price: 1599.90,
    image: "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?q=80&w=1587",
    category: "Conjuntos"
  },
  {
    id: 3,
    name: "Vestido Noite Estrelada",
    price: 1899.90,
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1587",
    category: "Vestidos"
  },
  {
    id: 4,
    name: "Vestido Glam Noir",
    price: 1799.90,
    image: "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1635",
    category: "Vestidos"
  }
];

const ProductCard = ({ product }: { product: Product }) => {
  const [hovering, setHovering] = useState(false);
  
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);
  
  return (
    <div 
      className="relative group overflow-hidden"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
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
          <p className="text-gold-600 font-light">{formattedPrice}</p>
          <button className="bg-gold-500 bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full transition-all">
            <ShoppingBag size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

const FeaturedProducts = ({ onViewAllClick }: FeaturedProductsProps) => {
  return (
    <section className="py-6 bg-white">
      <div className="container-custom px-0">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-wide">
            <span className="text-gold-500">Destaques</span> da Coleção
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
            className="inline-block bg-white border border-gold-500 bg-opacity-70 hover:bg-gold-500 hover:bg-opacity-10 text-gold-500 px-8 py-3 font-light tracking-wide rounded-full transition-all cursor-pointer"
          >
            Ver Todos
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts; 