// src/context/LoaderProvider.test.tsx
import { render, screen, act } from "@testing-library/react";
import React, { forwardRef, useImperativeHandle } from "react";

import "@testing-library/jest-dom";
import { LoaderProvider, useLoader } from "./LoaderProvider";

type HarnessRef = {
  show: () => void;
  hide: () => void;
  withOpResolve: <T>(op: () => Promise<T>) => Promise<T>;
};

const TestConsumer = forwardRef<HarnessRef>((_props, ref) => {
  const { showLoader, hideLoader, withLoader, isLoading } = useLoader();

  useImperativeHandle(ref, () => ({
    show: showLoader,
    hide: hideLoader,
    withOpResolve: withLoader,
  }));

  return <span data-testid="loading">{String(isLoading)}</span>;
});
TestConsumer.displayName = "TestConsumer";

const setup = () => {
  const ref = React.createRef<HarnessRef>();
  render(
    <LoaderProvider>
      <TestConsumer ref={ref} />
    </LoaderProvider>
  );
  return ref;
};

describe("LoaderProvider", () => {
  it("por defecto isLoading=false", () => {
    setup(); // ⬅️ Renderizamos antes de leer el DOM
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("showLoader activa isLoading=true y hideLoader lo desactiva cuando el contador vuelve a 0", async () => {
    const ref = setup();

    // +1
    await act(async () => {
      ref.current!.show();
      await Promise.resolve();
    });
    expect(screen.getByTestId("loading").textContent).toBe("true");

    // +1 concurrente
    await act(async () => {
      ref.current!.show();
      await Promise.resolve();
    });
    expect(screen.getByTestId("loading").textContent).toBe("true");

    // -1 (queda 1 pendiente)
    await act(async () => {
      ref.current!.hide();
      await Promise.resolve();
    });
    expect(screen.getByTestId("loading").textContent).toBe("true");

    // -1 (contador 0 → false)
    await act(async () => {
      ref.current!.hide();
      await Promise.resolve();
    });
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("hideLoader extra no baja de cero (permanece false)", async () => {
    const ref = setup();

    await act(async () => {
      ref.current!.hide();
      ref.current!.hide();
      await Promise.resolve();
    });

    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("withLoader activa durante la operación y desactiva al resolver", async () => {
    const ref = setup();

    let resolve!: (v: number) => void;
    const p = new Promise<number>((res) => (resolve = res));

    let resultPromise!: Promise<number>;
    await act(async () => {
      resultPromise = ref.current!.withOpResolve(() => p);
      await Promise.resolve();
    });
    expect(screen.getByTestId("loading").textContent).toBe("true");

    await act(async () => {
      resolve(123);
      await resultPromise;
    });
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("withLoader también desactiva si la operación falla", async () => {
    const ref = setup();

    let reject!: (e: unknown) => void;
    const p = new Promise((_res, rej) => (reject = rej));

    let resultPromise!: Promise<never>;
    await act(async () => {
      resultPromise = ref.current!.withOpResolve(() => p as Promise<never>);
      await Promise.resolve();
    });
    expect(screen.getByTestId("loading").textContent).toBe("true");

    await act(async () => {
      reject(new Error("boom"));
      await expect(resultPromise).rejects.toThrow("boom");
    });
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("lanza error si useLoader se usa fuera del provider", () => {
    const Bad = () => {
      useLoader();
      return null;
    };
    expect(() => render(<Bad />)).toThrow("useLoader must be used within a LoaderProvider");
  });
});
