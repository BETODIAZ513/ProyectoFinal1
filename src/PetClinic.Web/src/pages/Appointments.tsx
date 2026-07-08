import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, Calendar, X, AlertCircle, XCircle
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

interface Pet {
  id: number;
  nombre: string;
}

interface Veterinarian {
  id: number;
  nombreCompleto: string;
}

interface PagedAppointmentsResponse {
  items: Cita[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const Appointments: React.FC = () => {
  const { token } = useAuth();
  
  const [data, setData] = useState<PagedAppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Catálogos para el modal
  const [petsList, setPetsList] = useState<Pet[]>([]);
  const [vetsList, setVetsList] = useState<Veterinarian[]>([]);
  
  // Modal de Agendamiento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    mascotaId: "",
    veterinarioId: "",
    fechaHora: "",
    motivo: ""
  });
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchAppointments = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5210/api/citas?page=${page}&pageSize=6`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Error al obtener citas.");
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogs = async () => {
    try {
      // Cargar Mascotas
      const petRes = await fetch("http://localhost:5210/api/mascotas?pageSize=100", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      // Cargar Veterinarios
      const vetRes = await fetch("http://localhost:5210/api/veterinarios", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (petRes.ok && vetRes.ok) {
        const petData = await petRes.json();
        const vetData = await vetRes.json();
        setPetsList(petData.items.filter((p: any) => p.activo));
        setVetsList(vetData.filter((v: any) => v.activo));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments(currentPage);
    fetchCatalogs();
  }, [currentPage, token]);

  const handleOpenModal = () => {
    setFormData({
      mascotaId: petsList[0]?.id.toString() || "",
      veterinarioId: vetsList[0]?.id.toString() || "",
      fechaHora: "",
      motivo: ""
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mascotaId || !formData.veterinarioId || !formData.fechaHora || !formData.motivo) {
      setFormError("Por favor, rellene todos los campos obligatorios.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const response = await fetch("http://localhost:5210/api/citas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          mascotaId: parseInt(formData.mascotaId),
          veterinarioId: parseInt(formData.veterinarioId),
          fechaHora: formData.fechaHora,
          motivo: formData.motivo
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al programar la cita.");
      }

      setIsModalOpen(false);
      fetchAppointments(currentPage);
    } catch (err: any) {
      setFormError(err.message || "Error al guardar.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelAppointment = async (id: number) => {
    if (!window.confirm("¿Está seguro de que desea cancelar esta cita?")) return;

    try {
      const response = await fetch(`http://localhost:5210/api/citas/${id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id, estado: "Cancelada" })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cancelar.");
      }

      fetchAppointments(currentPage);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Agendada": return "status-scheduled";
      case "En Espera": return "status-waiting";
      case "Completada": return "status-completed";
      case "Cancelada": return "status-cancelled";
      default: return "";
    }
  };

  return (
    <div className="appts-container">
      <div className="appts-header">
        <div className="title-section">
          <h1>Planificador de Citas</h1>
          <p className="subtitle">Historial completo y panel de control de agendamientos médicos</p>
        </div>
        <button onClick={handleOpenModal} className="btn-add">
          <Plus className="btn-icon" /> Programar Cita
        </button>
      </div>

      <div className="table-panel">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando agenda...</p>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="empty-state">
            <Calendar className="empty-icon" />
            <p>No hay citas agendadas registradas.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Mascota</th>
                    <th>Propietario</th>
                    <th>Médico Veterinario</th>
                    <th>Motivo de Consulta</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((row) => (
                    <tr key={row.id}>
                      <td className="font-semibold">
                        <div className="date-time-col">
                          <span className="date-span">{new Date(row.fechaHora).toLocaleDateString()}</span>
                          <span className="time-span">{new Date(row.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="font-medium text-cyan">{row.mascotaNombre}</td>
                      <td>{row.propietarioNombreCompleto}</td>
                      <td>{row.veterinarioNombreCompleto}</td>
                      <td className="motivo-cell">{row.motivo}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(row.estado)}`}>
                          {row.estado}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          {row.estado === "Agendada" && (
                            <button 
                              onClick={() => handleCancelAppointment(row.id)}
                              className="btn-action-icon cancel"
                              title="Cancelar Cita"
                            >
                              <XCircle />
                            </button>
                          )}
                        </div>
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
                  Página {data.page} de {data.totalPages} ({data.totalCount} citas)
                </span>
                <div className="pagination-buttons">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="btn-page"
                  >
                    Anterior
                  </button>
                  <button 
                    disabled={currentPage === data.totalPages} 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.totalPages))}
                    className="btn-page"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Agendamiento */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Programar Nueva Consulta</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-close-modal">
                <X />
              </button>
            </div>

            {formError && (
              <div className="form-error-alert">
                <AlertCircle className="error-icon" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="appt-pet">Paciente (Mascota) *</label>
                  <select
                    id="appt-pet"
                    value={formData.mascotaId}
                    onChange={(e) => setFormData({ ...formData, mascotaId: e.target.value })}
                    disabled={formLoading}
                    className="form-select"
                  >
                    {petsList.length === 0 ? (
                      <option value="">No hay mascotas activas registradas</option>
                    ) : (
                      petsList.map((pet) => (
                        <option key={pet.id} value={pet.id}>{pet.nombre} (ID: {pet.id})</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="appt-vet">Médico Veterinario *</label>
                  <select
                    id="appt-vet"
                    value={formData.veterinarioId}
                    onChange={(e) => setFormData({ ...formData, veterinarioId: e.target.value })}
                    disabled={formLoading}
                    className="form-select"
                  >
                    {vetsList.length === 0 ? (
                      <option value="">No hay médicos activos registrados</option>
                    ) : (
                      vetsList.map((vet) => (
                        <option key={vet.id} value={vet.id}>{vet.nombreCompleto}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group span-2">
                  <label htmlFor="appt-datetime">Fecha y Hora *</label>
                  <input
                    id="appt-datetime"
                    type="datetime-local"
                    required
                    value={formData.fechaHora}
                    onChange={(e) => setFormData({ ...formData, fechaHora: e.target.value })}
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="appt-reason">Motivo de la Cita *</label>
                  <textarea
                    id="appt-reason"
                    rows={3}
                    required
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    placeholder="ej: Control de vacunas anuales o revisión de peso corporal"
                    disabled={formLoading}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="btn-cancel" 
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={formLoading}>
                  {formLoading ? "Agendando..." : "Confirmar Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .appts-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .appts-header {
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

        .btn-add {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
        }

        .btn-add:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(6, 182, 212, 0.35);
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

        .font-medium {
          font-weight: 500;
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

        .status-badge.status-scheduled {
          background: rgba(6, 182, 212, 0.1);
          color: #06b6d4;
        }

        .status-badge.status-waiting {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .status-badge.status-completed {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-badge.status-cancelled {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .actions-cell {
          display: flex;
          justify-content: center;
        }

        .btn-action-icon {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #94a3b8;
          border-radius: 6px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-action-icon svg {
          width: 15px;
          height: 15px;
        }

        .btn-action-icon:hover.cancel {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
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

        /* Modales */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          width: 100%;
          max-width: 550px;
          padding: 32px;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
          animation: modalFadeIn 0.3s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .modal-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .btn-close-modal {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .btn-close-modal:hover {
          color: #ffffff;
        }

        .form-error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
          color: #fca5a5;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          text-align: left;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group.span-2 {
          grid-column: span 2;
        }

        .form-group label {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 500;
        }

        .form-group input, .form-select, .form-textarea {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 14px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .form-select {
          cursor: pointer;
          height: 40px;
        }

        .form-select option {
          background: #1e293b;
          color: #ffffff;
        }

        .form-textarea {
          resize: none;
        }

        .form-group input:focus, .form-select:focus, .form-textarea:focus {
          border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
        }

        .btn-cancel {
          background: #334155;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background: #475569;
        }

        .btn-save {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
        }

        .btn-save:hover {
          box-shadow: 0 6px 16px rgba(6, 182, 212, 0.35);
        }
      `}</style>
    </div>
  );
};
