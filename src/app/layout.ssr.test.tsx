/** @jest-environment node */

import React from "react";
import { renderToString } from "react-dom/server";

// Mocks para que SSR sea simple
jest.mock("next/font/google", () => ({
  Roboto_Condensed: () => ({ variable: "rc-var" }),
}));

jest.mock("@/lib/StyledComponentsRegistry", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("./providers", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/Header/Header", () => ({
  __esModule: true,
  default: () => <header role="banner" data-testid="header" />,
}));

jest.mock("@/components/Header/HeaderSpacer", () => ({
  __esModule: true,
  HeaderSpacer: (props: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="header-spacer" {...props} />
  ),
}));

import RootLayout from "./layout";

describe("RootLayout (SSR)", () => {
  it("incluye <html lang='es'> y aplica la clase de la fuente en <body>", () => {
    const html = renderToString(
      <RootLayout>
        <main>contenido</main>
      </RootLayout>
    );

    expect(html).toMatch(/<html[^>]*lang="es"/);
    expect(html).toMatch(/<body[^>]*class="[^"]*\brc-var\b/);
  });
});
