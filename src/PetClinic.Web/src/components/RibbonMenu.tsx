import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Home, Users, Dog, Calendar, History, ClipboardList, 
  Activity, LogOut, LayoutDashboard 
} from "lucide-react";

export const RibbonMenu: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="ribbon-header">
      <div className="ribbon-container">
        <div className="ribbon-brand">
          <Activity className="brand-logo" />
          <span className="brand-title">PetClinic</span>
        </div>

        <nav className="ribbon-nav">
          {/* Inicio es común para todos */}
          <Link to="/inicio" className={`ribbon-item ${isActive("/inicio") ? "active" : ""}`}>
            <Home className="nav-icon" />
            <span>Inicio</span>
          </Link>

          {/* Menú de Administrador */}
          {hasRole("Administrador") && (
            <>
              <Link to="/veterinarios" className={`ribbon-item ${isActive("/veterinarios") ? "active" : ""}`}>
                <Users className="nav-icon" />
                <span>Veterinarios</span>
              </Link>
              <Link to="/propietarios" className={`ribbon-item ${isActive("/propietarios") ? "active" : ""}`}>
                <Users className="nav-icon" />
                <span>Propietarios</span>
              </Link>
              <Link to="/mascotas" className={`ribbon-item ${isActive("/mascotas") ? "active" : ""}`}>
                <Dog className="nav-icon" />
                <span>Mascotas</span>
              </Link>
              <Link to="/citas" className={`ribbon-item ${isActive("/citas") ? "active" : ""}`}>
                <Calendar className="nav-icon" />
                <span>Citas</span>
              </Link>
              <Link to="/historial" className={`ribbon-item ${isActive("/historial") ? "active" : ""}`}>
                <History className="nav-icon" />
                <span>Historial</span>
              </Link>
            </>
          )}

          {/* Menú de Recepcionista */}
          {hasRole("Recepcionista") && (
            <Link to="/recepcion" className={`ribbon-item ${isActive("/recepcion") ? "active" : ""}`}>
              <LayoutDashboard className="nav-icon" />
              <span>Recepción</span>
            </Link>
          )}

          {/* Menú de Veterinario */}
          {hasRole("Veterinario") && (
            <>
              <Link to="/consultas" className={`ribbon-item ${isActive("/consultas") ? "active" : ""}`}>
                <ClipboardList className="nav-icon" />
                <span>Consultas</span>
              </Link>
              <Link to="/historial-clinico" className={`ribbon-item ${isActive("/historial-clinico") ? "active" : ""}`}>
                <History className="nav-icon" />
                <span>Historial Clínico</span>
              </Link>
            </>
          )}

          {/* Menú de Auxiliar Clínico */}
          {hasRole("AuxiliarClinico") && (
            <>
              <Link to="/tareas-medicas" className={`ribbon-item ${isActive("/tareas-medicas") ? "active" : ""}`}>
                <ClipboardList className="nav-icon" />
                <span>Tareas Médicas</span>
              </Link>
              <Link to="/hospitalizacion" className={`ribbon-item ${isActive("/hospitalizacion") ? "active" : ""}`}>
                <Activity className="nav-icon" />
                <span>Hospitalización</span>
              </Link>
            </>
          )}
        </nav>

        <div className="ribbon-user-section">
          <div className="user-profile-info">
            <span className="profile-name">{user.nombreCompleto}</span>
            <span className="profile-role">{user.roles[0]}</span>
          </div>
          <button onClick={handleLogoutClick} className="btn-logout" title="Cerrar Sesión">
            <LogOut className="logout-icon" />
          </button>
        </div>
      </div>

      <style>{`
        .ribbon-header {
          background: #1e293b;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'Outfit', 'Inter', sans-serif;
          color: #f8fafc;
        }

        .ribbon-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 70px;
        }

        .ribbon-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-logo {
          color: #06b6d4;
          width: 28px;
          height: 28px;
        }

        .brand-title {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .ribbon-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 100%;
        }

        .ribbon-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .ribbon-item:hover {
          color: #f8fafc;
          background: rgba(255, 255, 255, 0.04);
        }

        .ribbon-item.active {
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.08);
          font-weight: 600;
        }

        .nav-icon {
          width: 18px;
          height: 18px;
        }

        .ribbon-user-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-profile-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .profile-name {
          font-size: 14px;
          font-weight: 600;
        }

        .profile-role {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .btn-logout {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-logout:hover {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
        }

        .logout-icon {
          width: 18px;
          height: 18px;
        }
      `}</style>
    </header>
  );
};
