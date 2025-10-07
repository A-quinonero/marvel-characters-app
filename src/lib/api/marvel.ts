import { CharactersResponse, Character } from "@/types/characters";
import { ComicsResponse, Comic } from "@/types/comic";

const BASE = "/api/marvel";

export async function fetchCharacters(
  nameStartsWith?: string,
  limit = 50,
  offset = 0
): Promise<Character[]> {
  const params = new URLSearchParams();
  if (nameStartsWith) params.set("nameStartsWith", nameStartsWith);
  params.set("limit", String(limit));
  params.set("offset", String(offset));

  const res = await fetch(`${BASE}/characters?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch characters");
  const data = (await res.json()) as CharactersResponse;
  return data.results;
}

export async function fetchCharacterById(id: number): Promise<Character> {
  const res = await fetch(`${BASE}/characters/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch character");
  return (await res.json()) as Character;
}

export async function fetchComicsByCharacter(id: number): Promise<Comic[]> {
  const res = await fetch(`${BASE}/characters/${id}/comics`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch comics");
  const data = (await res.json()) as ComicsResponse;
  return data.results;
}
