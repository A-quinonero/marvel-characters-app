"use client";

import { memo, useCallback, useMemo } from "react";
import styled from "styled-components";
import TransitionLink from "@/components/TransitionLink/TransitionLink";
import { useFavorites } from "@/hooks/useFavorites";
import HeartIcon from "@/assets/icons/HeartIcon";
import EmptyHeartIcon from "@/assets/icons/EmptyHeartIcon";

const ImgWrap = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  background: #f3f3f3;
  overflow: hidden;
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Title = styled.h3`
  position: relative;
  z-index: 1;
  font-family: Roboto Condensed;
  font-weight: 400;
  font-style: Regular;
  font-size: 14px;
  line-height: 100%;
  letter-spacing: 0%;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 1);
  flex: 1;
`;

const FavBtn = styled.button<{ $active: boolean }>`
  position: relative;
  z-index: 1;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  color: ${({ $active }) => ($active ? "#ec1d24" : "#999")};
  line-height: 1;
  transition: color 0.25s ease-in-out;

  &:focus-visible {
    outline: 2px solid #000;
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
  border-top: 5.38px solid rgba(236, 29, 36, 1);
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #ec1d24;
    z-index: 0;
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.25s ease-in-out;
  }
`;

const Card = styled.article`
  border: 1px solid #eee;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 1);
  transition: box-shadow 0.15s ease;
  clip-path: polygon(
    0% 0%,
    100% 0%,
    100% calc(100% - 12.86px),
    calc(100% - 12.86px) 100%,
    0% 100%
  );
  
  &:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);

    ${Content}::before {
      transform: scaleY(1);
    }

    ${FavBtn} {
      color: #ffffff;
    }
  }
`;

export type CharacterCardProps = {
  id: number;
  name: string;
  thumbnail: string;
};

function CharacterCardBase({ id, name, thumbnail }: CharacterCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const active = isFavorite(id);

  const toggle = useCallback(() => {
    if (active) removeFavorite(id);
    else addFavorite({ id, name, thumbnail });
  }, [active, id, name, thumbnail, addFavorite, removeFavorite]);

  const aria = useMemo(
    () => (active ? "Quitar de favoritos" : "Añadir a favoritos"),
    [active]
  );

  return (
    <Card data-cy="character-card">
      <TransitionLink href={`/character/${id}`} aria-label={`Ver detalle de ${name}`}>
        <ImgWrap>
          <Img src={thumbnail} alt={name} loading="lazy" />
        </ImgWrap>
      </TransitionLink>
      <Content>
        <Title title={name}>{name}</Title>
        <FavBtn onClick={toggle} $active={active} aria-pressed={active} aria-label={aria} title={aria}>
          {active ? <HeartIcon width={12} height={10.84} /> : <EmptyHeartIcon />}
        </FavBtn>
      </Content>
    </Card>
  );
}

export default memo(CharacterCardBase);