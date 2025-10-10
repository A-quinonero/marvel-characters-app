// src/context/CharactersProvider.tsx
"use client";

import React, { createContext, useContext, useMemo, useReducer, useCallback, useRef } from "react";
import { charactersInitialState, charactersReducer } from "@/reducers/charactersReducer";
import type { Character } from "@/types/characters";
import { fetchCharacters } from "@/lib/api/marvel";

type Ctx = {
  characters: Character[];
  loading: boolean;
  query: string;
  error?: string;
  search: (q: string) => Promise<void>;
  clearSearch: () => void;
  initializeCharacters: (data: Character[]) => void;
};

const CharactersContext = createContext<Ctx | null>(null);

export const CharactersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(charactersReducer, charactersInitialState);

  const initializeCharacters = useCallback((data: Character[]) => {
    dispatch({ type: "SET_INITIAL_DATA", payload: data });
  }, []);

  const abortRef = useRef<AbortController | null>(null);
  const seqRef = useRef(0);
  const lastExecutedNormRef = useRef<string>(""); // ← último término ejecutado (normalizado)

  const search = useCallback(async (q: string) => {
    const norm = q.trim().toLowerCase();

    if (!norm) {
      abortRef.current?.abort();
      abortRef.current = null;
      lastExecutedNormRef.current = ""; // reset
      dispatch({ type: "RESTORE_INITIAL" });
      return;
    }

    // ❗ Evita refetch si piden el mismo término
    if (norm === lastExecutedNormRef.current) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const mySeq = ++seqRef.current;

    dispatch({ type: "SET_QUERY", payload: q });
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const results = await fetchCharacters(q, 50, 0, controller.signal);
      if (seqRef.current !== mySeq) return;
      lastExecutedNormRef.current = norm; // solo si ésta ganó
      dispatch({ type: "SET_CHARACTERS", payload: results });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (seqRef.current !== mySeq) return;
      dispatch({ type: "SET_ERROR", payload: "Error fetching characters" });
    } finally {
      if (seqRef.current === mySeq) {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }
  }, []);

  const clearSearch = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    lastExecutedNormRef.current = "";
    dispatch({ type: "RESTORE_INITIAL" });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      characters: state.characters,
      loading: state.loading,
      query: state.query,
      error: state.error,
      search,
      clearSearch,
      initializeCharacters,
    }),
    [state, search, clearSearch, initializeCharacters]
  );

  return <CharactersContext.Provider value={value}>{children}</CharactersContext.Provider>;
};

export const useCharactersContext = () => {
  const ctx = useContext(CharactersContext);
  if (!ctx) throw new Error("useCharactersContext must be used within CharactersProvider");
  return ctx;
};
