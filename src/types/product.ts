// Tipo para imagem de produto
export interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  is_main: boolean;
  display_order?: number;
  product_id: string;
}

// Tipo para categoria
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  is_active: boolean;
}

// Tipo para cor de produto
export interface ProductColor {
  id: string;
  product_id: string;
  name: string;
  color_code: string;
  value: string; // Valor da cor em formato hexadecimal ou CSS
  image_url?: string;
}

// Tipo para tamanho de produto
export interface ProductSize {
  id: string;
  product_id: string;
  size: string;
  display_order: number;
}

// Tipo para variante (combinação cor/tamanho)
export interface ColorSizeVariant {
  id: string;
  product_id: string;
  color_id: string;
  size_id: string;
  stock_quantity: number;
  sku?: string;
}

// Tipo para avaliação de produto
export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  user_name?: string;
}

// Tipo de produto base
export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  features?: string | string[];
  price: number;
  discount_percent?: number;
  category_id: string;
  material?: string;
  weight?: number;
  is_featured: boolean;
  is_active: boolean;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
  
  // Campos processados (não diretamente do banco)
  mainImage?: string;
  finalPrice?: number;
  isNew?: boolean;
  shipsToday?: boolean;
  productStory?: string;
  tags?: string[];
  stock?: number;
  discount?: number;
}

// Tipo de produto com detalhes completos
export interface ProductWithDetails extends Product {
  category?: Category;
  images: ProductImage[];
  modelImages?: string[]; // Imagens do produto no modelo
  colors?: ProductColor[];
  sizes?: ProductSize[];
  variants?: ColorSizeVariant[];
  reviews?: ProductReview[];
  related_products?: Product[];
} 