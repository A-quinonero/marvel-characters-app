import { Character } from "@/types/characters";
import { ComicsResponse, Comic } from "@/types/comic";

// 1. Función para obtener la URL base absoluta
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // En el navegador, las rutas relativas funcionan bien
    return "";
  }
  if (process.env.VERCEL_URL) {
    // En Vercel, usamos la URL del entorno
    return `https://${process.env.VERCEL_URL}`;
  }
  // En desarrollo local (servidor), usamos localhost
  return "http://localhost:3000";
};

const ABSOLUTE_BASE = getBaseUrl();
const API_ROUTE_BASE = "/api/marvel";

export async function fetchCharacters(
  nameStartsWith?: string,
  limit = 50,
  offset = 0,
  signal?: AbortSignal
): Promise<Character[]> {
  const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (nameStartsWith) qs.set("nameStartsWith", nameStartsWith);

  // 2. Se antepone la URL base absoluta
  const res = await fetch(`${ABSOLUTE_BASE}${API_ROUTE_BASE}/characters?${qs.toString()}`, {
    signal,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  return json.results as Character[];
}

export async function fetchCharacterById(id: number): Promise<Character | null> {
  // 2. Se antepone la URL base absoluta
  const res = await fetch(`${ABSOLUTE_BASE}${API_ROUTE_BASE}/characters/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null; // Devuelve null si no se encuentra
    throw new Error("Failed to fetch character");
  }
  const characterData = await res.json();
  return characterData as Character;
}

export async function fetchComicsByCharacter(id: number): Promise<Comic[]> {
  // 2. Se antepone la URL base absoluta
  const res = await fetch(`${ABSOLUTE_BASE}${API_ROUTE_BASE}/characters/${id}/comics`);
  if (!res.ok) throw new Error("Failed to fetch comics");
  const data = (await res.json()) as ComicsResponse;
  return data.results;
}
