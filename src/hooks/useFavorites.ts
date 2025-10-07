import { useFavoritesContext } from "@/context/FavoritesProvider";

export function useFavorites() {
  const { state, addFavorite, removeFavorite } = useFavoritesContext();
  return {
    favorites: state.favorites,
    addFavorite,
    removeFavorite,
    isFavorite: (id: number) => state.favorites.some((f) => f.id === id),
    count: state.favorites.length,
  };
}
