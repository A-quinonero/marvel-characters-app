"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import debounce from "lodash.debounce";
import { useCharactersContext } from "@/context/CharactersProvider";
import { useFavorites } from "@/hooks/useFavorites";
import type { Character } from "@/types/characters";

export function useSearch() {
  const { characters, loading, query, search, clearSearch } = useCharactersContext();
  const { favorites } = useFavorites();
  const params = useSearchParams();

  // Estado controlado del input de búsqueda
  const [searchTerm, setSearchTerm] = useState<string>(query);

  // Sincronizar searchTerm con query del contexto
  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  // Referencia estable a search
  const searchRef = useRef(search);
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  // Debounced search - creado una sola vez
  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        void searchRef.current(term);
      }, 300),
    []
  );

  // Handler para cambios en el input
  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      debouncedSearch(value.trim());
    },
    [debouncedSearch]
  );

  // Limpiar debounce al desmontar
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Función para limpiar búsqueda
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    debouncedSearch.cancel();
    clearSearch();
  }, [clearSearch, debouncedSearch]);

  // Determinar si mostrar favoritos
  const showFavorites = params.get("favorites") === "1";

  // Lista de resultados basada en el modo
  const results = useMemo<Character[]>(
    () => (showFavorites ? favorites : characters),
    [showFavorites, favorites, characters]
  );

  return {
    // Búsqueda
    searchTerm,
    handleSearch,
    handleClearSearch,

    // Resultados
    results,
    resultsCount: results.length,

    // Estados
    isSearching: loading,
    showFavorites,
  };
}
