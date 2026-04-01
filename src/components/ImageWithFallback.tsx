import React, { useState, type ImgHTMLAttributes } from 'react';
import { FALLBACK_IMAGE } from '../lib/fetchWithRetry';

interface ImageWithFallbackProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallbackSrc?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = FALLBACK_IMAGE,
  alt,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!error) {
      setImgSrc(fallbackSrc);
      setError(true);
    }
  };

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  );
};
