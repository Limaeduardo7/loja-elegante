'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '../../../components/ProductDetail';

// Defina o tipo Product localmente
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  features: string[];
  material: string;
  sizes: string[];
  colors: { name: string; value: string; }[];
  images: string[];
  discount?: number;
  isNew?: boolean;
  tags: string[];
}

export default function ProdutoDetalhe() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  // Dados mockados para demonstração
  const mockProducts: Product[] = [
    {
      id: 1,
      name: "Vestido Floral Verão",
      price: 129.90,
      image: "/images/produtos/vestido-floral.jpg",
      category: "Vestidos",
      description: "Vestido floral leve e elegante perfeito para os dias quentes de verão. Confeccionado com tecido respirável e confortável.",
      features: ["Tecido leve", "Estampa floral", "Manga curta", "Decote V"],
      material: "100% Algodão",
      sizes: ["P", "M", "G", "GG"],
      colors: [
        { name: "Azul", value: "#0000FF" },
        { name: "Rosa", value: "#FFC0CB" },
        { name: "Verde", value: "#00FF00" }
      ],
      images: [
        "/images/produtos/vestido-floral-1.jpg",
        "/images/produtos/vestido-floral-2.jpg",
        "/images/produtos/vestido-floral-3.jpg",
      ],
      discount: 15,
      isNew: true,
      tags: ["verão", "casual", "floral"]
    },
    {
      id: 2,
      name: "Calça Jeans Reta",
      price: 159.90,
      image: "/images/produtos/calca-jeans.jpg",
      category: "Calças",
      description: "Calça jeans de corte reto com cintura alta. Confortável e versátil, perfeita para diversas ocasiões.",
      features: ["Cintura alta", "Corte reto", "5 bolsos", "Lavagem média"],
      material: "98% Algodão, 2% Elastano",
      sizes: ["36", "38", "40", "42", "44"],
      colors: [
        { name: "Azul médio", value: "#0000A0" },
        { name: "Azul escuro", value: "#00008B" },
        { name: "Preto", value: "#000000" }
      ],
      images: [
        "/images/produtos/calca-jeans-1.jpg",
        "/images/produtos/calca-jeans-2.jpg",
        "/images/produtos/calca-jeans-3.jpg",
      ],
      tags: ["básico", "casual", "jeans"]
    }
  ];

  useEffect(() => {
    // Simula busca no banco de dados pelo ID do produto
    const id = Number(params.id);
    const foundProduct = mockProducts.find(p => p.id === id);
    
    // Simula um pequeno delay de carregamento
    const timer = setTimeout(() => {
      setProduct(foundProduct || null);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-pulse">
          <div className="text-center">Carregando produto...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Produto não encontrado</h2>
          <p className="mt-2 text-gray-600">O produto que você está procurando não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  return <ProductDetail product={product} />;
} 