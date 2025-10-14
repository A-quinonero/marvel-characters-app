// src/components/ComicsList/ComicsList.test.tsx
import { render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";

import ComicsList from "./ComicsList";

import type { Comic } from "@/types/comic";

// Mockeamos ComicItem para que pinte un <li> simple con el título.
// Así comprobamos fácilmente la cantidad y el contenido.
jest.mock("@/components/ComicItem/ComicItem", () => ({
  __esModule: true,
  default: ({ comic }: { comic: Comic }) => <li data-testid="comic-item">{comic.title}</li>,
}));

const makeComic = (overrides: Partial<Comic> = {}): Comic => ({
  id: Math.floor(Math.random() * 100000),
  title: "Untitled",
  thumbnail: "https://example.com/cover.jpg",
  onsaleDate: "2020-01-01T00:00:00.000Z",
  ...overrides,
});

describe("ComicsList", () => {
  it("renderiza una lista (<ul>) con los cómics como <li>", () => {
    const comics: Comic[] = [
      makeComic({ id: 1, title: "Comic A" }),
      makeComic({ id: 2, title: "Comic B" }),
      makeComic({ id: 3, title: "Comic C" }),
    ];

    render(<ComicsList comics={comics} />);

    // El contenedor es un <ul>, así que debe tener role="list"
    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();

    // Cada item mockeado es un <li> => data-testid="comic-item"
    const items = screen.getAllByTestId("comic-item");
    expect(items).toHaveLength(comics.length);

    // Verifica contenido visible
    expect(screen.getByText("Comic A")).toBeInTheDocument();
    expect(screen.getByText("Comic B")).toBeInTheDocument();
    expect(screen.getByText("Comic C")).toBeInTheDocument();

    // No debe mostrarse el mensaje vacío cuando hay cómics
    expect(screen.queryByTestId("empty-message")).not.toBeInTheDocument();
  });

  it("mantiene el orden de los cómics recibidos", () => {
    const comics: Comic[] = [
      makeComic({ id: 10, title: "Primero" }),
      makeComic({ id: 20, title: "Segundo" }),
      makeComic({ id: 30, title: "Tercero" }),
    ];

    render(<ComicsList comics={comics} />);

    const items = screen.getAllByTestId("comic-item");
    expect(items.map((el) => el.textContent)).toEqual(["Primero", "Segundo", "Tercero"]);
  });

  it("muestra un mensaje accesible cuando no hay cómics", () => {
    render(<ComicsList comics={[]} />);

    // La lista existe
    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();

    // No hay <li> de cómic (solo el mensaje de vacío)
    expect(screen.queryAllByTestId("comic-item")).toHaveLength(0);

    // Mensaje visible y accesible
    const empty = screen.getByTestId("empty-message");
    expect(empty).toBeInTheDocument();
    expect(empty).toHaveTextContent("No comics available...");
  });
});
