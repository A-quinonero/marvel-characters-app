// app/providers.tsx
"use client";

import { CharactersProvider } from "@/context/CharactersProvider";
import { FavoritesProvider } from "@/context/FavoritesProvider";
import { Character } from "@/types/characters";

type ClientProvidersProps = {
  children: React.ReactNode;
  initialCharacters?: Character[]; // Datos del servidor
};

export default function ClientProviders({ children, initialCharacters }: ClientProvidersProps) {
  return (
    <FavoritesProvider>
      <CharactersProvider initialData={initialCharacters}>
        {children}
      </CharactersProvider>
    </FavoritesProvider>
  );
}