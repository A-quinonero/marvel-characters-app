"use client";

import { ThemeProvider } from "styled-components";
import theme from "@/styles/theme";
import { GlobalStyle } from "@/styles/globalStyles";
import { CharactersProvider } from "@/context/CharactersProvider";
import { FavoritesProvider } from "@/context/FavoritesProvider";

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
