// Pequeñas utilidades para construir srcset a partir de una URL de Marvel
type MarvelVariant =
  | "standard_amazing" | "standard_xlarge" | "standard_fantastic"
  | "portrait_small"   | "portrait_medium" | "portrait_xlarge"
  | "portrait_fantastic" | "portrait_incredible" | "portrait_uncanny";

/** Cambia el "variant" de la última parte de la URL: .../<variant>.<ext>  */
export function swapMarvelVariant(url: string, variant: MarvelVariant): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const file = parts.pop() || "";
    const ext = (file.split(".").pop() || "jpg").toLowerCase();
    const base = `${u.origin}${parts.join("/")}`;
    return `${base}/${variant}.${ext}`;
  } catch {
    // Fallback por si no es una URL absoluta (no debería pasar)
    return url.replace(/\/[^/]+\.(jpg|jpeg|png|gif|webp)$/i, `/${variant}.$1`);
  }
}

/** srcset para miniaturas cuadradas (cards de personajes) */
export function standardSrcSet(url: string): string {
  // Anchos aproximados oficiales de Marvel
  const variants: [MarvelVariant, number][] = [
    ["standard_amazing",   180],
    ["standard_xlarge",    200],
    ["standard_fantastic", 250],
  ];
  return variants
    .map(([v, w]) => `${swapMarvelVariant(url, v)} ${w}w`)
    .join(", ");
}

/** srcset para portadas 2:3 (lista de cómics) */
export function portraitSrcSet(url: string): string {
  const variants: [MarvelVariant, number][] = [
    ["portrait_medium",     100],
    ["portrait_xlarge",     150],
    ["portrait_fantastic",  168],
    ["portrait_incredible", 216],
    ["portrait_uncanny",    300],
  ];
  return variants
    .map(([v, w]) => `${swapMarvelVariant(url, v)} ${w}w`)
    .join(", ");
}
