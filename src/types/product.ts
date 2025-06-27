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
  image_url?: string;
  is_active: boolean;
  parent_id?: string | null;
  subcategories?: Category[]; // Array de subcategorias
  created_at?: string;
  updated_at?: string;
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
  description?: string;
  price: number;
  discount_percent?: number;
  mainImage?: string;
  images?: ProductImage[];
  category: Category;
  subcategory?: Category;
  in_stock: boolean;
  is_featured?: boolean;
  features?: string[];
  created_at?: string;
  updated_at?: string;
}

// Tipo de produto com detalhes completos
export interface ProductWithDetails extends Omit<Product, 'category' | 'subcategory'> {
  category?: Category;
  subcategory?: Category;
  colors?: ProductColor[];
  sizes?: ProductSize[];
  variants?: ColorSizeVariant[];
  reviews?: ProductReview[];
  related_products?: Product[];
} 