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

  // NUEVOS ESTADOS: Filtros para Tripulación
  const [crewAgencyFilter, setCrewAgencyFilter] = useState("all");
  const [crewSortOrder, setCrewSortOrder] = useState("asc");

  // NUEVOS ESTADOS: Filtros para Cargas Útiles
  const [payloadTypeFilter, setPayloadTypeFilter] = useState("all");
  const [payloadSortOrder, setPayloadSortOrder] = useState("asc");

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

  // SE FILTRA PRIMERO (Antes de calcular las métricas)
  
  // --- FILTRADO Y ORDENACIÓN REACTIVA PARA TRIPULACIÓN ---
  let filteredCrew = crew.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.agency.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgency = crewAgencyFilter === "all" ? true : c.agency === crewAgencyFilter;
    return matchesSearch && matchesAgency;
  });

  filteredCrew.sort((a, b) => {
    return crewSortOrder === "asc" 
      ? a.name.localeCompare(b.name) 
      : b.name.localeCompare(a.name);
  });

  // --- FILTRADO Y ORDENACIÓN REACTIVA PARA CARGAS ÚTILES ---
  let filteredPayloads = payloads.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = payloadTypeFilter === "all" ? true : p.type === payloadTypeFilter;
    return matchesSearch && matchesType;
  });

  filteredPayloads.sort((a, b) => {
    return payloadSortOrder === "asc" 
      ? a.name.localeCompare(b.name) 
      : b.name.localeCompare(a.name);
  });


  //CÁLCULO DE MÉTRICAS DINÁMICAS (Usando los arrays ya filtrados)
  const totalCrew = filteredCrew.length;
  const activeAstronauts = filteredCrew.filter(c => c.status === "active").length;
  
  const totalPayloads = filteredPayloads.length; 
  const totalMassKg = filteredPayloads.reduce((total, p) => total + (p.mass_kg || 0), 0);

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
          <p className="metric-value text-primary">{totalCrew}</p>
        </div>
        <div className="metric-card border-success">
          <h3 className="metric-title">Astronautas en Activo</h3>
          <p className="metric-value text-success">{activeAstronauts}</p>
        </div>
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

      <div className="contact-form" style={{ maxWidth: '100%', padding: '1.5rem', marginBottom: '2rem' }}>
        {/* PESTAÑAS */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button 
            className={activeTab === 'crew' ? 'submit-btn' : 'btn-reset'} 
            style={{ 
              padding: '0.6rem 1.2rem', borderRadius: '8px', 
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
              padding: '0.6rem 1.2rem', borderRadius: '8px', 
              border: activeTab !== 'payloads' ? '1px solid var(--border-color)' : 'none', 
              color: activeTab !== 'payloads' ? 'var(--text-primary)' : 'white' 
            }}
            onClick={() => setActiveTab('payloads')}
          >
            🛰️ Cargas Útiles
          </button>
        </div>

        {/* CONTROLES DE BÚSQUEDA Y FILTRADO (Renderizado dinámico según la pestaña) */}
        <div className="search-controls-container" style={{ flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          
          <input 
            type="text" 
            placeholder={`🔍 Buscar en ${activeTab === 'crew' ? 'tripulación' : 'cargas'}...`} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ flex: '1 1 250px' }}
          />

          {activeTab === 'crew' ? (
            <>
              {/* Filtros específicos de Tripulación */}
              <select 
                value={crewAgencyFilter} 
                onChange={(e) => setCrewAgencyFilter(e.target.value)}
                className="sort-select"
              >
                <option value="all">Todas las Agencias</option>
                <option value="NASA">NASA</option>
                <option value="JAXA">JAXA</option>
                <option value="ESA">ESA</option>
                <option value="SpaceX">SpaceX</option>
                <option value="Axiom Space">Axiom Space</option>
                <option value="Roscosmos">Roscosmos</option>
              </select>
              <select 
                value={crewSortOrder} 
                onChange={(e) => setCrewSortOrder(e.target.value)}
                className="sort-select"
              >
                <option value="asc">A - Z (Nombre)</option>
                <option value="desc">Z - A (Nombre)</option>
              </select>
            </>
          ) : (
            <>
              {/* Filtros específicos de Cargas Útiles */}
              <select 
                value={payloadTypeFilter} 
                onChange={(e) => setPayloadTypeFilter(e.target.value)}
                className="sort-select"
              >
                <option value="all">Todos los Tipos</option>
                <option value="Satellite">Satellite</option>
                <option value="Dragon Boilerplate">Dragon Boilerplate</option>
                <option value="Dragon 1.0">Dragon 1.0</option>
                <option value="Dragon 1.1">Dragon 1.1</option>
                <option value="Dragon 2.0">Dragon 2.0</option>
                <option value="Lander">Lander</option>
                <option value="Crew Dragon">Crew Dragon</option>
              </select>
              <select 
                value={payloadSortOrder} 
                onChange={(e) => setPayloadSortOrder(e.target.value)}
                className="sort-select"
              >
                <option value="asc">A - Z (Nombre)</option>
                <option value="desc">Z - A (Nombre)</option>
              </select>
            </>
          )}

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
                        <a href={c.wikipedia} target="_blank" rel="noopener noreferrer" title={`Leer sobre ${c.name} en Wikipedia`}>
                          <img src={c.image} alt={c.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-color)' }} />
                        </a>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>
                        <a href={c.wikipedia} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'underline', textDecorationColor: 'var(--accent-color)' }}>
                          {c.name}
                        </a>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>{c.agency}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{c.status === 'active' ? '🟢 Activo' : '⚪ Retirado'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron astronautas con estos filtros.</td></tr>
                )
              ) : (
                filteredPayloads.length > 0 ? (
                  filteredPayloads.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>
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
                  <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron cargas útiles con estos filtros.</td></tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}