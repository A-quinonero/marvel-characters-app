"use client";

import { useEffect, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { useLoader } from "@/context/LoaderProvider";

const loading = keyframes`
  0% { width: 0%; }
  50% { width: 80%; }
  95% { width: 95%; }
  100% { width: 95%; }
`;

const finishing = keyframes`
  0% { opacity: 1; }
  50% { width: 100%; opacity: 1; }
  100% { width: 100%; opacity: 0; }
`;

const Bar = styled.div<{ $isFinishing: boolean }>`
  position: absolute;
  left: 0;               /* anclada a la izquierda */
  bottom: 0;
  height: var(--progressbar-height, 3px);
  background: var(--progressbar-color, #ec1d24);
  z-index: var(--progressbar-z, 1001);
  width: 0;
  pointer-events: none;

  /* Animación controlada por estado + variables */
  animation: ${({ $isFinishing }) =>
    $isFinishing
      ? css`${finishing} var(--progressbar-finishing-dur, 0.5s) ease-out forwards`
      : css`${loading} var(--progressbar-loading-dur, 4s) cubic-bezier(0, 0.5, 0, 1) forwards`};

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
`;

export default function ProgressBar() {
  const { isLoading } = useLoader();
  const [showBar, setShowBar] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowBar(true);
      setIsFinishing(false);
    } else if (showBar) {
      setIsFinishing(true);
      const t = setTimeout(() => setShowBar(false), 500);
      return () => clearTimeout(t);
    }
  }, [isLoading, showBar]);

  if (!showBar) return null;

  // Decorativa (no bloquea lectores)
  return <Bar $isFinishing={isFinishing} aria-hidden="true" />;
}
