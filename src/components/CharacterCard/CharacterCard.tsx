"use client";

import { memo, useCallback, useMemo } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";

const Card = styled.article`
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
  transition: box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  }
`;
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
const Content = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  gap: 8px;
`;
const Title = styled.h3`
  font-size: 16px;
  line-height: 1.2;
  margin: 0;
  color: #111;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;
const FavBtn = styled.button<{ $active: boolean }>`
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  color: ${({ $active }) => ($active ? "#ec1d24" : "#999")};
  line-height: 1;
  &:focus-visible { outline: 2px solid #000; outline-offset: 2px; border-radius: 6px; }
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
    <Card>
      <Link href={`/character/${id}`} aria-label={`Ver detalle de ${name}`}>
        <ImgWrap><Img src={thumbnail} alt={name} loading="lazy" /></ImgWrap>
      </Link>
      <Content>
        <Title title={name}>{name}</Title>
        <FavBtn onClick={toggle} $active={active} aria-pressed={active} aria-label={aria} title={aria}>
          ★
        </FavBtn>
      </Content>
    </Card>
  );
}

export default memo(CharacterCardBase);
