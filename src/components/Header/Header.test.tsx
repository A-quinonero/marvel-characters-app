import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "./Header";

// ──────────────────────────
// Mocks de dependencias
// ──────────────────────────
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@/hooks/useFavorites", () => ({
  useFavorites: jest.fn(),
}));

jest.mock("@/hooks/useUrlFilters", () => ({
  useUrlFilters: jest.fn(),
}));

jest.mock("@/assets/icons/MarvelLogo", () => ({
  __esModule: true,
  default: () => <div data-testid="marvel-logo" />,
}));

jest.mock("@/assets/icons/HeartIcon", () => ({
  __esModule: true,
  default: () => <svg data-testid="heart-icon" />,
}));

jest.mock("../ProgressBar/ProgressBar", () => ({
  __esModule: true,
  default: () => <div data-testid="progress-bar" />,
}));

// Helpers typed
const { usePathname } = jest.requireMock("next/navigation");
const { useFavorites } = jest.requireMock("@/hooks/useFavorites");
const { useUrlFilters } = jest.requireMock("@/hooks/useUrlFilters");

describe("Header", () => {
  const makeUrlFilters = (overrides: Partial<ReturnType<typeof useUrlFilters>> = {}) => {
    const clearFilters = jest.fn();
    const navigate = jest.fn();
    const setFavorites = jest.fn();
    const setFavoritesAt = jest.fn();
    const showFavorites = false;

    return {
      clearFilters,
      navigate,
      setFavorites,
      setFavoritesAt,
      showFavorites,
      ...overrides,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useFavorites as jest.Mock).mockReturnValue({ count: 0 });
  });

  it("renderiza logo, contador, icono de corazón y progress bar", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    (useUrlFilters as jest.Mock).mockReturnValue(makeUrlFilters({ showFavorites: false }));
    (useFavorites as jest.Mock).mockReturnValue({ count: 3 });

    render(<Header />);

    expect(screen.getByRole("banner", { name: /barra de navegación/i })).toBeInTheDocument();
    expect(screen.getByTestId("marvel-logo")).toBeInTheDocument();
    expect(screen.getByTestId("heart-icon")).toBeInTheDocument();
    expect(screen.getByTestId("progress-bar")).toBeInTheDocument();

    // El contador muestra 3 y expone aria-label accesible
    const counter = screen.getByText("3");
    expect(counter).toBeInTheDocument();
    expect(counter).toHaveAttribute("aria-label", "Número de favoritos: 3");

    // El badge de favoritos expone los atributos accesibles correctos
    const favBadge = screen.getByTitle("Ver favoritos");
    expect(favBadge).toHaveAttribute("aria-label", "Ver favoritos");
    expect(favBadge).toHaveAttribute("aria-pressed", "false");
  });

  it('al hacer click en el logo estando en "/" llama a clearFilters y no a navigate', () => {
    const filters = makeUrlFilters({ showFavorites: false });
    (usePathname as jest.Mock).mockReturnValue("/");
    (useUrlFilters as jest.Mock).mockReturnValue(filters);

    render(<Header />);

    const logoBtn = screen.getByRole("button", { name: /volver al inicio/i });
    fireEvent.click(logoBtn);

    expect(filters.clearFilters).toHaveBeenCalledTimes(1);
    expect(filters.navigate).not.toHaveBeenCalled();
  });

  it('al hacer click en el logo estando en otra ruta llama a navigate("/")', () => {
    const filters = makeUrlFilters({ showFavorites: false });
    (usePathname as jest.Mock).mockReturnValue("/character/123");
    (useUrlFilters as jest.Mock).mockReturnValue(filters);

    render(<Header />);

    const logoBtn = screen.getByRole("button", { name: /volver al inicio/i });
    fireEvent.click(logoBtn);

    expect(filters.navigate).toHaveBeenCalledTimes(1);
    expect(filters.navigate).toHaveBeenCalledWith("/");
    expect(filters.clearFilters).not.toHaveBeenCalled();
  });

  it('si está en "/" y showFavorites=true, al click en favoritos NO hace nada', () => {
    const filters = makeUrlFilters({ showFavorites: true });
    (usePathname as jest.Mock).mockReturnValue("/");
    (useUrlFilters as jest.Mock).mockReturnValue(filters);

    render(<Header />);

    const favBadge = screen.getByTitle("Ver todos"); // title cuando showFavorites=true
    expect(favBadge).toHaveAttribute("aria-label", "Ver todos los personajes");
    expect(favBadge).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(favBadge);

    expect(filters.setFavorites).not.toHaveBeenCalled();
    expect(filters.setFavoritesAt).not.toHaveBeenCalled();
  });

  it('si está en "/" y showFavorites=false, al click en favoritos llama a setFavorites(true)', () => {
    const filters = makeUrlFilters({ showFavorites: false });
    (usePathname as jest.Mock).mockReturnValue("/");
    (useUrlFilters as jest.Mock).mockReturnValue(filters);

    render(<Header />);

    const favBadge = screen.getByTitle("Ver favoritos");
    fireEvent.click(favBadge);

    expect(filters.setFavorites).toHaveBeenCalledTimes(1);
    expect(filters.setFavorites).toHaveBeenCalledWith(true);
    expect(filters.setFavoritesAt).not.toHaveBeenCalled();
  });

  it('si NO está en "/" y showFavorites=false, al click en favoritos llama a setFavoritesAt(true, "/")', () => {
    const filters = makeUrlFilters({ showFavorites: false });
    (usePathname as jest.Mock).mockReturnValue("/character/123");
    (useUrlFilters as jest.Mock).mockReturnValue(filters);

    render(<Header />);

    const favBadge = screen.getByTitle("Ver favoritos");
    fireEvent.click(favBadge);

    expect(filters.setFavoritesAt).toHaveBeenCalledTimes(1);
    expect(filters.setFavoritesAt).toHaveBeenCalledWith(true, "/");
    expect(filters.setFavorites).not.toHaveBeenCalled();
  });

  it('si NO está en "/" y showFavorites=true, al click en favoritos no cambia nada (no hay rama en el código)', () => {
    const filters = makeUrlFilters({ showFavorites: true });
    (usePathname as jest.Mock).mockReturnValue("/character/123");
    (useUrlFilters as jest.Mock).mockReturnValue(filters);

    render(<Header />);

    const favBadge = screen.getByTitle("Ver todos");
    fireEvent.click(favBadge);

    expect(filters.setFavorites).not.toHaveBeenCalled();
    expect(filters.setFavoritesAt).not.toHaveBeenCalled();
  });
});
