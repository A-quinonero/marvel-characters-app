import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import CharacterCardSkeleton from "./CharacterCardSkeleton";

describe("CharacterCardSkeleton", () => {
  it("renderiza un article accesible con aria-busy y aria-live", () => {
    const { container } = render(<CharacterCardSkeleton />);
    const card = container.querySelector("article");

    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute("aria-busy", "true");
    expect(card).toHaveAttribute("aria-live", "polite");
  });

  it("tiene la estructura: ImgWrap (1 hijo) y Content (2 hijos)", () => {
    const { container } = render(<CharacterCardSkeleton />);
    const card = container.querySelector("article") as HTMLElement;

    // article -> [ImgWrap, Content]
    expect(card.children.length).toBe(2);

    const imgWrap = card.children[0] as HTMLElement;
    const content = card.children[1] as HTMLElement;

    // ImgWrap debe contener el bloque de imagen del esqueleto
    expect(imgWrap.tagName).toBe("DIV");
    expect(imgWrap.children.length).toBe(1); // SkeletonImage dentro

    // Content debe tener dos bloques (texto e icono)
    expect(content.tagName).toBe("DIV");
    expect(content.children.length).toBe(2); // SkeletonText y SkeletonIcon
  });

  it("no muestra texto visible (contenido puramente de esqueleto)", () => {
    const { container } = render(<CharacterCardSkeleton />);
    const card = container.querySelector("article") as HTMLElement;

    // No debe haber texto con caracteres no-espacio
    expect(card).not.toHaveTextContent(/\S/);
  });
});
