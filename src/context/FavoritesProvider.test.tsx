import { render, screen, act } from "@testing-library/react";
import React, { forwardRef, useImperativeHandle } from "react";

import "@testing-library/jest-dom";
import { FavoritesProvider, useFavoritesContext } from "./FavoritesProvider";

import type { FavoriteCharacter } from "@/types/favorites";

// Solo necesitamos espiar setItem
const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

type HarnessRef = {
  add: (c: FavoriteCharacter) => void;
  remove: (id: number) => void;
};

const TestConsumer = forwardRef<HarnessRef>((_props, ref) => {
  const ctx = useFavoritesContext();

  useImperativeHandle(ref, () => ({
    add: ctx.addFavorite,
    remove: ctx.removeFavorite,
  }));

  return (
    <div>
      <div data-testid="names">{ctx.state.favorites.map((f) => f.name).join(",")}</div>
      <div data-testid="count">{String(ctx.state.favorites.length)}</div>
    </div>
  );
});
TestConsumer.displayName = "TestConsumer";

const favA: FavoriteCharacter = { id: 1, name: "Iron Man", thumbnail: "iron.jpg" };
const favB: FavoriteCharacter = { id: 2, name: "Thor", thumbnail: "thor.jpg" };

describe("FavoritesProvider", () => {
  const setup = () => {
    const ref = React.createRef<HarnessRef>();
    render(
      <FavoritesProvider>
        <TestConsumer ref={ref} />
      </FavoritesProvider>
    );
    return ref;
  };

  it("carga favoritos desde localStorage al montar (JSON válido) y persiste", async () => {
    localStorage.setItem("favorites", JSON.stringify([favA, favB]));

    // No necesitamos capturar `ref` aquí
    setup();

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId("names").textContent).toBe("Iron Man,Thor");
    expect(screen.getByTestId("count").textContent).toBe("2");

    expect(setItemSpy).toHaveBeenCalled();
    const lastCall = setItemSpy.mock.calls.at(-1);
    expect(lastCall?.[0]).toBe("favorites");
    expect(lastCall?.[1]).toBe(JSON.stringify([favA, favB]));
  });

  it("ignora JSON inválido en localStorage sin romper y persiste []", async () => {
    localStorage.setItem("favorites", "not-json");

    setup();
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId("names").textContent).toBe("");
    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(setItemSpy).toHaveBeenCalledWith("favorites", JSON.stringify([]));
  });

  it("addFavorite añade y persiste; removeFavorite elimina y persiste", async () => {
    const ref = setup();
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      ref.current!.add(favA);
      await Promise.resolve();
    });
    expect(screen.getByTestId("names").textContent).toBe("Iron Man");
    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(setItemSpy).toHaveBeenLastCalledWith("favorites", JSON.stringify([favA]));

    await act(async () => {
      ref.current!.add(favB);
      await Promise.resolve();
    });
    expect(screen.getByTestId("names").textContent).toBe("Iron Man,Thor");
    expect(screen.getByTestId("count").textContent).toBe("2");
    expect(setItemSpy).toHaveBeenLastCalledWith("favorites", JSON.stringify([favA, favB]));

    await act(async () => {
      ref.current!.remove(1);
      await Promise.resolve();
    });
    expect(screen.getByTestId("names").textContent).toBe("Thor");
    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(setItemSpy).toHaveBeenLastCalledWith("favorites", JSON.stringify([favB]));
  });

  it("lanza error si useFavoritesContext se usa fuera del provider", () => {
    const BadConsumer = () => {
      useFavoritesContext();
      return null;
    };
    expect(() => render(<BadConsumer />)).toThrow(
      "useFavoritesContext must be used within FavoritesProvider"
    );
  });
});
