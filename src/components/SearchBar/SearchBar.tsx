"use client";

import SearchIcon from "@/assets/icons/SearchIcon";
import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  width: 100%;

  svg {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: var(--icon-muted, #888);
    pointer-events: none;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px 10px 32px; /* espacio para el icono */
  border: transparent;
  border-bottom: 1px solid var(--input-border, rgba(0, 0, 0, 1));
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  text-transform: uppercase;

  background: var(--input-bg, #fff);
  color: var(--input-text, #111);

  &:focus {
    border-color: var(--input-focus-border, #bbb);
  }

  ::placeholder {
    color: var(--input-placeholder, rgba(170, 170, 170, 1));
  }
`;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder }: Props) {
  return (
    <Wrapper>
      <SearchIcon />
      <label htmlFor="search" style={{ display: "none" }}>
        Buscar personajes
      </label>
      <Input
        data-cy="search-input"
        id="search"
        placeholder={placeholder ?? "SEARCH A CHARACTER..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Buscar personajes"
        autoComplete="off"
      />
    </Wrapper>
  );
}
