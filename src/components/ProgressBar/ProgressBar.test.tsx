import React from "react";
import { render, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProgressBar from "./ProgressBar";

jest.mock("@/context/LoaderProvider", () => ({
  useLoader: jest.fn(),
}));

const { useLoader } = jest.requireMock("@/context/LoaderProvider");

describe("ProgressBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const setLoading = (value: boolean) => {
    (useLoader as jest.Mock).mockReturnValue({ isLoading: value });
  };

  it("muestra la barra cuando isLoading=true", () => {
    setLoading(true);
    const { container } = render(<ProgressBar />);
    const bar = container.firstChild as HTMLElement | null;
    expect(bar).toBeInTheDocument();
  });

  it("permanece visible durante el finish y desaparece tras 500ms cuando isLoading pasa a false", () => {
    // 1) Empieza cargando
    setLoading(true);
    const utils = render(<ProgressBar />);
    let bar = utils.container.firstChild as HTMLElement | null;
    expect(bar).toBeInTheDocument();

    // 2) Cambiamos a false (finishing)
    setLoading(false);
    act(() => {
      utils.rerender(<ProgressBar />);
    });

    // Sigue visible durante finishing
    bar = utils.container.firstChild as HTMLElement | null;
    expect(bar).toBeInTheDocument();

    // 3) Pasan 500ms -> desaparece
    act(() => {
      jest.advanceTimersByTime(500);
    });
    bar = utils.container.firstChild as HTMLElement | null;
    expect(bar).toBeNull();
  });

  it("está anclada a la izquierda (left: 0) y no a la derecha", () => {
    setLoading(true);
    const { container } = render(<ProgressBar />);
    const bar = container.firstChild as HTMLElement;

    // Clases generadas por styled-components para este nodo
    const classNames = Array.from(bar.classList);
    expect(classNames.length).toBeGreaterThan(0);

    // Recorremos todas las hojas y reglas CSS del documento para encontrar la(s) regla(s) de cualquiera de esas clases.
    const getAllStyleRules = (): CSSStyleRule[] => {
      const collected: CSSStyleRule[] = [];
      const sheets = Array.from(document.styleSheets) as CSSStyleSheet[];

      const visitRules = (rules: CSSRuleList | undefined) => {
        if (!rules) return;
        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i];
          // Reglas de estilo
          if ((rule as CSSStyleRule).selectorText) {
            collected.push(rule as CSSStyleRule);
          }
          // Reglas agrupadas (media, supports, etc.)
          if ((rule as CSSMediaRule).cssRules) {
            visitRules((rule as CSSMediaRule).cssRules);
          }
        }
      };

      for (const sheet of sheets) {
        let rules: CSSRuleList | undefined;
        try {
          rules = sheet.cssRules;
        } catch {
          // Algunos estilos externos podrían bloquear el acceso; ignoramos.
          continue;
        }
        visitRules(rules);
      }
      return collected;
    };

    const rules = getAllStyleRules();

    // Filtramos las reglas cuyo selector incluya cualquiera de las clases del nodo
    const matching = rules.filter((r) =>
      classNames.some((cls) => r.selectorText!.includes(`.${cls}`))
    );

    // Debe existir al menos una regla para alguna de las clases
    expect(matching.length).toBeGreaterThan(0);

    // Unimos las declaraciones CSS para buscar left/right
    const declarations = matching.map((r) => (r.style && r.style.cssText) || r.cssText).join("\n");

    // Afirmamos que esté left: 0 y no haya right: 0
    expect(declarations.replace(/\s+/g, " ")).toMatch(/left:\s*0/);
    expect(declarations).not.toMatch(/right:\s*0/);
  });
});
