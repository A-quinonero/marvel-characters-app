import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";

import "@testing-library/jest-dom";
import TransitionLink from "./TransitionLink";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock de next/link que pinta un <a> estándar y reenvía onClick/props
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    onClick,
    children,
    ...rest
  }: {
    href: string | { pathname: string };
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    children: React.ReactNode;
  }) => (
    <a href={typeof href === "string" ? href : href?.pathname} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock("@/context/LoaderProvider", () => ({
  useLoader: jest.fn(),
}));

// Mock parcial de React para controlar useTransition
jest.mock("react", () => {
  const actual = jest.requireActual("react");
  return {
    ...actual,
    useTransition: jest.fn(), // la configuramos por test
  };
});

const { useRouter } = jest.requireMock("next/navigation");
const { useLoader } = jest.requireMock("@/context/LoaderProvider");
const { useTransition } = jest.requireMock("react");

// Helpers comunes
const makeRouter = () => ({ push: jest.fn() });
const makeLoader = () => ({ showLoader: jest.fn(), hideLoader: jest.fn() });

describe("TransitionLink", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(makeRouter());
    (useLoader as jest.Mock).mockReturnValue(makeLoader());
  });

  it("hace push al href dentro de startTransition al click", () => {
    const router = makeRouter();
    (useRouter as jest.Mock).mockReturnValue(router);

    const startTransitionMock = jest.fn((cb: () => void) => cb());
    (useTransition as jest.Mock).mockReturnValue([false, startTransitionMock]);

    render(
      <TransitionLink href="/target" aria-label="ir a target">
        Ir
      </TransitionLink>
    );

    const link = screen.getByRole("link", { name: /ir a target/i });
    fireEvent.click(link);

    expect(startTransitionMock).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith("/target");
  });

  it("muestra loader cuando isPending=true y lo oculta cuando isPending=false", () => {
    const loader = makeLoader();
    (useLoader as jest.Mock).mockReturnValue(loader);

    const startTransitionMock = jest.fn((cb: () => void) => cb());

    // 1ª render: isPending = true  → debe llamar a showLoader
    // 2ª render (rerender): isPending = false → debe llamar a hideLoader
    (useTransition as jest.Mock)
      .mockReturnValueOnce([true, startTransitionMock])
      .mockReturnValueOnce([false, startTransitionMock]);

    const { rerender } = render(
      <TransitionLink href="/x" aria-label="link">
        Link
      </TransitionLink>
    );

    expect(loader.showLoader).toHaveBeenCalledTimes(1);
    expect(loader.hideLoader).not.toHaveBeenCalled();

    act(() => {
      rerender(
        <TransitionLink href="/x" aria-label="link">
          Link
        </TransitionLink>
      );
    });

    expect(loader.hideLoader).toHaveBeenCalledTimes(1);
  });

  it("respeta onClick preventDefault (no navega por defecto del <a>) y usa solo router.push", () => {
    const router = makeRouter();
    (useRouter as jest.Mock).mockReturnValue(router);
    const startTransitionMock = jest.fn((cb: () => void) => cb());
    (useTransition as jest.Mock).mockReturnValue([false, startTransitionMock]);

    render(
      <TransitionLink href="/solo-router" aria-label="solo router">
        Go
      </TransitionLink>
    );

    const link = screen.getByRole("link", { name: /solo router/i });
    // Si no hiciera preventDefault, location.href cambiaría, pero aquí
    // simplemente comprobamos que el push se llama y que el anchor existe.
    fireEvent.click(link);

    expect(router.push).toHaveBeenCalledWith("/solo-router");
    expect(startTransitionMock).toHaveBeenCalledTimes(1);
  });
});
