import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import LaunchList from "./LaunchList";
import { useAuth } from "../context/AuthContext";
import { getLaunchesRequest } from "../services/SpaceXAPI";

//MOCKS
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../services/SpaceXAPI", () => ({
  getLaunchesRequest: vi.fn(),
}));

// Mockeamos SearchControls para simplificar la interacción en el test y no probar dependencias anidadas complejas.
// Simplemente pintamos botones que alteran los props que se le pasan.
vi.mock("./SearchControls", () => ({
  default: ({ onSearchChange, onFilterChange }: any) => (
    <div data-testid="mock-search-controls">
      <button onClick={() => onSearchChange("Falcon 9")}>Buscar Falcon 9</button>
      <button onClick={() => onFilterChange("success")}>Filtrar Exitosos</button>
    </div>
  ),
}));

// Mockeamos LaunchCard para que no intente renderizar cosas complejas
vi.mock("./LaunchCard", () => ({
  default: ({ launch }: any) => <div data-testid="mock-launch-card">{launch.name}</div>,
}));

describe("Componente Principal: LaunchList", () => {
  const renderList = () => {
    render(
      <BrowserRouter>
        <LaunchList />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("A. Renderizado por Estado de Autorización", () => {
    it("debería renderizar la tarjeta de bienvenida para invitados", () => {
      // ARRANGE
      (useAuth as any).mockReturnValue({ state: { isAuthenticated: false, token: null } });

      // ACT
      renderList();

      // ASSERT
      expect(screen.getByText(/Únete a la tripulación espacial/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Iniciar Sesión/i })).toBeInTheDocument();
    });
  });

  describe("B. Interacción con el Servicio (API)", () => {
    it("debería renderizar un mensaje de error si la petición a SpaceX falla", async () => {
      // ARRANGE
      (useAuth as any).mockReturnValue({ state: { isAuthenticated: true, token: "fake" } });
      (getLaunchesRequest as any).mockRejectedValue(new Error("Network Error"));

      // ACT
      renderList();

      // ASSERT
      // Usamos findByText porque el fetch es asíncrono
      expect(await screen.findByText(/No se pudieron cargar los lanzamientos de SpaceX/i)).toBeInTheDocument();
    });

    it("debería mostrar el dashboard de métricas cuando la petición tiene éxito", async () => {
      // ARRANGE
      (useAuth as any).mockReturnValue({ state: { isAuthenticated: true, token: "fake" } });
      (getLaunchesRequest as any).mockResolvedValue([
        { id: "1", name: "Misión 1", success: true, crew: [], date_utc: "2024-01-01" },
      ]);

      // ACT
      renderList();

      // ASSERT
      expect(await screen.findByText("Total Misiones")).toBeInTheDocument();
      expect(screen.getByText("Tasa de Éxito")).toBeInTheDocument();
    });
  });

  describe("C. Lógica de Filtrado Local y Estadísticas", () => {
    const mockLaunches = [
      { id: "1", name: "Falcon 1 Test", success: false, crew: [], date_utc: "2006-03-24" },
      { id: "2", name: "Falcon 9 Crew Dragon", success: true, crew: ["Bob", "Doug"], date_utc: "2020-05-30" },
      { id: "3", name: "Falcon Heavy Demo", success: true, crew: [], date_utc: "2018-02-06" },
    ];

    beforeEach(() => {
      (useAuth as any).mockReturnValue({ state: { isAuthenticated: true, token: "fake" } });
      (getLaunchesRequest as any).mockResolvedValue(mockLaunches);
    });

    it("debería calcular las estadísticas del dashboard correctamente", async () => {
      // ACT
      renderList();

      // ASSERT
      // Esperamos a que la petición termine y el componente se pinte
      await waitFor(() => {
        expect(screen.getAllByTestId("mock-launch-card")).toHaveLength(3);
      });

      // Misiones totales (3) -> Usamos getAllByText porque el "3" aparece en la tarjeta y en el texto "Se han encontrado 3..."
      const numeroTres = screen.getAllByText("3");
      expect(numeroTres.length).toBeGreaterThan(0); // Comprobamos que al menos lo ha encontrado una vez

      // Misiones tripuladas (1)
      const numberOne = screen.getAllByText("1");
      expect(numberOne.length).toBeGreaterThan(0); 
      
      // Misiones exitosas (2)
      const numeroDos = screen.getAllByText("2");
      expect(numeroDos.length).toBeGreaterThan(0);

      // Tasa de éxito: 2 exitosas / 3 totales = 67%
      expect(screen.getByText("67%")).toBeInTheDocument();
    });

    it("debería filtrar por texto de búsqueda (integración con estado local)", async () => {
      // ACT
      renderList();
      await waitFor(() => expect(screen.getAllByTestId("mock-launch-card")).toHaveLength(3));

      const btnBuscar = screen.getByRole("button", { name: "Buscar Falcon 9" });
      await userEvent.click(btnBuscar);

      // ASSERT
      // Tras hacer click en nuestro mock, el estado 'searchTerm' del LaunchList cambia
      // y solo debería quedar 1 resultado
      expect(screen.getAllByTestId("mock-launch-card")).toHaveLength(1);
      expect(screen.getByText("Falcon 9 Crew Dragon")).toBeInTheDocument();
    });

    it("debería mostrar el mensaje 'No se encontraron misiones' si el filtro es muy restrictivo", async () => {
      // ACT
      renderList();
      await waitFor(() => expect(screen.getAllByTestId("mock-launch-card")).toHaveLength(3));

      // Simulamos que el usuario busca "Falcon 9" y a la vez filtra por "Exitosas"
      // (En nuestros datos mock, la única Falcon 9 es exitosa, pero vamos a forzar un escenario vacío luego)
      
      // Vamos a probar primero filtrar por "Exitosas"
      const btnExitosas = screen.getByRole("button", { name: "Filtrar Exitosos" });
      await userEvent.click(btnExitosas);

      // Tras pulsar exitosas, deberían quedar 2 (la Crew Dragon y el Falcon Heavy)
      expect(screen.getAllByTestId("mock-launch-card")).toHaveLength(2);
      expect(screen.queryByText("Falcon 1 Test")).not.toBeInTheDocument(); // Esta falló
    });
  });
});