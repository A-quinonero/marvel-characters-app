import { FavoritesAction, FavoritesState } from "@/types/favorites";

export const favoritesInitialState: FavoritesState = { favorites: [] };

export function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case "LOAD_FAVORITES":
      return { favorites: action.payload };
    case "ADD_FAVORITE":
      if (state.favorites.some((f) => f.id === action.payload.id)) return state;
      return { favorites: [...state.favorites, action.payload] };
    case "REMOVE_FAVORITE":
      return { favorites: state.favorites.filter((f) => f.id !== action.payload) };
    default:
      return state;
  }
}
