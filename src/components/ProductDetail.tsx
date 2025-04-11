'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, Plus, Minus, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product } from '@/data/products';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [mainImage, setMainImage] = useState<string>(product.images[0]);
  const [selectedColor, setSelectedColor] = useState<{ name: string; value: string }>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]);
  const [quantity, setQuantity] = useState<number>(1);

  // Calcular o preço final com desconto, se aplicável
  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  // Funções de manipulação
  const handleColorChange = (color: { name: string; value: string }) => {
    setSelectedColor(color);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const addToCart = () => {
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
        <div className="space-y-4">
          <div className="relative h-[500px] w-full rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images.map((img, index) => (
              <button
                key={index}
                className={cn(
                  "relative h-24 w-24 rounded-md overflow-hidden border-2",
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

          <p className="text-gray-700">{product.description}</p>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Cor: {selectedColor.name}</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    className={cn(
                      "h-8 w-8 rounded-full border",
                      selectedColor.name === color.name ? "ring-2 ring-primary ring-offset-2" : ""
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorChange(color)}
                    aria-label={`Cor ${color.name}`}
                  />
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
                  className="flex-1 flex justify-center items-center h-10 text-gray-600 hover:text-primary"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex-1 text-center">{quantity}</span>
                <button
                  className="flex-1 flex justify-center items-center h-10 text-gray-600 hover:text-primary"
                  onClick={increaseQuantity}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <Button 
            className="w-full mt-6 py-6 text-base font-medium" 
            onClick={addToCart}
          >
            <ShoppingBag className="mr-2 h-5 w-5" /> Adicionar ao Carrinho
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
                  desde que esteja em perfeitas condições, com etiquetas intactas 
                  e na embalagem original.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 