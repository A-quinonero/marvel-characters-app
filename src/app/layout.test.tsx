import React from "react";
import { render, screen } from "@testing-library/react";

// Mocks: evitamos dependencias y estilos complejos
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

describe("RootLayout (DOM)", () => {
  it("renderiza Header, HeaderSpacer y children", () => {
    render(
      <RootLayout>
        <main data-testid="content">contenido</main>
      </RootLayout>
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("header-spacer")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });
});
