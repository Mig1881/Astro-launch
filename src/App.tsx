import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

//Capa de Servicios API
import { getToken, meRequest, saveToken, clearToken } from "./auth/authApi";

//Guardianes de Rutas (Filtros de Seguridad)
import RequireAuth from "./auth/RequireAuth";

//Tipos
import type { User } from "./types";

//Componentes y Páginas
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LaunchDetailPage from './pages/LaunchDetailPage';
import ContactPage from './pages/ContactPage';
//páginas de autenticación
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RequireRole from "./auth/RequireRole";
import AdminPage from "./pages/AdminPage";

function App() {
  const [token, setToken] = useState<string | null>(getToken());
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  const refreshMe = async (currentToken: string) => {
    try {
      const userData = await meRequest(currentToken);
      setUser(userData);
    } catch (error) {
      console.error("Sesión expirada o inválida");
      logout();
    } finally {
      setLoadingSession(false);
    }
  };

  const login = (newToken: string) => {
    saveToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    clearToken();
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) {
      refreshMe(token);
    } else {
      setLoadingSession(false);
    }
  }, [token]);

  if (loadingSession) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h2 className="text-2xl font-bold" style={{ textAlign: "center", marginTop: "5rem" }}>
          Iniciando sistemas de la nave... 🚀
        </h2>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Le paso las variables de sesión al Header */}
      <Header token={token} user={user} onLogout={logout} />
      
      <Routes>
        <Route path="/" element={<HomePage key={token ? "con-sesion" : "sin-sesion"} />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/*Rutas de Login y Registro. Les pao la función 'login' para que avisen al padre al terminar */}
        <Route path="/login" element={<LoginPage onLogin={login} />} />
        <Route path="/register" element={<RegisterPage onLogin={login} />} />
        
        <Route 
          path="/launch/:id" 
          element={
            <RequireAuth token={token}>
              <LaunchDetailPage />
            </RequireAuth>
          } 
        />

        <Route 
          path="/admin" 
          element={
            <RequireRole user={user} allowedRoles={["admin"]}>
              <AdminPage />
            </RequireRole>
          } 
        />
        
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App;