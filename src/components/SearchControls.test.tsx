import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchControls from "./SearchControls";

describe("Componente UI: SearchControls", () => {
  // 1. ARRANGE GLOBAL: Creamos "espías" para todas las funciones que el componente espera recibir
  const mockOnSearchChange = vi.fn();
  const mockOnSortChange = vi.fn();
  const mockOnFilterChange = vi.fn();
  const mockOnCrewFilterChange = vi.fn();

  // Preparo las props por defecto que le pasaremos al componente
  const defaultProps = {
    searchTerm: "",
    onSearchChange: mockOnSearchChange,
    sortOrder: "desc",
    onSortChange: mockOnSortChange,
    filterStatus: "all",
    onFilterChange: mockOnFilterChange,
    crewFilter: "all",
    onCrewFilterChange: mockOnCrewFilterChange,
  };

  beforeEach(() => {
    vi.clearAllMocks(); // Limpieza de los espías antes de cada test
  });

  it("1. debería renderizar todos los controles con sus valores iniciales", () => {
    // ACT
    render(<SearchControls {...defaultProps} />);

    // ASSERT
    expect(screen.getByPlaceholderText(/Buscar misión por nombre/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Todos los estados")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Toda la flota")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Más recientes primero")).toBeInTheDocument();
  });

  it("2. debería llamar a onSearchChange cuando el usuario escribe en el buscador", async () => {
    // ARRANGE
    render(<SearchControls {...defaultProps} />);
    const inputBuscador = screen.getByPlaceholderText(/Buscar misión por nombre/i);

    // ACT
    await userEvent.type(inputBuscador, "Apollo");

    // ASSERT
    // Vitest comprueba que la función espía fue llamada con el texto correcto
    // (Llamará a la función por cada letra, así que comprobamos que al menos recibió la "A")
    expect(mockOnSearchChange).toHaveBeenCalledWith("A");
  });

  it("3. debería llamar a onFilterChange al cambiar el estado de la misión", async () => {
    // ARRANGE
    render(<SearchControls {...defaultProps} />);
    // Buscamos el select por su valor actual mostrado en pantalla
    const selectEstado = screen.getByDisplayValue("Todos los estados");

    // ACT
    // Simulamos que el usuario selecciona la opción con el value="success"
    await userEvent.selectOptions(selectEstado, "success");

    // ASSERT
    expect(mockOnFilterChange).toHaveBeenCalledWith("success");
  });

  it("4. debería llamar a onCrewFilterChange al filtrar por tripulación", async () => {
    // ARRANGE
    render(<SearchControls {...defaultProps} />);
    const selectTripulacion = screen.getByDisplayValue("Toda la flota");

    // ACT
    await userEvent.selectOptions(selectTripulacion, "crewed");

    // ASSERT
    expect(mockOnCrewFilterChange).toHaveBeenCalledWith("crewed");
  });

  it("5. debería llamar a onSortChange al cambiar el orden cronológico", async () => {
    // ARRANGE
    render(<SearchControls {...defaultProps} />);
    const selectOrden = screen.getByDisplayValue("Más recientes primero");

    // ACT
    await userEvent.selectOptions(selectOrden, "asc");

    // ASSERT
    expect(mockOnSortChange).toHaveBeenCalledWith("asc");
  });
});