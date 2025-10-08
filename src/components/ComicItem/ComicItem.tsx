"use client";

import { memo } from "react";
import styled from "styled-components";
import type { Comic } from "@/types/comic";
import { formatOnSaleDate } from "@/lib/utils/formatters";

const mobileBreakpoint = "768px";

export const Item = styled.li`
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;

  /* --- INICIO DE LA SOLUCIÓN --- */

  /* Por defecto (escritorio/tablet), el cómic tiene un ancho fijo */
  width: 180px;
  /* Y le prohibimos encogerse */
  flex-shrink: 0;
  
  /* --- FIN DE LA SOLUCIÓN --- */

  /* En móvil, simplemente ajustamos el ancho si es necesario */
  @media (max-width: ${mobileBreakpoint}) {
    width: 164px;
  }
`;

const Cover = styled.img`
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  display: block;
  background: #f5f5f5;
`;

const Meta = styled.div`
  padding: 8px 10px;
`;

const Title = styled.h3`
  font-size: 14px;
  margin: 0 0 6px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  text-overflow: ellipsis;
  height: 36.4px;
`;

const DateText = styled.time`
  font-size: 12px;
  color: #666;
`;

type Props = { comic: Comic };

function ComicItem({ comic }: Props) {
  return (
    <Item aria-label={comic.title}>
      <Cover src={comic.thumbnail} alt={comic.title} loading="lazy" />
      <Meta>
        <Title title={comic.title}>{comic.title}</Title>
        <DateText dateTime={comic.onsaleDate || ""}>
          {formatOnSaleDate(comic.onsaleDate)}
        </DateText>
      </Meta>
    </Item>
  );
}

export default memo(ComicItem);