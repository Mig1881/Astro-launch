import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, authReducer, useAuth } from "./AuthContext";

describe("1. authReducer (Testing Unitario Puro de la lógica de negocio)", () => {
  const estadoInicial = {
    token: null,
    isAuthenticated: false,
    user: null,
  };

  it("debería autenticar al usuario y guardar el token al hacer LOGIN", () => {
    //Arrange: estado neutral
    const accionLogin: any = { type: "LOGIN", payload: "fake-jwt-token-123" };
    //ACt
    const nuevoEstado = authReducer(estadoInicial, accionLogin);
    //Assert
    expect(nuevoEstado.token).toBe("fake-jwt-token-123");
    expect(nuevoEstado.isAuthenticated).toBe(true);
    expect(nuevoEstado.user).toBeNull(); 
  });

  it("debería limpiar el estado completamente al hacer LOGOUT", () => {
    //Arrange: Partimos de un estado donde el usuario ya está logueado
    const estadoLogueado = {
      token: "super-secret-token",
      isAuthenticated: true,
      user: { id: 1, email: "piloto@spacex.com", role: "user" },
    };
    const accionLogout: any = { type: "LOGOUT" };
    // ACT
    const estadoTrasLogout = authReducer(estadoLogueado, accionLogout);
    //ASSERT
    expect(estadoTrasLogout.token).toBeNull();
    expect(estadoTrasLogout.isAuthenticated).toBe(false);
    expect(estadoTrasLogout.user).toBeNull();
  });
});

describe("2. AuthProvider y useAuth (Testing de Integración con React)", () => {
  //Para testear un Contexto, creamos un "Componente Falso" (Dummy Component)
  const TestComponent = () => {
    const { state, dispatch } = useAuth();
    return (
      <div>
        <span data-testid="auth-status">
          {state.isAuthenticated ? "Conectado" : "Desconectado"}
        </span>
        <button
          onClick={() =>
            dispatch({ type: "LOGIN", payload: "token-desde-ui" })
          }
        >
          Simular Entrada
        </button>
      </div>
    );
  };

  // Se limpia el localStorage antes de cada prueba
  beforeEach(() => {
    localStorage.clear();
  });

  it("debería actualizar el estado de la UI cuando un componente despacha una acción", async () => {
    //ARRANGE: Renderizamos nuestro componente Falso envuelto en nuestro Provider real
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const statusElement = screen.getByTestId("auth-status");
    const botonEntrar = screen.getByRole("button", { name: "Simular Entrada" });

    // Verificación inicial (Assert previo): Debe arrancar desconectado
    expect(statusElement).toHaveTextContent("Desconectado");

    //ACT  Simulamos que el usuario hace click en el botón de login
    await userEvent.click(botonEntrar);

    //ASSERT:  El contexto debe haber escuchado el dispatch, ejecutado el reducer y actualizado la UI
    expect(statusElement).toHaveTextContent("Conectado");
  });

  it("debería lanzar un error si useAuth se usa fuera del AuthProvider", () => {
    // ARRANGE: Creamos un componente rebelde, alguien intenta usar el Hook mal
    const ComponenteRebelde = () => {
      useAuth(); // Esto debería explotar
      return <div>Hola</div>;
    };

    // --- 2 & 3. ACT y ASSERT juntos ---Para capturar errores en React Testing Library, le decimos que ESPERE un error
    // Suprimimos temporalmente el console.error para que la terminal no se llene de ruido rojo
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<ComponenteRebelde />)).toThrow(
      "useAuth debe usarse dentro de un AuthProvider"
    );

    consoleSpy.mockRestore(); // Devolvemos el console.error a la normalidad
  });
});