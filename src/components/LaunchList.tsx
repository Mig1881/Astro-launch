import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import type { Launch } from "../types";
import { getLaunchesRequest } from "../services/SpaceXAPI";
import LaunchCard from "./LaunchCard";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import SearchControls from "./SearchControls";
import { getToken } from "../auth/authApi"; 

export default function LaunchList() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [crewFilter, setCrewFilter] = useState("all");
  
  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        const token = getToken();
        if (!token) {
          setIsGuest(true);
          setLoading(false);
          return;
        }

        // Llamamos al servicio limpio
        const data = await getLaunchesRequest(token);
        setLaunches(data);
        setLoading(false);
      } catch (err) {
        setError("No se pudieron cargar los lanzamientos de SpaceX 🚀");
        setLoading(false);
      }
    };

    fetchLaunches();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // Si es un invitado, renderizo la tarjeta de bienvenida limpia con clases CSS
  if (isGuest) {
    return (
      <div className="guest-welcome-card">
        <h2 className="guest-welcome-title">Únete a la tripulación espacial 👩‍🚀👨‍🚀</h2>
        <p className="guest-welcome-text">
          Los expedientes de las misiones están clasificados. Inicia sesión o solicita acceso a la base para consultar en tiempo real todos los datos de SpaceX.
        </p>
        <div className="guest-actions">
          <Link to="/login" className="map-button" style={{ padding: "0.8rem 2rem", fontSize: "1.1rem" }}>
            Iniciar Sesión
          </Link>
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
    // 1. Filtro por texto
    const nombreEnMinusculas = lanzamiento.name.toLowerCase();
    const busquedaEnMinusculas = searchTerm.toLowerCase();
    const coincideNombre = nombreEnMinusculas.includes(busquedaEnMinusculas);
    
    // 2. Filtro por Estado (Éxito/Fallo)
    let coincideEstado = true;
    if (filterStatus === "success") {
      coincideEstado = lanzamiento.success === true;
    } else if (filterStatus === "failure") {
      coincideEstado = lanzamiento.success === false;
    }

    // 3. Filtro por Tripulación
    let coincideTripulacion = true;
    if (crewFilter === "crewed") {
      coincideTripulacion = !!lanzamiento.crew && lanzamiento.crew.length > 0;
    } else if (crewFilter === "uncrewed") {
      coincideTripulacion = !lanzamiento.crew || lanzamiento.crew.length === 0;
    }

    // la misión tiene que pasar TODOS los filtros
    return coincideNombre && coincideEstado && coincideTripulacion;
  });

  resultado.sort((a, b) => {
    const tiempoA = new Date(a.date_utc).getTime();
    const tiempoB = new Date(b.date_utc).getTime();
    return sortOrder === "asc" ? tiempoA - tiempoB : tiempoB - tiempoA;
  });

  const filteredLaunches = resultado;

// --- MÉTRICAS DEL DASHBOARD DEL PILOTO ---
  const totalLaunches = launches.length;
  // Calculamos las misiones que tienen el array 'crew' con al menos 1 astronauta
  const crewedLaunches = launches.filter(l => l.crew && l.crew.length > 0).length;
  const successfulLaunches = launches.filter(l => l.success === true).length;
  const successRate = totalLaunches > 0 ? Math.round((successfulLaunches / totalLaunches) * 100) : 0;

  return (
    <section>
      {/* --- DASHBOARD DEL PILOTO --- */}
      <div className="dashboard-metrics-grid">
        <div className="metric-card border-accent">
          <h3 className="metric-title">Total Misiones</h3>
          <p className="metric-value text-primary">{totalLaunches}</p>
        </div>
        
        {/* NUEVA TARJETA: MISIONES TRIPULADAS */}
        <div className="metric-card border-info">
          <h3 className="metric-title">Misiones Tripuladas</h3>
          <p className="metric-value text-info">{crewedLaunches}</p>
        </div>

        <div className="metric-card border-success">
          <h3 className="metric-title">Misiones Exitosas</h3>
          <p className="metric-value text-success">{successfulLaunches}</p>
        </div>
        <div className="metric-card border-warning">
          <h3 className="metric-title">Tasa de Éxito</h3>
          <p className="metric-value text-warning">{successRate}%</p>
        </div>
      </div>
      <SearchControls 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        filterStatus={filterStatus}      
        onFilterChange={setFilterStatus}
        crewFilter={crewFilter}
        onCrewFilterChange={setCrewFilter}
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