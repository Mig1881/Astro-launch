import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactPage from "./ContactPage";

describe("Página de Contacto (ContactPage)", () => {
  beforeEach(() => {
    // Solo limpiamos el localStorage, dejamos que el tiempo fluya de forma natural
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("debería mostrar errores de validación si se envía el formulario vacío", async () => {
    // --- 1. ARRANGE ---
    render(<ContactPage />);
    const botonEnviar = screen.getByRole("button", { name: /Enviar mensaje/i });

    // --- 2. ACT ---
    await userEvent.click(botonEnviar);

    // --- 3. ASSERT ---
    expect(await screen.findByText("El nombre es obligatorio")).toBeInTheDocument();
    expect(await screen.findByText("El email es obligatorio")).toBeInTheDocument();
    expect(await screen.findByText("Selecciona un departamento")).toBeInTheDocument();
    expect(await screen.findByText("No puedes enviar un mensaje vacío")).toBeInTheDocument();
    expect(await screen.findByText("Debes aceptar la política de privacidad")).toBeInTheDocument();
  });

  it("debería mostrar un error si el email tiene formato incorrecto", async () => {
    // --- 1. ARRANGE ---
    render(<ContactPage />);
    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const botonEnviar = screen.getByRole("button", { name: /Enviar mensaje/i });

    // --- 2. ACT ---
    await userEvent.type(emailInput, "correo-invalido.com"); 
    await userEvent.click(botonEnviar);

    // --- 3. ASSERT ---
    expect(await screen.findByText("El formato del email no es correcto")).toBeInTheDocument();
  });

  it("debería enviar el formulario correctamente, guardar en localStorage y mostrar éxito", async () => {
    // --- 1. ARRANGE ---
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<ContactPage />);

    // Rellenamos todos los campos (nuestro Componente ahora es 100% accesible)
    await userEvent.type(screen.getByLabelText(/Nombre completo/i), "Comandante Shepard");
    await userEvent.type(screen.getByLabelText(/Correo electrónico/i), "shepard@normandy.com");
    await userEvent.selectOptions(screen.getByLabelText(/Departamento/i), "soporte");
    await userEvent.type(screen.getByLabelText(/Mensaje/i), "Necesito asistencia técnica con los motores.");
    await userEvent.click(screen.getByLabelText(/He leído y acepto la política de privacidad/i));

    const botonEnviar = screen.getByRole("button", { name: /Enviar mensaje/i });

    // --- 2. ACT ---
    await userEvent.click(botonEnviar);

    // Verificamos el estado intermedio ("Enviando...")
    expect(screen.getByRole("button", { name: /Enviando/i })).toBeDisabled();

    // --- 3. ASSERT ---
    // MAGIA AQUÍ: Le damos un timeout de 2500ms para que le dé tiempo al setTimeout(1500) del componente
    expect(await screen.findByText(/¡Mensaje Recibido Correctamente!/i, {}, { timeout: 2500 })).toBeInTheDocument();
    
    expect(screen.queryByRole("form")).not.toBeInTheDocument(); 
    expect(consoleSpy).toHaveBeenCalledWith("Formulario válido y enviado:", expect.any(Object));

    // Verificamos el localStorage
    const savedData = JSON.parse(localStorage.getItem("contactMessages") || "[]");
    expect(savedData).toHaveLength(1);
    expect(savedData[0].name).toBe("Comandante Shepard");
    expect(savedData[0].department).toBe("soporte");

    consoleSpy.mockRestore();
  });
});