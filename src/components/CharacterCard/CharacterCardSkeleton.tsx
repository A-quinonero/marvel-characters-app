"use client";
import styled, { keyframes } from "styled-components";

// 1. Replicamos los estilos estructurales de CharacterCard para que la forma coincida.
const Card = styled.article`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #202020; // Un color de fondo oscuro para el esqueleto
  clip-path: polygon(
    0% 0%,
    100% 0%,
    100% calc(100% - 12.86px),
    calc(100% - 12.86px) 100%,
    0% 100%
  );
`;

const ImgWrap = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  background: #333; // Color base para la imagen del esqueleto
`;

const Content = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  gap: 8px;
  height: 56px;
  border-top: 5.38px solid #444; // Color base para el borde
`;

// 2. Creamos la animación de brillo
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// 3. Creamos un bloque base para los elementos del esqueleto que tendrá la animación
const SkeletonBlock = styled.div`
  background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
`;

// Elementos específicos del esqueleto
const SkeletonImage = styled(SkeletonBlock)`
  width: 100%;
  height: 100%;
  border-radius: 0; // La imagen no necesita bordes redondeados
`;

const SkeletonText = styled(SkeletonBlock)`
  height: 14px;
  width: 70%;
`;

const SkeletonIcon = styled(SkeletonBlock)`
  height: 18px;
  width: 18px;
`;

// 4. Montamos el componente Skeleton final
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