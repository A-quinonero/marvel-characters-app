import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import StyledComponentsRegistry from "./StyledComponentsRegistry";

jest.mock("next/navigation", () => ({
  useServerInsertedHTML: jest.fn(),
}));

// Definimos TODO el mock dentro del factory para evitar problemas de hoisting
jest.mock("styled-components", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactActual = require("react"); // sólo para crear <style> en el mock
  const clearTagSpy = jest.fn();
  const getStyleElementSpy = jest.fn(() => [
    ReactActual.createElement(
      "style",
      { key: "1", "data-testid": "sc-style" },
      ".x{}"
    ),
  ]);

  class MockServerStyleSheet {
    public instance = { clearTag: clearTagSpy };
    public getStyleElement = getStyleElementSpy;
  }

  const MockStyleSheetManager = ({
    children,
  }: {
    children: React.ReactNode;
    sheet?: unknown;
  }) => ReactActual.createElement("div", { "data-testid": "sc-manager" }, children);

  return {
    __esModule: true,
    StyleSheetManager: MockStyleSheetManager,
    ServerStyleSheet: MockServerStyleSheet,
    __mocks__: { clearTagSpy, getStyleElementSpy },
  };
});

type USIH = (cb: () => React.ReactNode) => void;
const { useServerInsertedHTML } = jest.requireMock("next/navigation") as {
  useServerInsertedHTML: unknown;
};
const useServerInsertedHTMLMock = useServerInsertedHTML as jest.MockedFunction<USIH>;

const styledMocks = jest.requireMock("styled-components").__mocks__ as {
  clearTagSpy: jest.Mock;
  getStyleElementSpy: jest.Mock;
};

describe("StyledComponentsRegistry", () => {
  const CHILD = <div data-testid="child">content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registra el callback de inserción y limpia la tag (vía useServerInsertedHTML)", () => {
    // Capturamos el callback que Next ejecutaría para insertar estilos
    let insertedCB: (() => React.ReactNode) | undefined;
    useServerInsertedHTMLMock.mockImplementation((cb) => {
      insertedCB = cb;
    });

    const { getByTestId, queryByTestId } = render(
      <StyledComponentsRegistry>{CHILD}</StyledComponentsRegistry>
    );

    expect(useServerInsertedHTMLMock).toHaveBeenCalledTimes(1);
    expect(getByTestId("child")).toBeInTheDocument();

    // Ejecutamos el callback simulado
    const nodes = insertedCB?.();
    expect(styledMocks.getStyleElementSpy).toHaveBeenCalledTimes(1);
    expect(styledMocks.clearTagSpy).toHaveBeenCalledTimes(1);

    // 🔧 El callback devuelve un FRAGMENT con los <style> como children → los desenvolvemos
    const toArray = (v: unknown): React.ReactNode[] =>
      Array.isArray(v) ? (v as React.ReactNode[]) : [v as React.ReactNode];

    let styleCandidates: React.ReactNode[] = [];
    if (nodes && React.isValidElement(nodes) && nodes.props) {
      // children pueden ser array o único nodo
      styleCandidates = toArray((nodes.props as { children?: React.ReactNode }).children);
    } else {
      styleCandidates = toArray(nodes);
    }

    const hasStyle = styleCandidates.some((n) => {
      if (!React.isValidElement(n)) return false;
      const props = n.props as { [k: string]: unknown };
      return props["data-testid"] === "sc-style";
    });
    expect(hasStyle).toBe(true);

    // Esos <style> NO se montan automáticamente en el DOM del test
    expect(queryByTestId("sc-style")).not.toBeInTheDocument();
  });

  it("en cliente devuelve children directamente (sin StyleSheetManager)", () => {
    // Usamos el hook pero no hacemos nada con el callback
    useServerInsertedHTMLMock.mockImplementation((_cb) => {
      void _cb; // evitar lint de unused param
    });

    const { getByTestId, queryByTestId } = render(
      <StyledComponentsRegistry>{CHILD}</StyledComponentsRegistry>
    );

    expect(getByTestId("child")).toBeInTheDocument();
    expect(queryByTestId("sc-manager")).not.toBeInTheDocument();
  });
});
