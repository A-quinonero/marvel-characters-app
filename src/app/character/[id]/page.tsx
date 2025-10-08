// src/app/character/[id]/page.tsx
export const runtime = "nodejs";

import { notFound } from "next/navigation";

import type { MarvelCharacterDTO, MarvelComicDTO } from "@/types/api";
import CharacterDetailClient from "@/components/CharacterDetailClient/CharacterDetailClient";
import { mapCharacter, mapComic, marvelFetch } from "@/app/api/marvel/_utils";

type PageProps = { params: Promise<{ id: string }> }; // Next 15: params es Promise

export default async function CharacterDetailPage({ params }: PageProps) {
  const { id } = await params;              // 👈 await obligatorio en Next 15
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  // Construimos ambas promesas 100% en el servidor
  const characterPromise = (async () => {
    const data = await marvelFetch<MarvelCharacterDTO>(`/characters/${numericId}`);
    const dto = data.results[0];
    return dto ? mapCharacter(dto) : null;
  })();

  const comicsPromise = (async () => {
    const data = await marvelFetch<MarvelComicDTO>(`/characters/${numericId}/comics`, {
      limit: 20,
      orderBy: "onsaleDate",
    });
    return data.results.map(mapComic);
  })();

  const character = await characterPromise;
  if (!character) notFound();

  // Pasamos la PROMESA (ya creada en server) al cliente
  return <CharacterDetailClient character={character} comicsPromise={comicsPromise} />;
}
