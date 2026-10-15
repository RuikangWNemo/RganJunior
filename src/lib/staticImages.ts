import manifest from '@/generated/static-images.json';

type StaticImage = { src: string; srcSet: string; width: number; height: number };
const images: Readonly<Record<string, StaticImage>> = manifest;

// Only exact public paths in the generated manifest qualify. Signed/remote URLs stay intact.
export function getStaticImageProps(src: string | undefined, sizes = '(max-width: 767px) calc(100vw - 2rem), 50vw') {
  const image = src && Object.prototype.hasOwnProperty.call(images, src) ? images[src] : undefined;
  return image ? { src: image.src, srcSet: image.srcSet, sizes } : { src };
}

// Published HTML is already sanitized upstream. This only changes known image attributes.
export function optimizeStaticImageHtml(html: string): string {
  if (!html || typeof document === 'undefined') return html;
  const template = document.createElement('template');
  template.innerHTML = html;
  for (const image of template.content.querySelectorAll('img')) {
    const source = image.getAttribute('src');
    const entry = source && Object.prototype.hasOwnProperty.call(images, source) ? images[source] : undefined;
    if (entry && !image.hasAttribute('srcset')) {
      image.setAttribute('src', entry.src);
      image.setAttribute('srcset', entry.srcSet);
      image.setAttribute('sizes', '(max-width: 767px) calc(100vw - 2rem), 672px');
      if (!image.hasAttribute('width')) image.setAttribute('width', String(entry.width));
      if (!image.hasAttribute('height')) image.setAttribute('height', String(entry.height));
    }
    if (!image.hasAttribute('loading')) image.setAttribute('loading', 'lazy');
    if (!image.hasAttribute('decoding')) image.setAttribute('decoding', 'async');
  }
  return template.innerHTML;
}
