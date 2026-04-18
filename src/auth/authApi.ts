//Data Transfer Objects
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  role?: string; 
}

import type { User } from "../types";

//Persistencia en el disco duro del navegador (localStorage)
export const saveToken = (token: string) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const clearToken = () => localStorage.removeItem("token");

// Vite inyectará esta variable dependiendo del entorno (.env)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

//Capa de Servicio (Llamadas HTTP con Fetch)

export const loginRequest = async (payload: LoginPayload) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Credenciales incorrectas");
  return response.json(); 
};

export const registerRequest = async (payload: RegisterPayload) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Error al registrar");
  return response.json(); 
};

export const meRequest = async (token: string) => {
  const response = await fetch(`${BASE_URL}/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}` 
    }
  });

  if (!response.ok) throw new Error("Token inválido o expirado");
  return response.json(); 
};

// --- Endpoints para el Panel de Admin ---
export const getUsersRequest = async (token: string) => {
  const response = await fetch(`${BASE_URL}/users`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Error al obtener la lista de usuarios");
  return response.json();
};

export const deleteUserRequest = async (id: number, token: string) => {
  const response = await fetch(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Error al borrar el usuario");
  return response.json();
};

// --- Endpoints para el Panel de Prensa ---
export const getCrewRequest = async (token: string) => {
  const response = await fetch(`${BASE_URL}/crew`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Error al obtener la tripulación");
  return response.json();
};

export const getPayloadsRequest = async (token: string) => {
  const response = await fetch(`${BASE_URL}/payloads`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Error al obtener las cargas útiles");
  return response.json();
};

// Actualizar el rol de un usuario
export const updateUserRoleRequest = async (user: User, newRole: string, token: string) => {
  const response = await fetch(`http://localhost:3000/users/${user.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role: newRole }), 
  });

  if (!response.ok) {
    throw new Error("Error al actualizar el rol del usuario");
  }
  return response.json();
};