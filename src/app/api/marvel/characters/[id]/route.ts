import { NextResponse } from "next/server";
import { mapCharacter, marvelFetch } from "@/app/api/marvel/_utils";
import { MarvelCharacterDTO } from "@/types/api";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const data = await marvelFetch<MarvelCharacterDTO>(`/characters/${params.id}`);
  const dto = data.results[0];
  if (!dto) return NextResponse.json({ error: "Character not found" }, { status: 404 });
  return NextResponse.json(mapCharacter(dto));
}
