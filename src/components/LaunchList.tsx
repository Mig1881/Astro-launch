import { useEffect, useState } from "react";
// NUEVO: Importamos Link para poder hacer los botones de navegación
import { Link } from "react-router-dom"; 
import type { Launch } from "../types";
import { API_ENDPOINTS } from "../services/SpaceXAPI";
import LaunchCard from "./LaunchCard";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import SearchControls from "./SearchControls";
import { getToken } from "../auth/authApi"; 

export default function LaunchList() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  //Añado un estado para saber si es un visitante sin registrar
  const [isGuest, setIsGuest] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterStatus, setFilterStatus] = useState("all");
  
  useEffect(() => {
    const token = getToken();

    if (!token) {
      // No lanzo un error, implemento el estado de invitado o visitante sin registrar
      setIsGuest(true);
      setLoading(false);
      return;
    }

    fetch(API_ENDPOINTS.LAUNCHES, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data: Launch[]) => {
        setLaunches(data);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudieron cargar los lanzamientos de SpaceX 🚀");
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner />;
  
  // Si hay un error REAL del servidor, lo mostramos
  if (error) return <ErrorMessage message={error} />;

  //Si es un invitado, renderizo la tarjeta de bienvenida
  if (isGuest) {
    return (
      <div style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "4rem 2rem",
        textAlign: "center",
        marginTop: "1rem"
      }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Únete a la tripulación espacial 👩‍🚀👨‍🚀</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "2.5rem", maxWidth: "600px", margin: "0 auto" }}>
          Los expedientes de las misiones están clasificados. Inicia sesión o solicita acceso a la base para consultar en tiempo real todos los datos de SpaceX.
        </p>
        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
          {/* Botón secundario (bordeado) */}
          <Link to="/login" className="map-button" style={{ padding: "0.8rem 2rem", fontSize: "1.1rem" }}>
            Iniciar Sesión
          </Link>
          {/* Botón principal (relleno sólido). Le ponemos width auto para sobreescribir el 100% de App.css */}
          <Link to="/register" className="submit-btn" style={{ width: "auto", padding: "0.8rem 2rem", fontSize: "1.1rem" }}>
            Solicitar Acceso
          </Link>
        </div>
      </div>
    );
  }

  // --- LÓGICA DE USUARIOS LOGUEADOS ---
  let resultado = launches;
  
  resultado = resultado.filter(lanzamiento => {
    const nombreEnMinusculas = lanzamiento.name.toLowerCase();
    const busquedaEnMinusculas = searchTerm.toLowerCase();
    const coincideNombre = nombreEnMinusculas.includes(busquedaEnMinusculas);
    
    let coincideEstado = true;
    if (filterStatus === "success") {
      coincideEstado = lanzamiento.success === true;
    } else if (filterStatus === "failure") {
      coincideEstado = lanzamiento.success === false;
    }
    return coincideNombre && coincideEstado;
  });

  resultado.sort((a, b) => {
    const tiempoA = new Date(a.date_utc).getTime();
    const tiempoB = new Date(b.date_utc).getTime();
    return sortOrder === "asc" ? tiempoA - tiempoB : tiempoB - tiempoA;
  });

  const filteredLaunches = resultado;

  return (
    <section>
      <SearchControls 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        filterStatus={filterStatus}      
        onFilterChange={setFilterStatus} 
      />
      
      {filteredLaunches.length > 0 && (
        <p className="results-counter">
          Se han encontrado <strong>{filteredLaunches.length}</strong> lanzamientos:
        </p>
      )}
      
      <div className="launch-list-grid">
        {filteredLaunches.map((launch) => (
          <LaunchCard key={launch.id} launch={launch} />
        ))}
      </div>

      {filteredLaunches.length === 0 && (
        <div className="no-results-box">
          <h3>🔭 No se encontraron misiones</h3>
          <p>Prueba a cambiar los filtros de búsqueda.</p>
        </div>
      )}
    </section>
  );
}