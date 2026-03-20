// Formato de anidacion en en lanzamiento
export interface Launch {
  id: string;
  name: string;
  date_utc: string;
  links: Links;         
  details: string | null;
  rocket: string;
  launchpad: string | null;
  success: boolean | null;
}

export interface Links {
  patch: Patch;        
}

export interface Patch {
  small: string | null;
  large: string | null;
}

// datos especificos del cohete
export interface Rocket {
  id: string;
  name: string;
  type: string;
  description: string;
  height: { meters: number };
  mass: { kg: number };
}
// Datos especificos de la plataforma de lanzamiento
export interface Launchpad {
  id: string;
  name: string;
  full_name: string;
  locality: string;
  region: string;
  latitude: number;
  longitude: number;
}
// Datos del Usuario Autenticado
export interface User {
  id: number;
  email: string;
  role: string;
}