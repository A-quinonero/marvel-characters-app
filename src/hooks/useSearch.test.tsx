import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";

import "@testing-library/jest-dom";
import { useSearch } from "./useSearch";

// ──────────────────────────
// Mocks
// ──────────────────────────
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

jest.mock("@/context/CharactersProvider", () => ({
  useCharactersContext: jest.fn(),
}));

jest.mock("@/hooks/useFavorites", () => ({
  useFavorites: jest.fn(),
}));

// Mock de lodash.debounce para usar timers de Jest de forma fiable
// ⬇️ Sustituye tu jest.mock("lodash.debounce", ...) por esto
jest.mock("lodash.debounce", () => {
  type Debounced<T extends (...args: unknown[]) => unknown> = ((...args: Parameters<T>) => void) & {
    cancel: () => void;
  };

  const debounce = <T extends (...args: unknown[]) => unknown>(
    fn: T,
    wait: number
  ): Debounced<T> => {
    let t: ReturnType<typeof setTimeout> | undefined;

    const d = (...args: Parameters<T>) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        fn(...args);
      }, wait);
    };

    d.cancel = () => {
      if (t) clearTimeout(t);
    };

    return d as Debounced<T>;
  };

  return { __esModule: true, default: debounce };
});

const { useSearchParams } = jest.requireMock("next/navigation") as { useSearchParams: jest.Mock };
const { useCharactersContext } = jest.requireMock("@/context/CharactersProvider") as {
  useCharactersContext: jest.Mock;
};
const { useFavorites } = jest.requireMock("@/hooks/useFavorites") as { useFavorites: jest.Mock };

// ──────────────────────────
// Harness para consumir el hook
// ──────────────────────────
const Harness = () => {
  const {
    searchTerm,
    handleSearch,
    handleClearSearch,
    results,
    resultsCount,
    counterLabel,
    isSearching,
    showFavorites,
  } = useSearch();

  return (
    <div>
      <div data-testid="term">{searchTerm}</div>
      <div data-testid="results">{results.map((r: Character) => r.name).join(",")}</div>
      <div data-testid="count">{String(resultsCount)}</div>
      <div data-testid="label">{counterLabel}</div>
      <div data-testid="searching">{String(isSearching)}</div>
      <div data-testid="showFav">{String(showFavorites)}</div>

      <button data-testid="set-iron" onClick={() => handleSearch("Iron")} />
      <button data-testid="set-iron-spaces" onClick={() => handleSearch("  IRON  ")} />
      <button data-testid="set-man" onClick={() => handleSearch("man")} />
      <button data-testid="clear" onClick={() => handleClearSearch()} />
    </div>
  );
};

// ──────────────────────────
// Helpers de datos y de mocks
// ──────────────────────────
type Character = { id: number; name: string; thumbnail: string; description?: string };

const chars: Character[] = [
  { id: 1, name: "Iron Man", thumbnail: "iron.jpg" },
  { id: 2, name: "Black Widow", thumbnail: "bw.jpg" },
];

const favs: Character[] = [
  { id: 10, name: "Iron Man", thumbnail: "iron.jpg" },
  { id: 20, name: "Thor", thumbnail: "thor.jpg" },
];

const makeParams = (favorites: "1" | "0" | null) => ({
  get: (key: string) => (key === "favorites" ? favorites : null),
});

const makeCharsCtx = (overrides: Partial<ReturnType<typeof baseCharsCtx>> = {}) => ({
  ...baseCharsCtx(),
  ...overrides,
});

function baseCharsCtx() {
  return {
    characters: chars,
    loading: false,
    query: "",
    error: undefined as string | undefined,
    search: jest.fn().mockResolvedValue(undefined),
    clearSearch: jest.fn(),
  };
}

describe("useSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // por defecto: no favoritos
    (useSearchParams as jest.Mock).mockReturnValue(makeParams("0"));
    (useFavorites as jest.Mock).mockReturnValue({ favorites: favs });
    (useCharactersContext as jest.Mock).mockReturnValue(makeCharsCtx());
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("inicializa searchTerm desde query y lo actualiza cuando cambia (si no está en favoritos)", () => {
    (useCharactersContext as jest.Mock).mockReturnValue(makeCharsCtx({ query: "spider" }));

    const { rerender } = render(<Harness />);
    expect(screen.getByTestId("term").textContent).toBe("spider");
    expect(screen.getByTestId("showFav").textContent).toBe("false");

    // cambia el contexto: query → "iron"
    (useCharactersContext as jest.Mock).mockReturnValue(makeCharsCtx({ query: "iron" }));
    rerender(<Harness />);

    expect(screen.getByTestId("term").textContent).toBe("iron");
  });

  it("debounce: llama a search 1 vez pasados 300ms y deduplica el mismo término normalizado", () => {
    const ctx = makeCharsCtx({ search: jest.fn().mockResolvedValue(undefined) });
    (useCharactersContext as jest.Mock).mockReturnValue(ctx);

    render(<Harness />);

    // set "Iron" → arranca debounce
    fireEvent.click(screen.getByTestId("set-iron"));

    // antes de 300ms no debe llamar
    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(ctx.search).not.toHaveBeenCalled();

    // al llegar a 300ms llama 1 vez
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(ctx.search).toHaveBeenCalledTimes(1);
    expect(ctx.search).toHaveBeenCalledWith("Iron");

    // mismo término normalizado (con espacios y mayúsculas) → no llama de nuevo
    fireEvent.click(screen.getByTestId("set-iron-spaces"));
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(ctx.search).toHaveBeenCalledTimes(1);
  });

  it("handleClearSearch cancela el debounce y llama clearSearch inmediatamente", () => {
    const ctx = makeCharsCtx({
      search: jest.fn().mockResolvedValue(undefined),
      clearSearch: jest.fn(),
    });
    (useCharactersContext as jest.Mock).mockReturnValue(ctx);

    render(<Harness />);

    // Arranca un debounce
    fireEvent.click(screen.getByTestId("set-iron"));
    // Cancela antes de 300ms
    fireEvent.click(screen.getByTestId("clear"));

    expect(ctx.clearSearch).toHaveBeenCalledTimes(1);

    // Aunque pasen los timers, no debe disparar search
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(ctx.search).not.toHaveBeenCalled();
    expect(screen.getByTestId("term").textContent).toBe(""); // term limpiado
  });

  it("modo favoritos: no ejecuta search/clear tras escribir; filtra localmente; etiqueta siempre 'Result(s)'; isSearching=false", () => {
    (useSearchParams as jest.Mock).mockReturnValue(makeParams("1"));

    // Simulamos loading=true en el contexto; isSearching debe seguir false (porque showFavorites=true)
    const ctx = makeCharsCtx({ loading: true });
    (useCharactersContext as jest.Mock).mockReturnValue(ctx);

    render(<Harness />);

    // showFavorites = true
    expect(screen.getByTestId("showFav").textContent).toBe("true");
    expect(screen.getByTestId("searching").textContent).toBe("false");

    expect(ctx.clearSearch).toHaveBeenCalledTimes(1);
    // Sin término → muestra todos los favoritos
    expect(screen.getByTestId("results").textContent).toBe("Iron Man,Thor");
    expect(screen.getByTestId("count").textContent).toBe("2");
    expect(screen.getByTestId("label").textContent).toBe("2 Results");

    (ctx.clearSearch as jest.Mock).mockClear();
    // Introducimos término 'man' → filtra localmente (no search())
    fireEvent.click(screen.getByTestId("set-man"));
    expect(ctx.search).not.toHaveBeenCalled();
    expect(ctx.clearSearch).not.toHaveBeenCalled();

    // Debe filtrar por nombre (case-insensitive, incluye 'man' → "Iron Man")
    expect(screen.getByTestId("results").textContent).toBe("Iron Man");
    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(screen.getByTestId("label").textContent).toBe("1 Result");
  });

  it("modo normal: results y etiqueta 'Result(s)', isSearching sigue a loading", () => {
    // no favoritos
    (useSearchParams as jest.Mock).mockReturnValue(makeParams("0"));

    (useCharactersContext as jest.Mock).mockReturnValue(
      makeCharsCtx({ loading: true, characters: chars })
    );
    render(<Harness />);

    expect(screen.getByTestId("showFav").textContent).toBe("false");
    expect(screen.getByTestId("results").textContent).toBe("Iron Man,Black Widow");
    expect(screen.getByTestId("count").textContent).toBe("2");
    expect(screen.getByTestId("label").textContent).toBe("2 Results");
    expect(screen.getByTestId("searching").textContent).toBe("true");
  });
});
