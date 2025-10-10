import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useCharacters } from "./useCharacters";

// Mockeamos el hook del contexto que usa internamente useCharacters
jest.mock("@/context/CharactersProvider", () => ({
  useCharactersContext: jest.fn(),
}));
const { useCharactersContext } = jest.requireMock("@/context/CharactersProvider") as {
  useCharactersContext: jest.Mock;
};

// Tipos locales para el test (evita dependencias externas)
type Character = { id: number; name: string; thumbnail: string; description?: string };

// Harness para consumir el hook en un componente funcional
const Harness = () => {
  const { characters, loading, query, error, search, clearSearch } = useCharacters();

  return (
    <div>
      <div data-testid="names">{characters.map((c) => c.name).join(",")}</div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="query">{query}</div>
      <div data-testid="error">{error ?? ""}</div>

      <button data-testid="search-btn" onClick={() => search("iron")} />
      <button data-testid="clear-btn" onClick={() => clearSearch()} />
    </div>
  );
};

const makeCtx = (overrides: Partial<ReturnType<typeof baseCtx>> = {}) => ({
  ...baseCtx(),
  ...overrides,
});

function baseCtx() {
  return {
    characters: [] as Character[],
    loading: false,
    query: "",
    error: undefined as string | undefined,
    search: jest.fn().mockResolvedValue(undefined),
    clearSearch: jest.fn(),
  };
}

describe("useCharacters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("mapea correctamente los valores del contexto", () => {
    const ctx = makeCtx({
      characters: [
        { id: 1, name: "Iron Man", thumbnail: "iron.jpg" },
        { id: 2, name: "Thor", thumbnail: "thor.jpg" },
      ],
      loading: true,
      query: "iro",
      error: undefined,
    });
    (useCharactersContext as jest.Mock).mockReturnValue(ctx);

    render(<Harness />);

    expect(screen.getByTestId("names").textContent).toBe("Iron Man,Thor");
    expect(screen.getByTestId("loading").textContent).toBe("true");
    expect(screen.getByTestId("query").textContent).toBe("iro");
    expect(screen.getByTestId("error").textContent).toBe("");
  });

  it("expone las funciones search y clearSearch y las llama con los argumentos correctos", () => {
    const ctx = makeCtx();
    (useCharactersContext as jest.Mock).mockReturnValue(ctx);

    render(<Harness />);

    fireEvent.click(screen.getByTestId("search-btn"));
    expect(ctx.search).toHaveBeenCalledTimes(1);
    expect(ctx.search).toHaveBeenCalledWith("iron");

    fireEvent.click(screen.getByTestId("clear-btn"));
    expect(ctx.clearSearch).toHaveBeenCalledTimes(1);
  });

  it("refleja cambios si el contexto cambia en un rerender", () => {
    const ctx1 = makeCtx({
      characters: [{ id: 1, name: "Hulk", thumbnail: "hulk.jpg" }],
      loading: true,
      query: "h",
    });
    const ctx2 = makeCtx({
      characters: [
        { id: 1, name: "Hulk", thumbnail: "hulk.jpg" },
        { id: 2, name: "Black Widow", thumbnail: "bw.jpg" },
      ],
      loading: false,
      query: "hu",
    });

    (useCharactersContext as jest.Mock).mockReturnValueOnce(ctx1).mockReturnValue(ctx2);

    const { rerender } = render(<Harness />);

    // Estado inicial
    expect(screen.getByTestId("names").textContent).toBe("Hulk");
    expect(screen.getByTestId("loading").textContent).toBe("true");
    expect(screen.getByTestId("query").textContent).toBe("h");

    // Cambiamos el valor que devuelve el contexto y rerenderizamos
    rerender(<Harness />);

    expect(screen.getByTestId("names").textContent).toBe("Hulk,Black Widow");
    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("query").textContent).toBe("hu");
  });
});
