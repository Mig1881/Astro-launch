import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  saveToken, 
  getToken, 
  clearToken, 
  loginRequest, 
  getUsersRequest, 
  updateUserRoleRequest 
} from './authApi';
import type { User } from '../types';

describe('authApi - Capa de Servicios', () => {
  // Limpiamos todo antes de cada test para que no se contaminen entre sí
  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn(); // <-- CAMBIADO A globalThis
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Persistencia
  it('1. Debe guardar, obtener y limpiar el token del localStorage correctamente', () => {
    saveToken('token-falso-123');
    expect(localStorage.getItem('token')).toBe('token-falso-123');
    expect(getToken()).toBe('token-falso-123');
    
    clearToken();
    expect(getToken()).toBeNull();
  });

  // Test 2: Login - Happy Path
  it('2. loginRequest debe hacer un POST con credenciales y devolver los datos', async () => {
    const mockData = { token: 'jwt-123', user: { email: 'test@nasa.com' } };
    
    // Simulamos que el servidor responde OK
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const payload = { email: 'test@nasa.com', password: 'pass' };
    const result = await loginRequest(payload);

    // Verificamos que construyó la petición correctamente
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual(mockData);
  });

  // Test 3: Login - Sad Path (Error)
  it('3. loginRequest debe lanzar un error si las credenciales son incorrectas', async () => {
    // Simulamos que el servidor responde con error (ej. 401)
    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
    });

    const payload = { email: 'bad@nasa.com', password: 'bad' };
    
    // Verificamos que la promesa es rechazada con el mensaje correcto
    await expect(loginRequest(payload)).rejects.toThrow('Credenciales incorrectas');
  });

  // Test 4: Inyección de Token (GET)
  it('4. getUsersRequest debe inyectar correctamente el token Bearer en las cabeceras', async () => {
    const mockUsers = [{ id: 1, email: 'admin@nasa.com' }];
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    });

    const token = 'mi-token-secreto';
    await getUsersRequest(token);

    // Verificamos que la cabecera de Autorización se ha montado bien
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/users'), {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  });

  // Test 5: Peticiones Complejas (PATCH)
  it('5. updateUserRoleRequest debe enviar el ID del usuario en la URL y el nuevo rol en el body', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    // Simulamos un usuario
    const mockUser = { id: 42, email: 'piloto@spacex.com' } as User;
    const newRole = 'ADMIN';
    const token = 'token-admin';

    await updateUserRoleRequest(mockUser, newRole, token);

    // Verificamos construcción de URL dinámica, cabeceras y body
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/users/42'), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });
  });
});