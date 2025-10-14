"use client";

import styled, { keyframes } from "styled-components";

import { Item } from "../ComicItem/ComicItem";

import { Grid } from "./ComicsList";

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const SkeletonBlock = styled.div`
  /* Gradient y colores controlados por variables */
  background: linear-gradient(
    90deg,
    var(--skeleton-base) 25%,
    var(--skeleton-highlight) 50%,
    var(--skeleton-base) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} var(--skeleton-speed) infinite;
  border-radius: var(--skeleton-radius);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const SkeletonCover = styled(SkeletonBlock)`
  width: 100%;
  aspect-ratio: 2/3;
  background-color: var(--skeleton-img-bg);
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
`;

const SkeletonDate = styled(SkeletonBlock)`
  height: 12px;
  width: 60%;
`;

export default function ComicsListSkeleton() {
  return (
    <Grid>
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
