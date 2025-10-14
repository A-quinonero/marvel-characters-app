import { render, screen, fireEvent } from "@testing-library/react";

import SearchBar from "@/components/SearchBar/SearchBar";

describe("SearchBar", () => {
  it("renderiza el input con placeholder por defecto y el icono", () => {
    const onChange = jest.fn();
    // 👇 Hay que renderizar el componente con sus props
    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText("SEARCH A CHARACTER...");
    expect(input).toBeInTheDocument();

    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  it("propaga los cambios con onChange", () => {
    const onChange = jest.fn();
    // 👇 Hay que renderizar el componente
    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByRole("textbox", { name: /buscar personajes/i });
    fireEvent.change(input, { target: { value: "spider" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("spider");
  });

  it("usa el placeholder personalizado cuando se pasa por props", () => {
    const onChange = jest.fn();
    // 👇 Hay que pasar el placeholder como prop
    render(<SearchBar value="" onChange={onChange} placeholder="BUSCA..." />);

    expect(screen.getByPlaceholderText("BUSCA...")).toBeInTheDocument();
  });
});
