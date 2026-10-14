import type { ImgHTMLAttributes } from 'react';
import { getStaticImageProps } from '@/lib/staticImages';

export default function OptimizedImage({ src, srcSet, sizes, decoding = 'async', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const source = srcSet ? { src, srcSet, sizes } : getStaticImageProps(src, sizes);
  return <img {...source} {...props} decoding={decoding} />;
}
