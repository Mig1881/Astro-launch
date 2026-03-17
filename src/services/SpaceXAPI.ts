const BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  LAUNCHES: `${BASE_URL}/launches`,
  //Para saber el nombre real del cohete, tipo y descripcion buscamos un nuevo endPoint
  ROCKETS: `${BASE_URL}/rockets`,
  //Para saber los datos de la plataforma de lanzamiento(localidad, region y coordenadas)
  LAUNCHPADS: `${BASE_URL}/launchpads`,
  // URL base para el servicio de mapas externo, no require API key, y sirve para hechar un vsitazo de donde esta el lanzamiento
  MAP_SERVICE: "https://www.openstreetmap.org/export/embed.html",
  // Servicio de navegación de Google (Para el botón externo)
  GOOGLE_MAPS_BASE: "https://www.google.com/maps/search/?api=1&query="

  
};