'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../../components/ProductCard';
import { getProducts } from '../../lib/services/productService';
import { Product } from '../../types/product';

export default function ProdutosPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categoria = searchParams.get('categoria');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error, totalPages: total } = await getProducts({
          page: currentPage,
          categoryId: categoria || null,
        });

        if (error) {
          console.error('Erro ao buscar produtos:', error);
          return;
        }

        if (data) {
          setProducts(data);
          setTotalPages(total || 1);
        }
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, categoria]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-champagne-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-light text-gray-800 mb-8">
        {categoria ? `Produtos - ${categoria}` : 'Todos os Produtos'}
      </h1>
      
      {products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhum produto encontrado nesta categoria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === page
                      ? 'bg-champagne-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 