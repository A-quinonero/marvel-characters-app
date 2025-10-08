import { NextResponse } from "next/server";
import { mapCharacter, marvelFetch } from "@/app/api/marvel/_utils";
import { MarvelCharacterDTO } from "@/types/api";

export async function GET(request: Request, context: unknown) {
  // Tipado interno seguro sin romper Next 15.x
  const { params } = context as { params: { id: string } };
  const numericId = Number(params.id);

  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const data = await marvelFetch<MarvelCharacterDTO>(`/characters/${numericId}`);
  const dto = data.results[0];
  if (!dto) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
  }

  return NextResponse.json(mapCharacter(dto));
}
