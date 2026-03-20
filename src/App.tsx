import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 1. Capa de Servicios API
import { getToken, meRequest, saveToken, clearToken } from "./auth/authApi";

// 2. Guardianes de Rutas (Filtros de Seguridad)
import RequireAuth from "./auth/RequireAuth";
// import RequireRole from "./auth/RequireRole"; // Lo usaremos cuando hagamos la página de Admin

// 3. Tipos
import type { User } from "./types";

// 4. Componentes y Páginas
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LaunchDetailPage from './pages/LaunchDetailPage.tsx';
import ContactPage from './pages/ContactPage.tsx';

function App() {
  // --- ESTADO GLOBAL (Single Source of Truth / Contexto de Sesión) ---
  const [token, setToken] = useState<string | null>(getToken());
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  // --- LÓGICA DE SESIÓN (Controladores) ---
  // Equivalente a preguntar a la base de datos: "¿Este token sigue siendo válido?"
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

  // --- CICLO DE VIDA (Al arrancar la aplicación) ---
  useEffect(() => {
    if (token) {
      refreshMe(token);
    } else {
      setLoadingSession(false);
    }
  }, [token]);

  // Pantalla de carga (Para que no parpadee la app mientras comprueba el token)
  if (loadingSession) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h2 className="text-2xl font-bold">Iniciando sistemas de la nave... 🚀</h2>
      </div>
    );
  }

  // --- VISTA (El Router) ---
  return (
    <BrowserRouter>
      {/* Al Header le pasaremos mañana el usuario para que muestre el botón de Login o el nombre del usuario */}
      <Header />
      
      <Routes>
        {/* 1. RUTAS PÚBLICAS (El Escaparate de la Landing Page) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* 2. RUTAS PROTEGIDAS (Solo usuarios registrados) */}
        {/* Envolvemos la página de detalles con el filtro. Si no hay token, te expulsa. */}
        <Route 
          path="/launch/:id" 
          element={
            <RequireAuth token={token}>
              <LaunchDetailPage />
            </RequireAuth>
          } 
        />
        
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App;