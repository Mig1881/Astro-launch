import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Launch, Rocket, Launchpad } from '../types';
import { API_ENDPOINTS } from '../services/SpaceXAPI'; 
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import LaunchMap from '../components/LaunchMap';
import placeholderImg from '../assets/placeholder-rocket.png';

//Importo la función para obtener el token
import { getToken } from '../auth/authApi';

export default function LaunchDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [rocket, setRocket] = useState<Rocket | null>(null);
  const [launchpad, setLaunchpad] = useState<Launchpad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    // Obtengo el token.
    const token = getToken();
    // Preparo el objeto de cabeceras para reutilizarlo en las 3 peticiones
    const headers = { "Authorization": `Bearer ${token}` };

    let launchpadId: string | null = ""; 
    
    //Petición de la Misión
    fetch(`${API_ENDPOINTS.LAUNCHES}/${id}`, { headers })
      .then((response) => {
        if (!response.ok) throw new Error("No se encontró la Misión");
        return response.json();
      })
      .then((launchData: Launch) => {
        setLaunch(launchData);
        launchpadId = launchData.launchpad;

        //Petición del Cohete
        return fetch(`${API_ENDPOINTS.ROCKETS}/${launchData.rocket}`, { headers });
      })
      .then((response) => {
        if (!response.ok) throw new Error("No se encontraron detalles del cohete");
        return response.json();
      })
      .then((rocketData: Rocket) => {
        setRocket(rocketData);
        
        //Petición de la Plataforma
        return fetch(`${API_ENDPOINTS.LAUNCHPADS}/${launchpadId}`, { headers });
      })
      .then((res) => {
        if (!res.ok) throw new Error("Plataforma no encontrada");
        return res.json();
      })
      .then((padData: Launchpad) => {
        setLaunchpad(padData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!launch || !rocket || !launchpad) return null; 

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

          <div className="info-box rocket-section">
            <h3>Especificaciones del Cohete: {rocket.name}</h3>
            <p><strong>Tipo:</strong> {rocket.type}</p>
            <p>{rocket.description}</p>
            <p><strong>Masa:</strong> {rocket.mass.kg.toLocaleString()} kg</p>
          </div>

          <div className="info-box location-section">
            <h3>📍 Ubicación del Lanzamiento</h3>
            <p><strong>Lugar:</strong> {launchpad.full_name}</p>
            <p><strong>Localidad:</strong> {launchpad.locality} ({launchpad.region})</p>
            <p><strong>Coordenadas:</strong> {launchpad.latitude}, {launchpad.longitude}</p>
          </div>

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