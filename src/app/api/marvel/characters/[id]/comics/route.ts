import { NextResponse } from "next/server";
import { mapComic, marvelFetch } from "@/app/api/marvel/_utils";
import { MarvelComicDTO } from "@/types/api";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const data = await marvelFetch<MarvelComicDTO>(`/characters/${params.id}/comics`, {
    limit: 20,
    orderBy: "onsaleDate",
  });
  const results = data.results.map(mapComic);
  return NextResponse.json({ total: data.total, count: data.count, results });
}
