import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useFavorites } from "./useFavorites";

// Mock del context hook que usa internamente useFavorites
jest.mock("@/context/FavoritesProvider", () => ({
  useFavoritesContext: jest.fn(),
}));
const { useFavoritesContext } = jest.requireMock("@/context/FavoritesProvider") as {
  useFavoritesContext: jest.Mock;
};

// Tipo local para el test
type FavoriteCharacter = { id: number; name: string; thumbnail: string };

const Harness = ({ probeId }: { probeId: number }) => {
  const { favorites, count, isFavorite, addFavorite, removeFavorite } = useFavorites();
  return (
    <div>
      <div data-testid="names">{favorites.map((f) => f.name).join(",")}</div>
      <div data-testid="count">{String(count)}</div>
      <div data-testid="probe">{String(isFavorite(probeId))}</div>
      <button
        data-testid="add"
        onClick={() => addFavorite({ id: 999, name: "NewFav", thumbnail: "x.jpg" })}
      />
      <button data-testid="remove" onClick={() => removeFavorite(999)} />
    </div>
  );
};

const baseCtx = () => ({
  state: { favorites: [] as FavoriteCharacter[] },
  addFavorite: jest.fn(),
  removeFavorite: jest.fn(),
});
const makeCtx = (overrides: Partial<ReturnType<typeof baseCtx>> = {}) => ({
  ...baseCtx(),
  ...overrides,
});

describe("useFavorites", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("expone favorites, count e isFavorite correctamente", () => {
    const ctx = makeCtx({
      state: {
        favorites: [
          { id: 1, name: "Iron Man", thumbnail: "iron.jpg" },
          { id: 2, name: "Thor", thumbnail: "thor.jpg" },
        ],
      },
    });
    useFavoritesContext.mockReturnValue(ctx);

    render(<Harness probeId={2} />);

    expect(screen.getByTestId("names").textContent).toBe("Iron Man,Thor");
    expect(screen.getByTestId("count").textContent).toBe("2");
    expect(screen.getByTestId("probe").textContent).toBe("true"); // 2 es favorito
  });

  it("llama a addFavorite y removeFavorite con los argumentos correctos", () => {
    const ctx = makeCtx();
    useFavoritesContext.mockReturnValue(ctx);

    render(<Harness probeId={123} />);

    fireEvent.click(screen.getByTestId("add"));
    expect(ctx.addFavorite).toHaveBeenCalledTimes(1);
    expect(ctx.addFavorite).toHaveBeenCalledWith({
      id: 999,
      name: "NewFav",
      thumbnail: "x.jpg",
    });

    fireEvent.click(screen.getByTestId("remove"));
    expect(ctx.removeFavorite).toHaveBeenCalledTimes(1);
    expect(ctx.removeFavorite).toHaveBeenCalledWith(999);
  });

  it("refleja cambios si el contexto cambia en un rerender", () => {
    const ctx1 = makeCtx({
      state: { favorites: [{ id: 10, name: "Hulk", thumbnail: "h.jpg" }] },
    });
    const ctx2 = makeCtx({
      state: {
        favorites: [
          { id: 10, name: "Hulk", thumbnail: "h.jpg" },
          { id: 20, name: "Black Widow", thumbnail: "bw.jpg" },
        ],
      },
    });

    useFavoritesContext.mockReturnValueOnce(ctx1).mockReturnValue(ctx2);

    const { rerender } = render(<Harness probeId={20} />);

    // Inicial
    expect(screen.getByTestId("names").textContent).toBe("Hulk");
    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(screen.getByTestId("probe").textContent).toBe("false");

    // Cambia el contexto
    rerender(<Harness probeId={20} />);
    expect(screen.getByTestId("names").textContent).toBe("Hulk,Black Widow");
    expect(screen.getByTestId("count").textContent).toBe("2");
    expect(screen.getByTestId("probe").textContent).toBe("true");
  });
});
