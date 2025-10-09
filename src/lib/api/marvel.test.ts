import type { Character } from "@/types/characters";
import type { Comic, ComicsResponse } from "@/types/comic";

/**
 * Utilidad para crear respuestas mock de fetch tipadas
 */
const makeResponse = (jsonData: unknown, ok = true, status = 200): Response => {
  const resp = {
    ok,
    status,
    json: jest.fn().mockResolvedValue(jsonData),
  } as const;
  return resp as unknown as Response;
};
// arriba del describe o junto a los helpers del test
const makeComicsResponse = (results: Comic[]): ComicsResponse => ({
  results,
  total: results.length,
  count: results.length,
});

describe("lib/api/marvel", () => {
  let originalFetch: typeof fetch | undefined;
  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeAll(() => {
    originalFetch = (globalThis as unknown as { fetch?: typeof fetch }).fetch;
  });

  beforeEach(() => {
    fetchMock = jest.fn() as unknown as jest.MockedFunction<typeof fetch>;
    (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock;
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (originalFetch) {
      (globalThis as unknown as { fetch: typeof fetch }).fetch = originalFetch;
    }
  });

  describe("con ABSOLUTE_BASE vacío (entorno cliente por defecto en JSDOM)", () => {
    // Importamos normalmente (JSDOM define window → base = "")
    // Importa DESPUÉS de preparar fetchMock
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const api = require("./marvel") as typeof import("./marvel");

    it("fetchCharacters construye la URL con querystring y pasa el signal", async () => {
      const characters: Character[] = [
        { id: 1, name: "Iron Man", thumbnail: "iron.jpg", description: "" },
      ];
      fetchMock.mockResolvedValueOnce(makeResponse({ results: characters }));

      const ac = new AbortController();
      const result = await api.fetchCharacters("Iron", 50, 0, ac.signal);

      expect(result).toEqual(characters);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [url, opts] = fetchMock.mock.calls[0];
      expect(typeof url).toBe("string");
      expect(url as string).toBe("/api/marvel/characters?limit=50&offset=0&nameStartsWith=Iron");
      expect(opts?.signal).toBe(ac.signal);
    });

    it("fetchCharacters lanza error con el status en el mensaje si !ok", async () => {
      fetchMock.mockResolvedValueOnce(makeResponse({}, false, 500));
      await expect(api.fetchCharacters("X")).rejects.toThrow("API error 500");
    });

    it("fetchCharacterById (200) devuelve el Character", async () => {
      const ch: Character = { id: 123, name: "Thor", thumbnail: "thor.jpg", description: "" };
      fetchMock.mockResolvedValueOnce(makeResponse(ch, true, 200));

      const out = await api.fetchCharacterById(123);

      expect(out).toEqual(ch);
      const [url] = fetchMock.mock.calls[0];
      expect(url as string).toBe("/api/marvel/characters/123");
    });

    it("fetchCharacterById (404) devuelve null", async () => {
      fetchMock.mockResolvedValueOnce(makeResponse({}, false, 404));
      const out = await api.fetchCharacterById(9999);
      expect(out).toBeNull();
    });

    it("fetchCharacterById (!ok distinto de 404) lanza 'Failed to fetch character'", async () => {
      fetchMock.mockResolvedValueOnce(makeResponse({}, false, 503));
      await expect(api.fetchCharacterById(1)).rejects.toThrow("Failed to fetch character");
    });

    it("fetchComicsByCharacter devuelve results del payload", async () => {
      const comics: Comic[] = [
        { id: 10, title: "Comic A", thumbnail: "a.jpg", onsaleDate: "2020-01-01T00:00:00.000Z" },
      ];
      const payload: ComicsResponse = makeComicsResponse(comics);
      fetchMock.mockResolvedValueOnce(makeResponse(payload));

      const out = await api.fetchComicsByCharacter(100);

      expect(out).toEqual(comics);
      const [url] = fetchMock.mock.calls[0];
      expect(url as string).toBe("/api/marvel/characters/100/comics");
    });

    it("fetchComicsByCharacter lanza error si !ok", async () => {
      fetchMock.mockResolvedValueOnce(makeResponse({}, false, 500));
      await expect(api.fetchComicsByCharacter(1)).rejects.toThrow("Failed to fetch comics");
    });
  });

  describe("ABSOLUTE_BASE en SSR con VERCEL_URL", () => {
    it("usa https://<VERCEL_URL> como prefijo absoluto", async () => {
      jest.resetModules();
      const prevWindow = (globalThis as unknown as { window?: unknown }).window;
      const prevVercel = process.env.VERCEL_URL;

      // Simular SSR: sin window
      delete (globalThis as unknown as { window?: unknown }).window;
      process.env.VERCEL_URL = "myapp.vercel.app";

      const ch: Character = { id: 42, name: "BW", thumbnail: "bw.jpg", description: "" };
      fetchMock.mockResolvedValueOnce(makeResponse(ch));

      // Carga el módulo en un aislamiento para recomputar ABSOLUTE_BASE
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const apiSSR = require("./marvel") as typeof import("./marvel");
        // Ejecuta una llamada que use la base
        void apiSSR.fetchCharacterById(42);
      });

      // Restituye entorno
      (globalThis as unknown as { window?: unknown }).window = prevWindow;
      process.env.VERCEL_URL = prevVercel;

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url] = fetchMock.mock.calls[0];
      expect(url as string).toBe("https://myapp.vercel.app/api/marvel/characters/42");
    });
  });
});
