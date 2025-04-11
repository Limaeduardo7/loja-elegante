'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { type Product } from '@/components/ProductDetail';

// Dados de exemplo para produtos
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Vestido Floral Verão',
    price: 159.90,
    image: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=1887&auto=format&fit=crop',
    category: 'Vestidos',
    description: 'Vestido leve com estampa floral perfeito para o verão. Feito com tecido respirável e design confortável.',
    features: ['Tecido leve', 'Estampa floral', 'Ideal para verão', 'Fechamento com zíper'],
    material: '100% Algodão',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Rosa', 'Azul', 'Verde'],
    images: [
      'https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=1887&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1888&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1888&auto=format&fit=crop'
    ],
    discount: 15,
    isNew: true,
    tags: ['Verão', 'Floral', 'Casual']
  },
  {
    id: 2,
    name: 'Blazer Slim Fit',
    price: 299.90,
    image: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?q=80&w=1738&auto=format&fit=crop',
    category: 'Blazers',
    description: 'Blazer slim fit elegante para ocasiões formais ou casuais. Corte moderno e acabamento premium.',
    features: ['Slim fit', 'Tecido durável', 'Forro interno', '2 bolsos frontais'],
    material: '80% Poliéster, 20% Viscose',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Azul Marinho', 'Cinza'],
    images: [
      'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?q=80&w=1738&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=1780&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?q=80&w=1776&auto=format&fit=crop'
    ],
    discount: 0,
    isNew: false,
    tags: ['Formal', 'Trabalho', 'Elegante']
  },
  {
    id: 3,
    name: 'Calça Jeans Skinny',
    price: 129.90,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1887&auto=format&fit=crop',
    category: 'Calças',
    description: 'Calça jeans skinny com lavagem moderna e excelente caimento. Tecido com elastano para maior conforto.',
    features: ['Corte skinny', 'Com elastano', 'Cintura média', '5 bolsos'],
    material: '98% Algodão, 2% Elastano',
    sizes: ['34', '36', '38', '40', '42', '44'],
    colors: ['Azul Claro', 'Azul Escuro', 'Preto'],
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1887&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?q=80&w=1915&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?q=80&w=1780&auto=format&fit=crop'
    ],
    discount: 10,
    isNew: false,
    tags: ['Casual', 'Jeans', 'Básico']
  },
  {
    id: 4,
    name: 'Camisa Social Slim',
    price: 149.90,
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1925&auto=format&fit=crop',
    category: 'Camisas',
    description: 'Camisa social de corte slim com tecido de alta qualidade e acabamento impecável. Ideal para ocasiões formais.',
    features: ['Corte slim', 'Botões perolizados', 'Tecido não amarrota facilmente', 'Punho clássico'],
    material: '100% Algodão',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Branco', 'Azul Claro', 'Rosa Claro', 'Listrado'],
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1925&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?q=80&w=1887&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563630423918-b58f07336ac9?q=80&w=1887&auto=format&fit=crop'
    ],
    discount: 0,
    isNew: true,
    tags: ['Formal', 'Trabalho', 'Social']
  }
];

export default function ProdutosPage() {
  const router = useRouter();
  const [products] = useState<Product[]>(mockProducts);

  const handleProductClick = (productId: number) => {
    router.push(`/produtos/${productId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-light text-gray-800 mb-8">Produtos</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onProductClick={handleProductClick}
          />
        ))}
      </div>
    </div>
  );
} 