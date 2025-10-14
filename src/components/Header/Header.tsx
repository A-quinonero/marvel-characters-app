"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import ProgressBar from "../ProgressBar/ProgressBar";

import HeartIcon from "@/assets/icons/HeartIcon";
import MarvelLogo from "@/assets/icons/MarvelLogo";
import { useFavorites } from "@/hooks/useFavorites";
import { useSearch } from "@/hooks/useSearch";
import { useUrlFilters } from "@/hooks/useUrlFilters";


// src/components/Header/Header.tsx
const Bar = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-h);
  padding: 0 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--navbar-bg);
  color: var(--navbar-text);
  z-index: 1000;
  @media (max-width: 768px) {
    padding: 0 24px;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Logo = styled.button`
  all: unset;
  cursor: pointer;
  color: inherit;
  font-weight: 900;
  font-size: 20px;
  letter-spacing: 0.6px;
  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const FavBadge = styled.div<{ $active?: boolean }>`
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 8px 0;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;

const Counter = styled.span`
  font-size: 16px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
`;

export default function Header() {
  const pathname = usePathname();
  const { count } = useFavorites();
  const { showFavorites, clearFilters, setFavorites, navigate, setFavoritesAt } = useUrlFilters();
  const { handleClearSearch } = useSearch();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const goHome = useCallback(() => {
    if (pathname === "/") {
      clearFilters();
      handleClearSearch();
    } else {
      navigate("/");
    }
  }, [pathname, clearFilters, navigate, handleClearSearch]);

  const toggleFavorites = useCallback(() => {
    if (pathname === "/" && showFavorites) {
      return;
    }

    if (pathname === "/" && !showFavorites) {
      clearFilters();
      setFavorites(true);
      return;
    }
    if (pathname !== "/" && !showFavorites) {
      setFavoritesAt(true, "/");
      return;
    }
  }, [pathname, showFavorites, setFavorites, setFavoritesAt, clearFilters]);

  const safeCount = mounted ? count : 0;
  return (
    <Bar role="banner" aria-label="Barra de navegación">
      <Left>
        <Logo data-cy="header-logo" onClick={goHome} aria-label="Volver al inicio">
          <MarvelLogo />
        </Logo>
      </Left>
      <Right>
        <FavBadge
          data-cy="header-favorites-button"
          onClick={toggleFavorites}
          $active={showFavorites}
          aria-pressed={showFavorites}
          aria-label={showFavorites ? "Ver todos los personajes" : "Ver favoritos"}
          title={showFavorites ? "Ver todos" : "Ver favoritos"}
        >
          <HeartIcon />
          <Counter aria-label={`Número de favoritos: ${safeCount}`}>{safeCount}</Counter>
        </FavBadge>
      </Right>
      <ProgressBar />
    </Bar>
  );
}
