// src/hooks/useUrlFilters.ts
"use client";

import { useCallback, useTransition, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLoader } from "@/context/LoaderProvider";

export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { showLoader, hideLoader } = useLoader();

  const showFavorites = params.get("favorites") === "1";
  const q = params.get("q") ?? "";
  const paramsKey = params.toString(); // clave estable para detectar cambios de query

  const buildUrl = useCallback(
    (patch: Record<string, string | undefined>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === "") sp.delete(k);
        else sp.set(k, v);
      }
      const qs = sp.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [params, pathname]
  );

  const navigate = useCallback(
    (url: string) => {
      // CONTROL MANUAL: mostramos barra justo antes de navegar
      showLoader();
      startTransition(() => {
        router.replace(url, { scroll: false });
      });
    },
    [router, showLoader]
  );

  // FIN DE NAVEGACIÓN: cuando cambian pathname o los search params, ocultamos
  useEffect(() => {
    hideLoader();
  }, [pathname, paramsKey, hideLoader]);

  const clearFilters = useCallback(() => {
    navigate(buildUrl({ q: undefined, favorites: undefined }));
  }, [navigate, buildUrl]);

  const setFavorites = useCallback(
    (on: boolean) => {
      navigate(buildUrl({ favorites: on ? "1" : undefined }));
    },
    [navigate, buildUrl]
  );

  const setQuery = useCallback(
    (value: string) => {
      navigate(buildUrl({ q: value || undefined }));
    },
    [navigate, buildUrl]
  );

  return { showFavorites, q, clearFilters, setFavorites, setQuery, isPending, navigate };
}
