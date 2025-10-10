import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomeClient from "./HomeClient";
import type { Character } from "@/types/characters";

// ──────────────────────────
// Mocks de dependencias
// ──────────────────────────
jest.mock("@/context/CharactersProvider", () => ({
  useCharactersContext: jest.fn(),
}));

jest.mock("@/hooks/useSearch", () => ({
  useSearch: jest.fn(),
}));

// Mock de SearchBar: input controlado + botón clear
jest.mock("@/components/SearchBar/SearchBar", () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    onClear,
  }: {
    value: string;
    onChange: (val: string) => void;
    onClear: () => void;
  }) => (
    <div>
      <input
        data-testid="search-input"
        value={value}
        onChange={(e) => onChange((e.target as HTMLInputElement).value)}
      />
      <button data-testid="clear-btn" onClick={onClear}>
        clear
      </button>
    </div>
  ),
}));

// Mock de CharacterCard: pinta un <article> con el nombre
jest.mock("@/components/CharacterCard/CharacterCard", () => ({
  __esModule: true,
  default: ({ id, name }: { id: number; name: string; thumbnail: string }) => (
    <article data-testid="character-card" data-id={id}>
      {name}
    </article>
  ),
}));

// Mock de Skeleton
jest.mock("@/components/CharacterCard/CharacterCardSkeleton", () => ({
  __esModule: true,
  default: () => <div data-testid="character-skeleton">skeleton</div>,
}));

// Helpers para acceder a los mocks tipados
const { useCharactersContext } = jest.requireMock("@/context/CharactersProvider");
const { useSearch } = jest.requireMock("@/hooks/useSearch");

// ──────────────────────────
// Datos base
// ──────────────────────────
const initialData: Character[] = [
  { id: 1, name: "Iron Man", thumbnail: "iron.jpg", description: "" },
  { id: 2, name: "Thor", thumbnail: "thor.jpg", description: "" },
];

const results: Character[] = [
  { id: 10, name: "Hulk", thumbnail: "hulk.jpg", description: "" },
  { id: 20, name: "Black Widow", thumbnail: "bw.jpg", description: "" },
];

const makeUseSearchReturn = (overrides: Partial<ReturnType<typeof useSearch>> = {}) => {
  const base = {
    searchTerm: "",
    handleSearch: jest.fn(),
    handleClearSearch: jest.fn(),
    results,
    isSearching: false,
    showFavorites: false,
    counterLabel: "2 resultados",
  };
  return { ...base, ...overrides };
};

const makeUseCharactersContextReturn = () => {
  const initializeCharacters = jest.fn();
  return { initializeCharacters };
};

describe("HomeClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCharactersContext as jest.Mock).mockReturnValue(makeUseCharactersContextReturn());
    (useSearch as jest.Mock).mockReturnValue(makeUseSearchReturn());
  });

  it("inicializa el contexto de personajes con initialData al montar", () => {
    const ctx = makeUseCharactersContextReturn();
    (useCharactersContext as jest.Mock).mockReturnValue(ctx);

    render(<HomeClient initialData={initialData} />);

    expect(ctx.initializeCharacters).toHaveBeenCalledTimes(1);
    expect(ctx.initializeCharacters).toHaveBeenCalledWith(initialData);
  });

  it("renderiza SearchBar, Counter y el grid", () => {
    (useSearch as jest.Mock).mockReturnValue(
      makeUseSearchReturn({ searchTerm: "marvel", counterLabel: "2 resultados" })
    );

    const { container } = render(<HomeClient initialData={initialData} />);

    expect(screen.getByTestId("search-input")).toHaveValue("marvel");
    expect(screen.getByText("2 resultados")).toBeInTheDocument();
    const grid = container.querySelector('[data-cy="character-grid"]');
    expect(grid).toBeInTheDocument();
  });

  it("muestra 8 skeletons cuando isSearching=true y showFavorites=false", () => {
    (useSearch as jest.Mock).mockReturnValue(
      makeUseSearchReturn({ isSearching: true, showFavorites: false })
    );

    render(<HomeClient initialData={initialData} />);

    const skeletons = screen.getAllByTestId("character-skeleton");
    expect(skeletons).toHaveLength(8);
    expect(screen.queryAllByTestId("character-card")).toHaveLength(0);
  });

  it("NO muestra skeletons cuando showFavorites=true aunque isSearching=true", () => {
    (useSearch as jest.Mock).mockReturnValue(
      makeUseSearchReturn({
        isSearching: true,
        showFavorites: true,
        // resultados simulados en favoritos
        results: [{ id: 30, name: "Favorite One", thumbnail: "fav.jpg", description: "" }],
      })
    );

    render(<HomeClient initialData={initialData} />);

    // Título de favoritos visible
    expect(screen.getByRole("heading", { name: /favorites/i })).toBeInTheDocument();

    // No skeletons
    expect(screen.queryAllByTestId("character-skeleton")).toHaveLength(0);

    // Sí tarjetas
    const cards = screen.getAllByTestId("character-card");
    expect(cards).toHaveLength(1);
    expect(screen.getByText("Favorite One")).toBeInTheDocument();
  });

  it("muestra tarjetas cuando isSearching=false (usa results)", () => {
    (useSearch as jest.Mock).mockReturnValue(
      makeUseSearchReturn({
        isSearching: false,
        results,
      })
    );

    render(<HomeClient initialData={initialData} />);

    const cards = screen.getAllByTestId("character-card");
    expect(cards).toHaveLength(2);
    expect(screen.getByText("Hulk")).toBeInTheDocument();
    expect(screen.getByText("Black Widow")).toBeInTheDocument();
  });

  it("propaga eventos de búsqueda: change llama a handleSearch y clear llama a handleClearSearch", () => {
    const handleSearch = jest.fn();
    const handleClearSearch = jest.fn();

    (useSearch as jest.Mock).mockReturnValue(
      makeUseSearchReturn({
        searchTerm: "",
        handleSearch,
        handleClearSearch,
      })
    );

    render(<HomeClient initialData={initialData} />);

    const input = screen.getByTestId("search-input");
    fireEvent.change(input, { target: { value: "iron" } });
    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith("iron");

    const clearBtn = screen.getByTestId("clear-btn");
    fireEvent.click(clearBtn);
    expect(handleClearSearch).toHaveBeenCalledTimes(1);
  });
});
