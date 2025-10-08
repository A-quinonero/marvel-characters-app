export function formatOnSaleDate(iso?: string) {
  if (!iso) return "Fecha no disponible";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Fecha no disponible";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
