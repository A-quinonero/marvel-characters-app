import { NextResponse } from "next/server";
import { mapComic, marvelFetch } from "@/app/api/marvel/_utils";
import { MarvelComicDTO } from "@/types/api";

export async function GET(request: Request, context: unknown) {
  const { params } = context as { params: { id: string } };
  const numericId = Number(params.id);

  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const data = await marvelFetch<MarvelComicDTO>(`/characters/${numericId}/comics`, {
    limit: 20,
    orderBy: "onsaleDate",
  });

  const results = data.results.map(mapComic);
  return NextResponse.json({ total: data.total, count: data.count, results });
}
