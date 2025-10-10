// src/lib/readFixture.test.ts
import path from "path";

// Un único mock que usaremos para ambas rutas de import
const readFileMock = jest.fn();

// Mockeamos los dos nombres de módulo posibles
jest.mock("fs/promises", () => ({
  readFile: (...args: unknown[]) => readFileMock(...args),
}));
jest.mock("node:fs/promises", () => ({
  readFile: (...args: unknown[]) => readFileMock(...args),
}));

// Importamos DESPUÉS de declarar los mocks
import { readFixture } from "./readFixture";

describe("readFixture", () => {
  beforeEach(() => {
    readFileMock.mockReset();
  });

  it("lee y parsea JSON desde cypress/fixtures", async () => {
    readFileMock.mockResolvedValueOnce('{"foo":1}');

    const data = await readFixture<{ foo: number }>("my.json");

    expect(readFileMock).toHaveBeenCalledWith(
      path.join(process.cwd(), "cypress", "fixtures", "my.json"),
      "utf-8"
    );
    expect(data).toEqual({ foo: 1 });
  });

  it("lanza SyntaxError si el JSON es inválido", async () => {
    readFileMock.mockResolvedValueOnce("esto no es json");

    await expect(readFixture("broken.json")).rejects.toBeInstanceOf(SyntaxError);
  });

  it("propaga errores de fs (por ejemplo ENOENT)", async () => {
    const err = new Error("ENOENT: no such file or directory");
    readFileMock.mockRejectedValueOnce(err);

    await expect(readFixture("missing.json")).rejects.toThrow("ENOENT");
  });
});
