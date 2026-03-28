import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Header from "./Header";
import { useAuth } from "../../context/AuthContext";

//MOCKEAMOS LAS DEPENDENCIAS EXTERNAS
// Falsificamos nuestro contexto para poder dictar qué usuario está logueado
vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Falsificamos ThemeToggle para que no nos moleste en este test
vi.mock("../ThemeToggle", () => ({
  default: () => <button>Theme</button>,
}));

describe("Componente UI: Header", () => {
  // Función auxiliar para renderizar con Router
  const renderHeader = () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debería mostrar el botón de Iniciar Sesión si el usuario es un invitado", () => {
    //ARRANGE ---
    //Simulamos que el useAuth devuelve un estado sin token ni usuario
    (useAuth as any).mockReturnValue({
      state: { token: null, user: null },
      dispatch: vi.fn(),
    });

    //ACT
    renderHeader();

    //ASSERT
    expect(screen.getByRole("link", { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.queryByText(/Salir/i)).not.toBeInTheDocument();
  });

  it("debería mostrar el email del piloto y el botón Salir si está logueado", () => {
    //ARRANGE
    (useAuth as any).mockReturnValue({
      state: { 
        token: "fake-token", 
        user: { email: "maverick@spacex.com", role: "user" } 
      },
      dispatch: vi.fn(),
    });

    //ACT
    renderHeader();

    //ASSERT
    expect(screen.getByText(/piloto/i)).toBeInTheDocument(); // Verificamos que corta el email
    expect(screen.getByRole("button", { name: /Salir/i })).toBeInTheDocument();
  });

  it("debería mostrar el enlace VIP de Admin solo si el usuario tiene rol de admin", () => {
    //ARRANGE
    (useAuth as any).mockReturnValue({
      state: { 
        token: "fake-token", 
        user: { email: "jefe@spacex.com", role: "admin" } 
      },
      dispatch: vi.fn(),
    });

    //ACT
    renderHeader();

    //ASSERT
    expect(screen.getByRole("link", { name: /🛡️ Admin/i })).toBeInTheDocument();
    // No debería ver el de prensa
    expect(screen.queryByText(/📰 Sala de Prensa/i)).not.toBeInTheDocument();
  });

  it("llama a dispatch con LOGOUT cuando se pulsa Salir", async () => {
    //ARRANGE ---
    const mockDispatch = vi.fn();
    (useAuth as any).mockReturnValue({
      state: { token: "fake", user: { email: "a@a.com", role: "user" } },
      dispatch: mockDispatch,
    });
    renderHeader();

    //ACT
    const botonSalir = screen.getByRole("button", { name: /Salir/i });
    await userEvent.click(botonSalir);

    //ASSERT
    expect(mockDispatch).toHaveBeenCalledWith({ type: "LOGOUT" });
  });
});