"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import styled from "styled-components";
import { useMemo, useCallback } from "react";
import { useFavorites } from "@/hooks/useFavorites";

const Bar = styled.header`
  /* Layout del Figma */
  height: 84px;
  padding: 16px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  /* Estilo */
  background: #000000;
  color: #ffffff;

  /* UX */
  position: sticky;
  top: 0;
  z-index: 100;
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
  color: #ffffff;
  font-weight: 900;
  font-size: 20px;
  letter-spacing: 0.6px;
  line-height: 1;
  user-select: none;

  &:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const NavLink = styled(Link)`
  color: #ffffffcc;
  text-decoration: none;
  font-size: 14px;

  &:hover {
    color: #ffffff;
  }
  &:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const FavBadge = styled.button<{ $active?: boolean }>`
  position: relative;
  border: 1px solid #ffffff33;
  background: ${({ $active }) => ($active ? "#ec1d24" : "transparent")};
  color: #ffffff;
  cursor: pointer;

  padding: 8px 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: #ffffff66;
  }

  &:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
  }
`;

const Counter = styled.span`
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 11px;
  background: #ffffff;
  color: #000000;
  font-size: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

/** Header principal */
export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { count } = useFavorites();

  const isFavoritesView = useMemo(() => pathname?.includes("?favorites=1"), [pathname]);

  const goHome = useCallback(() => router.push("/"), [router]);

  const toggleFavorites = useCallback(() => {
    if (isFavoritesView) router.push("/");
    else router.push("/?favorites=1");
  }, [isFavoritesView, router]);

  return (
    <Bar role="banner" aria-label="Barra de navegación">
      <Left>
        <Logo onClick={goHome} aria-label="Volver al inicio">
          MARVEL
        </Logo>
        <NavLink href="/" aria-label="Inicio">
          Inicio
        </NavLink>
      </Left>

      <Right>
        <FavBadge
          onClick={toggleFavorites}
          $active={isFavoritesView}
          aria-pressed={isFavoritesView}
          aria-label={isFavoritesView ? "Ver todos los personajes" : "Ver favoritos"}
          title={isFavoritesView ? "Ver todos" : "Ver favoritos"}
        >
          <span aria-hidden>★</span>
          Favoritos
          <Counter aria-label={`Número de favoritos: ${count}`}>{count}</Counter>
        </FavBadge>
      </Right>
    </Bar>
  );
}
