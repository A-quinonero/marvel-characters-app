"use client";

import styled, { keyframes } from "styled-components";
import { Grid } from "./ComicsList"; // 1. Reutiliza el layout de la lista
import { Item } from "../ComicItem/ComicItem"; // 2. Reutiliza el layout de cada item

// 3. Define la animación de brillo (shimmer)
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// 4. Crea los bloques de contenido del esqueleto
const SkeletonBlock = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const SkeletonCover = styled(SkeletonBlock)`
  width: 100%;
  aspect-ratio: 2/3;
  background-color: #f5f5f5;
`;

const SkeletonMeta = styled.div`
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SkeletonTitle = styled(SkeletonBlock)`
  height: 14px;
  width: 90%;
  border-radius: 4px;
`;

const SkeletonDate = styled(SkeletonBlock)`
  height: 12px;
  width: 60%;
  border-radius: 4px;
`;

export default function ComicsListSkeleton() {
  return (
    <Grid>
      {/* 5. Renderiza una lista de 5 items de esqueleto */}
      {Array.from({ length: 5 }).map((_, index) => (
        <Item key={`skeleton-${index}`}>
          <SkeletonCover />
          <SkeletonMeta>
            <SkeletonTitle />
            <SkeletonDate />
          </SkeletonMeta>
        </Item>
      ))}
    </Grid>
  );
}