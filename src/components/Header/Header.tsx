"use client";

import { usePathname } from "next/navigation";
import styled from "styled-components";
import { useCallback } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import MarvelLogo from "@/assets/icons/MarvelLogo";
import HeartIcon from "@/assets/icons/HeartIcon";
import { useUrlFilters } from "@/hooks/useUrlFilters";

const Bar = styled.header`
  height: 84px;
  padding: 0 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #000;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
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
  color: #fff;
  font-weight: 900;
  font-size: 20px;
  letter-spacing: 0.6px;
  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;
const FavBadge = styled.div<{ $active?: boolean }>`
  background: transparent;
  color: #fff;
  cursor: pointer;
  padding: 8px 0;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  &:focus-visible {
    outline: 2px solid #fff;
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
  const { showFavorites, clearFilters, setFavorites, navigate } = useUrlFilters();

  const goHome = useCallback(() => {
    if (pathname === "/") {
      clearFilters(); // loader lo maneja useUrlFilters
    } else {
      navigate("/"); // usa navigate() para mostrar barra y reemplazar URL
    }
  }, [pathname, clearFilters, navigate]);

  const toggleFavorites = useCallback(() => {
    setFavorites(!showFavorites); // loader y transición ya controladas en el hook
  }, [showFavorites, setFavorites]);

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
    </Bar>
  );
}
