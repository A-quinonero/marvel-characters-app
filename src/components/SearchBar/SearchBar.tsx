"use client";

import { useSearch } from "@/hooks/useSearch";
import styled from "styled-components";

const Wrapper = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background: #fff;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: #bbb;
  }
`;

type Props = {
  placeholder?: string;
};

export default function SearchBar({ placeholder  }: Props) {
   const {searchTerm, handleSearch} =  useSearch()
  return (
    <Wrapper>
      <label htmlFor="search" style={{ display: "none" }}>
        Buscar personajes
      </label>
      <Input
        id="search"
        placeholder={placeholder ?? "Buscar personajes (ej. Spider)"}
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        aria-label="Buscar personajes"
        autoComplete="off"
      />
    </Wrapper>
  );
}
