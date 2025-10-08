"use client";
import styled, { keyframes } from "styled-components";

// Animación de rotación
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Contenedor para centrar el spinner en la pantalla
const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; // Ocupa la altura del contenedor padre
`;

// El spinner en sí
const SpinnerElement = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1); // Borde gris claro
  border-left-color: #EC1D24; // Color del spinner (rojo Marvel)
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`;

export default function GlobalSpinner() {
  return (
    <SpinnerWrapper>
      <SpinnerElement />
    </SpinnerWrapper>
  );
}