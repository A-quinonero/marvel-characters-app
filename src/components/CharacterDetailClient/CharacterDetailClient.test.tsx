// src/components/CharacterDetailClient/CharacterDetailClient.test.tsx
import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import CharacterDetailClient from "./CharacterDetailClient";
import type { Character } from "@/types/characters";
import type { Comic } from "@/types/comic";

// --- Mocks (sin cambios salvo imports de act arriba) ---
const toggleFavorite = jest.fn();

jest.mock("@/hooks/useCharacterDetail", () => ({
  useCharacterDetail: (character: Character | null, comics?: Comic[]) => {
    if (comics) return { sortedComics: comics ?? [] };
    return { favorite: false, toggleFavorite };
  },
}));

// Mock del ComicsList: ahora no necesita un data-testid
jest.mock("@/components/ComicsList/ComicsList", () => ({
  __esModule: true,
  default: ({ comics }: { comics: Comic[] }) => (
    <ul>
      {comics.map((c) => (
        <li key={c.id}>{c.title}</li>
      ))}
    </ul>
  ),
}));

// Mock del Skeleton accesible
jest.mock("@/components/ComicsList/ComicsListSkeleton", () => ({
  __esModule: true,
  default: () => <div>Cargando cómics...</div>,
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const character: Character = {
  id: 123,
  name: "Iron Man",
  description: "Genius, billionaire, playboy, philanthropist.",
  thumbnail: "https://example.com/ironman.jpg",
};
// --- Fin de los mocks ---

it("muestra un estado de carga y luego la lista de cómics", async () => {
  const comicsDef = deferred<Comic[]>();

  // Render dentro de act para cubrir la suspensión inicial
  await act(async () => {
    render(<CharacterDetailClient character={character} comicsPromise={comicsDef.promise} />);
  });

  // Esperamos al fallback de carga (puede aparecer en un tick async)
  expect(await screen.findByText("Cargando cómics...")).toBeInTheDocument();

  // Resolver la promesa DENTRO de act y esperar a que React procese el re-render
  await act(async () => {
    comicsDef.resolve([
      {
        id: 1,
        title: "Comic A",
        thumbnail: "https://example.com/a.jpg",
        onsaleDate: "2020-01-01T00:00:00.000Z",
      },
      {
        id: 2,
        title: "Comic B",
        thumbnail: "https://example.com/b.jpg",
        onsaleDate: "2021-01-01T00:00:00.000Z",
      },
    ]);
    await comicsDef.promise;
  });

  // Contenido final
  expect(await screen.findByText("Comic A")).toBeInTheDocument();
  expect(screen.queryByText("Cargando cómics...")).not.toBeInTheDocument();
  expect(screen.getByText("Comic B")).toBeInTheDocument();
  expect(screen.getByRole("list")).toBeInTheDocument();
});
