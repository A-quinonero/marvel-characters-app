import { CharactersAction, CharactersState } from "@/types/characters";

export const charactersInitialState: CharactersState = {
  characters: [],
  initialCharacters: [], // 👈 Añadido
  loading: false,
  query: "",
  error: undefined,
};

export function charactersReducer(
  state: CharactersState,
  action: CharactersAction
): CharactersState {
  switch (action.type) {
    // Esta nueva acción guarda los datos iniciales en ambos estados
    case "SET_INITIAL_DATA":
      return {
        ...state,
        characters: action.payload,
        initialCharacters: action.payload, // 👈 Guarda la copia de seguridad
        loading: false,
      };
    
    // Esta acción ahora solo actualiza los resultados de búsqueda
    case "SET_CHARACTERS":
      return { 
        ...state, 
        characters: action.payload, 
        loading: false, 
        error: undefined 
      };

    // Esta acción restaura la lista inicial
    case "RESTORE_INITIAL":
      return {
        ...state,
        characters: state.initialCharacters,
        query: "",
      }

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