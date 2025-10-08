import {  Character } from "@/types/characters";
import { ComicsResponse, Comic } from "@/types/comic";

const BASE = "/api/marvel";

export async function fetchCharacters(
  nameStartsWith?: string,
  limit = 50,
  offset = 0,
  signal?: AbortSignal
): Promise<Character[]> {
  const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (nameStartsWith) qs.set("nameStartsWith", nameStartsWith);

  const res = await fetch(`/api/marvel/characters?${qs.toString()}`, { signal });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  return json.results as Character[];
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
