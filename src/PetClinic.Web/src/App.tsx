import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Owners } from "./pages/Owners";
import { Veterinarians } from "./pages/Veterinarians";
import { Pets } from "./pages/Pets";
import { Appointments } from "./pages/Appointments";
import { Reception } from "./pages/Reception";
import { Consultations } from "./pages/Consultations";
import { History } from "./pages/History";
import { ClinicalHistory } from "./pages/ClinicalHistory";
import { MedicalTasks } from "./pages/MedicalTasks";
import { Hospitalization } from "./pages/Hospitalization";
import { Schedules } from "./pages/Schedules";
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

// Guardián para proteger rutas por rol
const RoleRoute = ({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) => {
  const { isAuthenticated, hasRole } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const isAuthorized = allowedRoles.some(r => hasRole(r));
  return isAuthorized ? <>{children}</> : <Navigate to="/inicio" replace />;
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

            {/* Acceso restringido según rol */}
            <Route path="/veterinarios" element={<RoleRoute allowedRoles={["Administrador"]}><Veterinarians /></RoleRoute>} />
            <Route path="/propietarios" element={<RoleRoute allowedRoles={["Administrador", "Recepcionista"]}><Owners /></RoleRoute>} />
            <Route path="/mascotas" element={<RoleRoute allowedRoles={["Administrador", "Recepcionista", "Veterinario", "AuxiliarClinico"]}><Pets /></RoleRoute>} />
            <Route path="/citas" element={<RoleRoute allowedRoles={["Administrador", "Recepcionista"]}><Appointments /></RoleRoute>} />
            <Route path="/historial" element={<RoleRoute allowedRoles={["Administrador", "Recepcionista"]}><History /></RoleRoute>} />
            <Route path="/recepcion" element={<RoleRoute allowedRoles={["Administrador", "Recepcionista"]}><Reception /></RoleRoute>} />
            <Route path="/consultas" element={<RoleRoute allowedRoles={["Administrador", "Veterinario"]}><Consultations /></RoleRoute>} />
            <Route path="/historial-clinico" element={<RoleRoute allowedRoles={["Administrador", "Veterinario", "AuxiliarClinico"]}><ClinicalHistory /></RoleRoute>} />
            <Route path="/tareas-medicas" element={<RoleRoute allowedRoles={["Administrador", "Veterinario", "AuxiliarClinico"]}><MedicalTasks /></RoleRoute>} />
            <Route path="/hospitalizacion" element={<RoleRoute allowedRoles={["Administrador", "Veterinario", "AuxiliarClinico"]}><Hospitalization /></RoleRoute>} />
            <Route path="/horarios" element={<RoleRoute allowedRoles={["Administrador", "Recepcionista", "Veterinario", "AuxiliarClinico"]}><Schedules /></RoleRoute>} />
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
