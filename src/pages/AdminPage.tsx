import { useEffect, useState } from "react";
import { getUsersRequest, deleteUserRequest, getToken } from "../auth/authApi";
import type { User } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //ESTADOS PARA EL FILTRADO Y ORDENACIÓN
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

  //LÓGICA DE PROCESAMIENTO REACTIVO (Filtros y Ordenación)
  let filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  filteredUsers.sort((a, b) => {
    return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
  });

  //CÁLCULO DE MÉTRICAS PARA EL DASHBOARD
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalPilots = totalUsers - totalAdmins;

  return (
    <main className="page-container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-color)' }}>Panel de Control 🛡️</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Dashboard de administración de la tripulación de AstroLaunchX.
      </p>

      {/*COMPONENTES DE RESUMEN (Métricas) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <div className="contact-form" style={{ padding: '1.5rem', textAlign: 'center', margin: 0 }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>Total Tripulación</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-color)', margin: '0.5rem 0 0 0' }}>{totalUsers}</p>
        </div>
        <div className="contact-form" style={{ padding: '1.5rem', textAlign: 'center', margin: 0, borderTop: '4px solid var(--accent-color)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>Comandantes (Admins)</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-color)', margin: '0.5rem 0 0 0' }}>{totalAdmins}</p>
        </div>
        <div className="contact-form" style={{ padding: '1.5rem', textAlign: 'center', margin: 0, borderTop: '4px solid #22c55e' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>Pilotos Activos</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#22c55e', margin: '0.5rem 0 0 0' }}>{totalPilots}</p>
        </div>
      </div>

      {/* CONTROLES DE FILTRADO Y ORDENACIÓN */}
      <div className="contact-form" style={{ maxWidth: '100%', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="🔍 Buscar por email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: '1 1 250px', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
          />
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
          >
            <option value="all">Todos los Roles</option>
            <option value="admin">Solo Admins</option>
            <option value="user">Solo Pilotos</option>
          </select>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
          >
            <option value="asc">ID: Ascendente</option>
            <option value="desc">ID: Descendente</option>
          </select>
        </div>

        {/* TABLA DE USUARIOS REACTIVA */}
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
                filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>#{user.id}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{user.email}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ 
                        backgroundColor: user.role === 'admin' ? 'rgba(100, 108, 255, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        color: user.role === 'admin' ? 'var(--accent-color)' : '#22c55e',
                        border: `1px solid ${user.role === 'admin' ? 'var(--accent-color)' : '#22c55e'}`,
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
                        title={user.role === 'admin' ? "No puedes borrar a un comandante" : "Expulsar piloto"}
                      >
                        🗑️ Borrar
                      </button>
                    </td>
                  </tr>
                ))
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