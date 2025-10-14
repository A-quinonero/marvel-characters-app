import { Suspense } from "react";

import { marvelFetch, mapCharacter } from "@/app/api/marvel/_utils";
import CharacterCardSkeleton from "@/components/CharacterCard/CharacterCardSkeleton";
import HomeClient from "@/components/HomeClient/HomeClient";
import { MarvelCharacterDTO } from "@/types/api";

function HomeFallback() {
  return (
    <div
      style={{
        padding: 24,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(172px,1fr))",
        gap: 12,
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <CharacterCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function HomePage() {
  const data = await marvelFetch<MarvelCharacterDTO>("/characters", {
    limit: 50,
    offset: 0,
    orderBy: "name",
  });
  const initial = data.results.map(mapCharacter);

  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeClient initialData={initial} />
    </Suspense>
  );
}
