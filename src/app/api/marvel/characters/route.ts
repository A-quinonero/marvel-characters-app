import { NextResponse } from "next/server";
import { mapCharacter, marvelFetch } from "@/app/api/marvel/_utils";
import { MarvelCharacterDTO } from "@/types/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nameStartsWith = searchParams.get("nameStartsWith") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  const data = await marvelFetch<MarvelCharacterDTO>("/characters", {
    limit,
    offset,
    orderBy: "name",
    nameStartsWith,
  });

  const results = data.results.map(mapCharacter);
  return NextResponse.json({ total: data.total, count: data.count, results });
}
