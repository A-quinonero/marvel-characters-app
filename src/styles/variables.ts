// src/styles/variables.ts
import { css } from "styled-components";
import type { AppTheme } from "./theme";

// Genera variables CSS a partir del tema
export const themeCssVars = (theme: AppTheme) => css`
  /* Colores base */
  --color-primary: ${theme.colors.primary};
  --color-text: ${theme.colors.text};
  --color-muted-text: ${theme.colors.mutedText};
  --color-bg: ${theme.colors.background};
  --color-surface: ${theme.colors.surface};
  --color-black: ${theme.colors.black};
  --color-white: ${theme.colors.white};
  --gray-100: ${theme.colors.gray100};
  --gray-200: ${theme.colors.gray200};
  --gray-300: ${theme.colors.gray300};

  /* Slots derivados de uso (puedes ajustarlos a tu gusto) */
  --navbar-bg: var(--color-black);
  --navbar-text: var(--color-white);

  --card-bg: var(--color-black);
  --card-border: var(--gray-200);
  --card-title: var(--color-text);
  --muted-text: var(--color-muted-text);

  --scrollbar-thumb: var(--color-primary);
  --scrollbar-track: var(--gray-300);
  --scrollbar-size: 4px;

  --skeleton-base: var(--gray-200);
  --skeleton-highlight: var(--gray-100);
  --skeleton-bg: var(--card-bg); /* fondo de tarjetas skeleton */
  --skeleton-img-bg: var(--gray-100); /* fondo de placeholders de imagen */
  --skeleton-speed: 1.5s; /* velocidad del shimmer */
  --skeleton-radius: 4px;
  /* Inputs / Forms */
  --input-bg: var(--color-bg);
  --input-text: var(--color-text);
  --input-border: var(--color-black);
  --input-focus-border: var(--gray-300);
  --input-placeholder: var(--muted-text);

  /* Iconografía “suave” (ej. lupa del buscador) */
  --icon-muted: var(--muted-text);
`;
