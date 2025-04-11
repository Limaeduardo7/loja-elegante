import { useState, ImgHTMLAttributes } from 'react';

// Propriedades estendidas para o componente de imagem
interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

// Componente de imagem com fallback
const ImageWithFallback = ({ 
  src, 
  fallbackSrc = '/placeholder-image.png', 
  alt = 'Imagem',
  ...props
}: ImageWithFallbackProps) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback; 