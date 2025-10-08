import "server-only";
import crypto from "node:crypto";
import { MarvelCharacterDTO, MarvelComicDTO, MarvelEnvelope } from "@/types/api";
import { Character } from "@/types/characters";
import { Comic } from "@/types/comic";

const BASE = process.env.MARVEL_API_BASE!;
const PUBLIC_KEY = process.env.MARVEL_PUBLIC_KEY!;
const PRIVATE_KEY = process.env.MARVEL_PRIVATE_KEY!;

export function authQS(): string {
  const ts = Date.now().toString();
  const hash = crypto.createHash("md5").update(ts + PRIVATE_KEY + PUBLIC_KEY).digest("hex");
  return new URLSearchParams({ ts, apikey: PUBLIC_KEY, hash }).toString();
}

export function toHttps(url?: string | null): string {
  if (!url) return "";
  return url.replace(/^http:\/\//i, "https://");
}

export function mapCharacter(dto: MarvelCharacterDTO): Character {
  const thumb = dto.thumbnail ? `${dto.thumbnail.path}.${dto.thumbnail.extension}` : "";
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? "",
    thumbnail: toHttps(thumb),
  };
}

function toIsoIfValid(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}
export function mapComic(dto: MarvelComicDTO): Comic {
  const dates = dto.dates ?? [];
  const get = (type: string) => dates.find(d => d.type === type)?.date;

  // Orden de preferencia por fecha (ajústalo si quieres otro):
  // 1) onsaleDate  2) focDate  3) unlimitedDate  4) digitalPurchaseDate
  const candidates = [
    get("onsaleDate"),
    get("focDate"),
    get("unlimitedDate"),
    get("digitalPurchaseDate"),
  ];

  const firstValidIso = candidates
    .map(toIsoIfValid)
    .find((iso): iso is string => iso !== undefined);

  const thumb = dto.thumbnail ? `${dto.thumbnail.path}.${dto.thumbnail.extension}` : "";

  return {
    id: dto.id,
    title: dto.title,
    onsaleDate: firstValidIso,                // <- ¡ya no peta si es inválida!
    thumbnail: toHttps(thumb),
  };
}

type SearchParams = Record<string, string | number | boolean | undefined>;

export async function marvelFetch<T>(
  path: string,
  search?: SearchParams,
  revalidateSeconds = 60
): Promise<MarvelEnvelope<T>["data"]> {
  const userQS = new URLSearchParams(
    Object.entries(search ?? {}).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v === undefined) return acc;
      acc[k] = String(v);
      return acc;
    }, {})
  );
  const url = `${BASE}${path}?${authQS()}${userQS.toString() ? `&${userQS.toString()}` : ""}`;

  const res = await fetch(url, { next: { revalidate: revalidateSeconds } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Marvel API error ${res.status}: ${text}`);
  }
  const json = (await res.json()) as MarvelEnvelope<T>;
  return json.data;
}
