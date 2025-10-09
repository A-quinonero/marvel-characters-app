// src/components/ComicsList/ComicsListSkeleton.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ComicsListSkeleton from "./ComicsListSkeleton";

// Mocks sin roles explícitos (evita jsx-a11y/no-redundant-roles)
jest.mock("./ComicsList", () => ({
  __esModule: true,
  Grid: ({ children }: { children: React.ReactNode }) => <ul data-testid="grid">{children}</ul>,
}));

jest.mock("../ComicItem/ComicItem", () => ({
  __esModule: true,
  Item: ({ children }: { children: React.ReactNode }) => <li data-testid="item">{children}</li>,
}));

describe("ComicsListSkeleton", () => {
  it("renderiza un grid con 5 items de esqueleto", () => {
    render(<ComicsListSkeleton />);

    // Usa roles implícitos
    const grid = screen.getByRole("list");
    expect(grid).toBeInTheDocument();

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
  });

  it("cada item tiene cover y meta (y meta tiene título y fecha)", () => {
    render(<ComicsListSkeleton />);

    const items = screen.getAllByRole("listitem");
    items.forEach((li) => {
      expect(li.children.length).toBe(2);

      const [cover, meta] = Array.from(li.children) as HTMLElement[];
      expect(cover.tagName).toBe("DIV");
      expect(meta.tagName).toBe("DIV");

      expect(meta.children.length).toBe(2);
      const [title, date] = Array.from(meta.children) as HTMLElement[];
      expect(title.tagName).toBe("DIV");
      expect(date.tagName).toBe("DIV");
    });
  });

  it("no muestra texto visible (contenido puramente esqueleto)", () => {
    render(<ComicsListSkeleton />);
    expect(screen.getByRole("list")).not.toHaveTextContent(/\S/);
  });
});
