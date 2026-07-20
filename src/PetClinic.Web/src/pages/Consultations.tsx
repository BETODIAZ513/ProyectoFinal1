import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Activity, Clock, Stethoscope, CheckSquare, Scale, RefreshCw, ShieldAlert
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

interface WeightRecord {
  id: number;
  fechaRegistro: string;
  pesoKg: number;
}

export const Consultations: React.FC = () => {
  const { token } = useAuth();
  
  const [appointments, setAppointments] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Consulta activa
  const [activeConsultation, setActiveConsultation] = useState<Cita | null>(null);
  
  // Historial de pesos del paciente activo
  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>([]);
  const [weightLoading, setWeightLoading] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [weightError, setWeightError] = useState<string | null>(null);
  const [submittingWeight, setSubmittingWeight] = useState(false);

  // Formulario clínico de cierre de consulta
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [closeError, setCloseError] = useState<string | null>(null);
  const [closeLoading, setCloseLoading] = useState(false);

  const fetchDoctorAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL + "/api/citas/veterinario", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setAppointments(result);
      } else {
        const errResult = await response.json().catch(() => ({}));
        throw new Error(errResult.message || `Error del servidor (${response.status}).`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al sincronizar las consultas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, [token]);

  const fetchWeightHistory = async (petId: number) => {
    setWeightLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/mascotas/${petId}/pesos`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setWeightHistory(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWeightLoading(false);
    }
  };

  const handleStartConsultation = async (appt: Cita) => {
    setActiveConsultation(appt);
    setNewWeight("");
    setWeightError(null);
    setDiagnosis("");
    setTreatment("");
    setAdditionalNotes("");
    setCloseError(null);
    await fetchWeightHistory(appt.mascotaId);
  };

  const handleAddWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || !activeConsultation) return;

    const weightVal = parseFloat(newWeight);
    if (isNaN(weightVal) || weightVal <= 0) {
      setWeightError("El peso debe ser mayor a 0 kg.");
      return;
    }

    setSubmittingWeight(true);
    setWeightError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/mascotas/${activeConsultation.mascotaId}/pesos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          pesoKg: weightVal,
          fechaRegistro: new Date().toISOString().split("T")[0],
          mascotaId: activeConsultation.mascotaId
        })
      });

      if (!response.ok) {
        const errResult = await response.json();
        throw new Error(errResult.message || "Error al registrar el peso.");
      }

      setNewWeight("");
      await fetchWeightHistory(activeConsultation.mascotaId);
    } catch (err: any) {
      setWeightError(err.message || "Error de red.");
    } finally {
      setSubmittingWeight(false);
    }
  };

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConsultation) return;

    if (!diagnosis || !treatment) {
      setCloseError("Por favor, ingrese el Diagnóstico y Tratamiento clínico.");
      return;
    }

    setCloseLoading(true);
    setCloseError(null);

    try {
      const response = await fetch(API_BASE_URL + "/api/consultas-detalles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          citaId: activeConsultation.id,
          mascotaId: activeConsultation.mascotaId,
          veterinarioId: activeConsultation.veterinarioId,
          diagnostico: diagnosis,
          tratamiento: treatment,
          notasAdicionales: additionalNotes
        })
      });

      if (!response.ok) {
        const errResult = await response.json();
        throw new Error(errResult.message || "Error al guardar el expediente.");
      }

      setActiveConsultation(null);
      await fetchDoctorAppointments();
    } catch (err: any) {
      setCloseError(err.message || "Error de conexión.");
    } finally {
      setCloseLoading(false);
    }
  };

  return (
    <div className="consults-container">
      <div className="consults-header">
        <div className="title-section">
          <h1>Bandeja de Consultas Clínicas</h1>
          <p className="subtitle">Agenda de pacientes asignados, cola de espera de consultorio y ficha médica activa</p>
        </div>
        <button onClick={fetchDoctorAppointments} className="btn-refresh">
          <RefreshCw className="btn-icon" /> Sincronizar Cola
        </button>
      </div>

      <div className="consults-layout">
        {/* Lado izquierdo: Lista de citas */}
        <div className="appointments-panel">
          <div className="panel-header">
            <Clock className="panel-icon" />
            <h2>Citas de Hoy y Futuras</h2>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando pacientes asignados...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <ShieldAlert className="empty-icon" />
              <p>No tienes consultas asignadas para hoy.</p>
            </div>
          ) : (
            <div className="appointments-list">
              {appointments.map((appt) => (
                <div 
                  key={appt.id} 
                  className={`appt-card ${activeConsultation?.id === appt.id ? "active" : ""} ${appt.estado === "Completada" ? "completed" : ""}`}
                >
                  <div className="card-top">
                    <span className="appt-time">
                      {new Date(appt.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`status-tag ${appt.estado === "En Espera" ? "waiting" : appt.estado === "Completada" ? "completed" : "scheduled"}`}>
                      {appt.estado}
                    </span>
                  </div>
                  
                  <div className="card-middle">
                    <h3 className="pet-name">{appt.mascotaNombre}</h3>
                    <p className="owner-name">Dueño: {appt.propietarioNombreCompleto}</p>
                    <p className="reason-text">"{appt.motivo}"</p>
                  </div>

                  <div className="card-bottom">
                    {appt.estado !== "Completada" && appt.estado !== "Cancelada" && (
                      <button 
                        onClick={() => handleStartConsultation(appt)}
                        className="btn-start"
                      >
                        <Stethoscope className="btn-small-icon" /> Iniciar Atención
                      </button>
                    )}
                    {appt.estado === "Completada" && (
                      <span className="done-label">Consulta Finalizada</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lado derecho: Ficha médica de consulta activa */}
        <div className="active-chart-panel">
          {activeConsultation ? (
            <form onSubmit={handleCompleteConsultation} className="chart-wrapper">
              <div className="chart-header">
                <Activity className="chart-icon" />
                <div>
                  <h2>Consulta Activa: {activeConsultation.mascotaNombre}</h2>
                  <p>Propietario: {activeConsultation.propietarioNombreCompleto}</p>
                </div>
              </div>

              {closeError && (
                <div className="error-alert">
                  <span>{closeError}</span>
                </div>
              )}

              <div className="chart-body">
                <div className="clinical-notes-card">
                  <h3>Detalles del Motivo</h3>
                  <div className="notes-display">
                    {activeConsultation.motivo}
                  </div>
                </div>

                {/* Formulario Clínico de Bitácora */}
                <div className="clinical-inputs-card">
                  <h3>Bitácora Médica de la Consulta</h3>
                  
                  <div className="form-group-field">
                    <label>Diagnóstico Veterinario *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Ingrese el diagnóstico clínico estructurado..."
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      disabled={closeLoading}
                      className="form-input-text"
                    />
                  </div>

                  <div className="form-group-field">
                    <label>Tratamiento y Receta *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Prescriba los medicamentos y recomendaciones..."
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                      disabled={closeLoading}
                      className="form-input-text"
                    />
                  </div>

                  <div className="form-group-field">
                    <label>Notas Adicionales (Opcional)</label>
                    <textarea
                      rows={2}
                      placeholder="Indicaciones secundarias..."
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      disabled={closeLoading}
                      className="form-input-text"
                    />
                  </div>
                </div>

                {/* Historial y registro de pesos integrado */}
                <div className="weight-record-card">
                  <div className="card-sub-header">
                    <Scale className="weight-icon" />
                    <h3>Indicador Clínico: Registro de Peso</h3>
                  </div>

                  {/* Formulario rápido de peso */}
                  <div className="mini-weight-form">
                    <div className="weight-input-row">
                      <div className="input-with-unit">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Nuevo peso (ej: 9.8)"
                          value={newWeight}
                          onChange={(e) => setNewWeight(e.target.value)}
                          disabled={submittingWeight || closeLoading}
                        />
                        <span className="unit-tag">kg</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleAddWeightSubmit} 
                        className="btn-save-weight" 
                        disabled={submittingWeight || closeLoading || !newWeight}
                      >
                        {submittingWeight ? "..." : "Registrar"}
                      </button>
                    </div>
                    {weightError && <p className="error-text">{weightError}</p>}
                  </div>

                  {/* Historial de pesos */}
                  <div className="weights-history-list">
                    {weightLoading ? (
                      <p className="loading-txt">Obteniendo registros corporales...</p>
                    ) : weightHistory.length === 0 ? (
                      <p className="no-weights-txt">No se han registrado pesos anteriormente.</p>
                    ) : (
                      <table className="weights-table">
                        <thead>
                          <tr>
                            <th>Fecha de Medición</th>
                            <th className="text-right">Peso</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weightHistory.map((w) => (
                            <tr key={w.id}>
                              <td>{new Date(w.fechaRegistro).toLocaleDateString()}</td>
                              <td className="text-right font-bold">{w.pesoKg.toFixed(2)} kg</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

              <div className="chart-footer">
                <button 
                  type="submit"
                  className="btn-complete-appt"
                  disabled={closeLoading}
                >
                  <CheckSquare className="btn-small-icon" /> {closeLoading ? "Cerrando Consulta..." : "Finalizar Consulta Médica"}
                </button>
              </div>
            </form>
          ) : (
            <div className="no-active-consultation">
              <Stethoscope className="big-stethoscope-icon" />
              <h3>Ningún Expediente Clínico Seleccionado</h3>
              <p>Seleccione un paciente de la lista de citas para iniciar su consulta veterinaria e incorporar indicadores clínicos.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .consults-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .consults-header {
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

        .consults-layout {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 30px;
          text-align: left;
        }

        .appointments-panel {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 12px;
        }

        .panel-icon {
          color: #06b6d4;
          width: 18px;
          height: 18px;
        }

        .panel-header h2 {
          font-size: 16px;
          color: #ffffff;
          margin: 0;
        }

        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 600px;
          overflow-y: auto;
        }

        .appt-card {
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s ease;
        }

        .appt-card.active {
          border-color: #06b6d4;
          background: rgba(6, 182, 212, 0.04);
        }

        .appt-card.completed {
          opacity: 0.6;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .appt-time {
          font-weight: 700;
          color: #06b6d4;
          font-size: 14px;
        }

        .status-tag {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 12px;
          text-transform: uppercase;
        }

        .status-tag.waiting {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .status-tag.completed {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-tag.scheduled {
          background: rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
        }

        .card-middle {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pet-name {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .owner-name {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .reason-text {
          font-size: 12px;
          color: #94a3b8;
          font-style: italic;
          margin: 6px 0 0 0;
        }

        .btn-start {
          background: #334155;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          justify-content: center;
          width: 100%;
        }

        .btn-start:hover {
          background: #06b6d4;
          border-color: #06b6d4;
        }

        .done-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }

        .active-chart-panel {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 24px;
          min-height: 500px;
          display: flex;
        }

        .no-active-consultation {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
          text-align: center;
          padding: 40px;
        }

        .big-stethoscope-icon {
          width: 60px;
          height: 60px;
          color: #334155;
          margin-bottom: 16px;
        }

        .no-active-consultation h3 {
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .no-active-consultation p {
          font-size: 14px;
          max-width: 400px;
          margin: 0;
          line-height: 1.5;
        }

        .chart-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .chart-header {
          display: flex;
          align-items: center;
          gap: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 16px;
        }

        .chart-icon {
          width: 32px;
          height: 32px;
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 8px;
          padding: 6px;
          box-sizing: border-box;
        }

        .chart-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 2px 0;
        }

        .chart-header p {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
        }

        .chart-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .clinical-notes-card, .clinical-inputs-card, .weight-record-card {
          background: rgba(15, 23, 42, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          padding: 20px;
        }

        .clinical-notes-card h3, .clinical-inputs-card h3, .card-sub-header h3 {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 12px 0;
        }

        .notes-display {
          font-size: 14px;
          color: #cbd5e1;
          background: rgba(15, 23, 42, 0.4);
          border-radius: 6px;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          line-height: 1.5;
        }

        .form-group-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }

        .form-group-field label {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 500;
        }

        .form-input-text {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 14px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          resize: none;
          font-family: inherit;
        }

        .form-input-text:focus {
          border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
        }

        .card-sub-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .weight-icon {
          color: #06b6d4;
          width: 16px;
          height: 16px;
        }

        .card-sub-header h3 {
          margin: 0;
        }

        .mini-weight-form {
          margin-bottom: 16px;
        }

        .weight-input-row {
          display: flex;
          gap: 10px;
        }

        .input-with-unit {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
        }

        .input-with-unit input {
          width: 100%;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 40px 10px 14px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
        }

        .unit-tag {
          position: absolute;
          right: 12px;
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
        }

        .btn-save-weight {
          background: #334155;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-save-weight:hover {
          background: #475569;
        }

        .error-text {
          font-size: 12px;
          color: #ef4444;
          margin-top: 6px;
        }

        .weights-history-list {
          max-height: 160px;
          overflow-y: auto;
          background: rgba(15, 23, 42, 0.4);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .weights-table {
          width: 100%;
          border-collapse: collapse;
        }

        .weights-table th {
          padding: 8px 12px;
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .weights-table td {
          padding: 8px 12px;
          font-size: 13px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          color: #cbd5e1;
        }

        .font-bold {
          font-weight: 700;
          color: #ffffff;
        }

        .text-right {
          text-align: right;
        }

        .loading-txt, .no-weights-txt {
          font-size: 12px;
          color: #64748b;
          text-align: center;
          padding: 16px 0;
        }

        .chart-footer {
          margin-top: auto;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 20px;
        }

        .btn-complete-appt {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .btn-complete-appt:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
        }

        .btn-small-icon {
          width: 16px;
          height: 16px;
        }
      `}</style>
    </div>
  );
};
