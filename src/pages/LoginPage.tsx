import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginRequest } from "../auth/authApi";

interface LoginPageProps {
  onLogin: (token: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginRequest({ email, password });
      
      //Retardo artificial para la animación mientras simulamos la conexion a la BD
      await new Promise(resolve => setTimeout(resolve, 1200));

      onLogin(data.access_token); // Le paso el token a App.tsx
      navigate("/"); // Redirigo al inicio
    } catch (err) {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
      <div className="contact-form" style={{ width: '100%', maxWidth: '450px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Iniciar Sesión 🔐</h2>
        
        {error && (
          <div className="error-container" style={{ margin: '0 0 1.5rem 0', padding: '0.8rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="astronauta@spacex.com"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span>
                Iniciando secuencia... <span className="anim-takeoff" style={{ fontSize: "1.5rem" }}>🚀</span>
              </span>
            ) : (
              "Entrar a la Base 🚀"
            )}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          ¿No tienes autorización? <Link to="/register" style={{ color: 'var(--accent-color)' }}>Solicitar acceso</Link>
        </p>
      </div>
    </div>
  );
}