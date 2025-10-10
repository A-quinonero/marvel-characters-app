"use client";

import React, { Suspense } from "react";
import styled, { keyframes } from "styled-components";
import { useCharacterDetail } from "@/hooks/useCharacterDetail";
import type { Character } from "@/types/characters";
import type { Comic } from "@/types/comic";
import ComicsList from "@/components/ComicsList/ComicsList";
import HeartIcon from "@/assets/icons/HeartIcon";
import EmptyHeartIconDetailCharacter from "@/assets/icons/EmptyHeartIconDetailCharacter";
import ComicsListSkeleton from "../ComicsList/ComicsListSkeleton";
import Image from "next/image";
import { marvelFullSize } from "@/lib/marvelImageLoader";

const fadeInFromAbove = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const breakpoint = "960px";
const mobileBreakpoint = "768px";

const Main = styled.main`
  animation: ${fadeInFromAbove} 0.6s ease-out forwards;
`;

const CharacterResume = styled.div`
  display: flex;
  justify-content: center;
  padding: 0;
  width: 100%;
  background: var(--color-black);
  clip-path: polygon(0% 0%, 100% 0%, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0% 100%);
`;

const CharacterContent = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: ${breakpoint};
  @media (max-width: ${breakpoint}) {
    flex-direction: column;
  }
`;

const CharacterPhoto = styled(Image)`
  object-fit: cover;
  @media (max-width: 960px) {
    width: 100%;
    height: auto;
    max-height: 400px;
  }
`;

const CharacterInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 48px;
  gap: 24px;
  background: var(--color-black);
  flex-grow: 1;
  @media (max-width: ${breakpoint}) {
    padding: 24px;
  }
`;

const CharacterTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  width: 100%;
`;

const CharacterTitle = styled.h1`
  margin: 0;
  font-family: "Roboto Condensed";
  font-weight: 700;
  font-size: 40px;
  line-height: 1.1;
  text-transform: uppercase;
  color: var(--color-white);
  @media (max-width: ${breakpoint}) {
    font-size: 32px;
  }
`;

const CharacterDescription = styled.p`
  font-family: "Roboto Condensed";
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.4;
  color: var(--color-white);
  margin: 0;
`;

const ComicsResume = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  width: 100%;
  @media (max-width: ${mobileBreakpoint}) {
    padding: 32px 16px;
  }
`;

const ComicsContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${breakpoint};
  gap: 24px;
  position: relative;
`;

const ComicsTitle = styled.h2`
  font-weight: 700;
  font-size: 32px;
  line-height: 1.1;
  text-transform: uppercase;
  color: var(--color-black);
  margin: 0;
  @media (max-width: ${mobileBreakpoint}) {
    font-size: 24px;
    padding: 0 16px;
  }
`;

const Span = styled.span`
  cursor: pointer;
`;

function Comics({ promise }: { promise: Promise<Comic[]> }) {
  const comics = React.use(promise);
  const { sortedComics } = useCharacterDetail(null, comics);
  return <ComicsList comics={sortedComics} />;
}

type Props = {
  character: Character;
  comicsPromise: Promise<Comic[]>;
};

export default function CharacterDetailClient({ character, comicsPromise }: Props) {
  const { favorite, toggleFavorite } = useCharacterDetail(character);

  return (
    <Main>
      <CharacterResume>
        <CharacterContent>
          <CharacterPhoto
            loader={marvelFullSize}
            src={character.thumbnail}
            alt={character.name}
            width={320}
            height={320}
          />
          <CharacterInfo>
            <CharacterTitleContainer>
              <CharacterTitle>{character.name}</CharacterTitle>
              <Span data-cy="detail-favorite-button" onClick={toggleFavorite}>
                {favorite ? <HeartIcon /> : <EmptyHeartIconDetailCharacter />}
              </Span>
            </CharacterTitleContainer>
            <CharacterDescription>
              {character.description
                ? character.description
                : "No description for this character..."}
            </CharacterDescription>
          </CharacterInfo>
        </CharacterContent>
      </CharacterResume>

      <ComicsResume>
        <ComicsContent>
          <ComicsTitle>COMICS</ComicsTitle>
          <Suspense fallback={<ComicsListSkeleton />}>
            <Comics promise={comicsPromise} />
          </Suspense>
        </ComicsContent>
      </ComicsResume>
    </Main>
  );
}
