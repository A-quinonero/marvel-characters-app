/** @jest-environment node */

import "@testing-library/jest-dom";
import baseTheme, { AppTheme } from "./theme";

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const renderCssSSRIsolated = (theme: AppTheme) => {
  let cssOut = "";
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ThemeProvider, ServerStyleSheet, StyleSheetManager } = require("styled-components");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { renderToString } = require("react-dom/server");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GlobalStyle } = require("./globalStyles") as typeof import("./globalStyles");

    const sheet = new ServerStyleSheet();
    try {
      renderToString(
        React.createElement(
          StyleSheetManager,
          { sheet: sheet.instance },
          React.createElement(
            ThemeProvider,
            { theme },
            React.createElement(React.Fragment, null, [
              React.createElement(GlobalStyle, { key: "g" }),
              React.createElement("div", { key: "m" }, "mount"),
            ])
          )
        )
      );
      cssOut = sheet.getStyleTags();
    } finally {
      sheet.seal();
    }
  });
  return cssOut;
};

describe("GlobalStyle (SSR)", () => {
  it("inyecta :root con --header-h y variables CSS, además de resets básicos", () => {
    const theme: AppTheme = { ...baseTheme };
    const css = renderCssSSRIsolated(theme);

    expect(css).toMatch(/:root[^}]*--header-h:\s*84px/);
    expect(css).toMatch(/:root[^}]*--color-primary:\s*#EC1D24/i);
    expect(css).toMatch(
      new RegExp(`:root[^}]*--color-bg:\\s*${escapeRegExp(theme.colors.background)}`, "i")
    );
    expect(css).toMatch(
      new RegExp(`:root[^}]*--color-text:\\s*${escapeRegExp(theme.colors.text)}`, "i")
    );

    expect(css).toMatch(/\*,\s*\*::before,\s*\*::after[^}]*box-sizing:\s*border-box/);
    expect(css).toMatch(/img,\s*picture,\s*video,\s*canvas,\s*svg[^}]*display:\s*block/);
    expect(css).toMatch(/img,\s*picture,\s*video,\s*canvas,\s*svg[^}]*max-width:\s*100%/);
    expect(css).toMatch(/a[^}]*text-decoration:\s*none/);
  });

  it("body usa var(--color-bg) y var(--color-text) y :root declara esos tokens", () => {
    const theme: AppTheme = {
      ...baseTheme,
      colors: { ...baseTheme.colors, background: "#222222", text: "#ededed" },
    };
    const css = renderCssSSRIsolated(theme);

    // body referencia las variables (no valores literales)
    expect(css).toMatch(/body[^}]*background:\s*var\(--color-bg\)/);
    expect(css).toMatch(/body[^}]*color:\s*var\(--color-text\)/);

    // :root declara las variables de color (sin forzar el valor exacto)
    expect(css).toMatch(/:root[^}]*--color-bg:\s*[^;]+;/i);
    expect(css).toMatch(/:root[^}]*--color-text:\s*[^;]+;/i);

    // Fuente incluye "Roboto Condensed"
    expect(css).toMatch(/font-family:[^;]*Roboto Condensed/i);
  });
});
