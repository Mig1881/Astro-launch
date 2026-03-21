import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../ThemeToggle"; 
import type { User } from "../../types"; 

interface HeaderProps {
  token: string | null;
  user: User | null;
  onLogout: () => void;
}

export default function Header({ token, user, onLogout }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
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