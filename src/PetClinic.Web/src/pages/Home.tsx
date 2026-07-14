import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Users, Dog, Calendar, ClipboardList, Activity, Clock, CheckCircle2 
} from "lucide-react";

export const Home: React.FC = () => {
  const { token, user, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);

  // Admin stats
  const [adminStats, setAdminStats] = useState({
    propietariosCount: 0,
    mascotasCount: 0,
    citasHoy: 0,
    hospitalizadosCount: 0,
    proximasCitas: [] as any[]
  });

  // Recepcionista stats
  const [recepcionistaStats, setRecepcionistaStats] = useState({
    salaEspera: 0,
    ingresosConfirmados: 0,
    esperaList: [] as any[]
  });

  // Veterinario stats
  const [veterinarioStats, setVeterinarioStats] = useState({
    consultasHoyCount: 0,
    tareasPendientes: 0,
    agendaHoy: [] as any[]
  });

  // Auxiliar stats
  const [auxiliarStats, setAuxiliarStats] = useState({
    hospitalizadosCount: 0,
    tareasPendientesCount: 0,
    tareasPendientesList: [] as any[]
  });

  useEffect(() => {
    if (!token || !user) return;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const headers = { "Authorization": `Bearer ${token}` };

        if (hasRole("Administrador")) {
          // 1. Propietarios
          const ownersRes = await fetch("http://localhost:5210/api/propietarios?page=1&pageSize=1", { headers });
          const ownersData = ownersRes.ok ? await ownersRes.json() : { totalCount: 0 };

          // 2. Mascotas
          const petsRes = await fetch("http://localhost:5210/api/mascotas?page=1&pageSize=1", { headers });
          const petsData = petsRes.ok ? await petsRes.json() : { totalCount: 0 };

          // 3. Citas de hoy
          const citasRes = await fetch("http://localhost:5210/api/citas/hoy", { headers });
          const citasData = citasRes.ok ? await citasRes.json() : [];

          // 4. Hospitalizaciones
          const hospRes = await fetch("http://localhost:5210/api/hospitalizaciones", { headers });
          const hospData = hospRes.ok ? await hospRes.json() : [];

          setAdminStats({
            propietariosCount: ownersData.totalCount || 0,
            mascotasCount: petsData.totalCount || 0,
            citasHoy: citasData.length || 0,
            hospitalizadosCount: hospData.length || 0,
            proximasCitas: citasData.slice(0, 5)
          });
        }

        if (hasRole("Recepcionista")) {
          const citasRes = await fetch("http://localhost:5210/api/citas/hoy", { headers });
          const citasData = citasRes.ok ? await citasRes.json() : [];
          
          const waiting = citasData.filter((c: any) => c.estado === "Agendada");
          const completed = citasData.filter((c: any) => c.estado === "Completada");

          setRecepcionistaStats({
            salaEspera: waiting.length,
            ingresosConfirmados: completed.length,
            esperaList: waiting
          });
        }

        if (hasRole("Veterinario")) {
          // 1. Citas del veterinario
          const citasRes = await fetch("http://localhost:5210/api/citas/veterinario", { headers });
          const citasData = citasRes.ok ? await citasRes.json() : [];
          
          const todayStr = new Date().toISOString().split('T')[0];
          const todayCitas = citasData.filter((c: any) => c.fechaHora.startsWith(todayStr));
          const pendingCitas = todayCitas.filter((c: any) => c.estado === "Agendada");

          // 2. Tareas Clínicas
          const tasksRes = await fetch("http://localhost:5210/api/tareas-clinicas", { headers });
          const tasksData = tasksRes.ok ? await tasksRes.json() : [];
          const pendingTasks = tasksData.filter((t: any) => t.estado !== "Completada");

          setVeterinarioStats({
            consultasHoyCount: todayCitas.length,
            tareasPendientes: pendingTasks.length,
            agendaHoy: pendingCitas
          });
        }

        if (hasRole("AuxiliarClinico")) {
          // 1. Hospitalizaciones
          const hospRes = await fetch("http://localhost:5210/api/hospitalizaciones", { headers });
          const hospData = hospRes.ok ? await hospRes.json() : [];

          // 2. Tareas
          const tasksRes = await fetch("http://localhost:5210/api/tareas-clinicas", { headers });
          const tasksData = tasksRes.ok ? await tasksRes.json() : [];
          const pendingTasks = tasksData.filter((t: any) => t.estado !== "Completada");

          setAuxiliarStats({
            hospitalizadosCount: hospData.length,
            tareasPendientesCount: pendingTasks.length,
            tareasPendientesList: pendingTasks
          });
        }
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [token, user]);

  if (!user) return null;

  const renderAdminDashboard = () => (
    <div className="dashboard-grid">
      <div className="metric-card">
        <Users className="metric-icon blue" />
        <div className="metric-info">
          <h3>Propietarios Activos</h3>
          <p className="metric-value">{adminStats.propietariosCount}</p>
        </div>
      </div>
      <div className="metric-card">
        <Dog className="metric-icon green" />
        <div className="metric-info">
          <h3>Mascotas Registradas</h3>
          <p className="metric-value">{adminStats.mascotasCount}</p>
        </div>
      </div>
      <div className="metric-card">
        <Calendar className="metric-icon cyan" />
        <div className="metric-info">
          <h3>Citas Hoy</h3>
          <p className="metric-value">{adminStats.citasHoy}</p>
        </div>
      </div>
      <div className="metric-card">
        <Activity className="metric-icon purple" />
        <div className="metric-info">
          <h3>Pacientes Hospitalizados</h3>
          <p className="metric-value">{adminStats.hospitalizadosCount}</p>
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
              {adminStats.proximasCitas.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#64748b" }}>
                    No hay citas programadas para hoy.
                  </td>
                </tr>
              ) : (
                adminStats.proximasCitas.map((cita: any) => (
                  <tr key={cita.id}>
                    <td>{cita.mascotaNombre}</td>
                    <td>{cita.propietarioNombreCompleto}</td>
                    <td>{cita.veterinarioNombreCompleto}</td>
                    <td>{new Date(cita.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{cita.motivo}</td>
                  </tr>
                ))
              )}
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
          <p className="metric-value">{recepcionistaStats.salaEspera} Pacientes</p>
        </div>
      </div>
      <div className="metric-card">
        <CheckCircle2 className="metric-icon green" />
        <div className="metric-info">
          <h3>Ingresos Confirmados</h3>
          <p className="metric-value">{recepcionistaStats.ingresosConfirmados} Hoy</p>
        </div>
      </div>

      <div className="dashboard-panel span-2">
        <h2>Control de Llegadas y Recepción</h2>
        <div className="waiting-list">
          {recepcionistaStats.esperaList.length === 0 ? (
            <p style={{ color: "#64748b", margin: 0 }}>No hay pacientes en sala de espera hoy.</p>
          ) : (
            recepcionistaStats.esperaList.map((cita: any) => (
              <div key={cita.id} className="waiting-item">
                <div className="waiting-details">
                  <h4>{cita.mascotaNombre}</h4>
                  <p>Propietario: {cita.propietarioNombreCompleto} | Vet: {cita.veterinarioNombreCompleto}</p>
                </div>
                <span className="badge status-waiting">
                  Hora: {new Date(cita.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
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
          <p className="metric-value">{veterinarioStats.consultasHoyCount}</p>
        </div>
      </div>
      <div className="metric-card">
        <ClipboardList className="metric-icon purple" />
        <div className="metric-info">
          <h3>Tareas Indicadas</h3>
          <p className="metric-value">{veterinarioStats.tareasPendientes} Pendientes</p>
        </div>
      </div>

      <div className="dashboard-panel span-2">
        <h2>Mi Agenda de Consultas (Hoy)</h2>
        <div className="agenda-list">
          {veterinarioStats.agendaHoy.length === 0 ? (
            <p style={{ color: "#64748b", margin: 0 }}>No tienes consultas pendientes para hoy.</p>
          ) : (
            veterinarioStats.agendaHoy.map((cita: any) => (
              <div key={cita.id} className="agenda-item">
                <span className="time-label">
                  {new Date(cita.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="agenda-details">
                  <h4>{cita.mascotaNombre}</h4>
                  <p>Motivo: {cita.motivo}</p>
                </div>
              </div>
            ))
          )}
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
          <p className="metric-value">{auxiliarStats.hospitalizadosCount} Activos</p>
        </div>
      </div>
      <div className="metric-card">
        <ClipboardList className="metric-icon blue" />
        <div className="metric-info">
          <h3>Mis Tareas Asignadas</h3>
          <p className="metric-value">{auxiliarStats.tareasPendientesCount} Pendientes</p>
        </div>
      </div>

      <div className="dashboard-panel span-2">
        <h2>Monitor de Tareas Clínicas Pendientes</h2>
        <div className="tasks-list">
          {auxiliarStats.tareasPendientesList.length === 0 ? (
            <p style={{ color: "#64748b", margin: 0 }}>No hay tareas clínicas pendientes.</p>
          ) : (
            auxiliarStats.tareasPendientesList.map((task: any) => (
              <div key={task.id} className="task-card-item">
                <div className="task-details">
                  <div className="task-header-row">
                    <span className="task-badge normal">
                      {task.estado ? task.estado.toUpperCase() : "PENDIENTE"}
                    </span>
                    <h4>{task.titulo} - {task.mascotaNombre}</h4>
                  </div>
                  <p>{task.descripcion}</p>
                  <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                    Indicado por Dr. {task.veterinarioNombre}.
                  </p>
                </div>
              </div>
            ))
          )}
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

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Cargando métricas clínicas...</div>
      ) : (
        <>
          {hasRole("Administrador") && renderAdminDashboard()}
          {hasRole("Recepcionista") && renderRecepcionistaDashboard()}
          {hasRole("Veterinario") && renderVeterinarioDashboard()}
          {hasRole("AuxiliarClinico") && renderAuxiliarDashboard()}
        </>
      )}

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
      `}</style>
    </div>
  );
};
