import React, { forwardRef, useImperativeHandle } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useCharacterDetail } from "./useCharacterDetail";

// ──────────────────────────
// Mocks
// ──────────────────────────
jest.mock("@/hooks/useFavorites", () => ({
  useFavorites: jest.fn(),
}));

const { useFavorites } = jest.requireMock("@/hooks/useFavorites") as {
  useFavorites: jest.Mock;
};

type Character = {
  id: number;
  name: string;
  thumbnail: string;
  description?: string;
};

type Comic = {
  id: number;
  title: string;
  thumbnail: string;
  onsaleDate?: string;
};

// Harness para consumir el hook en un componente
type HarnessRef = { toggle: () => void };
function HarnessUI({
  favorite,
  sortedComics,
}: {
  favorite: boolean;
  sortedComics: Comic[];
}) {
  return (
    <div>
      <span data-testid="favorite">{String(favorite)}</span>
      <ul data-testid="sorted">
        {sortedComics.map((c) => (
          <li key={c.id}>{c.id}</li>
        ))}
      </ul>
    </div>
  );
}

const Harness = forwardRef<
  HarnessRef,
  { character: Character | null; comics?: Comic[] }
>(({ character, comics }, ref) => {
  const { favorite, toggleFavorite, sortedComics } = useCharacterDetail(
    character,
    comics
  );

  useImperativeHandle(ref, () => ({
    toggle: toggleFavorite,
  }));

  return <HarnessUI favorite={favorite} sortedComics={sortedComics} />;
});
Harness.displayName = "Harness";

// Helpers
const makeFavs = ({
  isFav = () => false,
}: {
  isFav?: (id: number) => boolean;
} = {}) => {
  return {
    isFavorite: jest.fn(isFav),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
  };
};

const IRON: Character = {
  id: 100,
  name: "Iron Man",
  thumbnail: "iron.jpg",
};

const comicsUnsorted: Comic[] = [
  { id: 3, title: "C3", thumbnail: "c3.jpg", onsaleDate: "2021-01-01T00:00:00.000Z" },
  { id: 1, title: "C1", thumbnail: "c1.jpg" }, // sin fecha -> 0
  { id: 2, title: "C2", thumbnail: "c2.jpg", onsaleDate: "2020-01-01T00:00:00.000Z" },
];

describe("useCharacterDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("favorite=false cuando character=null y toggleFavorite no hace nada", () => {
    const favs = makeFavs();
    (useFavorites as jest.Mock).mockReturnValue(favs);

    const ref = React.createRef<HarnessRef>();
    render(<Harness ref={ref} character={null} comics={[]} />);

    expect(screen.getByTestId("favorite").textContent).toBe("false");

    // Llamar al toggle no debe invocar add/remove
    ref.current!.toggle();
    expect(favs.addFavorite).not.toHaveBeenCalled();
    expect(favs.removeFavorite).not.toHaveBeenCalled();
  });

  it("favorite=true cuando isFavorite(id) devuelve true y toggle llama a removeFavorite", () => {
    const favs = makeFavs({ isFav: (id) => id === IRON.id });
    (useFavorites as jest.Mock).mockReturnValue(favs);

    const ref = React.createRef<HarnessRef>();
    render(<Harness ref={ref} character={IRON} comics={[]} />);

    expect(screen.getByTestId("favorite").textContent).toBe("true");

    ref.current!.toggle();
    expect(favs.removeFavorite).toHaveBeenCalledTimes(1);
    expect(favs.removeFavorite).toHaveBeenCalledWith(IRON.id);
    expect(favs.addFavorite).not.toHaveBeenCalled();
  });

  it("favorite=false cuando isFavorite(id) devuelve false y toggle llama a addFavorite con el payload correcto", () => {
    const favs = makeFavs({ isFav: () => false });
    (useFavorites as jest.Mock).mockReturnValue(favs);

    const ref = React.createRef<HarnessRef>();
    render(<Harness ref={ref} character={IRON} comics={[]} />);

    expect(screen.getByTestId("favorite").textContent).toBe("false");

    ref.current!.toggle();
    expect(favs.addFavorite).toHaveBeenCalledTimes(1);
    expect(favs.addFavorite).toHaveBeenCalledWith({
      id: IRON.id,
      name: IRON.name,
      thumbnail: IRON.thumbnail,
    });
    expect(favs.removeFavorite).not.toHaveBeenCalled();
  });

  it("sortedComics ordena por onsaleDate ascendente y no muta el array original", () => {
    const favs = makeFavs();
    (useFavorites as jest.Mock).mockReturnValue(favs);

    const input = [...comicsUnsorted]; // copia para comparar luego
    const ref = React.createRef<HarnessRef>();
    render(<Harness ref={ref} character={IRON} comics={input} />);

    // Orden esperado: sin fecha (id:1) → 2020 (id:2) → 2021 (id:3)
    const sortedLi = screen
      .getAllByRole("listitem")
      .map((li) => Number(li.textContent));

    expect(sortedLi).toEqual([1, 2, 3]);

    // El array original debe permanecer en el mismo orden en que lo pasamos
    expect(input.map((c) => c.id)).toEqual(
      comicsUnsorted.map((c) => c.id)
    );
  });
});
