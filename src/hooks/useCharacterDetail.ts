"use client";

import { useMemo, useCallback } from "react";
import type { Character } from "@/types/characters";
import type { Comic } from "@/types/comic";
import { useFavorites } from "@/hooks/useFavorites";

export function useCharacterDetail(character: Character | null, comics?: Comic[]) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const favorite = character ? isFavorite(character.id) : false;

  const toggleFavorite = useCallback(() => {
    if (!character) return;

    if (favorite) {
      removeFavorite(character.id);
    } else {
      addFavorite({ 
        id: character.id, 
        name: character.name, 
        thumbnail: character.thumbnail 
      });
    }
  }, [favorite, character, addFavorite, removeFavorite]);

  const sortedComics = useMemo(() => {
    if (!comics) return [];
    
    return [...comics].sort((a, b) => {
      const da = a.onsaleDate ? Date.parse(a.onsaleDate) : 0;
      const db = b.onsaleDate ? Date.parse(b.onsaleDate) : 0;
      return da - db;
    });
  }, [comics]);

  return { favorite, toggleFavorite, sortedComics };
}