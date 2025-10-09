// src/components/ComicItem/ComicItem.test.tsx
import { render, screen } from "@testing-library/react";
import ComicItem from "./ComicItem";
import type { Comic } from "@/types/comic";
import { baseFromMarvel } from "@/lib/marvelImageLoader"; // 👈 importa el helper

jest.mock("@/lib/utils/formatters", () => ({
  formatOnSaleDate: (iso?: string) => (iso ? "formatted-date" : ""),
}));

describe("ComicItem", () => {
  const comic: Comic = {
    id: 99,
    title: "The Amazing Test-Man",
    thumbnail: "https://example.com/test.jpg",
    onsaleDate: "2022-12-31T00:00:00.000Z",
  };

  it("renderiza portada, título y fecha formateada", () => {
    render(<ComicItem comic={comic} />);

    // portada (src transformado por next/image + loader)
    const img = screen.getByRole("img", { name: comic.title }) as HTMLImageElement;
    const src = img.getAttribute("src")!;
    // Debe partir del "base" y terminar con un variant portrait_*.ext
    const base = baseFromMarvel(comic.thumbnail);
    expect(src).toMatch(new RegExp(`^${base}/portrait_[^/]+\\.(jpg|jpeg|png|gif|webp|avif)$`));

    // título
    expect(screen.getByRole("heading", { name: comic.title })).toBeInTheDocument();

    // fecha formateada
    expect(screen.getByText("formatted-date")).toBeInTheDocument();

    // aria-label en el item
    expect(screen.getByLabelText(comic.title)).toBeInTheDocument();
  });

  it("renderiza sin romper si no hay fecha", () => {
    render(<ComicItem comic={{ ...comic, onsaleDate: undefined }} />);
    expect(screen.getByRole("heading", { name: comic.title })).toBeInTheDocument();
  });
});
