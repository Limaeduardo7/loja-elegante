import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { type Product } from '../data/products';

type ProductCardProps = {
  product: Product;
  onProductClick?: (productId: number) => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const { id, name, price, image, category, discount, isNew } = product;

  // Calcular preço com desconto, se houver
  const discountedPrice = discount ? price * (1 - discount / 100) : null;

  // Formatar preços
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);

  const formattedDiscountedPrice = discountedPrice
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(discountedPrice)
    : null;

  // Função para lidar com o clique no produto
  const handleClick = () => {
    if (onProductClick) {
      onProductClick(id);
    }
  };

  return (
    <Link to={`/produto/${id}`} className="group" onClick={handleClick}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="h-48 overflow-hidden">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-1">{category}</p>
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{name}</h3>
          <div className="font-bold text-primary">
            {discountedPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 line-through text-sm font-light">
                  {formattedPrice}
                </span>
                <span className="text-gold-600 font-light">
                  {formattedDiscountedPrice}
                </span>
              </div>
            ) : (
              formattedPrice
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 