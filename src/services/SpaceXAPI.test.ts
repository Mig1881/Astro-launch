import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { getLaunchesRequest, getFullLaunchDetails, API_ENDPOINTS } from "./SpaceXAPI";

//CONFIGURACIÓN GLOBAL DE MOCKS
// Uso globalThis, que es el estándar moderno que TypeScript y JSDOM entienden perfectamente
globalThis.fetch = vi.fn();

describe("Capa de Servicios: SpaceXAPI", () => {
  // LLimpieza antes de empezar para que no haya contaminacion
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Restauramos todo a la normalidad al terminar
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("1. getLaunchesRequest (Manejo de peticiones simples)", () => {
    it("debería obtener la lista de lanzamientos enviando el token en las cabeceras", async () => {
      //ARRANGE
      const tokenFalso = "token-secreto-123";
      const datosSimulados = [{ id: "1", name: "Falcon 1" }, { id: "2", name: "Falcon 9" }];
      
      // Le decimos al fetch falso qué debe devolver
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => datosSimulados,
      });

      //ACT
      const resultado = await getLaunchesRequest(tokenFalso);

      //ASSERT
      expect(globalThis.fetch).toHaveBeenCalledWith(API_ENDPOINTS.LAUNCHES, {
        headers: { Authorization: `Bearer ${tokenFalso}` },
      });
      expect(resultado).toEqual(datosSimulados);
    });

    it("debería lanzar un error si la respuesta del servidor no es OK (ej. 401 Unauthorized)", async () => {
      //ARRANGE
      const tokenFalso = "token-invalido";
      
      (globalThis.fetch as any).mockResolvedValue({
        ok: false,
      });

      //ACT & ASSERT
      await expect(getLaunchesRequest(tokenFalso)).rejects.toThrow(
        `Error fetching data from ${API_ENDPOINTS.LAUNCHES}`
      );
    });
  });

  describe("2. getFullLaunchDetails (Orquestación de múltiples peticiones)", () => {
    it("debería empaquetar los datos de misión, cohete y plataforma correctamente", async () => {
      //ARRANGE
      const tokenFalso = "token-valido";
      const idMision = "mision-101";

      (globalThis.fetch as any).mockImplementation(async (url: string) => {
        if (url.includes(API_ENDPOINTS.LAUNCHES)) {
          return { ok: true, json: async () => ({ id: idMision, rocket: "r1", launchpad: "lp1", payloads: [], crew: [] }) };
        }
        if (url.includes(API_ENDPOINTS.ROCKETS)) {
          return { ok: true, json: async () => ({ id: "r1", name: "Falcon Heavy" }) };
        }
        if (url.includes(API_ENDPOINTS.LAUNCHPADS)) {
          return { ok: true, json: async () => ({ id: "lp1", name: "KSC LC 39A" }) };
        }
        return { ok: true, json: async () => ({}) };
      });

      //ACT
      const detallesCompletos = await getFullLaunchDetails(idMision, tokenFalso);

      //ASSERT
      expect(detallesCompletos.launch.id).toBe(idMision);
      expect(detallesCompletos.rocket.name).toBe("Falcon Heavy");
      expect(detallesCompletos.launchpad.name).toBe("KSC LC 39A");
      
      expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    });
  });
});