// src/lib/readFixture.ts
import { readFile } from "fs/promises";
import path from "path";

export async function readFixture<T = unknown>(file: string): Promise<T> {
  const p = path.join(process.cwd(), "cypress", "fixtures", file);
  const raw = await readFile(p, "utf-8");
  return JSON.parse(raw) as T;
}
