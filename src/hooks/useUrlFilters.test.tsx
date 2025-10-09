import React, { forwardRef, useImperativeHandle } from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useUrlFilters } from "./useUrlFilters";

// ─────────── Mocks ───────────
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/context/LoaderProvider", () => ({
  useLoader: jest.fn(),
}));

// Mock parcial de React para controlar useTransition
jest.mock("react", () => {
  const actual = jest.requireActual("react");
  return { ...actual, useTransition: jest.fn() };
});

const { useRouter, usePathname, useSearchParams } = jest.requireMock("next/navigation") as {
  useRouter: jest.Mock;
  usePathname: jest.Mock;
  useSearchParams: jest.Mock;
};
const { useLoader } = jest.requireMock("@/context/LoaderProvider") as { useLoader: jest.Mock };
const { useTransition } = jest.requireMock("react") as { useTransition: jest.Mock };

// ─────────── Helpers ───────────
type ParamsInit = Record<string, string | undefined>;
const makeParams = (init: ParamsInit) => {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(init)) {
    if (v !== undefined && v !== "") usp.set(k, v);
  }
  return {
    get: (key: string) => usp.get(key),
    toString: () => usp.toString(),
  };
};

type ReplaceArgs = [url: string, opts?: { scroll?: boolean }];

// Mock del router con jest.fn tipado correctamente: <Return, ArgsTuple>
const makeRouter = () => ({
  replace: jest.fn<void, ReplaceArgs>(),
});
const makeLoader = () => ({ showLoader: jest.fn(), hideLoader: jest.fn() });

// Harness con ref para invocar las acciones del hook directamente
type HarnessRef = {
  clearFilters: () => void;
  setFavorites: (on: boolean) => void;
  setQuery: (value: string) => void;
  navigate: (url: string) => void;
  setFavoritesAt: (on: boolean, basePath?: string) => void;
};

const Harness = forwardRef<HarnessRef>((_props, ref) => {
  const {
    showFavorites,
    q,
    clearFilters,
    setFavorites,
    setQuery,
    isPending,
    navigate,
    setFavoritesAt,
  } = useUrlFilters();

  useImperativeHandle(ref, () => ({
    clearFilters,
    setFavorites,
    setQuery,
    navigate,
    setFavoritesAt,
  }));

  return (
    <div>
      <div data-testid="showFav">{String(showFavorites)}</div>
      <div data-testid="q">{q}</div>
      <div data-testid="pending">{String(isPending)}</div>
    </div>
  );
});
Harness.displayName = "Harness";

describe("useUrlFilters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePathname.mockReturnValue("/characters");
    useSearchParams.mockReturnValue(makeParams({ q: "iron", favorites: "1", x: "1" }));
    useRouter.mockReturnValue(makeRouter());
    useLoader.mockReturnValue(makeLoader());
    const startTransition = jest.fn((cb: () => void) => cb());
    useTransition.mockReturnValue([false, startTransition]);
  });

  const renderHarness = () => {
    const ref = React.createRef<HarnessRef>();
    render(<Harness ref={ref} />);
    return ref;
  };

  const getLastReplaceCall = () => {
    const router = useRouter.mock.results.at(-1)!.value as ReturnType<typeof makeRouter>;
    const calls = router.replace.mock.calls as ReplaceArgs[]; // 👈 tipado
    expect(calls.length).toBeGreaterThan(0);
    return calls.at(-1)!; // [url, opts]
  };

  it("lee showFavorites y q desde los parámetros e informa isPending", () => {
    const startTransition = jest.fn((cb: () => void) => cb());
    useTransition.mockReturnValueOnce([true, startTransition]); // pending=true en este render

    renderHarness();

    expect(screen.getByTestId("showFav").textContent).toBe("true");
    expect(screen.getByTestId("q").textContent).toBe("iron");
    expect(screen.getByTestId("pending").textContent).toBe("true");
  });

  it("navigate: llama a showLoader, startTransition y router.replace(url,{scroll:false})", () => {
    const ref = renderHarness();
    const loader = useLoader.mock.results[0].value as ReturnType<typeof makeLoader>;
    const [, startTransition] = useTransition.mock.results[0].value as [
      boolean,
      (cb: () => void) => void,
    ];

    act(() => {
      ref.current!.navigate("/dest");
    });

    expect(loader.showLoader).toHaveBeenCalledTimes(1);
    expect(startTransition).toHaveBeenCalledTimes(1);
    const [url, opts] = getLastReplaceCall();
    expect(url).toBe("/dest");
    expect(opts).toEqual({ scroll: false });
  });

  it("clearFilters: elimina q y favorites pero conserva otros params", () => {
    const ref = renderHarness();

    act(() => {
      ref.current!.clearFilters();
    });

    const [url] = getLastReplaceCall();
    const sp = new URL("http://t" + url).searchParams;
    expect(sp.get("q")).toBeNull();
    expect(sp.get("favorites")).toBeNull();
    expect(sp.get("x")).toBe("1");
  });

  it("setFavorites(true) añade favorites=1; setFavorites(false) lo elimina", () => {
    // Añadir
    useSearchParams.mockReturnValueOnce(makeParams({ q: "iron" })); // sin favorites
    const ref1 = renderHarness();

    act(() => {
      ref1.current!.setFavorites(true);
    });
    let [url] = getLastReplaceCall();
    let sp = new URL("http://t" + url).searchParams;
    expect(sp.get("favorites")).toBe("1");
    expect(sp.get("q")).toBe("iron");

    // Quitar
    useRouter.mockReturnValueOnce(makeRouter());
    useSearchParams.mockReturnValueOnce(makeParams({ q: "iron", favorites: "1" }));
    const ref2 = renderHarness();

    act(() => {
      ref2.current!.setFavorites(false);
    });
    [url] = getLastReplaceCall();
    sp = new URL("http://t" + url).searchParams;
    expect(sp.get("favorites")).toBeNull();
    expect(sp.get("q")).toBe("iron");
  });

  it("setQuery(value) pone q; con cadena vacía lo elimina", () => {
    useSearchParams.mockReturnValueOnce(makeParams({ favorites: "1" })); // sin q
    const ref1 = renderHarness();

    act(() => {
      ref1.current!.setQuery("iron");
    });
    let [url] = getLastReplaceCall();
    let sp = new URL("http://t" + url).searchParams;
    expect(sp.get("q")).toBe("iron");
    expect(sp.get("favorites")).toBe("1");

    // borrar q
    useRouter.mockReturnValueOnce(makeRouter());
    useSearchParams.mockReturnValueOnce(makeParams({ q: "iron" }));
    const ref2 = renderHarness();

    act(() => {
      ref2.current!.setQuery("");
    });
    [url] = getLastReplaceCall();
    sp = new URL("http://t" + url).searchParams;
    expect(sp.get("q")).toBeNull();
  });

  it("setFavoritesAt(true, '/'): usa basePath indicado y aplica favorites=1 con params actuales", () => {
    useSearchParams.mockReturnValueOnce(makeParams({ q: "thor" }));
    const ref = renderHarness();

    act(() => {
      ref.current!.setFavoritesAt(true, "/");
    });

    const [url] = getLastReplaceCall();
    expect(url.startsWith("/?")).toBe(true);
    const sp = new URL("http://t" + url).searchParams;
    expect(sp.get("favorites")).toBe("1");
    expect(sp.get("q")).toBe("thor");
  });

  it("hideLoader() se invoca cuando cambia pathname o paramsKey", () => {
    renderHarness();
    const loader = useLoader.mock.results.at(-1)!.value as ReturnType<typeof makeLoader>;
    loader.hideLoader.mockClear(); // ignoramos el mount

    // Cambia paramsKey (toString distinto)
    useRouter.mockReturnValueOnce(makeRouter());
    useSearchParams.mockReturnValueOnce(makeParams({ q: "cap" }));
    renderHarness();
    expect(loader.hideLoader).toHaveBeenCalledTimes(1);

    // Cambia pathname
    loader.hideLoader.mockClear();
    usePathname.mockReturnValueOnce("/characters/123");
    renderHarness();
    expect(loader.hideLoader).toHaveBeenCalledTimes(1);
  });
});
