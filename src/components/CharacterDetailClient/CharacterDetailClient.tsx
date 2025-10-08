"use client";

import styled, { keyframes } from "styled-components";
import { useCharacterDetail } from "@/hooks/useCharacterDetail";
import type { Character } from "@/types/characters";
import type { Comic } from "@/types/comic";
import ComicsList from "@/components/ComicsList/ComicsList";
import HeartIcon from "@/assets/icons/HeartIcon";
import EmptyHeartIconDetailCharacter from "@/assets/icons/EmptyHeartIconDetailCharacter";

// La animación ahora empieza desde arriba
const fadeInFromAbove = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px); /* Cambiado a valor negativo */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const breakpoint = "960px";
const mobileBreakpoint = "768px";

const Main = styled.main`
  /* Aplicamos la animación corregida */
  animation: ${fadeInFromAbove} 0.6s ease-out forwards;
`;

// ... (El resto del código es idéntico y no necesita cambios)

const CharacterResume = styled.div`
  display: flex;
  justify-content: center;
  padding: 0;
  width: 100%;
  background: #000000;
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

const CharacterPhoto = styled.img`
  width: 320px;
  height: 320px;
  object-fit: cover;

  @media (max-width: ${breakpoint}) {
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
  background: #000000;
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
  font-style: normal;
  font-weight: 700;
  font-size: 40px;
  line-height: 1.1;
  text-transform: uppercase;
  color: #ffffff;

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
  color: #ffffff;
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
  color: #000000;
  margin: 0;

  @media (max-width: ${mobileBreakpoint}) {
    font-size: 24px;
    padding: 0 16px;
  }
`;

const Span = styled.span`
    cursor: pointer;
`


type Props = {
  character: Character;
  comics: Comic[];
};

export default function CharacterDetailClient({ character, comics }: Props) {
  const { favorite, toggleFavorite, sortedComics } = useCharacterDetail(character, comics);

  return (
    <Main>
      <CharacterResume>
        <CharacterContent>
          <CharacterPhoto src={character.thumbnail} alt={character.name} />
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
                : "Not description for this character..."}
            </CharacterDescription>
          </CharacterInfo>
        </CharacterContent>
      </CharacterResume>

      <ComicsResume>
        <ComicsContent>
          <ComicsTitle>COMICS</ComicsTitle>
          <ComicsList comics={sortedComics} />
        </ComicsContent>
      </ComicsResume>
    </Main>
  );
}