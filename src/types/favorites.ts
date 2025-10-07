export interface FavoriteCharacter {
  id: number;
  name: string;
  thumbnail: string;
}

export interface FavoritesState {
  favorites: FavoriteCharacter[];
}

export type FavoritesAction =
  | { type: "LOAD_FAVORITES"; payload: FavoriteCharacter[] }
  | { type: "ADD_FAVORITE"; payload: FavoriteCharacter }
  | { type: "REMOVE_FAVORITE"; payload: number };
