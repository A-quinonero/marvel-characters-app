import { render, screen, act } from "@testing-library/react";
import React, { forwardRef, useImperativeHandle } from "react";

import "@testing-library/jest-dom";
import { CharactersProvider, useCharactersContext } from "./CharactersProvider";

import type { Character } from "@/types/characters";

// ───────────────────────────────────────────
// Mock de la API Marvel con control de señales/abort
// ───────────────────────────────────────────
type PendingCall = {
  q: string;
  signal?: AbortSignal;
  resolve: (v: Character[]) => void;
  reject: (e: unknown) => void;
  promise: Promise<Character[]>;
};

const pendingCalls: PendingCall[] = [];

jest.mock("@/lib/api/marvel", () => ({
  fetchCharacters: jest.fn((q: string, _limit: number, _offset: number, signal?: AbortSignal) => {
    let resolve!: (v: Character[]) => void;
    let reject!: (e: unknown) => void;
    const promise = new Promise<Character[]>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    // Si se aborta la señal, rechazamos como en fetch real
    if (signal) {
      if (signal.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
      } else {
        const onAbort = () => reject(new DOMException("Aborted", "AbortError"));
        signal.addEventListener("abort", onAbort, { once: true });
      }
    }

    const call: PendingCall = { q, signal, resolve, reject, promise };
    pendingCalls.push(call);
    return promise;
  }),
}));

const { fetchCharacters } = jest.requireMock("@/lib/api/marvel");

// ───────────────────────────────────────────
// Consumer de prueba con ref para invocar acciones del contexto
// ───────────────────────────────────────────
type HarnessRef = {
  initialize: (data: Character[]) => void;
  search: (q: string) => Promise<void>;
  clear: () => void;
};

const TestConsumer = forwardRef<HarnessRef>((_props, ref) => {
  const ctx = useCharactersContext();

  useImperativeHandle(ref, () => ({
    initialize: ctx.initializeCharacters,
    search: ctx.search,
    clear: ctx.clearSearch,
  }));

  return (
    <div>
      <div data-testid="names">{ctx.characters.map((c) => c.name).join(",")}</div>
      <div data-testid="loading">{String(ctx.loading)}</div>
      <div data-testid="query">{ctx.query}</div>
      <div data-testid="error">{ctx.error ?? ""}</div>
    </div>
  );
});
TestConsumer.displayName = "TestConsumer";

// ───────────────────────────────────────────
// Datos helpers
// ───────────────────────────────────────────
const initialData: Character[] = [
  { id: 1, name: "Iron Man", thumbnail: "iron.jpg", description: "" },
  { id: 2, name: "Thor", thumbnail: "thor.jpg", description: "" },
];
const resultsIron: Character[] = [
  { id: 10, name: "Ironheart", thumbnail: "irh.jpg", description: "" },
];
const resultsThor: Character[] = [
  { id: 20, name: "Thor (Jane Foster)", thumbnail: "tjf.jpg", description: "" },
];

// ───────────────────────────────────────────
// Tests
// ───────────────────────────────────────────
describe("CharactersProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pendingCalls.length = 0;
  });

  const setup = () => {
    const ref = React.createRef<HarnessRef>();
    render(
      <CharactersProvider>
        <TestConsumer ref={ref} />
      </CharactersProvider>
    );
    return ref;
  };

  it("initializeCharacters establece el estado inicial", async () => {
    const ref = setup();

    await act(async () => {
      ref.current!.initialize(initialData);
    });

    expect(screen.getByTestId("names").textContent).toBe("Iron Man,Thor");
    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("query").textContent).toBe("");
    expect(screen.getByTestId("error").textContent).toBe("");
  });

  it("search pone loading=true, hace fetch y, al resolver, actualiza characters y loading=false", async () => {
    const ref = setup();

    // Dispara búsqueda
    let searchPromise: Promise<void>;
    await act(async () => {
      searchPromise = ref.current!.search("iron");
      // da un tick para que SET_LOADING(true) se procese
      await Promise.resolve();
    });

    expect(screen.getByTestId("loading").textContent).toBe("true");
    expect(fetchCharacters).toHaveBeenCalledWith("iron", 50, 0, expect.any(Object));
    expect(pendingCalls).toHaveLength(1);

    // Resolvemos la llamada pendiente
    await act(async () => {
      pendingCalls[0].resolve(resultsIron);
      await searchPromise!;
    });

    expect(screen.getByTestId("names").textContent).toBe("Ironheart");
    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("query").textContent).toBe("iron");
    expect(screen.getByTestId("error").textContent).toBe("");
  });

  it("search('') aborta lo en curso y restaura el estado inicial", async () => {
    const ref = setup();

    // inicializa con initialData
    await act(async () => {
      ref.current!.initialize(initialData);
    });

    // lanza búsqueda en curso
    await act(async () => {
      ref.current!.search("thor");
      await Promise.resolve();
    });
    expect(pendingCalls).toHaveLength(1);
    const firstSignal = pendingCalls[0].signal!;
    expect(firstSignal.aborted).toBe(false);
    expect(screen.getByTestId("loading").textContent).toBe("true");

    // ahora search('') → aborta y restaura
    await act(async () => {
      ref.current!.search("");
      await Promise.resolve();
    });

    expect(firstSignal.aborted).toBe(true); // abortado por el provider
    expect(screen.getByTestId("names").textContent).toBe("Iron Man,Thor");
    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("query").textContent).toBe("");
    expect(screen.getByTestId("error").textContent).toBe("");
  });

  it("no vuelve a hacer fetch si el término normalizado es el mismo", async () => {
    const ref = setup();

    // Primera búsqueda exitosa con "iron"
    let p1!: Promise<void>;
    await act(async () => {
      p1 = ref.current!.search("iron");
      await Promise.resolve();
    });
    pendingCalls[0].resolve(resultsIron);
    await act(async () => {
      await p1;
    });
    expect(fetchCharacters).toHaveBeenCalledTimes(1);

    // Segunda con espacios/mayúsculas pero mismo normalized
    await act(async () => {
      await ref.current!.search("   IRON  ");
    });

    // No hay nueva llamada
    expect(fetchCharacters).toHaveBeenCalledTimes(1);
  });

  it("al lanzar una nueva búsqueda aborta la anterior", async () => {
    const ref = setup();

    // Lanza primera ("iron")
    await act(async () => {
      ref.current!.search("iron");
      await Promise.resolve();
    });
    const s1 = pendingCalls[0].signal!;
    expect(s1.aborted).toBe(false);

    // Lanza segunda ("thor") → aborta la primera
    await act(async () => {
      ref.current!.search("thor");
      await Promise.resolve();
    });
    const s2 = pendingCalls[1].signal!;
    expect(s1.aborted).toBe(true);
    expect(s2.aborted).toBe(false);

    // Resolvemos la segunda y verificamos estado final
    await act(async () => {
      // la última llamada a search devuelven Promise<void>; no la guardamos,
      // pero podemos provocar el flush resolviendo la promesa subyacente
      pendingCalls[1].resolve(resultsThor);
      // da un tick para que el reducer procese
      await Promise.resolve();
    });

    expect(screen.getByTestId("names").textContent).toBe("Thor (Jane Foster)");
    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("error").textContent).toBe("");
  });

  it('si fetchCharacters rechaza con error no-Abort, setea error="Error fetching characters" y loading=false', async () => {
    const ref = setup();

    // Para esta llamada, sobreescribimos el mock a rejetar con error normal
    (fetchCharacters as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error("boom")));

    await act(async () => {
      await ref.current!.search("failcase");
    });

    expect(screen.getByTestId("error").textContent).toBe("Error fetching characters");
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });
});
