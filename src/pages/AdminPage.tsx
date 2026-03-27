import { useEffect, useState } from "react";
import { getUsersRequest, deleteUserRequest, getToken } from "../auth/authApi";
import type { User } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ESTADOS PARA EL FILTRADO Y ORDENACIÓN
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchUsers = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("No hay token");
      
      const data = await getUsersRequest(token);
      setUsers(data);
    } catch (err) {
      setError("Acceso denegado. No tienes nivel de autorización suficiente. 🛑");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que quieres expulsar a este piloto?")) return;
    try {
      const token = getToken();
      if (!token) return;
      await deleteUserRequest(id, token);
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      alert("Error al expulsar al usuario.");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // LÓGICA DE PROCESAMIENTO REACTIVO
  let filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  filteredUsers.sort((a, b) => {
    return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
  });

  // CÁLCULO DE MÉTRICAS PARA EL DASHBOARD
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalPilots = totalUsers - totalAdmins;

  const operativeForce = totalUsers > 0 ? Math.round((totalPilots / totalUsers) * 100) : 0;

  return (
    <main className="page-container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
      
      <h2 className="section-title" style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>
        Panel de Control 🛡️
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
        Dashboard de administración de la tripulación de AstroLaunchX.
      </p>

      {/* COMPONENTES DE RESUMEN */}
      <div className="dashboard-metrics-grid">
        <div className="metric-card border-accent">
          <h3 className="metric-title">Total Tripulación</h3>
          <p className="metric-value text-primary">{totalUsers}</p>
        </div>
        <div className="metric-card border-info">
          <h3 className="metric-title">Comandantes</h3>
          <p className="metric-value text-info">{totalAdmins}</p>
        </div>
        <div className="metric-card border-success">
          <h3 className="metric-title">Pilotos Activos</h3>
          <p className="metric-value text-success">{totalPilots}</p>
        </div>
        <div className="metric-card border-warning">
          <h3 className="metric-title">Fuerza Operativa</h3>
          <p className="metric-value text-warning">{operativeForce}%</p>
        </div>
      </div>

      {/* CONTROLES DE FILTRADO REUTILIZANDO CLASES DE APP.CSS */}
      <div className="search-controls-container" style={{ flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar por email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          style={{ flex: '1 1 250px' }}
        />
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          className="sort-select"
        >
          <option value="all">Todos los Roles</option>
          <option value="admin">Solo Admins</option>
          <option value="user">Solo Pilotos</option>
        </select>
        <select 
          value={sortOrder} 
          onChange={(e) => setSortOrder(e.target.value)}
          className="sort-select"
        >
          <option value="asc">ID: Ascendente</option>
          <option value="desc">ID: Descendente</option>
        </select>
      </div>

      {/* TABLA DE USUARIOS REACTIVA */}
      <div className="contact-form" style={{ maxWidth: '100%', padding: '1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem 0.5rem' }}>ID</th>
                <th style={{ padding: '1rem 0.5rem' }}>Email</th>
                <th style={{ padding: '1rem 0.5rem' }}>Rol</th>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => {
                  // Pequeña lógica para asignar colores limpios según el rol
                  let roleBg = 'rgba(34, 197, 94, 0.1)'; // Verde por defecto (user)
                  let roleColor = '#22c55e';
                  
                  if (user.role === 'admin') {
                    roleBg = 'rgba(100, 108, 255, 0.1)';
                    roleColor = 'var(--accent-color)'; // Azul
                  } else if (user.role === 'prensa') {
                    roleBg = 'rgba(245, 158, 11, 0.1)';
                    roleColor = '#f59e0b'; // Naranja
                  }

                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>#{user.id}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{user.email}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ 
                          backgroundColor: roleBg,
                          color: roleColor,
                          border: `1px solid ${roleColor}`,
                          padding: '0.3rem 0.6rem',
                          borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="btn-reset"
                          style={{ 
                            borderColor: 'var(--error-color)', color: 'var(--error-color)', padding: '0.4rem 0.8rem',
                            opacity: user.role === 'admin' ? 0.3 : 1, cursor: user.role === 'admin' ? 'not-allowed' : 'pointer'
                          }}
                          disabled={user.role === 'admin'}
                          title={user.role === 'admin' ? "No puedes borrar a un comandante" : "Expulsar usuario"}
                        >
                          🗑️ Borrar
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No se encontraron usuarios con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}