import type { ImageLoader } from "next/image";

function splitMarvelSrc(src: string): { base: string; ext: string } {
  const m = src.match(
    /^(.*?)(?:\/(portrait|standard|landscape)_[^/.]+)?\.(jpg|jpeg|png|gif|webp|avif)$/i
  );
  if (m) return { base: m[1], ext: m[3].toLowerCase() };

  // Si no hay extensión al final, asumimos jpg
  // (Marvel casi siempre entrega jpg; ajusta si necesitas)
  return { base: src.replace(/\/$/, ""), ext: "jpg" };
}

function pickStandardVariant(w: number) {
  if (w <= 100) return "standard_medium";
  if (w <= 140) return "standard_large"; // 140x140
  if (w <= 180) return "standard_amazing"; // 180x180
  if (w <= 200) return "standard_xlarge"; // 200x200
  return "standard_fantastic"; // 250x250
}

function pickPortraitVariant(w: number) {
  if (w <= 150) return "portrait_xlarge"; // 150x225
  if (w <= 168) return "portrait_fantastic"; // 168x252
  if (w <= 216) return "portrait_incredible"; // 216x324
  return "portrait_uncanny"; // 300x450
}

export const marvelSquareLoader: ImageLoader = ({ src, width }) => {
  const { base, ext } = splitMarvelSrc(src);
  const variant = pickStandardVariant(width);
  return `${base}/${variant}.${ext}`;
};

export const marvelPortraitLoader: ImageLoader = ({ src, width }) => {
  const { base, ext } = splitMarvelSrc(src);
  const variant = pickPortraitVariant(width);
  return `${base}/${variant}.${ext}`;
};
export const marvelFullSize: ImageLoader = ({ src }) => {
  const { base, ext } = splitMarvelSrc(src);
  return `${base}.${ext}`;
};
