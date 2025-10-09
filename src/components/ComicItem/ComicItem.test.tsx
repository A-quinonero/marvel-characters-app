import { render, screen } from "@testing-library/react";
import ComicItem from "./ComicItem";
import type { Comic } from "@/types/comic";

// Mock del formateador para control del output
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

    // portada
    const img = screen.getByRole("img", { name: comic.title });
    expect(img).toHaveAttribute("src", comic.thumbnail);

    // título
    expect(screen.getByRole("heading", { name: comic.title })).toBeInTheDocument();

    // fecha formateada
    expect(screen.getByText("formatted-date")).toBeInTheDocument();

    // aria-label en el item
    expect(screen.getByLabelText(comic.title)).toBeInTheDocument();
  });

  it("renderiza sin romper si no hay fecha", () => {
    render(<ComicItem comic={{ ...comic, onsaleDate: undefined }} />);
    // No debería crashear y el título sigue visible
    expect(screen.getByRole("heading", { name: comic.title })).toBeInTheDocument();
  });
});
