import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  CheckCircle, XCircle, RefreshCw, Smile
} from "lucide-react";

interface Cita {
  id: number;
  mascotaId: number;
  mascotaNombre: string;
  veterinarioId: number;
  veterinarioNombreCompleto: string;
  propietarioNombreCompleto: string;
  fechaHora: string;
  motivo: string;
  estado: string;
}

export const Reception: React.FC = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTodayAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL + "/api/citas/hoy", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setAppointments(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
  }, [token]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/citas/${id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id, estado: newStatus })
      });

      if (!response.ok) {
        const errResult = await response.json();
        throw new Error(errResult.message || "Error al actualizar estado.");
      }

      await fetchTodayAppointments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Resumen del día
  const totalAgendadas = appointments.filter(a => a.estado === "Agendada").length;
  const totalEnEspera = appointments.filter(a => a.estado === "En Espera").length;
  const totalCompletadas = appointments.filter(a => a.estado === "Completada").length;

  return (
    <div className="reception-container">
      <div className="reception-header">
        <div className="title-section">
          <h1>Recepción y Sala de Espera</h1>
          <p className="subtitle">Gestión de llegadas, control de arribos diarios y sala de espera interactiva</p>
        </div>
        <button onClick={fetchTodayAppointments} className="btn-refresh">
          <RefreshCw className="btn-icon" /> Actualizar Lista
        </button>
      </div>

      {/* Tarjetas de Resumen Clínico */}
      <div className="summary-grid">
        <div className="summary-card cyan">
          <h3>Agendadas Hoy</h3>
          <p className="count">{totalAgendadas}</p>
        </div>
        <div className="summary-card orange">
          <h3>En Sala de Espera</h3>
          <p className="count">{totalEnEspera}</p>
        </div>
        <div className="summary-card green">
          <h3>Atendidos</h3>
          <p className="count">{totalCompletadas}</p>
        </div>
      </div>

      <div className="table-panel">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Sincronizando sala de espera...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <Smile className="empty-icon" />
            <p>No hay citas programadas para el día de hoy.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Hora Programada</th>
                  <th>Mascota (Paciente)</th>
                  <th>Propietario (Contacto)</th>
                  <th>Médico Asignado</th>
                  <th>Motivo Clínico</th>
                  <th>Estado</th>
                  <th className="text-center">Confirmar Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((row) => (
                  <tr key={row.id} className={row.estado === "Completada" ? "completed-row" : row.estado === "Cancelada" ? "cancelled-row" : ""}>
                    <td className="font-semibold text-cyan">
                      {new Date(row.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="font-bold">{row.mascotaNombre}</td>
                    <td>{row.propietarioNombreCompleto}</td>
                    <td>{row.veterinarioNombreCompleto}</td>
                    <td className="motivo-cell" title={row.motivo}>{row.motivo}</td>
                    <td>
                      <span className={`status-badge ${row.estado === "En Espera" ? "waiting" : row.estado === "Completada" ? "completed" : row.estado === "Cancelada" ? "cancelled" : "scheduled"}`}>
                        {row.estado}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        {row.estado === "Agendada" && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(row.id, "En Espera")}
                              className="btn-confirm"
                              title="Confirmar llegada a clínica"
                            >
                              <CheckCircle className="action-icon" /> Confirmar Llegada
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(row.id, "Cancelada")}
                              className="btn-cancel"
                              title="Cancelar cita"
                            >
                              <XCircle className="action-icon" /> Cancelar
                            </button>
                          </>
                        )}
                        {row.estado === "En Espera" && (
                          <button 
                            onClick={() => handleUpdateStatus(row.id, "Cancelada")}
                            className="btn-cancel"
                            title="Cancelar cita"
                          >
                            <XCircle className="action-icon" /> Cancelar
                          </button>
                        )}
                        {row.estado === "Completada" && (
                          <span className="text-muted">Atendido</span>
                        )}
                        {row.estado === "Cancelada" && (
                          <span className="text-muted">Cancelado</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .reception-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .reception-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
          text-align: left;
        }

        .title-section h1 {
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 4px 0;
        }

        .title-section .subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .btn-refresh {
          background: #334155;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .btn-refresh:hover {
          background: #475569;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
          text-align: left;
        }

        .summary-card {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .summary-card h3 {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          margin: 0 0 8px 0;
          letter-spacing: 0.5px;
        }

        .summary-card .count {
          font-size: 32px;
          font-weight: 700;
          margin: 0;
        }

        .summary-card.cyan .count { color: #06b6d4; }
        .summary-card.orange .count { color: #f59e0b; }
        .summary-card.green .count { color: #10b981; }

        .table-panel {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 24px;
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
          font-size: 12px;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .clinical-table td {
          padding: 16px;
          font-size: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .font-semibold {
          font-weight: 600;
        }

        .font-bold {
          font-weight: 700;
          color: #ffffff;
        }

        .text-cyan {
          color: #06b6d4;
        }

        .motivo-cell {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .status-badge.scheduled {
          background: rgba(6, 182, 212, 0.1);
          color: #06b6d4;
        }

        .status-badge.waiting {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .status-badge.completed {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-badge.cancelled {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .actions-cell {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .btn-confirm {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .btn-confirm:hover {
          background: #10b981;
          color: #ffffff;
        }

        .btn-cancel {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background: #ef4444;
          color: #ffffff;
        }

        .action-icon {
          width: 14px;
          height: 14px;
        }

        .completed-row {
          opacity: 0.65;
        }

        .cancelled-row {
          opacity: 0.45;
          text-decoration: line-through;
        }

        .text-muted {
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .loading-state, .empty-state {
          text-align: center;
          padding: 48px 0;
          color: #64748b;
        }

        .spinner {
          border: 3px solid rgba(255, 255, 255, 0.05);
          border-top: 3px solid #06b6d4;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
          margin: 0 auto 12px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          color: #475569;
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  );
};
