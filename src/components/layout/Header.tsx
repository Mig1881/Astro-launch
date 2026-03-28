import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../ThemeToggle"; 
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { state, dispatch } = useAuth();
  const { token, user } = state;

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate("/"); 
  };

  return (
    <header className="main-header">
      <Link to="/" className="logo-link">
        <h1>AstroLaunchX 🚀</h1>
      </Link>
  
      <nav className="main-nav">
        <Link to="/">Inicio</Link>
        <Link to="/contact">Contacto</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" style={{ color: "var(--error-color)", fontWeight: "bold" }}>
            🛡️ Admin
          </Link>
        )}
        {user?.role === 'prensa' && (
          <Link to="/prensa" style={{ color: "#3b82f6", fontWeight: "bold" }}>
            📰 Sala de Prensa
          </Link>
        )}
        
        {/* RENDERIZADO CONDICIONAL DE SESIÓN */}
        {token ? (
          <>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Piloto: <strong style={{ color: "var(--accent-color)" }}>{user?.email.split('@')[0]}</strong>
            </span>
            <button 
              onClick={handleLogout} 
              className="map-button" 
              style={{ padding: "0.4rem 1rem", fontSize: "0.9rem", cursor: "pointer" }}
            >
              Salir
            </button>
          </>
        ) : (
          <Link 
            to="/login" 
            className="map-button" 
            style={{ padding: "0.4rem 1rem", fontSize: "0.9rem" }}
          >
            Iniciar Sesión
          </Link>
        )}
        
        <ThemeToggle />
      </nav>
    </header>
  );
}