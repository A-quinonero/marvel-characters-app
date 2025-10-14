// src/components/CharacterCard/CharacterCard.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";

import CharacterCard from "./CharacterCard";

const mockUseFavorites = {
  isFavorite: jest.fn(),
  addFavorite: jest.fn(),
  removeFavorite: jest.fn(),
};

// ✅ Mock del hook de favoritos
jest.mock("@/hooks/useFavorites", () => ({
  useFavorites: () => mockUseFavorites,
}));

// ✅ Mock de TransitionLink para evitar useRouter
jest.mock("@/components/TransitionLink/TransitionLink", () => {
  return function MockTransitionLink({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) {
    return <a href={href}>{children}</a>;
  };
});

describe("CharacterCard", () => {
  const baseProps = {
    id: 1011334,
    name: "3-D Man",
    thumbnail: "https://example.com/3dman.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza nombre e imagen", () => {
    mockUseFavorites.isFavorite.mockReturnValue(false);
    render(<CharacterCard {...baseProps} />);

    expect(screen.getByRole("img", { name: baseProps.name })).toBeInTheDocument();
    expect(screen.getByText(baseProps.name)).toBeInTheDocument();
  });

  it("muestra botón como no-favorito y permite añadir", () => {
    mockUseFavorites.isFavorite.mockReturnValue(false);
    render(<CharacterCard {...baseProps} />);

    const btn = screen.getByRole("button", { name: /añadir a favoritos/i });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(btn);

    expect(mockUseFavorites.addFavorite).toHaveBeenCalledWith({
      id: baseProps.id,
      name: baseProps.name,
      thumbnail: baseProps.thumbnail,
    });
  });

  it("muestra botón como favorito y permite quitar", () => {
    mockUseFavorites.isFavorite.mockReturnValue(true);
    render(<CharacterCard {...baseProps} />);

    const btn = screen.getByRole("button", { name: /quitar de favoritos/i });
    expect(btn).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(btn);

    expect(mockUseFavorites.removeFavorite).toHaveBeenCalledWith(baseProps.id);
  });
});
