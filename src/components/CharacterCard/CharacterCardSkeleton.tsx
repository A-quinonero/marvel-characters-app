"use client";

import styled, { keyframes } from "styled-components";

const Card = styled.article`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--skeleton-bg);
  clip-path: polygon(0% 0%, 100% 0%, 100% calc(100% - 12.86px), calc(100% - 12.86px) 100%, 0% 100%);
`;

const ImgWrap = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  background: var(--skeleton-img-bg);
`;

const Content = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  gap: 8px;
  height: 56px;
  border-top: 5.38px solid var(--card-border);
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const SkeletonBlock = styled.div`
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

const SkeletonImage = styled(SkeletonBlock)`
  width: 100%;
  height: 100%;
  border-radius: 0;
`;

const SkeletonText = styled(SkeletonBlock)`
  height: 14px;
  width: 70%;
`;

const SkeletonIcon = styled(SkeletonBlock)`
  height: 18px;
  width: 18px;
`;

export default function CharacterCardSkeleton() {
  return (
    <Card aria-busy="true" aria-live="polite">
      <ImgWrap>
        <SkeletonImage />
      </ImgWrap>
      <Content>
        <SkeletonText />
        <SkeletonIcon />
      </Content>
    </Card>
  );
}
