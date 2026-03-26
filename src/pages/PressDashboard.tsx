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

        //ejecuta ambas peticiones a la vez (en paralelo)
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
  // Sumamos la masa de todos los satélites (ignorando los nulos)
  const totalMassKg = payloads.reduce((total, p) => total + (p.mass_kg || 0), 0);
  
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
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-color)' }}>Centro de Prensa 📰</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Datos clasificados de tripulación y cargas útiles para comunicados oficiales.
      </p>

      {/* TARJETAS DE MÉTRICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="contact-form" style={{ padding: '1.5rem', textAlign: 'center', margin: 0, borderTop: '4px solid #3b82f6' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>Total Astronautas</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-color)', margin: '0.5rem 0 0 0' }}>{crew.length}</p>
        </div>
        <div className="contact-form" style={{ padding: '1.5rem', textAlign: 'center', margin: 0, borderTop: '4px solid #22c55e' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>Astronautas en Activo</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#22c55e', margin: '0.5rem 0 0 0' }}>{activeAstronauts}</p>
        </div>
        <div className="contact-form" style={{ padding: '1.5rem', textAlign: 'center', margin: 0, borderTop: '4px solid #f59e0b' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>Toneladas Enviadas</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b', margin: '0.5rem 0 0 0' }}>
            {Math.round(totalMassKg / 1000).toLocaleString()} t
          </p>
        </div>
      </div>

      {/* CONTROLES DEL DASHBOARD */}
      <div className="contact-form" style={{ maxWidth: '100%', padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={activeTab === 'crew' ? 'submit-btn' : 'btn-reset'} 
              style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: activeTab !== 'crew' ? '1px solid var(--border-color)' : 'none', color: activeTab !== 'crew' ? 'var(--text-color)' : '' }}
              onClick={() => setActiveTab('crew')}
            >
              👩‍🚀 Tripulación
            </button>
            <button 
              className={activeTab === 'payloads' ? 'submit-btn' : 'btn-reset'} 
              style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: activeTab !== 'payloads' ? '1px solid var(--border-color)' : 'none', color: activeTab !== 'payloads' ? 'var(--text-color)' : '' }}
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
            style={{ flex: '1 1 250px', maxWidth: '300px', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
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
                filteredCrew.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.5rem' }}>
                      <img src={c.image} alt={c.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    </td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>{c.name}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{c.agency}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{c.status === 'active' ? '🟢 Activo' : '⚪ Retirado'}</td>
                  </tr>
                ))
              ) : (
                filteredPayloads.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>{p.name}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{p.type}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{p.orbit}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>{p.mass_kg ? p.mass_kg.toLocaleString() : 'Desconocida'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}