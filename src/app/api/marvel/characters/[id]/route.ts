import { NextResponse } from "next/server";

import { mapCharacter, marvelFetch } from "@/app/api/marvel/_utils";
import type { MarvelCharacterDTO } from "@/types/api";

type Params = { id: string };
type Ctx = { params: Promise<Params> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params; // 👈 await aquí
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const data = await marvelFetch<MarvelCharacterDTO>(`/characters/${numericId}`);
  const dto = data.results[0];
  if (!dto) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
  }

  return NextResponse.json(mapCharacter);
}
