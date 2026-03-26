import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Launch, Rocket, Launchpad, Payload, Crew } from '../types';
import { API_ENDPOINTS } from '../services/SpaceXAPI'; 
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import LaunchMap from '../components/LaunchMap';
import placeholderImg from '../assets/placeholder-rocket.png';

import { getToken } from '../auth/authApi';

export default function LaunchDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [rocket, setRocket] = useState<Rocket | null>(null);
  const [launchpad, setLaunchpad] = useState<Launchpad | null>(null);
  
  const [payload, setPayload] = useState<Payload | null>(null);
  const [crewMembers, setCrewMembers] = useState<Crew[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchAllDetails = async () => {
      try {
        const token = getToken();
        const headers = { "Authorization": `Bearer ${token}` };

        // 1. Misión Principal
        const resLaunch = await fetch(`${API_ENDPOINTS.LAUNCHES}/${id}`, { headers });
        if (!resLaunch.ok) throw new Error("No se encontró la Misión");
        const launchData: Launch = await resLaunch.json();
        setLaunch(launchData);

        // 2. Cohete y Plataforma
        const pRocket = fetch(`${API_ENDPOINTS.ROCKETS}/${launchData.rocket}`, { headers }).then(r => r.json());
        const pPad = fetch(`${API_ENDPOINTS.LAUNCHPADS}/${launchData.launchpad}`, { headers }).then(r => r.json());

        // 3. Carga Útil
        let pPayload = Promise.resolve(null);
        if (launchData.payloads && launchData.payloads.length > 0) {
          pPayload = fetch(`${API_ENDPOINTS.PAYLOADS}/${launchData.payloads[0]}`, { headers })
                      .then(r => r.ok ? r.json() : null).catch(() => null);
        }

        const [rocketData, padData, payloadData] = await Promise.all([pRocket, pPad, pPayload]);
        
        setRocket(rocketData);
        setLaunchpad(padData);
        setPayload(payloadData);

        // 4. Tripulación
        if (launchData.crew && launchData.crew.length > 0) {
          const crewIds = launchData.crew.map((c: any) => typeof c === 'string' ? c : c.crew);
          const crewPromises = crewIds.map(cId => 
            fetch(`${API_ENDPOINTS.CREW}/${cId}`, { headers }).then(r => r.ok ? r.json() : null)
          );
          const crewResults = await Promise.all(crewPromises);
          setCrewMembers(crewResults.filter(c => c !== null)); 
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAllDetails();
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

          {payload && (
            <div className="info-box" style={{ borderLeft: '4px solid #f59e0b' }}>
              <h3>🛰️ Carga Útil: {payload.name}</h3>
              <p><strong>Tipo:</strong> {payload.type}</p>
              <p><strong>Órbita de destino:</strong> {payload.orbit}</p>
              {payload.mass_kg && <p><strong>Masa:</strong> {payload.mass_kg.toLocaleString()} kg</p>}
            </div>
          )}

          {crewMembers.length > 0 && (
            <div className="info-box" style={{ borderLeft: '4px solid #3b82f6' }}>
              <h3>👩‍🚀 Tripulación ({crewMembers.length})</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                {crewMembers.map(astronaut => (
                  <div key={astronaut.id} style={{ textAlign: 'center', width: '80px' }}>
                    <img 
                      src={astronaut.image} 
                      alt={astronaut.name} 
                      style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-color)' }}
                    />
                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', lineHeight: '1.2' }}>{astronaut.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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