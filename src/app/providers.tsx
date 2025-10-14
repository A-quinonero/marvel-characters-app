"use client";

import { ThemeProvider } from "styled-components";

import { CharactersProvider } from "@/context/CharactersProvider";
import { FavoritesProvider } from "@/context/FavoritesProvider";
import { GlobalStyle } from "@/styles/globalStyles";
import theme from "@/styles/theme";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <CharactersProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </CharactersProvider>
    </ThemeProvider>
  );
}
