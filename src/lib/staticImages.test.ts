import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import manifest from '@/generated/static-images.json';
import { getStaticImageProps, optimizeStaticImageHtml } from './staticImages';

describe('static WebP delivery', () => {
  it('ships every candidate with a WebP payload and a unique width descriptor', () => {
    expect(Object.keys(manifest).length).toBeGreaterThan(0);
    for (const image of Object.values(manifest)) {
      const widths = new Set();
      for (const candidate of image.srcSet.split(', ')) {
        const [url, width] = candidate.split(' ');
        const path = resolve('public', url.slice(1));
        expect(existsSync(path), url).toBe(true);
        const file = readFileSync(path);
        expect(file.toString('ascii', 0, 4), url).toBe('RIFF');
        expect(file.toString('ascii', 8, 12), url).toBe('WEBP');
        expect(Number(width.slice(0, -1))).toBeLessThanOrEqual(image.width);
        expect(widths.has(width), url).toBe(false);
        widths.add(width);
      }
      expect(image.srcSet).toContain(`${image.src} `);
    }
  });

  it('keeps remote and signed media URLs outside the static-image rewrite', () => {
    for (const src of [
      'https://example.com/images/photo.jpg?token=private',
      '/images/not-in-the-manifest.jpg',
      undefined,
    ]) expect(getStaticImageProps(src)).toEqual({ src });
  });

  it('optimizes managed article photos while preserving links, alt, crop styles and explicit source sets', () => {
    const src = '/images/programs/life-experience-camp-feet.png';
    const html = `<a href="${src}"><img src="${src}" alt="菜园" style="object-position:50% 42%"></a>`;
    const element = document.createElement('div');
    element.innerHTML = optimizeStaticImageHtml(html);
    expect(element.querySelector('a')?.getAttribute('href')).toBe(src);
    const image = element.querySelector('img');
    expect(image?.getAttribute('src')).toBe(manifest[src].src);
    expect(image?.getAttribute('srcset')).toBe(manifest[src].srcSet);
    expect(image?.alt).toBe('菜园');
    expect(image?.style.objectPosition).toBe('50% 42%');
    expect(image?.getAttribute('loading')).toBe('lazy');
    expect(image?.getAttribute('decoding')).toBe('async');
    element.innerHTML = optimizeStaticImageHtml(`<img src="${src}" srcset="/custom.webp 640w" loading="eager">`);
    expect(element.querySelector('img')?.getAttribute('src')).toBe(src);
    expect(element.querySelector('img')?.getAttribute('srcset')).toBe('/custom.webp 640w');
    expect(element.querySelector('img')?.getAttribute('loading')).toBe('eager');
  });
});
