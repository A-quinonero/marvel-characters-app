import { notFound } from "next/navigation";
import { mapCharacter, mapComic, marvelFetch } from "@/app/api/marvel/_utils";
import type { MarvelCharacterDTO, MarvelComicDTO } from "@/types/api";
import type { Character } from "@/types/characters";
import type { Comic } from "@/types/comic";
import CharacterDetailClient from "@/components/CharacterDetailClient/CharacterDetailClient";

// 👇 params es una PROMESA
type PageProps = { params: Promise<{ id: string }> };

export default async function CharacterDetailPage({ params }: PageProps) {
  // 👇 hay que await
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id)) notFound();

  // Personaje
  const charData = await marvelFetch<MarvelCharacterDTO>(`/characters/${id}`);
  const dto = charData.results[0];
  if (!dto) notFound();
  const character: Character = mapCharacter(dto);

  // Cómics (primeros 20, ordenados por fecha)
  const comicsData = await marvelFetch<MarvelComicDTO>(`/characters/${id}/comics`, {
    limit: 20,
    orderBy: "onsaleDate",
  });
  const comics: Comic[] = comicsData.results.map(mapComic);

  return <CharacterDetailClient character={character} comics={comics} />;
}
