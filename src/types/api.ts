export interface MarvelImageDTO {
  path: string;
  extension: string;
}

export interface MarvelDateDTO {
  type: string;
  date: string;
}

export interface MarvelCharacterDTO {
  id: number;
  name: string;
  description?: string | null;
  thumbnail?: MarvelImageDTO | null;
}

export interface MarvelComicDTO {
  id: number;
  title: string;
  dates?: MarvelDateDTO[];
  thumbnail?: MarvelImageDTO | null;
}

export interface MarvelEnvelope<T> {
  code: number;
  status: string;
  data: {
    offset: number;
    limit: number;
    total: number;
    count: number;
    results: T[];
  };
}
