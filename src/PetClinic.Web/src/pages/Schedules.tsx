import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Calendar, Clock, User, Plus, CheckCircle, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

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

interface Veterinario {
  id: number;
  nombreCompleto: string;
  especialidad: string;
}

interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  propietarioNombreCompleto: string;
}

export const Schedules: React.FC = () => {
  const { token, user, hasRole } = useAuth();

  // Listas de datos
  const [appointments, setAppointments] = useState<Cita[]>([]);
  const [vetsList, setVetsList] = useState<Veterinario[]>([]);
  const [petsList, setPetsList] = useState<Mascota[]>([]);

  // Selección de Filtros/Vistas
  const [selectedVetId, setSelectedVetId] = useState<string>("");
  const [selectedAuxShift, setSelectedAuxShift] = useState<string>("Turno Mañana (08:00 - 16:00)");

  // Estados comunes
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal de Agendamiento (Solo Veterinario)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMascotaId, setFormMascotaId] = useState("");
  const [formFecha, setFormFecha] = useState("");
  const [formHora, setFormHora] = useState("09:00");
  const [formMotivo, setFormMotivo] = useState("");

  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  // Cargar veterinarios y mascotas al inicio
  useEffect(() => {
    if (!token) return;

    const fetchInitialData = async () => {
      try {
        // 1. Veterinarios
        const vetsRes = await fetch("http://localhost:5210/api/veterinarios", { headers });
        if (vetsRes.ok) {
          const vets = await vetsRes.json();
          setVetsList(vets);
          // Si el usuario es Auxiliar, Administrador o Recepcionista, autoseleccionar el primer veterinario
          if (vets.length > 0) {
            setSelectedVetId(vets[0].id.toString());
          }
        }

        // 2. Mascotas (para agendamiento)
        const petsRes = await fetch("http://localhost:5210/api/mascotas?page=1&pageSize=100", { headers });
        if (petsRes.ok) {
          const pagedPets = await petsRes.json();
          setPetsList(pagedPets.items || []);
        }
      } catch (err) {
        console.error("Error cargando catálogos iniciales:", err);
      }
    };

    fetchInitialData();
  }, [token]);

  // Cargar citas según el veterinario seleccionado o el rol
  const fetchSchedules = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      let url = "http://localhost:5210/api/citas/veterinario";
      
      // Si se selecciona un veterinario en el selector (Auxiliar, Admin, Recepcionista)
      if (selectedVetId && !hasRole("Veterinario")) {
        url = `http://localhost:5210/api/citas/veterinario?veterinarioId=${selectedVetId}`;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      } else {
        throw new Error("No se pudo obtener la agenda de citas.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error al obtener la agenda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedVetId, token]);

  // Agendar nueva cita (Veterinario para sí mismo)
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMascotaId || !formFecha || !formHora || !formMotivo) {
      alert("Por favor complete todos los campos.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Encontrar el VeterinarioId correspondiente al usuario logueado en la lista de veterinarios
    const currentVet = vetsList.find(v => v.nombreCompleto === user?.nombreCompleto);
    if (!currentVet) {
      setErrorMessage("No se encontró su registro de veterinario en el sistema.");
      setSubmitting(false);
      return;
    }

    const proposedDateTime = `${formFecha}T${formHora}:00`;

    try {
      const res = await fetch("http://localhost:5210/api/citas", {
        method: "POST",
        headers,
        body: JSON.stringify({
          mascotaId: parseInt(formMascotaId),
          veterinarioId: currentVet.id,
          fechaHora: proposedDateTime,
          motivo: formMotivo
        })
      });

      if (res.ok) {
        setSuccessMessage("Cita programada con éxito en su horario.");
        setIsModalOpen(false);
        // Reset form
        setFormMascotaId("");
        setFormFecha("");
        setFormHora("09:00");
        setFormMotivo("");
        // Recargar agenda
        fetchSchedules();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "No disponible (superposición detectada).");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Ocurrió un error al agendar la cita.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="schedules-container">
      <div className="schedules-header">
        <div className="title-section">
          <h1>Módulo de Horarios y Agendas</h1>
          <p className="subtitle">Visualización de turnos de enfermería y control de agendas médicas veterinarias</p>
        </div>

        <div className="header-actions">
          <button onClick={fetchSchedules} className="btn-refresh">
            <RefreshCw className="btn-icon" /> Sincronizar Agenda
          </button>
          {hasRole("Veterinario") && (
            <button onClick={() => setIsModalOpen(true)} className="btn-add">
              <Plus className="btn-icon" /> Añadir Cita a mi Horario
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="alert-box success">
          <CheckCircle className="alert-icon" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert-box error">
          <AlertCircle className="alert-icon" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selectores dinámicos basados en Roles */}
      <div className="schedules-filters-panel">
        {/* Auxiliar Clínico: Ve su turno + selector de veterinario */}
        {hasRole("AuxiliarClinico") && (
          <div className="filters-row">
            <div className="filter-group">
              <label>Mi Turno Asignado</label>
              <select 
                value={selectedAuxShift} 
                onChange={(e) => setSelectedAuxShift(e.target.value)}
                className="select-filter"
              >
                <option value="Turno Mañana (08:00 - 16:00)">Turno Mañana (08:00 - 16:00)</option>
                <option value="Turno Tarde (16:00 - 00:00)">Turno Tarde (16:00 - 00:00)</option>
                <option value="Turno Noche (00:00 - 08:00)">Turno Noche (00:00 - 08:00)</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Ver Agenda de Veterinario</label>
              <select 
                value={selectedVetId} 
                onChange={(e) => setSelectedVetId(e.target.value)}
                className="select-filter"
              >
                {vetsList.map(v => (
                  <option key={v.id} value={v.id}>{v.nombreCompleto} ({v.especialidad})</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Administrador / Recepcionista: Selector de veterinario o auxiliar */}
        {(hasRole("Administrador") || hasRole("Recepcionista")) && (
          <div className="filters-row">
            <div className="filter-group">
              <label>Inspeccionar Agenda de Veterinario</label>
              <select 
                value={selectedVetId} 
                onChange={(e) => setSelectedVetId(e.target.value)}
                className="select-filter"
              >
                {vetsList.map(v => (
                  <option key={v.id} value={v.id}>{v.nombreCompleto} ({v.especialidad})</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Inspeccionar Turno de Auxiliar</label>
              <select className="select-filter">
                <option>Auxiliar 1 - Turno Mañana</option>
                <option>Auxiliar 2 - Turno Tarde</option>
                <option>Auxiliar 3 - Turno Noche</option>
              </select>
            </div>
          </div>
        )}

        {/* Veterinario: Informativo de su rol */}
        {hasRole("Veterinario") && (
          <div className="filters-row">
            <div className="role-badge-info">
              <Sparkles className="spark-icon" />
              <span>Mostrando su agenda personal de hoy en adelante. Para añadir citas presione el botón superior.</span>
            </div>
          </div>
        )}
      </div>

      <div className="schedules-content-layout">
        {/* Lado Izquierdo: Cronograma / Lista de citas */}
        <div className="schedule-panel">
          <h2>Cronograma de Citas</h2>
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando citas programadas...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <Calendar className="empty-icon" />
              <p>No hay citas programadas para el veterinario seleccionado.</p>
            </div>
          ) : (
            <div className="appointments-timeline">
              {appointments.map((cita) => (
                <div key={cita.id} className={`timeline-card status-${cita.estado.toLowerCase()}`}>
                  <div className="time-indicator">
                    <Clock className="time-icon" />
                    <span>{new Date(cita.fechaHora).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <div className="appointment-card-body">
                    <h3>{cita.mascotaNombre}</h3>
                    <p className="owner-name">Propietario: {cita.propietarioNombreCompleto}</p>
                    <p className="reason-text"><strong>Motivo:</strong> {cita.motivo}</p>
                    <div className="card-footer-info">
                      <span className="vet-badge">
                        <User className="footer-icon" /> {cita.veterinarioNombreCompleto}
                      </span>
                      <span className={`status-tag ${cita.estado.toLowerCase()}`}>
                        {cita.estado}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lado Derecho: Turno Laboral del Auxiliar o Info adicional */}
        {hasRole("AuxiliarClinico") && (
          <div className="shift-panel">
            <h2>Mi Turno Asignado</h2>
            <div className="shift-card">
              <Clock className="shift-card-icon" />
              <div className="shift-details">
                <h3>{selectedAuxShift}</h3>
                <p>Usted está programado para la asistencia en quirófano, hospitalización y soporte clínico durante este bloque horario.</p>
              </div>
            </div>
            <div className="shift-duties">
              <h4>Responsabilidades de Turno</h4>
              <ul>
                <li>Control de signos vitales de mascotas hospitalizadas.</li>
                <li>Higiene de jaulas y reposición de medicamentos.</li>
                <li>Asistencia inmediata en la cola de consultas médicas.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Modal para añadir citas (Solo Veterinario) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Programar Nueva Cita en mi Horario</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-close-modal">&times;</button>
            </div>
            <form onSubmit={handleCreateAppointment}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Seleccionar Mascota</label>
                  <select 
                    value={formMascotaId} 
                    onChange={(e) => setFormMascotaId(e.target.value)}
                    required
                  >
                    <option value="">-- Seleccionar Mascota --</option>
                    {petsList.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} ({p.especie}) - Prop: {p.propietarioNombreCompleto}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha de la Cita</label>
                    <input 
                      type="date" 
                      value={formFecha} 
                      onChange={(e) => setFormFecha(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Hora de la Cita</label>
                    <input 
                      type="time" 
                      value={formHora} 
                      onChange={(e) => setFormHora(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Motivo de la Cita</label>
                  <textarea 
                    value={formMotivo} 
                    onChange={(e) => setFormMotivo(e.target.value)} 
                    placeholder="Detalle la razón de la consulta o control"
                    rows={3}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel" disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={submitting}>
                  {submitting ? "Programando..." : "Programar Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .schedules-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Outfit', 'Inter', sans-serif;
          color: #f8fafc;
        }

        .schedules-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }

        .schedules-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 6px 0;
          color: #ffffff;
        }

        .subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-refresh, .btn-add, .btn-save {
          background: #06b6d4;
          border: none;
          color: #ffffff;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .btn-refresh:hover, .btn-add:hover, .btn-save:hover {
          background: #0891b2;
        }

        .btn-refresh {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
        }

        .btn-refresh:hover {
          background: #334155;
          color: #ffffff;
        }

        .btn-icon {
          width: 16px;
          height: 16px;
        }

        .alert-box {
          padding: 16px 20px;
          border-radius: 8px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
        }

        .alert-box.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        .alert-box.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .alert-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .schedules-filters-panel {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
        }

        .filters-row {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 280px;
        }

        .filter-group label {
          font-size: 13px;
          font-weight: 500;
          color: #94a3b8;
          text-align: left;
        }

        .select-filter {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 14px;
          color: #f8fafc;
          font-size: 14px;
          outline: none;
        }

        .role-badge-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #06b6d4;
          font-size: 14px;
          font-weight: 500;
        }

        .spark-icon {
          width: 18px;
          height: 18px;
        }

        .schedules-content-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
        }

        @media (max-width: 1024px) {
          .schedules-content-layout {
            grid-template-columns: 1fr;
          }
        }

        .schedule-panel, .shift-panel {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 24px;
          text-align: left;
        }

        .schedule-panel h2, .shift-panel h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 20px 0;
          color: #ffffff;
        }

        .loading-state, .empty-state {
          padding: 80px 20px;
          text-align: center;
          color: #64748b;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 16px;
        }

        .appointments-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .timeline-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-left: 4px solid #64748b;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .timeline-card.status-agendada {
          border-left-color: #3b82f6;
        }

        .timeline-card.status-completada {
          border-left-color: #10b981;
        }

        .timeline-card.status-cancelada {
          border-left-color: #ef4444;
        }

        .time-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #06b6d4;
          font-weight: 600;
          font-size: 13px;
        }

        .time-icon {
          width: 14px;
          height: 14px;
        }

        .appointment-card-body h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 6px 0;
          color: #ffffff;
        }

        .owner-name {
          font-size: 13px;
          color: #94a3b8;
          margin: 0 0 8px 0;
        }

        .reason-text {
          font-size: 14px;
          color: #cbd5e1;
          margin: 0;
        }

        .card-footer-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 12px;
        }

        .vet-badge {
          font-size: 12px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .footer-icon {
          width: 14px;
          height: 14px;
        }

        .status-tag {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .status-tag.agendada { background: rgba(59, 130, 246, 0.1); color: #93c5fd; }
        .status-tag.completada { background: rgba(16, 185, 129, 0.1); color: #a7f3d0; }
        .status-tag.cancelada { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }

        /* Lado Derecho: Turno */
        .shift-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
        }

        .shift-card-icon {
          width: 24px;
          height: 24px;
          color: #a78bfa;
          flex-shrink: 0;
        }

        .shift-details h3 {
          font-size: 15px;
          margin: 0 0 6px 0;
          color: #ffffff;
        }

        .shift-details p {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          line-height: 1.5;
        }

        .shift-duties h4 {
          font-size: 14px;
          color: #ffffff;
          margin: 0 0 12px 0;
        }

        .shift-duties ul {
          margin: 0;
          padding-left: 20px;
          color: #94a3b8;
          font-size: 13px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
          text-align: left;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .modal-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #ffffff;
        }

        .btn-close-modal {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 24px;
          cursor: pointer;
        }

        .modal-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: #94a3b8;
        }

        .form-group select, .form-group input, .form-group textarea {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 14px;
          color: #f8fafc;
          font-size: 14px;
          outline: none;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-cancel {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-cancel:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #ffffff;
        }
      `}</style>
    </div>
  );
};
