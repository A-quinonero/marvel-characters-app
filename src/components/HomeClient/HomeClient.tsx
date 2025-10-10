"use client";

import styled from "styled-components";
import SearchBar from "@/components/SearchBar/SearchBar";
import CharacterCard from "@/components/CharacterCard/CharacterCard";
import { useSearch } from "@/hooks/useSearch";
import CharacterCardSkeleton from "@/components/CharacterCard/CharacterCardSkeleton";
import { useEffect } from "react";
import { Character } from "@/types/characters";
import { useCharactersContext } from "@/context/CharactersProvider";

const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  gap: 24px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  /* Estilos para pantallas más pequeñas (móviles) */
  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const SearchContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(172.5px, 1fr));
  gap: 12px;
  width: 100%;

  /* Forzamos 2 columnas en pantallas más pequeñas */
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Counter = styled.div`
  padding: 0 4px;
  color: #666;
  font-size: 12px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0%;
  color: rgba(0, 0, 0, 1);
`;
const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  height: 38px;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
`;
const Title = styled.h2`
  font-family: Roboto Condensed;
  font-weight: 700;
  font-style: Bold;
  font-size: 32px;
  line-height: 100%;
  letter-spacing: 0%;
  text-transform: uppercase;
`;

type Props = { initialData: Character[] };

export default function HomeClient({ initialData }: Props) {
  const { initializeCharacters } = useCharactersContext();
  const {
    searchTerm,
    handleSearch,
    handleClearSearch,
    results,
    isSearching,
    showFavorites,
    counterLabel,
  } = useSearch();

  useEffect(() => {
    initializeCharacters(initialData);
  }, [initialData, initializeCharacters]);

  const shouldShowSkeletons = isSearching && !showFavorites;

  return (
    <Main>
      {showFavorites && (
        <TitleContainer>
          <Title>Favorites</Title>
        </TitleContainer>
      )}

      <SearchContainer>
        <SearchBar value={searchTerm} onChange={handleSearch} onClear={handleClearSearch} />
        <Counter>{counterLabel}</Counter>
      </SearchContainer>

      <Grid data-cy="character-grid">
        {shouldShowSkeletons
          ? Array.from({ length: 8 }).map((_, i) => <CharacterCardSkeleton key={i} />)
          : results.map((c) => (
              <CharacterCard key={c.id} id={c.id} name={c.name} thumbnail={c.thumbnail} />
            ))}
      </Grid>
    </Main>
  );
}
