'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Plus, Minus, ShoppingBag, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

// Atualização dos tipos para incluir cores com imagens
interface ProductColor {
  id?: string;
  name: string;
  value: string; // código de cor
  image_url?: string; // URL da imagem associada à cor
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discount?: number;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  category: string;
  material: string;
  isNew?: boolean;
  shipsToday?: boolean;
  features: string[];
  tags?: string[];
  stock?: number; // Quantidade em estoque
}

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [mainImage, setMainImage] = useState<string>(product.images[0]);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]);
  const [quantity, setQuantity] = useState<number>(
    product.stock && product.stock > 0 ? 1 : 0
  );
  console.log('Inicialização do estado de quantidade:', {
    stock: product.stock,
    initialQuantity: product.stock && product.stock > 0 ? 1 : 0
  });
  const [thumbnails, setThumbnails] = useState<string[]>(product.images);

  // Calcular o preço final com desconto, se aplicável
  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  // Atualizar as imagens exibidas quando a cor for alterada
  useEffect(() => {
    // Se a cor selecionada tem uma imagem associada, definir como imagem principal
    if (selectedColor.image_url) {
      setMainImage(selectedColor.image_url);
      
      // Criar um array com a imagem da cor como primeira e as demais imagens do produto
      const colorImageIndex = product.images.indexOf(selectedColor.image_url);
      let newThumbnails: string[] = [];
      
      // Se a imagem da cor já está no array de imagens do produto, priorizá-la
      if (colorImageIndex >= 0) {
        newThumbnails = [
          ...product.images.slice(colorImageIndex, colorImageIndex + 1),
          ...product.images.slice(0, colorImageIndex),
          ...product.images.slice(colorImageIndex + 1)
        ];
      } else {
        // Se não, adicionar a imagem da cor como primeira imagem
        newThumbnails = [selectedColor.image_url, ...product.images];
      }
      
      setThumbnails(newThumbnails);
    } else {
      // Se não tem imagem associada, voltar para as imagens originais do produto
      setMainImage(product.images[0]);
      setThumbnails(product.images);
    }
  }, [selectedColor, product.images]);

  // Atualizar quantidade quando o produto mudar
  useEffect(() => {
    // Ajustar quantidade baseado no estoque
    if (!product.stock || product.stock <= 0) {
      setQuantity(0);
    } else if (quantity === 0 || quantity > product.stock) {
      setQuantity(1);
    }
  }, [product, product.stock]);

  // Monitorar mudanças na quantidade
  useEffect(() => {
    console.log('Quantidade atualizada:', quantity);
  }, [quantity]);

  // Funções de manipulação
  const handleColorChange = (color: ProductColor) => {
    setSelectedColor(color);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const increaseQuantity = () => {
    // Só aumenta se a quantidade atual for menor que o estoque disponível
    console.log('increaseQuantity chamado');
    console.log('Estoque atual:', product.stock);
    console.log('Quantidade atual:', quantity);
    
    if (product.stock && quantity < product.stock) {
      console.log('Aumentando quantidade');
      setQuantity(prev => prev + 1);
    } else {
      console.log('Não foi possível aumentar a quantidade');
      if (!product.stock) {
        console.log('Motivo: produto.stock é undefined ou 0');
      } else if (quantity >= product.stock) {
        console.log('Motivo: quantidade já é igual ou maior que o estoque disponível');
      }
    }
  };

  const decreaseQuantity = () => {
    console.log('decreaseQuantity chamado');
    console.log('Quantidade atual:', quantity);
    
    if (quantity > 1) {
      console.log('Diminuindo quantidade');
      setQuantity(prev => prev - 1);
    } else {
      console.log('Não é possível diminuir abaixo de 1');
    }
  };

  const addToCart = () => {
    // Verificar se há estoque disponível
    if (!product.stock || product.stock <= 0) {
      console.log('Produto sem estoque disponível');
      // Você pode adicionar uma notificação toast aqui se desejar
      return;
    }
    
    // Verificar se a quantidade selecionada é maior que o estoque
    if (quantity > product.stock) {
      console.log('Quantidade solicitada maior que o estoque disponível');
      // Você pode adicionar uma notificação toast aqui se desejar
      return;
    }
    
    // Implementar lógica de adicionar ao carrinho
    console.log('Adicionando ao carrinho:', {
      product,
      color: selectedColor,
      size: selectedSize,
      quantity
    });
    // Aqui você pode integrar com seu sistema de carrinho
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Seção de imagens */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Miniaturas ao lado esquerdo */}
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:max-h-[500px] md:w-24">
            {thumbnails.map((img, index) => (
              <button
                key={index}
                className={cn(
                  "relative h-24 w-24 flex-shrink-0 rounded-md overflow-hidden border-2",
                  mainImage === img ? "border-primary" : "border-transparent"
                )}
                onClick={() => setMainImage(img)}
              >
                <Image
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
          
          {/* Imagem principal */}
          <div className="relative h-[500px] flex-grow rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Informações do produto */}
        <div className="space-y-6">
          {product.isNew && (
            <span className="inline-block bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">
              Novo
            </span>
          )}
          
          <h1 className="text-3xl font-bold">{product.name}</h1>
          
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-sm text-gray-500">(12 avaliações)</span>
          </div>

          <div className="flex items-center gap-4">
            {product.discount ? (
              <>
                <span className="text-2xl font-bold">R$ {finalPrice.toFixed(2)}</span>
                <span className="text-lg text-gray-500 line-through">
                  R$ {product.price.toFixed(2)}
                </span>
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                  {product.discount}% OFF
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold">R$ {product.price.toFixed(2)}</span>
            )}
          </div>

          {/* Informação de estoque */}
          <div className="flex items-center gap-2">
            {product.stock !== undefined && product.stock > 0 ? (
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Em estoque: {product.stock} {product.stock === 1 ? 'unidade' : 'unidades'}
              </span>
            ) : (
              <span className="text-sm font-medium text-white bg-red-500 px-2 py-1 rounded-full">
                PRODUTO ESGOTADO
              </span>
            )}
          </div>

          <p className="text-gray-700">{product.description}</p>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Cor: {selectedColor.name}</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    className={cn(
                      "h-10 w-10 rounded-full border relative group",
                      selectedColor.name === color.name ? "ring-2 ring-primary ring-offset-2" : ""
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorChange(color)}
                    aria-label={`Cor ${color.name}`}
                  >
                    {color.image_url && (
                      <div className="absolute inset-0 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                        <Image 
                          src={color.image_url} 
                          alt={`Imagem da cor ${color.name}`} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Tamanho: {selectedSize}</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={cn(
                      "h-10 min-w-[2.5rem] px-3 rounded-md border",
                      selectedSize === size
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-900 hover:bg-gray-50"
                    )}
                    onClick={() => handleSizeChange(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Quantidade</h3>
              <div className="flex items-center border rounded-md w-32">
                <button
                  className={`flex-1 flex justify-center items-center h-10
                    ${quantity <= 1 
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                      : "bg-gray-200 text-gray-600 hover:bg-primary hover:text-white cursor-pointer"
                    }`}
                  onClick={() => {
                    console.log('Botão de decremento clicado');
                    decreaseQuantity();
                  }}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex-1 text-center font-medium">{quantity}</span>
                <button
                  className={`flex-1 flex justify-center items-center h-10
                    ${!product.stock || quantity >= product.stock 
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                      : "bg-gray-200 text-gray-600 hover:bg-primary hover:text-white cursor-pointer"
                    }`}
                  onClick={() => {
                    console.log('Botão de incremento clicado');
                    increaseQuantity();
                  }}
                  disabled={!product.stock || quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {product.stock && product.stock > 0 && quantity === product.stock && (
                <p className="text-xs text-amber-600 mt-1">
                  Quantidade máxima disponível
                </p>
              )}
            </div>
          </div>

          <Button 
            className={cn(
              "w-full mt-6 py-6 text-base font-medium",
              !product.stock || product.stock <= 0 
                ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed text-gray-600" 
                : ""
            )}
            onClick={addToCart}
            disabled={!product.stock || product.stock <= 0}
          >
            {product.stock && product.stock > 0 ? (
              <>
                <ShoppingBag className="mr-2 h-5 w-5" /> 
                Adicionar ao Carrinho
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-5 w-5" />
                Produto Indisponível
              </>
            )}
          </Button>

          <div className="border-t pt-6 mt-8">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Material:</span> {product.material}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-700">Categoria:</span> {product.category}
            </p>
            {product.tags && (
              <div className="flex gap-2 mt-3">
                {product.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Características e detalhes em abas */}
      <div className="mt-16">
        <Tabs defaultValue="features">
          <TabsList className="w-full justify-start border-b">
            <TabsTrigger value="features" className="text-lg">Características</TabsTrigger>
            <TabsTrigger value="details" className="text-lg">Detalhes adicionais</TabsTrigger>
          </TabsList>
          <TabsContent value="features" className="py-6">
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block h-5 w-5 min-w-[1.25rem] mt-0.5 mr-2 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="details" className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Cuidados</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• Lavar à mão ou na máquina com água fria</li>
                  <li>• Não usar alvejante</li>
                  <li>• Secar na sombra</li>
                  <li>• Passar em temperatura média</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">Devolução</h3>
                <p className="text-gray-700">
                  Este produto pode ser devolvido em até 30 dias após o recebimento, 
                  desde que esteja em perfeitas condições e com a embalagem original.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 