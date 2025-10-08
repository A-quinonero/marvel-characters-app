"use client";

import { useEffect, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { useLoader } from "@/context/LoaderProvider"; // Usa el LoaderProvider existente

const loadingAnimation = keyframes`
  0% { width: 0%; }
  50% { width: 80%; }
  95% { width: 95%; }
  100% { width: 95%; }
`;

const finishingAnimation = keyframes`
  0% { opacity: 1; }
  50% { width: 100%; opacity: 1; }
  100% { width: 100%; opacity: 0; }
`;

const Bar = styled.div<{ $isFinishing: boolean }>`
  position: fixed;
  top: 84px;
  left: 0;
  height: 3px;
  background: #EC1D24;
  z-index: 9999;
  width: 0;

  animation: ${({ $isFinishing }) => $isFinishing
    ? css`${finishingAnimation} 0.5s ease-out forwards`
    : css`${loadingAnimation} 4s cubic-bezier(0, 0.5, 0, 1) forwards`
  };
`;

export default function ProgressBar() {
  const { isLoading } = useLoader(); // Escucha el isLoading del LoaderProvider
  const [showBar, setShowBar] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowBar(true);
      setIsFinishing(false);
    } else if (showBar && !isLoading) {
      setIsFinishing(true);
      const timer = setTimeout(() => {
        setShowBar(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, showBar]);

  if (!showBar) {
    return null;
  }

  return <Bar $isFinishing={isFinishing} />;
}