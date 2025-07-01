// Tipo para imagem de produto
export interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  is_main: boolean;
  display_order?: number;
}

// Tipo para categoria
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subcategories?: Category[];
}

// Tipo para cor de produto
export interface ProductColor {
  id: string;
  name: string;
  color_code: string;
  image_url?: string;
}

// Tipo para tamanho de produto
export interface ProductSize {
  id: string;
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
  price?: number;
}

// Tipo para avaliação de produto
export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

// Tipo de produto base
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  mainImage?: string;
  images?: ProductImage[];
  category_id?: string;
  category?: Category;
  features?: string[];
  tags?: string[];
  material?: string;
  sizes?: string[];
  colors?: string[];
  discount_percent?: number;
  is_new?: boolean;
  is_active?: boolean;
  in_stock?: boolean;
  created_at?: string;
  updated_at?: string;
  totalStock?: number;
  variants?: ColorSizeVariant[];
}

// Tipo de produto com detalhes completos
export interface ProductWithDetails extends Omit<Product, 'sizes' | 'colors'> {
  sizes?: ProductSize[];
  colors?: ProductColor[];
  reviews?: ProductReview[];
  related_products?: Product[];
} 