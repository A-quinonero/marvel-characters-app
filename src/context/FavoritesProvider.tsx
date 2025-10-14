"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";

import { favoritesInitialState, favoritesReducer } from "@/reducers/favoritesReducer";
import { FavoriteCharacter, FavoritesState } from "@/types/favorites";

type FavoritesContextValue = {
  state: FavoritesState;
  addFavorite: (c: FavoriteCharacter) => void;
  removeFavorite: (id: number) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, favoritesInitialState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("favorites");
    if (raw) {
      try {
        dispatch({ type: "LOAD_FAVORITES", payload: JSON.parse(raw) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("favorites", JSON.stringify(state.favorites));
  }, [state.favorites]);

  const addFavorite = (c: FavoriteCharacter) => dispatch({ type: "ADD_FAVORITE", payload: c });
  const removeFavorite = (id: number) => dispatch({ type: "REMOVE_FAVORITE", payload: id });

  return (
    <FavoritesContext.Provider value={{ state, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavoritesContext = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavoritesContext must be used within FavoritesProvider");
  return ctx;
};
