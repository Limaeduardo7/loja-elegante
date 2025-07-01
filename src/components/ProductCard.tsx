import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { type Product } from '../types/product';

type ProductCardProps = {
  product: Product;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { id, name, price, mainImage, category, discount_percent, is_new } = product;

  // Calcular preço com desconto, se houver
  const discountedPrice = discount_percent ? price * (1 - discount_percent / 100) : null;
  
  // Valor final para exibição (com desconto, se houver)
  const finalPrice = discountedPrice || price;
  
  // Calcular valor parcelado em 10x
  const installmentPrice = finalPrice / 10;

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
    
  const formattedInstallmentPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(installmentPrice);

  return (
    <Link to={`/produto/${id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="h-48 overflow-hidden">
          <img 
            src={mainImage} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-1">{category?.name || 'Sem categoria'}</p>
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 font-title">{name}</h3>
          <div className="font-bold text-primary">
            {discountedPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 line-through text-sm font-light">
                  {formattedPrice}
                </span>
                <span className="text-champagne-600 font-light">
                  {formattedDiscountedPrice}
                </span>
              </div>
            ) : (
              <span className="text-champagne-600 font-light">{formattedPrice}</span>
            )}
            <p className="text-xs text-gray-500 mt-1 font-text">
              ou 10x de {formattedInstallmentPrice} sem juros
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 