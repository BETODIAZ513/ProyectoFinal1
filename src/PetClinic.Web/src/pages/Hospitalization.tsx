import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, Activity, CheckCircle2, X, 
  AlertCircle, RefreshCw, Layers, ShieldCheck
} from "lucide-react";

interface Hospitalizacion {
  id: number;
  mascotaId: number;
  mascotaNombre: string;
  especie: string;
  raza: string;
  sexo: string;
  fechaIngreso: string;
  motivo: string;
  estado: string; // Internado, Alta
  numeroJaula: string;
}

interface MonitoreoClinico {
  id: number;
  hospitalizacionId: number;
  fechaHora: string;
  frecuenciaCardiaca: number;
  frecuenciaRespiratoria: number;
  temperatura: number;
  estadoAlerta: string;
  medicamentosAdministrados: string;
  notasMonitoreo: string;
  registradoPor: string;
}

interface Pet {
  id: number;
  nombre: string;
}

export const Hospitalization: React.FC = () => {
  const { token, hasRole } = useAuth();
  
  const [activeAdmissions, setActiveAdmissions] = useState<Hospitalizacion[]>([]);
  const [loading, setLoading] = useState(false);

  // Mascota hospitalizada seleccionada (para ver telemetría de monitoreo)
  const [selectedHosp, setSelectedHosp] = useState<Hospitalizacion | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<MonitoreoClinico[]>([]);
  const [loadingVitals, setLoadingVitals] = useState(false);

  // Catálogo de mascotas libres
  const [petsList, setPetsList] = useState<Pet[]>([]);

  // Modal Admisión
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [admitData, setAdmitData] = useState({ mascotaId: "", motivo: "", numeroJaula: "" });
  const [admitError, setAdmitError] = useState<string | null>(null);
  const [admitLoading, setAdmitLoading] = useState(false);

  // Modal Monitoreo
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [vitalsData, setVitalsData] = useState({
    frecuenciaCardiaca: "80",
    frecuenciaRespiratoria: "20",
    temperatura: "38.5",
    estadoAlerta: "Alerta",
    medicamentosAdministrados: "",
    notasMonitoreo: ""
  });
  const [vitalsError, setVitalsError] = useState<string | null>(null);
  const [vitalsLoading, setVitalsLoading] = useState(false);

  const isVetOrAdmin = hasRole(["Administrador", "Veterinario"]);

  const fetchActiveAdmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5210/api/hospitalizaciones", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setActiveAdmissions(result);
        
        // Mantener la selección actualizada si procede
        if (selectedHosp) {
          const updated = result.find((h: Hospitalizacion) => h.id === selectedHosp.id);
          if (updated) {
            setSelectedHosp(updated);
          } else {
            setSelectedHosp(null);
            setVitalsHistory([]);
          }
        }
      } else {
        const errResult = await response.json().catch(() => ({}));
        throw new Error(errResult.message || `Error del servidor (${response.status}).`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al sincronizar el monitor de hospitalizados.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVitalsHistory = async (hospId: number) => {
    setLoadingVitals(true);
    try {
      const response = await fetch(`http://localhost:5210/api/hospitalizaciones/${hospId}/monitoreos`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setVitalsHistory(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVitals(false);
    }
  };

  const fetchPetsCatalog = async () => {
    try {
      const response = await fetch("http://localhost:5210/api/mascotas?pageSize=100", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setPetsList(result.items.filter((p: any) => p.activo));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchActiveAdmissions();
    fetchPetsCatalog();
  }, [token]);

  const handleSelectAdmission = async (hosp: Hospitalizacion) => {
    setSelectedHosp(hosp);
    await fetchVitalsHistory(hosp.id);
  };

  const handleOpenAdmitModal = () => {
    // Filtrar mascotas que no estén hospitalizadas ya
    const hospitalizedPetIds = activeAdmissions.map(a => a.mascotaId);
    const availablePets = petsList.filter(p => !hospitalizedPetIds.includes(p.id));

    setAdmitData({
      mascotaId: availablePets[0]?.id.toString() || "",
      motivo: "",
      numeroJaula: ""
    });
    setAdmitError(null);
    setIsAdmitModalOpen(true);
  };

  const handleAdmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitData.mascotaId || !admitData.motivo || !admitData.numeroJaula) {
      setAdmitError("Todos los campos de admisión son obligatorios.");
      return;
    }

    setAdmitLoading(true);
    setAdmitError(null);

    try {
      const response = await fetch("http://localhost:5210/api/hospitalizaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          mascotaId: parseInt(admitData.mascotaId),
          motivo: admitData.motivo,
          numeroJaula: admitData.numeroJaula
        })
      });

      if (!response.ok) {
        const errResult = await response.json();
        throw new Error(errResult.message || "Error al procesar el ingreso.");
      }

      setIsAdmitModalOpen(false);
      await fetchActiveAdmissions();
    } catch (err: any) {
      setAdmitError(err.message || "Error de red.");
    } finally {
      setAdmitLoading(false);
    }
  };

  const handleDischarge = async (hospId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Está seguro de firmar el alta clínica para esta mascota? Esto liberará su jaula.")) return;

    try {
      const response = await fetch(`http://localhost:5210/api/hospitalizaciones/${hospId}/alta`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        const errResult = await response.json();
        throw new Error(errResult.message || "Error al procesar el alta.");
      }

      if (selectedHosp?.id === hospId) {
        setSelectedHosp(null);
        setVitalsHistory([]);
      }
      await fetchActiveAdmissions();
    } catch (err: any) {
      alert(err.message || "Error de conexión.");
    }
  };

  const handleOpenVitalsModal = (hosp: Hospitalizacion, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedHosp(hosp);
    setVitalsData({
      frecuenciaCardiaca: "80",
      frecuenciaRespiratoria: "20",
      temperatura: "38.5",
      estadoAlerta: "Alerta",
      medicamentosAdministrados: "",
      notesMonitoreo: "" // compatible
    } as any);
    setVitalsError(null);
    setIsVitalsModalOpen(true);
  };

  const handleVitalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHosp) return;

    const fc = parseInt(vitalsData.frecuenciaCardiaca);
    const fr = parseInt(vitalsData.frecuenciaRespiratoria);
    const temp = parseFloat(vitalsData.temperatura);

    if (isNaN(fc) || isNaN(fr) || isNaN(temp)) {
      setVitalsError("Por favor, ingrese constantes biológicas válidas.");
      return;
    }

    setVitalsLoading(true);
    setVitalsError(null);

    try {
      const response = await fetch("http://localhost:5210/api/hospitalizaciones/monitoreos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          hospitalizacionId: selectedHosp.id,
          frecuenciaCardiaca: fc,
          frecuenciaRespiratoria: fr,
          temperatura: temp,
          estadoAlerta: vitalsData.estadoAlerta,
          medicamentosAdministrados: vitalsData.medicamentosAdministrados,
          notasMonitoreo: (vitalsData as any).notasMonitoreo || "",
          registradoPor: "Clínico"
        })
      });

      if (!response.ok) {
        const errResult = await response.json();
        throw new Error(errResult.message || "Error al registrar signos vitales.");
      }

      setIsVitalsModalOpen(false);
      await fetchVitalsHistory(selectedHosp.id);
    } catch (err: any) {
      setVitalsError(err.message || "Error de red.");
    } finally {
      setVitalsLoading(false);
    }
  };

  // Filtrar de nuevo las mascotas libres para el modal de admisión
  const hospitalizedPetIds = activeAdmissions.map(a => a.mascotaId);
  const availablePets = petsList.filter(p => !hospitalizedPetIds.includes(p.id));

  return (
    <div className="hosp-container">
      <div className="hosp-header">
        <div className="title-section">
          <h1>Monitor de Pacientes Hospitalizados</h1>
          <p className="subtitle">Gestión clínica de ingresos a jaulas, altas médicas y registro periódico de telemetría de signos vitales</p>
        </div>

        <div className="header-actions">
          <button onClick={fetchActiveAdmissions} className="btn-refresh">
            <RefreshCw className="btn-icon" /> Sincronizar Monitor
          </button>
          {isVetOrAdmin && (
            <button onClick={handleOpenAdmitModal} className="btn-add">
              <Plus className="btn-icon" /> Hospitalizar Paciente
            </button>
          )}
        </div>
      </div>

      <div className="hosp-layout">
        {/* Lado izquierdo: Lista de ingresados */}
        <div className="admissions-panel">
          <div className="panel-header">
            <Layers className="panel-icon" />
            <h2>Pacientes Internados</h2>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando pacientes hospitalizados...</p>
            </div>
          ) : activeAdmissions.length === 0 ? (
            <div className="empty-state">
              <ShieldCheck className="empty-icon" />
              <p>No se reportan pacientes hospitalizados en este momento.</p>
            </div>
          ) : (
            <div className="admissions-list">
              {activeAdmissions.map((admission) => (
                <div 
                  key={admission.id} 
                  onClick={() => handleSelectAdmission(admission)}
                  className={`admission-card ${selectedHosp?.id === admission.id ? "active" : ""}`}
                >
                  <div className="card-top">
                    <span className="cage-badge">Jaula {admission.numeroJaula}</span>
                    <span className="entry-date">
                      Ingreso: {new Date(admission.fechaIngreso).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="card-middle">
                    <h3 className="pet-name">{admission.mascotaNombre}</h3>
                    <p className="pet-breed">{admission.especie} - {admission.raza} ({admission.sexo})</p>
                    <p className="reason-text">"{admission.motivo}"</p>
                  </div>

                  <div className="card-bottom">
                    <button 
                      onClick={(e) => handleOpenVitalsModal(admission, e)}
                      className="btn-vitals-quick"
                    >
                      <Activity className="btn-small-icon" /> Registrar Constantes
                    </button>
                    {isVetOrAdmin && (
                      <button 
                        onClick={(e) => handleDischarge(admission.id, e)}
                        className="btn-discharge-quick"
                      >
                        <CheckCircle2 className="btn-small-icon" /> Alta
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lado derecho: Telemetría de monitoreos */}
        <div className="telemetry-panel">
          {selectedHosp ? (
            <div className="telemetry-wrapper">
              <div className="telemetry-header">
                <Activity className="telemetry-icon" />
                <div>
                  <h2>Evolución Clínica: {selectedHosp.mascotaNombre}</h2>
                  <p>Jaula asignada: {selectedHosp.numeroJaula} | Motivo: {selectedHosp.motivo}</p>
                </div>
              </div>

              {loadingVitals ? (
                <div className="loading-vitals-state">
                  <div className="spinner"></div>
                  <p>Obteniendo telemetría del paciente...</p>
                </div>
              ) : vitalsHistory.length === 0 ? (
                <div className="no-vitals">
                  <AlertCircle className="no-vitals-icon" />
                  <p>No se registran monitoreos clínicos previos para este internamiento.</p>
                  <button 
                    onClick={(e) => handleOpenVitalsModal(selectedHosp, e)}
                    className="btn-vitals-init"
                  >
                    Registrar Primer Monitoreo
                  </button>
                </div>
              ) : (
                <div className="vitals-timeline-wrapper">
                  <h3>Historial de Telemetría (Signos Vitales)</h3>
                  <div className="vitals-timeline">
                    {vitalsHistory.map((item) => (
                      <div key={item.id} className="timeline-node">
                        <div className="node-marker"></div>
                        <div className="node-content">
                          <div className="node-header">
                            <span className="node-date">
                              {new Date(item.fechaHora).toLocaleDateString()} - {new Date(item.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="node-author">Por: {item.registradoPor}</span>
                          </div>

                          <div className="vitals-metrics-row">
                            <div className="metric-pill temp">
                              <span className="metric-label">Temp:</span>
                              <span className="metric-val">{item.temperatura.toFixed(1)} °C</span>
                            </div>
                            <div className="metric-pill heart">
                              <span className="metric-label">FC:</span>
                              <span className="metric-val">{item.frecuenciaCardiaca} lpm</span>
                            </div>
                            <div className="metric-pill resp">
                              <span className="metric-label">FR:</span>
                              <span className="metric-val">{item.frecuenciaRespiratoria} rpm</span>
                            </div>
                            <div className={`metric-pill alert-status ${item.estadoAlerta.toLowerCase()}`}>
                              <span className="metric-label">Alerta:</span>
                              <span className="metric-val">{item.estadoAlerta}</span>
                            </div>
                          </div>

                          {item.medicamentosAdministrados && (
                            <div className="metric-note">
                              <span className="note-title">Medicamentos:</span>
                              <p className="note-body">{item.medicamentosAdministrados}</p>
                            </div>
                          )}

                          {item.notasMonitoreo && (
                            <div className="metric-note">
                              <span className="note-title">Observaciones:</span>
                              <p className="note-body">"{item.notasMonitoreo}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-active-hosp">
              <Activity className="big-telemetry-icon" />
              <h3>Ningún Registro de Hospitalización Seleccionado</h3>
              <p>Seleccione un paciente de la lista izquierda para cargar su ficha evolutiva de signos vitales y telemetría de monitoreo.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Admisión */}
      {isAdmitModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Hospitalizar Paciente</h2>
              <button onClick={() => setIsAdmitModalOpen(false)} className="btn-close-modal">
                <X />
              </button>
            </div>

            {admitError && (
              <div className="form-error-alert">
                <AlertCircle className="error-icon" />
                <span>{admitError}</span>
              </div>
            )}

            <form onSubmit={handleAdmitSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group span-2">
                  <label htmlFor="admit-pet">Mascota (Paciente) *</label>
                  <select
                    id="admit-pet"
                    value={admitData.mascotaId}
                    onChange={(e) => setAdmitData({ ...admitData, mascotaId: e.target.value })}
                    disabled={admitLoading}
                    className="form-select"
                  >
                    {availablePets.length === 0 ? (
                      <option value="">No hay mascotas libres disponibles</option>
                    ) : (
                      availablePets.map((pet) => (
                        <option key={pet.id} value={pet.id}>{pet.nombre}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group span-2">
                  <label htmlFor="admit-cage">Número de Jaula Asignada *</label>
                  <input
                    id="admit-cage"
                    type="text"
                    required
                    value={admitData.numeroJaula}
                    onChange={(e) => setAdmitData({ ...admitData, numeroJaula: e.target.value })}
                    placeholder="ej: Jaula A-3"
                    disabled={admitLoading}
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="admit-reason">Motivo de Hospitalización *</label>
                  <textarea
                    id="admit-reason"
                    rows={3}
                    required
                    value={admitData.motivo}
                    onChange={(e) => setAdmitData({ ...admitData, motivo: e.target.value })}
                    placeholder="ej: Monitoreo post-quirúrgico por extirpación de quiste..."
                    disabled={admitLoading}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setIsAdmitModalOpen(false)} 
                  className="btn-cancel" 
                  disabled={admitLoading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={admitLoading || availablePets.length === 0}>
                  {admitLoading ? "Ingresando..." : "Registrar Ingreso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Monitoreo Signos Vitales */}
      {isVitalsModalOpen && selectedHosp && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Monitoreo de Signos Vitales: {selectedHosp.mascotaNombre}</h2>
              <button onClick={() => setIsVitalsModalOpen(false)} className="btn-close-modal">
                <X />
              </button>
            </div>

            {vitalsError && (
              <div className="form-error-alert">
                <AlertCircle className="error-icon" />
                <span>{vitalsError}</span>
              </div>
            )}

            <form onSubmit={handleVitalsSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="vital-temp">Temperatura (°C) *</label>
                  <input
                    id="vital-temp"
                    type="number"
                    step="0.1"
                    required
                    value={vitalsData.temperatura}
                    onChange={(e) => setVitalsData({ ...vitalsData, temperatura: e.target.value })}
                    placeholder="ej: 38.5"
                    disabled={vitalsLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="vital-fc">Frec. Cardíaca (lpm) *</label>
                  <input
                    id="vital-fc"
                    type="number"
                    required
                    value={vitalsData.frecuenciaCardiaca}
                    onChange={(e) => setVitalsData({ ...vitalsData, frecuenciaCardiaca: e.target.value })}
                    placeholder="ej: 80"
                    disabled={vitalsLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="vital-fr">Frec. Respiratoria (rpm) *</label>
                  <input
                    id="vital-fr"
                    type="number"
                    required
                    value={vitalsData.frecuenciaRespiratoria}
                    onChange={(e) => setVitalsData({ ...vitalsData, frecuenciaRespiratoria: e.target.value })}
                    placeholder="ej: 20"
                    disabled={vitalsLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="vital-alert">Estado de Alerta *</label>
                  <select
                    id="vital-alert"
                    value={vitalsData.estadoAlerta}
                    onChange={(e) => setVitalsData({ ...vitalsData, estadoAlerta: e.target.value })}
                    disabled={vitalsLoading}
                    className="form-select"
                  >
                    <option value="Alerta">Alerta (Normal)</option>
                    <option value="Deprimido">Deprimido</option>
                    <option value="Estuporoso">Estuporoso</option>
                    <option value="Comatoso">Comatoso</option>
                  </select>
                </div>

                <div className="form-group span-2">
                  <label htmlFor="vital-meds">Medicamentos Administrados</label>
                  <input
                    id="vital-meds"
                    type="text"
                    value={vitalsData.medicamentosAdministrados}
                    onChange={(e) => setVitalsData({ ...vitalsData, medicamentosAdministrados: e.target.value })}
                    placeholder="ej: Cefalotina 1ml endovenosa"
                    disabled={vitalsLoading}
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="vital-notes">Observaciones y Comentarios</label>
                  <textarea
                    id="vital-notes"
                    rows={2}
                    value={(vitalsData as any).notasMonitoreo || ""}
                    onChange={(e) => setVitalsData({ ...vitalsData, notasMonitoreo: e.target.value } as any)}
                    placeholder="ej: El paciente come por sus propios medios, ánimo mejorado..."
                    disabled={vitalsLoading}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setIsVitalsModalOpen(false)} 
                  className="btn-cancel" 
                  disabled={vitalsLoading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={vitalsLoading}>
                  {vitalsLoading ? "Guardando..." : "Guardar Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .hosp-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .hosp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 35px;
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

        .header-actions {
          display: flex;
          gap: 12px;
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

        .hosp-layout {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 30px;
          text-align: left;
        }

        .admissions-panel {
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

        .admissions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 600px;
          overflow-y: auto;
        }

        .admission-card {
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admission-card:hover {
          border-color: rgba(6, 182, 212, 0.5);
        }

        .admission-card.active {
          border-color: #06b6d4;
          background: rgba(6, 182, 212, 0.04);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cage-badge {
          background: rgba(6, 182, 212, 0.15);
          color: #06b6d4;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .entry-date {
          font-size: 12px;
          color: #64748b;
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

        .pet-breed {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .reason-text {
          font-size: 12px;
          color: #cbd5e1;
          margin: 6px 0 0 0;
          font-style: italic;
          line-height: 1.4;
        }

        .card-bottom {
          display: flex;
          gap: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 10px;
        }

        .btn-vitals-quick {
          flex: 1;
          background: #334155;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          justify-content: center;
        }

        .btn-vitals-quick:hover {
          background: #06b6d4;
          border-color: #06b6d4;
        }

        .btn-discharge-quick {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-discharge-quick:hover {
          background: #10b981;
          color: #ffffff;
        }

        .btn-small-icon {
          width: 14px;
          height: 14px;
        }

        .telemetry-panel {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 24px;
          min-height: 500px;
          display: flex;
        }

        .no-active-hosp {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
          text-align: center;
          padding: 40px;
        }

        .big-telemetry-icon {
          width: 60px;
          height: 60px;
          color: #334155;
          margin-bottom: 16px;
        }

        .no-active-hosp h3 {
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .no-active-hosp p {
          font-size: 14px;
          max-width: 400px;
          margin: 0;
          line-height: 1.5;
        }

        .telemetry-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .telemetry-header {
          display: flex;
          align-items: center;
          gap: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 16px;
        }

        .telemetry-icon {
          width: 32px;
          height: 32px;
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 8px;
          padding: 6px;
          box-sizing: border-box;
        }

        .telemetry-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 2px 0;
        }

        .telemetry-header p {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .loading-vitals-state, .no-vitals {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
          text-align: center;
          padding: 40px;
        }

        .no-vitals-icon {
          width: 44px;
          height: 44px;
          color: #334155;
          margin-bottom: 12px;
        }

        .btn-vitals-init {
          margin-top: 14px;
          background: #06b6d4;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .vitals-timeline-wrapper {
          text-align: left;
        }

        .vitals-timeline-wrapper h3 {
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          margin: 0 0 16px 0;
          letter-spacing: 0.5px;
        }

        .vitals-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-height: 450px;
          overflow-y: auto;
          padding-left: 8px;
        }

        .vitals-timeline .timeline-node {
          position: relative;
          padding-left: 20px;
          border-left: 2px solid rgba(255, 255, 255, 0.05);
        }

        .vitals-timeline .node-marker {
          position: absolute;
          left: -6px;
          top: 4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #06b6d4;
          border: 2px solid #1e293b;
        }

        .vitals-timeline .node-content {
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          padding: 14px;
        }

        .vitals-timeline .node-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 6px;
          margin-bottom: 10px;
          font-size: 12px;
        }

        .vitals-timeline .node-date {
          color: #06b6d4;
          font-weight: 700;
        }

        .vitals-timeline .node-author {
          color: #64748b;
          font-weight: 600;
        }

        .vitals-metrics-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
        }

        .metric-pill {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 2px 10px;
          font-size: 12px;
          display: flex;
          gap: 4px;
        }

        .metric-pill .metric-label {
          color: #64748b;
          font-weight: 600;
        }

        .metric-pill .metric-val {
          color: #ffffff;
          font-weight: 700;
        }

        .metric-pill.temp {
          border-color: rgba(6, 182, 212, 0.2);
        }
        .metric-pill.temp .metric-val { color: #06b6d4; }

        .metric-pill.heart {
          border-color: rgba(239, 68, 68, 0.2);
        }
        .metric-pill.heart .metric-val { color: #ef4444; }

        .metric-pill.alert-status.alerta {
          border-color: rgba(16, 185, 129, 0.2);
        }
        .metric-pill.alert-status.alerta .metric-val { color: #10b981; }

        .metric-pill.alert-status.deprimido {
          border-color: rgba(245, 158, 11, 0.2);
        }
        .metric-pill.alert-status.deprimido .metric-val { color: #f59e0b; }

        .metric-note {
          background: rgba(15, 23, 42, 0.4);
          border-radius: 6px;
          padding: 8px 12px;
          border: 1px solid rgba(255, 255, 255, 0.03);
          margin-top: 6px;
        }

        .note-title {
          display: block;
          font-size: 10px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
        }

        .note-body {
          font-size: 12px;
          color: #cbd5e1;
          margin: 2px 0 0 0;
          line-height: 1.4;
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
          max-width: 500px;
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
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
          color: #fca5a5;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
        }

        .error-icon {
          width: 16px;
          height: 16px;
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
          font-family: inherit;
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
