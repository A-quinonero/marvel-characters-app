"use client";

import { usePathname } from "next/navigation";
import styled from "styled-components";
import { useCallback } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import MarvelLogo from "@/assets/icons/MarvelLogo";
import HeartIcon from "@/assets/icons/HeartIcon";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import ProgressBar from "../ProgressBar/ProgressBar";

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

  const goHome = useCallback(() => {
    if (pathname === "/") {
      clearFilters();
    } else {
      navigate("/");
    }
  }, [pathname, clearFilters, navigate]);

  const toggleFavorites = useCallback(() => {
    if (pathname === "/" && showFavorites) {
      return;
    }

    if (pathname === "/" && !showFavorites) {
      setFavorites(true);
      return;
    }
    if (pathname !== "/" && !showFavorites) {
      setFavoritesAt(true, "/");
      return;
    }
  }, [pathname, showFavorites, setFavorites, setFavoritesAt]);

  return (
    <Bar role="banner" aria-label="Barra de navegación">
      <Left>
        <Logo onClick={goHome} aria-label="Volver al inicio">
          <MarvelLogo />
        </Logo>
      </Left>
      <Right>
        <FavBadge
          onClick={toggleFavorites}
          $active={showFavorites}
          aria-pressed={showFavorites}
          aria-label={showFavorites ? "Ver todos los personajes" : "Ver favoritos"}
          title={showFavorites ? "Ver todos" : "Ver favoritos"}
        >
          <HeartIcon />
          <Counter aria-label={`Número de favoritos: ${count}`}>{count}</Counter>
        </FavBadge>
      </Right>
      <ProgressBar />
    </Bar>
  );
}
