export const runtime = "nodejs";

import { notFound } from "next/navigation";
import CharacterDetailClient from "@/components/CharacterDetailClient/CharacterDetailClient";
import type { MarvelCharacterDTO, MarvelComicDTO } from "@/types/api";
import { mapCharacter, mapComic, marvelFetch } from "@/app/api/marvel/_utils";
import { readFixture } from "@/lib/readFixture";

type PageProps = { params: Promise<{ id: string }> };

export default async function CharacterDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  if (process.env.MOCK_API === "1" || process.env.NEXT_PUBLIC_MOCK_API === "1") {
    const all = await readFixture<
      Array<{
        id: number;
        name: string;
        description: string;
        thumbnail: string;
      }>
    >("characters.json");

    const character = all.find((c) => c.id === numericId) ?? null;
    if (!character) notFound();

    let comics: Array<{ id: number; title: string; onsaleDate?: string; thumbnail: string }> = [];
    try {
      const obj = await readFixture<{ results?: typeof comics }>(`comics.${numericId}.json`);
      comics = obj.results ?? [];
    } catch {
      comics = [];
    }

    const comicsPromise = Promise.resolve(comics);
    return <CharacterDetailClient character={character} comicsPromise={comicsPromise} />;
  }
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

  return <CharacterDetailClient character={character} comicsPromise={comicsPromise} />;
}
