"use client";

import { useMemo, useCallback } from "react";
import type { Character } from "@/types/characters";
import type { Comic } from "@/types/comic";
import { useFavorites } from "@/hooks/useFavorites";

export function useCharacterDetail(character: Character, comics: Comic[]) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const favorite = isFavorite(character.id);

  const toggleFavorite = useCallback(() => {
    if (favorite) removeFavorite(character.id);
    else addFavorite({ id: character.id, name: character.name, thumbnail: character.thumbnail });
  }, [favorite, character.id, character.name, character.thumbnail, addFavorite, removeFavorite]);

  // Aseguramos orden por fecha ascendente (por si cambia proveedor)
  const sortedComics = useMemo(() => {
    return [...comics].sort((a, b) => {
      const da = a.onsaleDate ? Date.parse(a.onsaleDate) : 0;
      const db = b.onsaleDate ? Date.parse(b.onsaleDate) : 0;
      return da - db;
    });
  }, [comics]);

  return { favorite, toggleFavorite, sortedComics };
}
