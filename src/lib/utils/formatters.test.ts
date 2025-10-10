import { formatOnSaleDate } from "./formatters";

describe("formatOnSaleDate", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("devuelve 'Fecha no disponible' cuando iso es undefined", () => {
    expect(formatOnSaleDate(undefined)).toBe("Fecha no disponible");
  });

  it("devuelve 'Fecha no disponible' cuando iso es inválido", () => {
    expect(formatOnSaleDate("no-es-una-fecha")).toBe("Fecha no disponible");
  });

  it("con iso válido formatea usando toLocaleDateString con las opciones esperadas y devuelve su valor", () => {
    // Mock determinista del formateo
    const spy = jest.spyOn(Date.prototype, "toLocaleDateString").mockReturnValue("02 ene 2020");

    const result = formatOnSaleDate("2020-01-02T00:00:00.000Z");

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
    expect(result).toBe("02 ene 2020");
  });
});
