import { useEffect, useState } from "react";
import { getCrewRequest, getPayloadsRequest, getToken } from "../auth/authApi";
import type { Crew, Payload } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function PressDashboard() {
  const [crew, setCrew] = useState<Crew[]>([]);
  const [payloads, setPayloads] = useState<Payload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados para la interactividad de la tabla
  const [activeTab, setActiveTab] = useState<"crew" | "payloads">("crew");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) throw new Error("No hay token de seguridad");

        // Ejecuta ambas peticiones a la vez (en paralelo)
        const [crewData, payloadsData] = await Promise.all([
          getCrewRequest(token),
          getPayloadsRequest(token)
        ]);

        setCrew(crewData);
        setPayloads(payloadsData);
      } catch (err) {
        setError("Acceso denegado. Exclusivo para el departamento de Prensa. 🛑");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // --- CÁLCULO DE MÉTRICAS (Componentes de resumen) ---
  const activeAstronauts = crew.filter(c => c.status === "active").length;
  const totalMassKg = payloads.reduce((total, p) => total + (p.mass_kg || 0), 0);
  const totalPayloads = payloads.length; // NUEVA MÉTRICA: Total de satélites/cargas

  // --- FILTRADO REACTIVO PARA LA TABLA ---
  const filteredCrew = crew.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.agency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayloads = payloads.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="page-container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
      

      <h2 className="section-title" style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>
        Centro de Prensa 📰
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
        Datos clasificados de tripulación y cargas útiles para comunicados oficiales.
      </p>


      <div className="dashboard-metrics-grid">
        <div className="metric-card border-accent">
          <h3 className="metric-title">Total Astronautas</h3>
          <p className="metric-value text-primary">{crew.length}</p>
        </div>
        <div className="metric-card border-success">
          <h3 className="metric-title">Astronautas en Activo</h3>
          <p className="metric-value text-success">{activeAstronauts}</p>
        </div>
        {/* NUEVA TARJETA: Total de Cargas */}
        <div className="metric-card border-info">
          <h3 className="metric-title">Total de Cargas Útiles</h3>
          <p className="metric-value text-info">{totalPayloads}</p>
        </div>
        <div className="metric-card border-warning">
          <h3 className="metric-title">Toneladas Enviadas</h3>
          <p className="metric-value text-warning">
            {Math.round(totalMassKg / 1000).toLocaleString()} t
          </p>
        </div>
      </div>

      {/* CONTROLES DE PESTAÑAS Y BÚSQUEDA */}
      <div className="contact-form" style={{ maxWidth: '100%', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Botones de Pestañas */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={activeTab === 'crew' ? 'submit-btn' : 'btn-reset'} 
              style={{ 
                padding: '0.6rem 1.2rem', 
                borderRadius: '8px', 
                border: activeTab !== 'crew' ? '1px solid var(--border-color)' : 'none', 
                color: activeTab !== 'crew' ? 'var(--text-primary)' : 'white' 
              }}
              onClick={() => setActiveTab('crew')}
            >
              👩‍🚀 Tripulación
            </button>
            <button 
              className={activeTab === 'payloads' ? 'submit-btn' : 'btn-reset'} 
              style={{ 
                padding: '0.6rem 1.2rem', 
                borderRadius: '8px', 
                border: activeTab !== 'payloads' ? '1px solid var(--border-color)' : 'none', 
                color: activeTab !== 'payloads' ? 'var(--text-primary)' : 'white' 
              }}
              onClick={() => setActiveTab('payloads')}
            >
              🛰️ Cargas Útiles
            </button>
          </div>
          
          <input 
            type="text" 
            placeholder={`🔍 Buscar en ${activeTab === 'crew' ? 'tripulación' : 'cargas'}...`} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ flex: '1 1 250px', maxWidth: '300px' }}
          />
        </div>

        {/* TABLA REACTIVA DINÁMICA */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                {activeTab === 'crew' ? (
                  <>
                    <th style={{ padding: '1rem 0.5rem' }}>Perfil</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Nombre</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Agencia</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Estado</th>
                  </>
                ) : (
                  <>
                    <th style={{ padding: '1rem 0.5rem' }}>Nombre del Satélite/Carga</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Tipo</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Órbita</th>
                    <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Masa (Kg)</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeTab === 'crew' ? (
                filteredCrew.length > 0 ? (
                  filteredCrew.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.5rem' }}>
                        {/* IMAGEN CLICKABLE */}
                        <a href={c.wikipedia} target="_blank" rel="noopener noreferrer" title={`Leer sobre ${c.name} en Wikipedia`}>
                          <img src={c.image} alt={c.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-color)' }} />
                        </a>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>
                        {/* NOMBRE CLICKABLE */}
                        <a href={c.wikipedia} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'underline', textDecorationColor: 'var(--accent-color)' }}>
                          {c.name}
                        </a>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>{c.agency}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{c.status === 'active' ? '🟢 Activo' : '⚪ Retirado'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron astronautas.</td></tr>
                )
              ) : (
                filteredPayloads.length > 0 ? (
                  filteredPayloads.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>
                        {/* BÚSQUEDA DINÁMICA DEL SATÉLITE CLICKABLE (Color Naranja) */}
                        <a 
                          href={`https://www.google.com/search?q=${encodeURIComponent(p.name + ' satellite SpaceX')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: 'var(--text-primary)', textDecoration: 'underline', textDecorationColor: '#f59e0b' }}
                          title={`Buscar información sobre ${p.name}`}
                        >
                          {p.name}
                        </a>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>{p.type}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{p.orbit}</td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>{p.mass_kg ? p.mass_kg.toLocaleString() : 'Desconocida'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron cargas útiles.</td></tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}