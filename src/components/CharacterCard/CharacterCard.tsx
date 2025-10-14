// src/components/CharacterCard/CharacterCard.tsx
"use client";

import Image from "next/image";
import { memo, useCallback, useMemo } from "react";
import styled from "styled-components";

import EmptyHeartIcon from "@/assets/icons/EmptyHeartIcon";
import HeartIcon from "@/assets/icons/HeartIcon";
import TransitionLink from "@/components/TransitionLink/TransitionLink";
import { useFavorites } from "@/hooks/useFavorites";
import { marvelSquareLoader } from "@/lib/marvelImageLoader";

const ImgWrap = styled.div`
  position: relative; /* necesario para fill */
  width: 100%;
  aspect-ratio: 1 / 1;
  background: var(--gray-100);
  overflow: hidden;
`;

const Img = styled(Image)`
  object-fit: cover;
  display: block;
`;

const Title = styled.h3`
  position: relative;
  z-index: 1;
  font-family: Roboto Condensed;
  font-weight: 400;
  font-size: 14px;
  text-transform: uppercase;
  color: var(--color-white);
  flex: 1;
`;

const FavBtn = styled.button<{ $active: boolean }>`
  position: relative;
  z-index: 1;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--muted-text)")};
  line-height: 1;
  transition: color 0.25s ease-in-out;

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    border-radius: 6px;
  }
`;

const Content = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  gap: 8px;
  height: 56px;
  border-top: 5.38px solid var(--color-primary);
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--color-primary);
    z-index: 0;
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.25s ease-in-out;
  }
`;

const Card = styled.article`
  border: 1px solid var(--card-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  transition: box-shadow 0.15s ease;
  clip-path: polygon(0% 0%, 100% 0%, 100% calc(100% - 12.86px), calc(100% - 12.86px) 100%, 0% 100%);

  &:hover {
    ${Content}::before {
      transform: scaleY(1);
    }

    ${FavBtn} {
      color: var(--color-white);
    }

    ${FavBtn} svg, ${FavBtn} path, ${FavBtn} circle, ${FavBtn} polygon, ${FavBtn} rect {
      fill: var(--color-white) !important;
      stroke: var(--color-white) !important;
    }
  }
`;

export type CharacterCardProps = {
  id: number;
  name: string;
  thumbnail: string; // cualquier variante de marvel; el loader la ajusta
};

function CharacterCardBase({ id, name, thumbnail }: CharacterCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const active = isFavorite(id);

  const toggle = useCallback(() => {
    if (active) removeFavorite(id);
    else addFavorite({ id, name, thumbnail });
  }, [active, id, name, thumbnail, addFavorite, removeFavorite]);

  const aria = useMemo(() => (active ? "Quitar de favoritos" : "Añadir a favoritos"), [active]);

  return (
    <Card data-cy="character-card">
      <TransitionLink href={`/character/${id}`} aria-label={`Ver detalle de ${name}`}>
        <ImgWrap>
          <Img
            loader={marvelSquareLoader}
            src={thumbnail}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 180px"
          />
        </ImgWrap>
      </TransitionLink>
      <Content>
        <Title title={name}>{name}</Title>
        <FavBtn
          data-cy="favorite-toggle-button"
          onClick={toggle}
          $active={active}
          aria-pressed={active}
          aria-label={aria}
          title={aria}
        >
          {active ? <HeartIcon width={12} height={10.84} /> : <EmptyHeartIcon />}
        </FavBtn>
      </Content>
    </Card>
  );
}

export default memo(CharacterCardBase);
