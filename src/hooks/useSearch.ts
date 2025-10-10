// src/hooks/useSearch.ts
"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import debounce from "lodash.debounce";
import { useCharactersContext } from "@/context/CharactersProvider";
import { useFavorites } from "@/hooks/useFavorites";
import type { Character } from "@/types/characters";

type Debounced = ((term: string) => void) & { cancel: () => void };

const MIN_CHARS = 1;

export function useSearch() {
  const { characters, loading, query, search, clearSearch } = useCharactersContext();
  const { favorites } = useFavorites();
  const params = useSearchParams();

  const showFavorites = params.get("favorites") === "1";

  const [searchTerm, setSearchTerm] = useState<string>(query ?? "");

  useEffect(() => {
    if (!showFavorites) setSearchTerm(query);
  }, [query, showFavorites]);

  // Debounce estable (1 sola instancia)
  const debouncedRef = useRef<Debounced | null>(null);
  useEffect(() => {
    debouncedRef.current = debounce((term: string) => {
      if (term) {
        void search(term);
      } else {
        clearSearch();
      }
    }, 300) as Debounced;

    return () => debouncedRef.current?.cancel();
  }, [search, clearSearch]);

  const lastTermRef = useRef<string>("");
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    debouncedRef.current?.cancel();
    lastTermRef.current = "";
    clearSearch();
  }, [clearSearch]);

  useEffect(() => {
    if (showFavorites) {
      handleClearSearch();
      debouncedRef.current?.cancel();
    }
  }, [showFavorites, handleClearSearch]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);

      if (showFavorites) {
        return;
      }

      const term = value.trim();
      const norm = term.toLowerCase();

      if (norm.length === 0) {
        debouncedRef.current?.cancel();
        lastTermRef.current = "";
        clearSearch();
        return;
      }

      if (norm.length < MIN_CHARS) {
        debouncedRef.current?.cancel();
        return;
      }

      if (norm === lastTermRef.current) return;
      lastTermRef.current = norm;

      debouncedRef.current?.(term);
    },
    [showFavorites, clearSearch]
  );

  const results = useMemo<Character[]>(() => {
    if (showFavorites) {
      const norm = searchTerm.toLowerCase().trim();
      return norm ? favorites.filter((f) => f.name.toLowerCase().includes(norm)) : favorites;
    }
    return characters;
  }, [showFavorites, searchTerm, favorites, characters]);

  const resultsCount = results.length;

  const counterLabel = useMemo(() => {
    const label = resultsCount === 1 ? "Result" : "Results";
    return `${resultsCount} ${label}`;
  }, [resultsCount]);

  const isSearching = !showFavorites && loading;

  return {
    searchTerm,
    handleSearch,
    handleClearSearch,
    results,
    resultsCount,
    counterLabel,
    isSearching,
    showFavorites,
  };
}
