export interface Comic {
  id: number;
  title: string;
  onsaleDate?: string; // ISO
  thumbnail: string;
}

export interface ComicsResponse {
  total: number;
  count: number;
  results: Comic[];
}
