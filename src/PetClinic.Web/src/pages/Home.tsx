import React from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Users, Dog, Calendar, ClipboardList, Activity, Clock, CheckCircle2 
} from "lucide-react";

export const Home: React.FC = () => {
  const { user, hasRole } = useAuth();

  if (!user) return null;

  const renderAdminDashboard = () => (
    <div className="dashboard-grid">
      <div className="metric-card">
        <Users className="metric-icon blue" />
        <div className="metric-info">
          <h3>Propietarios Activos</h3>
          <p className="metric-value">124</p>
        </div>
      </div>
      <div className="metric-card">
        <Dog className="metric-icon green" />
        <div className="metric-info">
          <h3>Mascotas Registradas</h3>
          <p className="metric-value">312</p>
        </div>
      </div>
      <div className="metric-card">
        <Calendar className="metric-icon cyan" />
        <div className="metric-info">
          <h3>Citas Hoy</h3>
          <p className="metric-value">18</p>
        </div>
      </div>
      <div className="metric-card">
        <Activity className="metric-icon purple" />
        <div className="metric-info">
          <h3>Pacientes Hospitalizados</h3>
          <p className="metric-value">8</p>
        </div>
      </div>

      <div className="dashboard-panel span-2">
        <h2>Próximas Citas Semanales</h2>
        <div className="table-responsive">
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Propietario</th>
                <th>Veterinario</th>
                <th>Fecha / Hora</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Toby (Canino)</td>
                <td>Juan Pérez</td>
                <td>Dr. Pérez</td>
                <td>Hoy - 09:00</td>
                <td>Vacunación Anual</td>
              </tr>
              <tr>
                <td>Luna (Felino)</td>
                <td>María Gómez</td>
                <td>Dr. Pérez</td>
                <td>Hoy - 10:30</td>
                <td>Control de Peso</td>
              </tr>
              <tr>
                <td>Rex (Canino)</td>
                <td>Carlos Díaz</td>
                <td>Dr. Pérez</td>
                <td>Mañana - 15:00</td>
                <td>Limpieza Dental</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRecepcionistaDashboard = () => (
    <div className="dashboard-grid">
      <div className="metric-card">
        <Clock className="metric-icon cyan" />
        <div className="metric-info">
          <h3>Sala de Espera</h3>
          <p className="metric-value">3 Pacientes</p>
        </div>
      </div>
      <div className="metric-card">
        <CheckCircle2 className="metric-icon green" />
        <div className="metric-info">
          <h3>Ingresos Confirmados</h3>
          <p className="metric-value">12 Hoy</p>
        </div>
      </div>

      <div className="dashboard-panel span-2">
        <h2>Control de Llegadas y Recepción</h2>
        <div className="waiting-list">
          <div className="waiting-item">
            <div className="waiting-details">
              <h4>Toby</h4>
              <p>Propietario: Juan Pérez | Vet: Dr. Pérez</p>
            </div>
            <span className="badge status-waiting">En Espera (15m)</span>
          </div>
          <div className="waiting-item">
            <div className="waiting-details">
              <h4>Luna</h4>
              <p>Propietario: María Gómez | Vet: Dr. Pérez</p>
            </div>
            <span className="badge status-waiting">En Espera (5m)</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVeterinarioDashboard = () => (
    <div className="dashboard-grid">
      <div className="metric-card">
        <Calendar className="metric-icon blue" />
        <div className="metric-info">
          <h3>Mis Consultas Hoy</h3>
          <p className="metric-value">6</p>
        </div>
      </div>
      <div className="metric-card">
        <ClipboardList className="metric-icon purple" />
        <div className="metric-info">
          <h3>Tareas Indicadas</h3>
          <p className="metric-value">4 Pendientes</p>
        </div>
      </div>

      <div className="dashboard-panel span-2">
        <h2>Mi Agenda de Consultas (Hoy)</h2>
        <div className="agenda-list">
          <div className="agenda-item">
            <span className="time-label">09:00 - 10:00</span>
            <div className="agenda-details">
              <h4>Toby</h4>
              <p>Motivo: Control de Alergias</p>
            </div>
            <button className="btn-action">Iniciar Consulta</button>
          </div>
          <div className="agenda-item">
            <span className="time-label">10:30 - 11:30</span>
            <div className="agenda-details">
              <h4>Luna</h4>
              <p>Motivo: Aplicación Triple Felina</p>
            </div>
            <button className="btn-action">Iniciar Consulta</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuxiliarDashboard = () => (
    <div className="dashboard-grid">
      <div className="metric-card">
        <Activity className="metric-icon purple" />
        <div className="metric-info">
          <h3>Pacientes Hospitalizados</h3>
          <p className="metric-value">8 Activos</p>
        </div>
      </div>
      <div className="metric-card">
        <ClipboardList className="metric-icon blue" />
        <div className="metric-info">
          <h3>Mis Tareas Asignadas</h3>
          <p className="metric-value">3 Urgentes</p>
        </div>
      </div>

      <div className="dashboard-panel span-2">
        <h2>Monitor de Tareas Clínicas Pendientes</h2>
        <div className="tasks-list">
          <div className="task-card-item priority-high">
            <div className="task-details">
              <div className="task-header-row">
                <span className="task-badge priority">ALTA PRIORIDAD</span>
                <h4>Administrar Medicación - Rex (Canino)</h4>
              </div>
              <p>Dar 1 comp. de Cefalexina. Indicado por Dr. Pérez.</p>
            </div>
            <button className="btn-complete-task">Completar</button>
          </div>
          <div className="task-card-item priority-medium">
            <div className="task-details">
              <div className="task-header-row">
                <span className="task-badge normal">NORMAL</span>
                <h4>Alimentación - Canela (Felino)</h4>
              </div>
              <p>Proporcionar 80g de alimento húmedo prescrito.</p>
            </div>
            <button className="btn-complete-task">Completar</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <h1>Bienvenido de nuevo, {user.nombreCompleto}</h1>
        <p className="role-text">Rol actual: <strong>{user.roles[0]}</strong></p>
      </div>

      {hasRole("Administrador") && renderAdminDashboard()}
      {hasRole("Recepcionista") && renderRecepcionistaDashboard()}
      {hasRole("Veterinario") && renderVeterinarioDashboard()}
      {hasRole("AuxiliarClinico") && renderAuxiliarDashboard()}

      <style>{`
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Outfit', 'Inter', sans-serif;
          color: #f8fafc;
        }

        .dashboard-welcome {
          margin-bottom: 32px;
          text-align: left;
        }

        .dashboard-welcome h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #ffffff;
        }

        .role-text {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .role-text strong {
          color: #06b6d4;
          font-weight: 600;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .metric-card {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          text-align: left;
        }

        .metric-icon {
          width: 48px;
          height: 48px;
          padding: 12px;
          border-radius: 10px;
          box-sizing: border-box;
        }

        .metric-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .metric-icon.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .metric-icon.cyan { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }
        .metric-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

        .metric-info h3 {
          font-size: 13px;
          font-weight: 500;
          color: #94a3b8;
          margin: 0 0 4px 0;
        }

        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .dashboard-panel {
          grid-column: span 4;
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 24px;
          text-align: left;
        }

        .dashboard-panel.span-2 {
          grid-column: span 4;
        }

        @media (min-width: 1024px) {
          .dashboard-panel.span-2 {
            grid-column: span 4;
          }
        }

        .dashboard-panel h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 20px 0;
          color: #ffffff;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .clinical-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .clinical-table th {
          padding: 12px 16px;
          color: #64748b;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .clinical-table td {
          padding: 16px;
          font-size: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .waiting-list, .agenda-list, .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .waiting-item, .agenda-item {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .waiting-details h4, .agenda-details h4 {
          font-size: 15px;
          margin: 0 0 4px 0;
          color: #ffffff;
        }

        .waiting-details p, .agenda-details p {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .badge {
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
        }

        .badge.status-waiting {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .btn-action {
          background: rgba(6, 182, 212, 0.1);
          color: #06b6d4;
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-action:hover {
          background: #06b6d4;
          color: #ffffff;
        }

        .time-label {
          font-size: 14px;
          font-weight: 600;
          color: #06b6d4;
        }

        .task-card-item {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-left: 4px solid #64748b;
          border-radius: 8px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .task-card-item.priority-high {
          border-left-color: #ef4444;
        }

        .task-card-item.priority-medium {
          border-left-color: #3b82f6;
        }

        .task-header-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
        }

        .task-header-row h4 {
          font-size: 15px;
          margin: 0;
          color: #ffffff;
        }

        .task-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        .task-badge.priority {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
        }

        .task-badge.normal {
          background: rgba(59, 130, 246, 0.15);
          color: #93c5fd;
        }

        .task-details p {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
        }

        .btn-complete-task {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-complete-task:hover {
          background: #10b981;
          color: #ffffff;
        }
      `}</style>
    </div>
  );
};
