import { notFound } from "next/navigation";
import { fetchCharacterById, fetchComicsByCharacter } from "@/lib/api/marvel";
import CharacterDetailClient from "@/components/CharacterDetailClient/CharacterDetailClient";

type PageProps = {
  params: { id: string };
};

export default async function CharacterDetailPage({ params }: PageProps) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    notFound();
  }

  // 1. Lanzamos ambas peticiones en PARALELO, sin 'await'
  const characterPromise = fetchCharacterById(id);
  const comicsPromise = fetchComicsByCharacter(id);

  // 2. Esperamos solo por los datos del personaje para la carga inicial
  const character = await characterPromise;
  if (!character) {
    notFound();
  }

  // 3. Pasamos el personaje resuelto y la PROMESA de los cómics al cliente
  return (
    <CharacterDetailClient character={character} comicsPromise={comicsPromise} />
  );
}