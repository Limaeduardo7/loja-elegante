import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Star, Plus, Minus, ShoppingBag, Heart, Truck, Shield, ArrowLeft } from 'lucide-react';
import { Product, products } from '../data/products';
import { cn } from '../lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<{ name: string; value: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Rolar para o topo quando o componente montar
    window.scrollTo(0, 0);
    
    // Buscar o produto com base no id na URL
    const fetchProduct = async () => {
      try {
        // Simulando um atraso de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Buscar produto do array de produtos
        const foundProduct = products.find(p => p.id === Number(id));
        
        if (foundProduct) {
          setProduct(foundProduct);
          setMainImage(foundProduct.images[0]);
          setSelectedColor(foundProduct.colors[0]);
          setSelectedSize(foundProduct.sizes[0]);
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do produto:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Calcular o preço final com desconto, se aplicável
  const finalPrice = product?.discount
    ? product.price * (1 - product.discount / 100)
    : product?.price;

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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      // Animação simples para o favorito
      const heartIcon = document.getElementById('heart-icon');
      if (heartIcon) {
        heartIcon.classList.add('scale-125');
        setTimeout(() => {
          heartIcon.classList.remove('scale-125');
        }, 300);
      }
    }
  };

  const addToCart = () => {
    if (!product) return;
    
    // Implementar lógica de adicionar ao carrinho
    console.log('Adicionando ao carrinho:', {
      product,
      color: selectedColor,
      size: selectedSize,
      quantity
    });
    // Aqui você pode integrar com seu sistema de carrinho
    alert(`${quantity} unidade(s) do produto "${product.name}" adicionado ao carrinho!`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
          <p className="mt-4 text-gold-500 font-light">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-light mb-4 text-gray-800">Produto não encontrado</h1>
          <p className="text-gray-600 mb-6">O produto que você está procurando não está disponível ou foi removido.</p>
          <Button 
            onClick={handleGoBack} 
            variant="outline" 
            className="border-gold-500 text-gold-500 hover:bg-gold-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a loja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 pb-12 pt-28 md:pt-32">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-gold-500 transition-colors">Início</button>
          <span className="mx-2">/</span>
          <button onClick={() => navigate('/colecao')} className="hover:text-gold-500 transition-colors">Coleção</button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Seção de imagens */}
          <div className="space-y-6">
            <div className="relative h-[600px] w-full rounded-lg overflow-hidden bg-gray-50">
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={toggleFavorite}
                  className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all hover:shadow-lg"
                >
                  <Heart 
                    id="heart-icon"
                    className={`h-5 w-5 transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                  />
                </button>
              </div>
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  className={cn(
                    "relative h-24 w-24 rounded-md overflow-hidden border-2 transition-all",
                    mainImage === img ? "border-gold-500 shadow-md" : "border-transparent hover:border-gray-200"
                  )}
                  onClick={() => setMainImage(img)}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Informações do produto */}
          <div className="space-y-8">
            <div>
              {product.isNew && (
                <span className="inline-block bg-gold-500 text-white text-xs px-3 py-1 rounded-full font-medium mb-3">
                  Novidade
                </span>
              )}
              {product.discount && (
                <span className="inline-block bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-medium mb-3 ml-2">
                  {product.discount}% OFF
                </span>
              )}
              
              <h1 className="text-3xl font-light text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-gold-500 text-gold-500" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">(12 avaliações)</span>
              </div>
            </div>

            <div className="border-t border-b py-6 border-gray-100">
              <div className="flex items-center gap-4">
                {product.discount ? (
                  <>
                    <span className="text-3xl font-light text-gold-600">{formatPrice(finalPrice || 0)}</span>
                    <span className="text-lg text-gray-400 line-through font-light">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-light text-gold-600">{formatPrice(product.price)}</span>
                )}
              </div>
              
              <p className="text-sm text-gray-500 mt-2">
                Em até 10x de {formatPrice((finalPrice || product.price) / 10)} sem juros
              </p>
            </div>

            <p className="text-gray-700 font-light leading-relaxed">{product.description}</p>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3 text-gray-700">Cor: <span className="font-light text-gray-900">{selectedColor?.name}</span></h3>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      className={cn(
                        "h-10 w-10 rounded-full transition-all",
                        selectedColor?.name === color.name 
                          ? "ring-2 ring-gold-500 ring-offset-2 scale-110" 
                          : "hover:scale-105"
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleColorChange(color)}
                      aria-label={`Cor ${color.name}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3 text-gray-700">Tamanho: <span className="font-light text-gray-900">{selectedSize}</span></h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={cn(
                        "h-11 min-w-[3rem] px-4 rounded-md border border-gray-200 font-light transition-all",
                        selectedSize === size
                          ? "bg-gold-500 text-white border-gold-500"
                          : "bg-white text-gray-700 hover:border-gold-300 hover:text-gold-500"
                      )}
                      onClick={() => handleSizeChange(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3 text-gray-700">Quantidade</h3>
                <div className="inline-flex items-center border border-gray-200 rounded-md">
                  <button
                    className="flex justify-center items-center h-12 w-12 text-gray-500 hover:text-gold-500 transition-colors border-r border-gray-200"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-light">{quantity}</span>
                  <button
                    className="flex justify-center items-center h-12 w-12 text-gray-500 hover:text-gold-500 transition-colors border-l border-gray-200"
                    onClick={increaseQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                className="py-7 px-8 bg-gold-500 hover:bg-gold-600 text-base font-light tracking-wide flex-1" 
                onClick={addToCart}
              >
                <ShoppingBag className="mr-2 h-5 w-5" /> Adicionar ao Carrinho
              </Button>
              
              <Button 
                variant="outline"
                className="py-7 border-gold-200 text-gold-500 hover:bg-gold-50 font-light tracking-wide"
                onClick={toggleFavorite}
              >
                <Heart className={`mr-2 h-5 w-5 ${isFavorite ? 'fill-gold-500' : ''}`} /> 
                {isFavorite ? 'Salvo' : 'Salvar'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg">
                <Truck className="h-6 w-6 text-gold-500" />
                <div>
                  <h4 className="text-sm font-medium">Entrega rápida</h4>
                  <p className="text-xs text-gray-500">2-4 dias úteis</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg">
                <Shield className="h-6 w-6 text-gold-500" />
                <div>
                  <h4 className="text-sm font-medium">Garantia de qualidade</h4>
                  <p className="text-xs text-gray-500">30 dias para troca</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 mt-6 border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Material:</span> <span className="font-light">{product.material}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Categoria:</span> <span className="font-light">{product.category}</span>
                  </p>
                </div>
              </div>
              
              {product.tags && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {product.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-light"
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
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="w-full justify-start border-b border-gray-200 mb-6">
              <TabsTrigger value="features" className="text-lg font-light py-4 px-6">Características</TabsTrigger>
              <TabsTrigger value="details" className="text-lg font-light py-4 px-6">Informações adicionais</TabsTrigger>
              <TabsTrigger value="reviews" className="text-lg font-light py-4 px-6">Avaliações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="features" className="py-6">
              <ul className="space-y-4 max-w-2xl">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block h-6 w-6 min-w-[1.5rem] mt-0.5 mr-3 bg-gold-50 text-gold-500 rounded-full flex items-center justify-center text-xs">✓</span>
                    <span className="font-light text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            
            <TabsContent value="details" className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-gray-800">Cuidados</h3>
                  <ul className="space-y-2 font-light text-gray-700">
                    <li className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-500 mr-2"></span>
                      Lavar à mão ou na máquina com água fria
                    </li>
                    <li className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-500 mr-2"></span>
                      Não usar alvejante
                    </li>
                    <li className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-500 mr-2"></span>
                      Secar na sombra
                    </li>
                    <li className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-500 mr-2"></span>
                      Passar em temperatura média
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-gray-800">Devolução</h3>
                  <p className="font-light text-gray-700 leading-relaxed">
                    Este produto pode ser devolvido em até 30 dias após o recebimento, 
                    desde que esteja em perfeitas condições, com etiquetas intactas 
                    e na embalagem original.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="py-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Avaliações dos clientes</h3>
                <div className="flex justify-center my-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-6 w-6 fill-gold-500 text-gold-500" />
                  ))}
                </div>
                <p className="text-gray-600 font-light">
                  Baseado em 12 avaliações
                </p>
                <Button className="mt-6 bg-gold-500 hover:bg-gold-600 font-light">
                  Escrever uma avaliação
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 