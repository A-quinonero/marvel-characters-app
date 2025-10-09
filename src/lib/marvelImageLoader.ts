// src/lib/marvelImageLoader.ts
import type { ImageLoader } from 'next/image';

// Exporto baseFromMarvel también por si quieres blurDataURL rápido
export function baseFromMarvel(src: string) {
  return src.replace(/\/(portrait|standard|landscape)_[^/.]+\.[a-z]+$/i, '');
}
function getExt(src: string) {
  const m = src.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i);
  return m ? m[1] : 'jpg';
}

function pickStandardVariant(w: number) {
 
  if (w <= 180) return 'standard_large';
  if (w <= 200) return 'standard_xlarge';
  if (w <= 250) return 'standard_fantastic';
  return 'standard_amazing';
}

function pickPortraitVariant(w: number) {

  if (w <= 225) return 'portrait_xlarge';
  if (w <= 252) return 'portrait_fantastic';
  if (w <= 300) return 'portrait_uncanny';
  return 'portrait_incredible';
}

export const marvelSquareLoader: ImageLoader = ({ src, width, quality }) => {
  const base = baseFromMarvel(src);
  const ext = getExt(src);
  const variant = pickStandardVariant(width);
  const q = quality ? `?q=${quality}` : '';
  return `${base}/${variant}.${ext}${q}`;
};

export const marvelPortraitLoader: ImageLoader = ({ src, width, quality }) => {
  const base = baseFromMarvel(src);
  const ext = getExt(src);
  const variant = pickPortraitVariant(width);
  const q = quality ? `?q=${quality}` : '';
  return `${base}/${variant}.${ext}${q}`;
};
