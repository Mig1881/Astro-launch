import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerRequest } from "../auth/authApi";

interface RegisterPageProps {
  onLogin: (token: string) => void;
}

export default function RegisterPage({ onLogin }: RegisterPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden. Revisa los datos.");
      return;
    }

    setLoading(true);

    try {
      const data = await registerRequest({ email, password });
      onLogin(data.access_token); // Hacemos auto-login al registrarse
      navigate("/"); // Redirigimos al inicio
    } catch (err) {
      setError("Error al crear la cuenta. Es posible que el email ya esté en uso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
      <div className="contact-form" style={{ width: '100%', maxWidth: '450px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Nuevo Registro 🛰️</h2>
        
        {error && (
          <div className="error-container" style={{ margin: '0 0 1.5rem 0', padding: '0.8rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nuevo.piloto@spacex.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Contraseña</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="confirm-password">Repetir Contraseña</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Registrando datos... ⏳" : "Crear Cuenta"}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--accent-color)' }}>Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}