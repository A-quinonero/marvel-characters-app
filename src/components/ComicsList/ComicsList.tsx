"use client";

import styled from "styled-components";

import ComicItem from "@/components/ComicItem/ComicItem";
import type { Comic } from "@/types/comic";

export const Grid = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;

  /* Carrusel horizontal */
  display: flex;
  overflow-x: auto;
  scrollbar-gutter: stable both-edges;
  gap: 16px;
  padding-bottom: 24px;

  /* Scrollbar (WebKit) */
  &::-webkit-scrollbar {
    height: var(--scrollbar-size, 8px); /* súbelo para testear visibilidad */
  }
  &::-webkit-scrollbar-track,
  &::-webkit-scrollbar-track-piece {
    background: var(--scrollbar-track, #d9d9d9);
  }
  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb, #ec1d24);
    border-radius: 9999px;
  }
  &::-webkit-scrollbar-thumb:horizontal {
    min-width: 32px; /* mejora percepción */
  }

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb, #ec1d24) var(--scrollbar-track, #d9d9d9);
`;

const EmptyItem = styled.li`
  padding: 8px 10px;
  opacity: 0.8;
  white-space: nowrap;
`;

type Props = { comics: Comic[] };

export default function ComicsList({ comics }: Props) {
  if (!comics || comics.length === 0) {
    return (
      <Grid>
        <EmptyItem data-testid="empty-message" role="status" aria-live="polite">
          No comics available...
        </EmptyItem>
      </Grid>
    );
  }

  return (
    <Grid>
      {comics.map((comic) => (
        <ComicItem key={comic.id} comic={comic} />
      ))}
    </Grid>
  );
}
