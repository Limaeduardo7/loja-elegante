import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Star, Plus, Minus, ShoppingBag, Heart, Truck, Shield, ArrowLeft, X, ChevronRight, ChevronLeft, Ruler, AlertTriangle, Check, Info, Clock, ZoomIn, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../components/ui/dialog';
import ShippingCalculator from '../components/ui/ShippingCalculator';
import { ProductWithDetails } from '../types/product';
import { getProductDetails } from '../lib/services/productService';
import { getOrCreateCart, addToCart as addItemToCart } from '../lib/services/cartService';
import { useCart } from '../contexts/CartContext';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<{ id: string; name: string; color_code: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState<{ id: string; size: string } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageType, setImageType] = useState<'product' | 'model'>('product');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [addingToCart, setAddingToCart] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [stockInfo, setStockInfo] = useState({ available: true, quantity: 0 });
  const { updateCartItemsCount } = useCart();

  useEffect(() => {
    // Rolar para o topo quando o componente montar
    window.scrollTo(0, 0);
    
    // Buscar o produto com base no id na URL
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data: productData, error } = await getProductDetails(id);
        
        if (error) {
          console.error('Erro ao buscar detalhes do produto:', error);
          setError('Não foi possível carregar os detalhes do produto. Tente novamente mais tarde.');
          return;
        }
        
        if (!productData) {
          setError('Produto não encontrado');
          return;
        }
        
        setProduct(productData);
        
        // Definir imagem principal
        if (productData.images && productData.images.length > 0) {
          // Procurar a imagem principal marcada como is_main
          const mainImg = productData.images.find(img => img.is_main);
          setMainImage(mainImg?.url || productData.images[0].url);
        }
        
        // Definir cor selecionada
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
        
        // Definir tamanho selecionado
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        
        // Verificar disponibilidade de estoque
        updateStockInfo(productData, productData.colors?.[0]?.id, productData.sizes?.[0]?.id);
        
      } catch (e) {
        console.error('Erro inesperado:', e);
        setError('Ocorreu um erro ao carregar os detalhes do produto.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Atualizar informações de estoque quando o usuário muda cor ou tamanho
  useEffect(() => {
    if (product && selectedColor && selectedSize) {
      updateStockInfo(product, selectedColor.id, selectedSize.id);
    }
  }, [selectedColor, selectedSize, product]);

  const updateStockInfo = (productData: ProductWithDetails, colorId?: string, sizeId?: string) => {
    if (!productData || !productData.variants) {
      setStockInfo({ available: false, quantity: 0 });
      return;
    }
    
    // Se temos cor e tamanho selecionados, verificar variante específica
    if (colorId && sizeId) {
      const variant = productData.variants.find(v => 
        v.color_id === colorId && v.size_id === sizeId
      );
      
      if (variant) {
        setStockInfo({ 
          available: variant.stock_quantity > 0, 
          quantity: variant.stock_quantity 
        });
        return;
      }
    }
    
    // Caso não tenha variante específica ou sem variantes, verificar estoque geral
    // Verificamos se há pelo menos um produto em estoque na soma total
    const totalStock = productData.variants.reduce((total, v) => total + v.stock_quantity, 0);
    setStockInfo({ 
      available: totalStock > 0, 
      quantity: totalStock
    });
  };

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
  const finalPrice = product?.discount_percent
    ? product.price * (1 - product.discount_percent / 100)
    : product?.price;

  // Funções de manipulação
  const handleColorChange = (color: any) => {
    setSelectedColor(color);
  };

  const handleSizeChange = (size: any) => {
    setSelectedSize(size);
  };

  const increaseQuantity = () => {
    if (stockInfo.available && quantity < stockInfo.quantity) {
      setQuantity(prev => prev + 1);
    }
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

  const addToCart = async () => {
    setAddingToCart(true);
    
    try {
      // Obter ou criar o carrinho primeiro
      const { cart, error: cartError } = await getOrCreateCart();
      
      if (cartError || !cart) {
        throw new Error('Não foi possível acessar o carrinho de compras');
      }
      
      // Verificar se temos um ID de variante (cor/tamanho) selecionado
      let variantId = '';
      
      if (product && product.variants && product.variants.length > 0) {
        // Se o produto tem variantes, verificar se cor e tamanho foram selecionados
        if (!selectedColor) {
          throw new Error('Por favor, selecione uma cor');
        }
        
        if (!selectedSize) {
          throw new Error('Por favor, selecione um tamanho');
        }
        
        // Encontrar a variante correspondente à cor e tamanho selecionados
        const variant = product.variants.find(
          v => v.color_id === selectedColor.id && v.size_id === selectedSize.id
        );
        
        if (variant) {
          variantId = variant.id;
        }
      }
      
      if (!id) {
        throw new Error('ID do produto não encontrado');
      }
      
      // Adicionar ao carrinho
      const { success, error } = await addItemToCart(
        cart.id,
        id,
        quantity,
        variantId
      );
      
      if (!success) {
        throw new Error(error?.message || 'Não foi possível adicionar o item ao carrinho');
      }
      
      // Atualizar contagem de itens no carrinho
      await updateCartItemsCount();
      
    } catch (error: any) {
      console.error('Erro ao adicionar ao carrinho:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = async () => {
    await addToCart();
    navigate('/carrinho?checkout=true');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return;
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const getStockStatus = () => {
    if (!stockInfo.available || stockInfo.quantity <= 0) return { color: "red", text: "Fora de estoque" };
    if (stockInfo.quantity <= 3) return { color: "red", text: `Últimas ${stockInfo.quantity} unidades!` };
    if (stockInfo.quantity <= 10) return { color: "orange", text: `Baixo estoque: ${stockInfo.quantity} unidades` };
    return { color: "green", text: "Em estoque" };
  };

  // Média das avaliações
  const getAverageRating = () => {
    if (!product?.reviews || product.reviews.length === 0) return 5;
    const sum = product.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / product.reviews.length;
  };

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star 
        key={star} 
        className={`h-4 w-4 ${star <= rating ? "fill-champagne-500 text-rose-300" : "text-gray-300"}`} 
      />
    ));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin border-t-2 border-b-2 border-rose-300"></div>
          <p className="mt-4 text-champagne-500 font-light">Carregando produto...</p>
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
            className="border-champagne-500 text-champagne-500 hover:bg-champagne-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a loja
          </Button>
        </div>
      </div>
    );
  }

  // Definir qual conjunto de imagens mostrar
  const displayImages = imageType === 'model' && product.modelImages 
    ? product.modelImages 
    : product.images?.map(img => img.url) || [];
  
  // Status do estoque
  const stockStatus = getStockStatus();
  
  // Média de avaliações
  const averageRating = getAverageRating();

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 pb-12 pt-28 md:pt-32">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-champagne-500 transition-colors">Início</button>
          <span className="mx-2">/</span>
          <button onClick={() => navigate('/colecao')} className="hover:text-champagne-500 transition-colors">Coleção</button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Seção de imagens */}
          <div className="flex flex-col gap-6">
            {/* Seletores de tipo de imagem (produto/modelo) */}
            <div className="flex mb-4 border-b border-gray-200">
              <button 
                className={`py-2 px-4 font-light ${imageType === 'product' ? 'border-b-2 border-champagne-500 text-champagne-600' : 'text-gray-500'}`}
                onClick={() => setImageType('product')}
              >
                Fotos do Produto
              </button>
              {product.modelImages && (
                <button 
                  className={`py-2 px-4 font-light ${imageType === 'model' ? 'border-b-2 border-champagne-500 text-champagne-600' : 'text-gray-500'}`}
                  onClick={() => setImageType('model')}
                >
                  Com Modelo
                </button>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              {/* Miniaturas ao lado esquerdo para desktop */}
              <div className="order-2 md:order-1 md:w-24 md:h-[600px] overflow-x-auto md:overflow-y-auto md:overflow-x-hidden md:pr-2">
                <div className="flex md:flex-col gap-4 pb-2 md:pb-0">
                  {displayImages.map((img, index) => (
                    <button
                      key={index}
                      className={cn(
                        "relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all",
                        mainImage === img ? "border-champagne-500 shadow-md" : "border-transparent hover:border-gray-200"
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
              
              {/* Imagem principal */}
              <div 
                ref={imageRef}
                className={`order-1 md:order-2 relative h-[600px] flex-grow rounded-lg overflow-hidden bg-gray-50 cursor-zoom-in ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                onClick={toggleZoom}
                onMouseMove={handleMouseMove}
              >
                <div className="absolute top-4 right-4 z-10 flex space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleZoom();
                    }}
                    className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all hover:shadow-lg"
                  >
                    <ZoomIn className="h-5 w-5 text-gray-600" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite();
                    }}
                    className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all hover:shadow-lg"
                  >
                    <Heart 
                      id="heart-icon"
                      className={`h-5 w-5 transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                    />
                  </button>
                </div>
                
                {isZoomed ? (
                  <div 
                    className="absolute inset-0 w-full h-full"
                    style={{
                      backgroundImage: `url(${mainImage})`,
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundSize: '200%',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                ) : (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Informações do produto */}
          <div className="space-y-8">
            <div>
              {product.isNew && (
                <span className="inline-block bg-rose-300 text-white text-xs px-3 py-1 rounded-full font-medium mb-3">
                  Novidade
                </span>
              )}
              {product.discount && (
                <span className="inline-block bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-medium mb-3 ml-2">
                  {product.discount}% OFF
                </span>
              )}
              {product.shipsToday && (
                <span className="inline-block bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full font-medium mb-3 ml-2">
                  Envio Hoje!
                </span>
              )}
              
              <h1 className="text-3xl font-light text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {renderStars(averageRating)}
                </div>
                <span className="text-sm text-gray-500">
                  {product.reviews ? `(${product.reviews.length} avaliações)` : "(Sem avaliações)"}
                </span>
              </div>
            </div>

            <div className="border-t border-b py-6 border-gray-100">
              <div className="flex items-center gap-4">
                {product.discount ? (
                  <>
                    <span className="text-3xl font-light text-champagne-600">{formatPrice(finalPrice || 0)}</span>
                    <span className="text-lg text-gray-400 line-through font-light">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-light text-champagne-600">{formatPrice(product.price)}</span>
                )}
              </div>
              
              <p className="text-sm text-gray-500 mt-2">
                Em até 10x de {formatPrice((finalPrice || product.price) / 10)} sem juros
              </p>
              
              {/* Elementos de urgência */}
              {product.stock && product.stock <= 10 && (
                <div className={`flex items-center mt-4 text-${stockStatus.color}-600`}>
                  <AlertTriangle className={`h-4 w-4 mr-2 text-${stockStatus.color}-600`} />
                  <span className="text-sm font-medium">{stockStatus.text}</span>
                </div>
              )}
              
              {product.shipsToday && (
                <div className="flex items-center mt-2 text-green-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">Pedido até 15h, enviamos hoje!</span>
                </div>
              )}
            </div>

            {/* Descrição com storytelling */}
            <div className="space-y-4">
              <p className="text-gray-700 font-light leading-relaxed">{product.description}</p>
              
              {product.productStory && (
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-rose-300">
                  <h3 className="text-sm font-medium mb-2 text-gray-900">História do Produto</h3>
                  <p className="text-gray-700 font-light italic leading-relaxed">
                    {product.productStory}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Cor: <span className="font-light text-gray-900">{selectedColor?.name}</span>
                  </h3>
                  
                  {/* Tabela de medidas */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="flex items-center text-sm text-champagne-500 hover:underline">
                        <Ruler className="h-4 w-4 mr-1" />
                        Tabela de medidas
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Tabela de Medidas</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-3">Como medir</h4>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="space-y-1">
                            <p className="text-sm"><strong>Busto:</strong> Meça ao redor da parte mais larga do busto</p>
                            <p className="text-sm"><strong>Cintura:</strong> Meça ao redor da parte mais estreita da cintura</p>
                            <p className="text-sm"><strong>Quadril:</strong> Meça ao redor da parte mais larga do quadril</p>
                          </div>
                          <div>
                            <img src="/images/medidas.png" alt="Como medir" className="w-full" />
                          </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-champagne-50">
                                <th className="p-2 border border-gray-200 text-left">Tamanho</th>
                                <th className="p-2 border border-gray-200 text-left">Busto (cm)</th>
                                <th className="p-2 border border-gray-200 text-left">Cintura (cm)</th>
                                <th className="p-2 border border-gray-200 text-left">Quadril (cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="p-2 border border-gray-200">PP</td>
                                <td className="p-2 border border-gray-200">84-88</td>
                                <td className="p-2 border border-gray-200">64-68</td>
                                <td className="p-2 border border-gray-200">90-94</td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="p-2 border border-gray-200">P</td>
                                <td className="p-2 border border-gray-200">88-92</td>
                                <td className="p-2 border border-gray-200">68-72</td>
                                <td className="p-2 border border-gray-200">94-98</td>
                              </tr>
                              <tr>
                                <td className="p-2 border border-gray-200">M</td>
                                <td className="p-2 border border-gray-200">92-96</td>
                                <td className="p-2 border border-gray-200">72-76</td>
                                <td className="p-2 border border-gray-200">98-102</td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="p-2 border border-gray-200">G</td>
                                <td className="p-2 border border-gray-200">96-100</td>
                                <td className="p-2 border border-gray-200">76-80</td>
                                <td className="p-2 border border-gray-200">102-106</td>
                              </tr>
                              <tr>
                                <td className="p-2 border border-gray-200">GG</td>
                                <td className="p-2 border border-gray-200">100-104</td>
                                <td className="p-2 border border-gray-200">80-84</td>
                                <td className="p-2 border border-gray-200">106-110</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-4">*As medidas podem variar em até 2cm</p>
                      </div>
                      <DialogClose asChild>
                        <Button 
                          variant="outline" 
                          className="mt-4 w-full border-champagne-500 text-champagne-500 hover:bg-champagne-50"
                        >
                          Fechar
                        </Button>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex gap-3">
                  {product.colors?.map((color) => (
                    <button
                      key={color.name}
                      className={cn(
                        "h-10 w-10 rounded-full transition-all",
                        selectedColor?.name === color.name 
                          ? "ring-2 ring-champagne-500 ring-offset-2 scale-110" 
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
                <h3 className="text-sm font-medium mb-3 text-gray-700">Tamanho: <span className="font-light text-gray-900">{selectedSize?.size}</span></h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map((size) => (
                    <button
                      key={size.id}
                      className={cn(
                        "h-11 min-w-[3rem] px-4 rounded-md border border-gray-200 font-light transition-all",
                        selectedSize?.id === size.id
                          ? "bg-champagne-500 text-white border-champagne-500"
                          : "bg-white text-gray-700 hover:border-champagne-300 hover:text-champagne-500"
                      )}
                      onClick={() => handleSizeChange(size)}
                    >
                      {size.size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3 text-gray-700">Quantidade</h3>
                <div className="inline-flex items-center border border-gray-200 rounded-md">
                  <button
                    className="flex justify-center items-center h-12 w-12 text-gray-500 hover:text-champagne-500 transition-colors border-r border-gray-200"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-light">{quantity}</span>
                  <button
                    className="flex justify-center items-center h-12 w-12 text-gray-500 hover:text-champagne-500 transition-colors border-l border-gray-200"
                    onClick={increaseQuantity}
                    disabled={product.stock !== undefined && quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* Alerta de produto fora de estoque */}
              {!stockInfo.available && (
                <div className="w-full p-3 mb-2 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">Este produto está temporariamente fora de estoque.</span>
                </div>
              )}
              
              <Button 
                className={`py-7 px-8 text-base font-medium tracking-wide flex-1 shadow-lg hover:shadow-xl ${
                  stockInfo.available 
                    ? "bg-rose-300 hover:bg-rose-400" 
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                onClick={buyNow}
                disabled={!stockInfo.available}
              >
                {stockInfo.available ? "COMPRE AGORA" : "INDISPONÍVEL"}
              </Button>
              
              <Button 
                className={`py-4 px-8 text-base font-light tracking-wide flex-1 ${
                  stockInfo.available 
                    ? "bg-black hover:bg-gray-800 text-white" 
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                onClick={addToCart}
                disabled={!stockInfo.available}
              >
                <ShoppingBag className="mr-2 h-5 w-5" /> 
                {stockInfo.available ? "Adicionar ao Carrinho" : "Indisponível"}
              </Button>
            </div>

            {/* Status de estoque e aviso de notificação */}
            <div className="pt-2">
              {!stockInfo.available ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-red-700 font-medium">Fora de estoque</span>
                  </div>
                  <button 
                    className="text-sm text-champagne-500 hover:underline flex items-center"
                    onClick={() => alert('Você será notificado quando este produto voltar ao estoque.')}
                  >
                    <Bell className="h-4 w-4 mr-1" />
                    Avise-me quando disponível
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full mr-2 bg-${stockStatus.color}-500`}></div>
                  <span className={`text-sm text-${stockStatus.color}-700`}>
                    {stockStatus.text}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg">
                <Truck className="h-6 w-6 text-champagne-500" />
                <div>
                  <h4 className="text-sm font-medium">Entrega rápida</h4>
                  <p className="text-xs text-gray-500">2-4 dias úteis</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg">
                <Shield className="h-6 w-6 text-champagne-500" />
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
                    <span className="font-medium">Categoria:</span> <span className="font-light">{product.category?.name}</span>
                  </p>
                </div>
              </div>
              
              {product.tags && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {product.tags.map((tag: string, idx: number) => (
                    <span 
                      key={idx}
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

        {/* Calculadora de Frete */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-light mb-6 text-gray-900 border-b border-gray-100 pb-3">
              Calcule o Frete e o Prazo de Entrega
            </h2>
            <ShippingCalculator
              products={[{
                id: product.id,
                width: 15,
                height: 5,
                length: 20,
                weight: product.weight || 0.5,
                insurance_value: product.price || 0,
                quantity: quantity
              } as any]}
              compact={true}
            />
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
                {typeof product.features === 'string' ? (
                  <li className="flex items-start">
                    <span className="inline-block h-6 w-6 min-w-[1.5rem] mt-0.5 mr-3 bg-champagne-50 text-champagne-500 rounded-full flex items-center justify-center text-xs">✓</span>
                    <span className="font-light text-gray-700">{product.features}</span>
                  </li>
                ) : Array.isArray(product.features) ? product.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block h-6 w-6 min-w-[1.5rem] mt-0.5 mr-3 bg-champagne-50 text-champagne-500 rounded-full flex items-center justify-center text-xs">✓</span>
                    <span className="font-light text-gray-700">{feature}</span>
                  </li>
                )) : null}
              </ul>
            </TabsContent>
            
            <TabsContent value="details" className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-gray-800">Cuidados</h3>
                  <ul className="space-y-2 font-light text-gray-700">
                    <li className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-300 mr-2"></span>
                      Lavar à mão ou na máquina com água fria
                    </li>
                    <li className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-300 mr-2"></span>
                      Não usar alvejante
                    </li>
                    <li className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-300 mr-2"></span>
                      Secar na sombra
                    </li>
                    <li className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-300 mr-2"></span>
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
              {product.reviews && product.reviews.length > 0 ? (
                <div>
                  <div className="mb-8 flex items-center">
                    <div className="bg-gray-100 p-4 rounded-lg text-center mr-8">
                      <p className="text-5xl font-light text-champagne-600 mb-1">{averageRating.toFixed(1)}</p>
                      <div className="flex justify-center my-2">
                        {renderStars(averageRating)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {product.reviews.length} avaliações
                      </p>
                    </div>
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = product.reviews?.filter(r => r.rating === star).length || 0;
                        const percentage = product.reviews ? (count / product.reviews.length) * 100 : 0;
                        
                        return (
                          <div className="flex items-center mb-1" key={star}>
                            <div className="flex items-center w-24">
                              <span className="text-sm mr-2">{star}</span>
                              <Star className="h-4 w-4 fill-champagne-500 text-rose-300" />
                            </div>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-champagne-500" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-500 w-16">{count} ({percentage.toFixed(0)}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <Button className="mb-8 bg-champagne-500 hover:bg-champagne-600 font-light">
                    Escrever uma avaliação
                  </Button>
                  
                  <div className="space-y-6">
                    {product.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-800">{review.user_name || 'Usuário'}</p>
                            <div className="flex items-center mt-1">
                              {renderStars(review.rating)}
                              <span className="ml-2 text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded flex items-center">
                            <Check size={12} className="mr-1" /> Compra verificada
                          </div>
                        </div>
                        <p className="font-light text-gray-700 mt-3">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Seja o primeiro a avaliar</h3>
                  <p className="text-gray-600 font-light mb-6">
                    Este produto ainda não possui avaliações. Compartilhe sua experiência!
                  </p>
                  <Button className="bg-champagne-500 hover:bg-champagne-600 font-light">
                    Escrever uma avaliação
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 