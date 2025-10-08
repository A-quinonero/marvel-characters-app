import { NextResponse } from "next/server";
import { mapComic, marvelFetch } from "@/app/api/marvel/_utils";
import type { MarvelComicDTO } from "@/types/api";

type Params = { id: string };
type Ctx = { params: Promise<Params> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;               // 👈 await aquí
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const data = await marvelFetch<MarvelComicDTO>(`/characters/${numericId}/comics`, {
    limit: 20,
    orderBy: "onsaleDate",
  });

  const results = data.results.map(mapComic);
  return NextResponse.json({ total: data.total, count: data.count, results });
}
