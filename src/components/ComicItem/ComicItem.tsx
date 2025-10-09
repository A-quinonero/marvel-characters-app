"use client";

import { memo } from "react";
import styled from "styled-components";
import type { Comic } from "@/types/comic";
import { formatOnSaleDate } from "@/lib/utils/formatters";

const mobileBreakpoint = "768px";

export const Item = styled.li`
  
  overflow: hidden;
  width: 180px;
  flex-shrink: 0;
  @media (max-width: ${mobileBreakpoint}) {
    width: 164px;
  }
`;

const Cover = styled.img`
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  display: block;
  background: var(--gray-100);
`;

const Meta = styled.div`
  padding: 8px 10px;
`;

const Title = styled.h3`
  color: var(--card-title);
  font-size: 16px;
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
  color: var(--muted-text);
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
