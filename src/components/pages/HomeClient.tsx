"use client";

import styled from "styled-components";
import SearchBar from "@/components/SearchBar/SearchBar";
import CharacterCard from "@/components/CharacterCard/CharacterCard";
import { useSearch } from "@/hooks/useSearch";
import type { Character } from "@/types/characters";

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 16px;
`;

const Counter = styled.div`
  padding: 8px 16px;
  color: #666;
`;


export default function HomeClient() {
const { results, resultsCount, isSearching, showFavorites } = useSearch();
  return (
    <>
      <SearchBar  />
      <Counter>{showFavorites ? `Favoritos: ${resultsCount}` : `Resultados: ${resultsCount}`}</Counter>
      <Grid>
        {results.map((c) => (
          <CharacterCard key={c.id} id={c.id} name={c.name} thumbnail={c.thumbnail} />
        ))}
        {isSearching && <div style={{ padding: 16 }}>Cargando…</div>}
      </Grid>
    </>
  );
}
