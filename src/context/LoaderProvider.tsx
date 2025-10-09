"use client";

import { createContext, useState, useContext, ReactNode, useCallback, useMemo, useRef } from "react";

type LoaderContextType = {
  showLoader: () => void;
  hideLoader: () => void;
  withLoader: <T>(op: () => Promise<T>) => Promise<T>;
  isLoading: boolean;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pendingRef = useRef(0);

  const showLoader = useCallback(() => {
    pendingRef.current += 1;
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    pendingRef.current = Math.max(0, pendingRef.current - 1);
    if (pendingRef.current === 0) {
      setIsLoading(false);
    }
  }, []);

  const withLoader = useCallback(async <T,>(op: () => Promise<T>): Promise<T> => {
    showLoader();
    try {
      return await op();
    } finally {
      hideLoader();
    }
  }, [showLoader, hideLoader]);

  const value = useMemo<LoaderContextType>(() => ({
    showLoader, hideLoader, withLoader, isLoading
  }), [showLoader, hideLoader, withLoader, isLoading]);

  return (
    <LoaderContext.Provider value={value}>
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoader must be used within a LoaderProvider");
  return ctx;
}