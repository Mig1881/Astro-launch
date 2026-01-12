import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
//Añado Rocket y Launchpad
import type { Launch, Rocket, Launchpad } from '../types';
import { API_ENDPOINTS } from '../services/SpaceXAPI'; 
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import LaunchMap from '../components/LaunchMap';
import placeholderImg from '../assets/placeholder-rocket.png';

export default function LaunchDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const [launch, setLaunch] = useState<Launch | null>(null);
  //Añado un estado para la llamada de la Api a Rocket
  const [rocket, setRocket] = useState<Rocket | null>(null);
  //Añado otro estado para la llamada de la Api para la Plataforma de Lanzamiento
  const [launchpad, setLaunchpad] = useState<Launchpad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Si no hay ID en la URL, no hago nada.
    if (!id) return;

    let launchpadId: string | null = ""; //Utilizo una variable para guaradar ID, la variable puede guardar ambas cosas

    
    fetch(`${API_ENDPOINTS.LAUNCHES}/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error("No se encontró la Misión");
        return response.json();
      })
      .then((launchData: Launch) => {
        //Guardos los datos de la mision en el estado
        setLaunch(launchData);
        // GUARDO el ID aquí mismo para usarlo más adelante
        launchpadId = launchData.launchpad;

        //Cuando estamos dentro de un then poner un return delante del fetch es fundamental
        //le esta diciendo que no siga con el siguiente Then() hasta que esta nueva peticion de la API termine
        //Uso el ID del cohete del lanzamiento que acabo de obtener
        return fetch(`${API_ENDPOINTS.ROCKETS}/${launchData.rocket}`);
      })
      .then((response) => {
        if (!response.ok) throw new Error("No se encontraron detalles del cohete");
        return response.json();
      })
      .then((rocketData: Rocket) => {
        //Guardo el cohete en el estado
        setRocket(rocketData);
        //Uso LaunchPadId que he grabado antes
      return fetch(`${API_ENDPOINTS.LAUNCHPADS}/${launchpadId}`);
        
      })
      .then((res) => {
        if (!res.ok) throw new Error("Plataforma no encontrada");
        return res.json();
      })
      .then((padData: Launchpad) => {
        // Guardo la plataforma y terminamos la carga
        setLaunchpad(padData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

  // Si el ID cambia, se vuelve a ejecutar todo.
}, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!launch || !rocket || !launchpad) return null; //basta con que una sea cierta para que se ejecute return
  //Como los estados de launch, Rocket y launchpad valen null, solo cuando los tres procesos
  //de acceso a la api hayan terminado con exito pasara a la seccion return para dibujar la interfaz

  return (
    <main className="page-container detail-page">
      <Link to="/" className="back-link">← Volver al listado</Link>
      
      <div className="detail-grid">
        <div className="detail-image-container">
          <img src={launch.links.patch.large || placeholderImg} alt={launch.name} />
        </div>

        <div className="detail-info">
          <h1>{launch.name}</h1>
          
          <div className="info-box">
            <h3>Descripción de la misión</h3>
            <p>{launch.details || 'Sin descripción disponible.'}</p>
          </div>

          {/* datos del cohete */}
          <div className="info-box rocket-section">
            <h3>Especificaciones del Cohete: {rocket.name}</h3>
            <p><strong>Tipo:</strong> {rocket.type}</p>
            <p>{rocket.description}</p>
            <p><strong>Masa:</strong> {rocket.mass.kg.toLocaleString()} kg</p>
          </div>

          {/* datos de ubicacion de la plataforma de lanzamiento */}
          <div className="info-box location-section">
            <h3>📍 Ubicación del Lanzamiento</h3>
            <p><strong>Lugar:</strong> {launchpad.full_name}</p>
            <p><strong>Localidad:</strong> {launchpad.locality} ({launchpad.region})</p>
            <p><strong>Coordenadas:</strong> {launchpad.latitude}, {launchpad.longitude}</p>
          </div>

          {/* INTEGRACIÓN DEL MAPA (Servicio Externo) */}
          <LaunchMap 
            latitude={launchpad.latitude} 
            longitude={launchpad.longitude} 
            locationName={launchpad.full_name} 
          />
          
          <div className="info-meta">
            <p><strong>Fecha:</strong> {new Date(launch.date_utc).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </main>
  );
}