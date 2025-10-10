import { useCharactersContext } from "@/context/CharactersProvider";

export function useCharacters() {
  const ctx = useCharactersContext();
  return {
    characters: ctx.characters,
    loading: ctx.loading,
    query: ctx.query,
    error: ctx.error,
    search: ctx.search,
    clearSearch: ctx.clearSearch,
  };
}
