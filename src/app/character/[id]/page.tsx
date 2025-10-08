// src/app/character/[id]/page.tsx
import { notFound } from "next/navigation";
import { fetchCharacterById, fetchComicsByCharacter } from "@/lib/api/marvel";
import CharacterDetailClient from "@/components/CharacterDetailClient/CharacterDetailClient";

type PageParams = { id: string };
type PageProps = { params: Promise<PageParams> };

export default async function CharacterDetailPage({ params }: PageProps) {
  // 👇 Next 15: params es una Promise, hay que await
  const { id: idParam } = await params;

  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  // Lanza las dos en paralelo
  const characterPromise = fetchCharacterById(id);
  const comicsPromise = fetchComicsByCharacter(id);

  // Espera solo el personaje para render inicial
  const character = await characterPromise;
  if (!character) notFound();

  // Pasa la PROMESA de los cómics al cliente (para suspense/lazy)
  return <CharacterDetailClient character={character} comicsPromise={comicsPromise} />;
}
