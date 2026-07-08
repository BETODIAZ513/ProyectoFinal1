import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Owners } from "./pages/Owners";
import { Veterinarians } from "./pages/Veterinarians";
import { Placeholder } from "./pages/Placeholder";
import { RibbonMenu } from "./components/RibbonMenu";
import "./App.css";

// Layout que incluye la barra de navegación superior (Ribbon)
const DashboardLayout = () => {
  return (
    <div className="app-layout">
      <RibbonMenu />
      <main className="app-main-content">
        <Outlet />
      </main>
    </div>
  );
};

// Guardián para redirigir si el usuario ya está autenticado (ej. ir a /login teniendo sesión activa)
const UnauthenticatedRoute = () => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <Outlet /> : <Navigate to="/inicio" replace />;
};

// Componente para manejar redirección de ruta raíz o desconocidas
const RootRedirector = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/inicio" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas (Solo accesibles sin sesión) */}
          <Route element={<UnauthenticatedRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Rutas Privadas / Protegidas */}
          <Route element={<DashboardLayout />}>
            {/* Acceso para cualquier usuario autenticado */}
            <Route path="/inicio" element={<Home />} />

            {/* Acceso restringido para Administrador */}
            <Route path="/veterinarios" element={<Veterinarians />} />
            <Route path="/propietarios" element={<Owners />} />
            <Route path="/mascotas" element={<Placeholder title="Fichas de Mascotas" />} />
            <Route path="/citas" element={<Placeholder title="Agenda de Citas" />} />
            <Route path="/historial" element={<Placeholder title="Historial Global de Citas" />} />

            {/* Acceso restringido para Recepcionista */}
            <Route path="/recepcion" element={<Placeholder title="Control de Recepción y Espera" />} />

            {/* Acceso restringido para Veterinario */}
            <Route path="/consultas" element={<Placeholder title="Bandeja de Consultas" />} />
            <Route path="/historial-clinico" element={<Placeholder title="Historial Clínico de Pacientes" />} />

            {/* Acceso restringido para Auxiliar Clínico */}
            <Route path="/tareas-medicas" element={<Placeholder title="Bandeja de Tareas Médicas" />} />
            <Route path="/hospitalizacion" element={<Placeholder title="Monitor de Pacientes Hospitalizados" />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="/" element={<RootRedirector />} />
          <Route path="*" element={<RootRedirector />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
