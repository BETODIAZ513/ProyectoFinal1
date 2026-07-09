import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

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

interface PagedAppointmentsResponse {
  items: Cita[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const History: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<PagedAppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchHistory = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5210/api/consultas-detalles/historial-citas?page=${page}&pageSize=8`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage, token]);

  return (
    <div className="history-container">
      <div className="history-header">
        <div className="title-section">
          <h1>Historial Global de Citas</h1>
          <p className="subtitle">Registro histórico de consultas atendidas y canceladas del sistema</p>
        </div>
      </div>

      <div className="table-panel">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Obteniendo archivo histórico...</p>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="empty-state">
            <Calendar className="empty-icon" />
            <p>No se registran citas pasadas (completadas o canceladas) en el sistema.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Paciente (Mascota)</th>
                    <th>Propietario</th>
                    <th>Médico Veterinario</th>
                    <th>Motivo de Consulta</th>
                    <th>Estado de Cierre</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((row) => (
                    <tr key={row.id}>
                      <td className="font-semibold">
                        <div className="date-time-col">
                          <span className="date-span">{new Date(row.fechaHora).toLocaleDateString()}</span>
                          <span className="time-span">
                            {new Date(row.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="font-bold text-cyan">{row.mascotaNombre}</td>
                      <td>{row.propietarioNombreCompleto}</td>
                      <td>{row.veterinarioNombreCompleto}</td>
                      <td className="motivo-cell" title={row.motivo}>{row.motivo}</td>
                      <td>
                        <span className={`status-badge ${row.estado === "Completada" ? "completed" : "cancelled"}`}>
                          {row.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {data.totalPages > 1 && (
              <div className="pagination-bar">
                <span className="pagination-info">
                  Página {data.page} de {data.totalPages} ({data.totalCount} registros en total)
                </span>
                <div className="pagination-buttons">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="btn-page"
                  >
                    <ChevronLeft /> Anterior
                  </button>
                  <button 
                    disabled={currentPage === data.totalPages} 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.totalPages))}
                    className="btn-page"
                  >
                    Siguiente <ChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .history-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .history-header {
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
        }

        .text-cyan {
          color: #06b6d4;
        }

        .date-time-col {
          display: flex;
          flex-direction: column;
        }

        .date-span {
          color: #ffffff;
        }

        .time-span {
          font-size: 12px;
          color: #64748b;
        }

        .motivo-cell {
          max-width: 250px;
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

        .status-badge.completed {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-badge.cancelled {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .pagination-info {
          font-size: 13px;
          color: #64748b;
        }

        .pagination-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-page {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #cbd5e1;
          border-radius: 6px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-page:hover:not(:disabled) {
          border-color: #06b6d4;
          color: #06b6d4;
        }

        .btn-page:disabled {
          opacity: 0.4;
          cursor: not-allowed;
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
