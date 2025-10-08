import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: var(--font-roboto-condensed), "Roboto Condensed", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
  }
  img, picture, video, canvas, svg { display:block; max-width:100%; }
  input, button, textarea, select { font: inherit; color: inherit; }
  a { color: inherit; text-decoration: none; }
  ul { margin:0; padding:0; list-style:none; }
`;
