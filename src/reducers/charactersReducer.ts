import { CharactersAction, CharactersState } from "@/types/characters";

export const charactersInitialState: CharactersState = {
  characters: [],
  loading: false,
  query: "",
  error: undefined,
};

export function charactersReducer(
  state: CharactersState,
  action: CharactersAction
): CharactersState {
  switch (action.type) {
    case "SET_INITIAL":
      return { ...state, characters: action.payload, loading: false, error: undefined };
    case "SET_CHARACTERS":
      return { ...state, characters: action.payload, loading: false, error: undefined };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_QUERY":
      return { ...state, query: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}
