import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '../../../components/ProductDetail';
import { products } from '../../../data/products';
import { getProductDetails } from '../../../lib/services/productService';

type ProductPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  // Tenta buscar do Supabase primeiro
  const { data: productFromDB } = await getProductDetails(params.id);
  
  // Se encontrou no banco de dados, retorna os metadados baseados nele
  if (productFromDB) {
    return {
      title: `${productFromDB.name} - Loja Elegante`,
      description: productFromDB.description || '',
      openGraph: {
        images: productFromDB.mainImage ? [{ url: productFromDB.mainImage }] : [],
      },
    };
  }
  
  // Caso contrário, tenta encontrar nos dados mockados
  const product = products.find(p => p.id === parseInt(params.id));
  
  if (!product) {
    return {
      title: 'Produto não encontrado',
      description: 'O produto que você está procurando não foi encontrado.'
    };
  }

  return {
    title: `${product.name} - Loja Elegante`,
    description: product.description,
    openGraph: {
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Tenta buscar produto do Supabase
  const { data: productFromDB, error } = await getProductDetails(params.id);
  
  // Se encontrado no banco de dados, converter para o formato esperado pelo ProductDetail
  if (productFromDB && !error) {
    const formattedProduct = {
      id: parseInt(productFromDB.id),
      name: productFromDB.name,
      description: productFromDB.description || '',
      price: productFromDB.price,
      discount: productFromDB.discount_percent,
      images: productFromDB.images?.map(img => img.url) || [],
      colors: productFromDB.colors?.map(color => ({
        name: color.name,
        value: color.color_code,
        image_url: color.image_url
      })) || [],
      sizes: productFromDB.sizes?.map(size => size.size) || [],
      category: productFromDB.category?.name || '',
      material: productFromDB.material || '',
      isNew: productFromDB.isNew,
      features: Array.isArray(productFromDB.features) 
        ? productFromDB.features 
        : (productFromDB.features ? productFromDB.features.split(',') : []),
      tags: productFromDB.tags || [],
      stock: productFromDB.stock || 0
    };
    
    return (
      <main>
        <ProductDetail product={formattedProduct} />
      </main>
    );
  }
  
  // Se não encontrado no banco, tenta nos dados mockados
  const product = products.find(p => p.id === parseInt(params.id));
  
  if (!product) {
    notFound();
  }

  return (
    <main>
      <ProductDetail product={product} />
    </main>
  );
} 