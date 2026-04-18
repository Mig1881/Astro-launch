const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const API_ENDPOINTS = {
  LAUNCHES: `${BASE_URL}/launches`,
  ROCKETS: `${BASE_URL}/rockets`,
  LAUNCHPADS: `${BASE_URL}/launchpads`,
  PAYLOADS: `${BASE_URL}/payloads`, 
  CREW: `${BASE_URL}/crew`,
  MAP_SERVICE: "https://www.openstreetmap.org/export/embed.html",
  GOOGLE_MAPS_BASE: "https://www.google.com/maps/search/?api=1&query="
};

//Función Helper para centralizar las cabeceras de autorización y manejo de errores básicos
const fetchWithAuth = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!response.ok) throw new Error(`Error fetching data from ${url}`);
  return response.json();
};

// Petición para obtener todos los lanzamientos (Usado en LaunchList)
export const getLaunchesRequest = async (token: string) => {
  return fetchWithAuth(API_ENDPOINTS.LAUNCHES, token);
};

// Petición orquestada para los detalles de la misión (LaunchDetailPage)
export const getFullLaunchDetails = async (id: string, token: string) => {
  //Misión Principal
  const launchData = await fetchWithAuth(`${API_ENDPOINTS.LAUNCHES}/${id}`, token);

  //Cohete y Plataforma
  const pRocket = fetchWithAuth(`${API_ENDPOINTS.ROCKETS}/${launchData.rocket}`, token);
  const pPad = fetchWithAuth(`${API_ENDPOINTS.LAUNCHPADS}/${launchData.launchpad}`, token);

  //Carga Útil
  let pPayload = Promise.resolve(null);
  if (launchData.payloads && launchData.payloads.length > 0) {
    pPayload = fetchWithAuth(`${API_ENDPOINTS.PAYLOADS}/${launchData.payloads[0]}`, token)
                .catch(() => null); // Si falla el satélite, no rompemos toda la app
  }

  //Se espera  a que Cohete, Plataforma y Carga terminen
  const [rocketData, padData, payloadData] = await Promise.all([pRocket, pPad, pPayload]);

  //Tripulación
  let crewMembers = [];
  if (launchData.crew && launchData.crew.length > 0) {
    const crewIds = launchData.crew.map((c: any) => typeof c === 'string' ? c : c.crew);
    const crewPromises = crewIds.map((cId: string) => 
  fetchWithAuth(`${API_ENDPOINTS.CREW}/${cId}`, token).catch(() => null)
);
    const crewResults = await Promise.all(crewPromises);
    crewMembers = crewResults.filter(c => c !== null); 
  }

  // Devolucion del objeto empaquetado
  return {
    launch: launchData,
    rocket: rocketData,
    launchpad: padData,
    payload: payloadData,
    crewMembers
  };
};