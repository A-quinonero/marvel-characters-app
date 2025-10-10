/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { render, screen } from "@testing-library/react";
import ComicItem from "./ComicItem";
import type { Comic } from "@/types/comic";

jest.mock("@/lib/utils/formatters", () => ({
  formatOnSaleDate: (iso?: string) => (iso ? "formatted-date" : ""),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { src, alt, loader, quality = 70 } = props;
    const srcStr = typeof src === "string" ? src : (src?.src ?? "");
    const computed = loader ? loader({ src: srcStr, width: 200, quality }) : srcStr;
    return <img src={computed} alt={alt} />;
  },
}));

describe("ComicItem", () => {
  const comic: Comic = {
    id: 99,
    title: "The Amazing Test-Man",
    thumbnail: "https://example.com/test/portrait_medium.jpg",
    onsaleDate: "2022-12-31T00:00:00.000Z",
  };

  it("renderiza portada, título y fecha formateada", () => {
    render(<ComicItem comic={comic} />);

    const img = screen.getByRole("img", { name: comic.title }) as HTMLImageElement;
    expect(img).toHaveAttribute("src", "https://example.com/test/portrait_incredible.jpg");

    expect(screen.getByRole("heading", { name: comic.title })).toBeInTheDocument();
    expect(screen.getByText("formatted-date")).toBeInTheDocument();
    expect(screen.getByLabelText(comic.title)).toBeInTheDocument();
  });

  it("renderiza sin romper si no hay fecha", () => {
    render(<ComicItem comic={{ ...comic, onsaleDate: undefined }} />);
    expect(screen.getByRole("heading", { name: comic.title })).toBeInTheDocument();
  });
});
