export interface Character {
  id: number;
  name: string;
  description?: string;
  thumbnail: string;
}

export interface CharactersState {
  characters: Character[];
  loading: boolean;
  query: string;
  error?: string;
}

export type CharactersAction =
  | { type: "SET_INITIAL"; payload: Character[] }
  | { type: "SET_CHARACTERS"; payload: Character[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_QUERY"; payload: string }
  | { type: "SET_ERROR"; payload: string | undefined };

export interface CharactersResponse {
  total: number;
  count: number;
  results: Character[];
}
