import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';

//Guardianes de Rutas (Filtros de Seguridad)
import RequireAuth from "./auth/RequireAuth";
import RequireRole from "./auth/RequireRole";

//Componentes y Páginas
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LaunchDetailPage from './pages/LaunchDetailPage';
import ContactPage from './pages/ContactPage';

//páginas de autenticación
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from "./pages/AdminPage";
import PressDashboard from "./pages/PressDashboard";

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        
        <Header />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          

          <Route 
            path="/launch/:id" 
            element={
              <RequireAuth>
                <LaunchDetailPage />
              </RequireAuth>
            } 
          />

          <Route 
            path="/admin" 
            element={
              <RequireRole allowedRoles={["admin"]}>
                <AdminPage />
              </RequireRole>
            } 
          />
          <Route 
            path="/prensa" 
            element={
              <RequireRole allowedRoles={["prensa"]}>
                <PressDashboard />
              </RequireRole>
            } 
          />
          
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;