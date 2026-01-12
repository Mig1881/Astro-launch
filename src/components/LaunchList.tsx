import { useEffect, useState } from "react";
import type { Launch } from "../types";
import { API_ENDPOINTS } from "../services/SpaceXAPI";
import LaunchCard from "./LaunchCard";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import SearchControls from "./SearchControls";


export default function LaunchList() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  //Añado dos estados mas para busqueda y ordenacion
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  //Añado otro estado: "all", "success" o "failure"
  const [filterStatus, setFilterStatus] = useState("all");
  


  useEffect(() => {
    fetch(API_ENDPOINTS.LAUNCHES)
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data: Launch[]) => {
        setLaunches(data);
        setLoading(false);
        // Para probar el spinner simulo que la conexión tarda 8 segundos
        // setTimeout(() => {
        //   setLaunches(data);
        //   setLoading(false);
        // }, 8000); 
      })
      .catch(() => {
        setError("No se pudieron cargar los lanzamientos de SpaceX 🚀");
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner />;
  
  if (error) return <ErrorMessage message={error} />;

    //Procesamiento de datos

 
  let resultado = launches;
  //Filtrado combinado por nombre y Estado
  resultado = resultado.filter(lanzamiento => {
    const nombreEnMinusculas = lanzamiento.name.toLowerCase();
    const busquedaEnMinusculas = searchTerm.toLowerCase();
    const coincideNombre = nombreEnMinusculas.includes(busquedaEnMinusculas);
    
    //Lógica de Estado, si es success, failure o por defecto all
    let coincideEstado = true;
    if (filterStatus === "success") {
      coincideEstado = lanzamiento.success === true;
    } else if (filterStatus === "failure") {
      coincideEstado = lanzamiento.success === false;
    }
    //el return si devuelve true: el lanzamiento se guarada en la nueva lista si false se decarta
    return coincideNombre && coincideEstado;
    
  });

//Ordeno el resultado del filtro(a= 2010, b= 2012)
  resultado.sort((a, b) => {
    //convierto la fecha a numero, los milisegundos que han pasado desde el año 1970
    const tiempoA = new Date(a.date_utc).getTime();
    const tiempoB = new Date(b.date_utc).getTime();

    if (sortOrder === "asc") {
      return tiempoA - tiempoB; // El numero mas pequeño(fechas mas vieja) va primero(a<b negativo, por lo que a va antes, ascendente)
    } else {
      return tiempoB - tiempoA; // El numero mas grande(fecha mas reciente) va primero(b>a positivo, por lo que va despues, descendente)
    }
  });

//Guardo el resultado final
const filteredLaunches = resultado;


  
  return (
    <section>
      {/* Componente de búsqueda pasamos estados de busqueda y ordenacion */}
      <SearchControls 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        filterStatus={filterStatus}      
        onFilterChange={setFilterStatus} 
      />
      {/* Feedback: Se muestra el contador si hay resultados */}
      {filteredLaunches.length > 0 && (
        <p className="results-counter">
          Se han encontrado <strong>{filteredLaunches.length}</strong> lanzamientos:
        </p>
      )}
      {/* map por cada mision que encuentra(launch) ejecuta el componente */}
      <div className="launch-list-grid">
        {filteredLaunches.map((launch) => (
          <LaunchCard key={launch.id} launch={launch} />
        ))}
      </div>

      {/* Feedback si no hay resultados */}
      {filteredLaunches.length === 0 && (
        <div className="no-results-box">
          <h3>🔭 No se encontraron misiones</h3>
          <p>Prueba a cambiar los filtros de búsqueda.</p>
        </div>
      )}
    </section>
  );
};
