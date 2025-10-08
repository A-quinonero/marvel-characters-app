"use client";

import styled from "styled-components";
import type { Comic } from "@/types/comic";
import ComicItem from "@/components/ComicItem/ComicItem";

const Grid = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;

  /* Comportamiento por defecto para ESCRITORIO y TABLET: carrusel horizontal */
  display: flex;
  overflow-x: scroll;
  gap: 16px;
  padding-bottom: 24px;

  /* Estilos de la scrollbar */
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(217, 217, 217, 1);
    width:100%;
  }
  &::-webkit-scrollbar-thumb {
    background: #ec1d24;
    
  }
  scrollbar-width: thin;
  scrollbar-color: #ec1d24 #d9d9d9;
  
`;

type Props = { comics: Comic[] };

export default function ComicsList({ comics }: Props) {
  return (
    <Grid>
      {comics.map((comic) => (
        <ComicItem key={comic.id} comic={comic} />
      ))}
    </Grid>
  );
}
