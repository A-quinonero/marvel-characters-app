"use client";

import React, { createContext, useContext, useMemo, useReducer, useCallback } from "react";
import { charactersInitialState, charactersReducer } from "@/reducers/charactersReducer";
import { Character } from "@/types/characters";
import { fetchCharacters } from "@/lib/api/marvel";

type Ctx = {
  characters: Character[];
  loading: boolean;
  query: string;
  error?: string;
  search: (q: string) => Promise<void>;
  clearSearch: () => void;
};

const CharactersContext = createContext<Ctx | null>(null);

type CharactersProviderProps = {
  children: React.ReactNode;
  initialData?: Character[]; // Opcional, para SSR
};

export const CharactersProvider: React.FC<CharactersProviderProps> = ({
  children,
  initialData,
}) => {
  // Si hay initialData (SSR), úsalo como estado inicial
  const [state, dispatch] = useReducer(
    charactersReducer,
    initialData ? { ...charactersInitialState, characters: initialData } : charactersInitialState
  );

  const search = useCallback(
    async (q: string) => {
      // Si la búsqueda está vacía y tenemos datos iniciales, restaurar
      if (!q && initialData) {
        dispatch({ type: "SET_CHARACTERS", payload: initialData });
        dispatch({ type: "SET_QUERY", payload: "" });
        return;
      }

      dispatch({ type: "SET_QUERY", payload: q });
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const results = await fetchCharacters(q || undefined, 50, 0);
        dispatch({ type: "SET_CHARACTERS", payload: results });
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Error fetching characters" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [initialData]
  );

  const clearSearch = useCallback(() => {
    if (initialData) {
      dispatch({ type: "SET_CHARACTERS", payload: initialData });
    }
    dispatch({ type: "SET_QUERY", payload: "" });
  }, [initialData]);

  const value = useMemo<Ctx>(
    () => ({
      characters: state.characters,
      loading: state.loading,
      query: state.query,
      error: state.error,
      search,
      clearSearch,
    }),
    [state, search, clearSearch]
  );

  return <CharactersContext.Provider value={value}>{children}</CharactersContext.Provider>;
};

export const useCharactersContext = () => {
  const ctx = useContext(CharactersContext);
  if (!ctx) throw new Error("useCharactersContext must be used within CharactersProvider");
  return ctx;
};
