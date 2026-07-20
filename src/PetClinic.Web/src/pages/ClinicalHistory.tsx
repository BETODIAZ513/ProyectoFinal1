import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Search, Dog, User, Calendar, Award, 
  Scale, FileText, ClipboardList
} from "lucide-react";

interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  fechaNacimiento: string;
  sexo: string;
  color: string;
  propietarioId: number;
  propietarioNombreCompleto: string;
  activo: boolean;
}

interface DetalleConsulta {
  id: number;
  citaId: number;
  mascotaId: number;
  veterinarioId: number;
  veterinarioNombreCompleto: string;
  fechaAtencion: string;
  diagnostico: string;
  tratamiento: string;
  notasAdicionales: string;
}

interface WeightRecord {
  id: number;
  fechaRegistro: string;
  pesoKg: number;
}

export const ClinicalHistory: React.FC = () => {
  const { token } = useAuth();
  
  // Buscador de mascotas
  const [searchTerm, setSearchTerm] = useState("");
  const [petsList, setPetsList] = useState<Mascota[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  
  // Mascota seleccionada
  const [selectedPet, setSelectedPet] = useState<Mascota | null>(null);
  
  // Expediente de la mascota seleccionada
  const [history, setHistory] = useState<DetalleConsulta[]>([]);
  const [weights, setWeights] = useState<WeightRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const searchPets = async (term: string) => {
    setLoadingPets(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/mascotas?pageSize=6&searchTerm=${encodeURIComponent(term)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setPetsList(result.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPets(false);
    }
  };

  useEffect(() => {
    searchPets(searchTerm);
  }, [searchTerm, token]);

  const handleSelectPet = async (pet: Mascota) => {
    setSelectedPet(pet);
    setLoadingHistory(true);
    try {
      // 1. Obtener detalles de consulta
      const historyRes = await fetch(`${API_BASE_URL}/api/consultas-detalles/mascota/${pet.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      // 2. Obtener pesos
      const weightRes = await fetch(`${API_BASE_URL}/api/mascotas/${pet.id}/pesos`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (historyRes.ok && weightRes.ok) {
        const historyData = await historyRes.json();
        const weightData = await weightRes.json();
        setHistory(historyData);
        setWeights(weightData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const calculateAge = (birthdate: string) => {
    const born = new Date(birthdate);
    const now = new Date();
    let years = now.getFullYear() - born.getFullYear();
    let months = now.getMonth() - born.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < born.getDate())) {
      years--;
      months += 12;
    }
    if (years === 0) return `${months} meses`;
    return `${years} años y ${months} meses`;
  };

  return (
    <div className="clin-hist-container">
      <div className="clin-hist-header">
        <div className="title-section">
          <h1>Expediente Clínico de Pacientes</h1>
          <p className="subtitle">Buscador unificado de bitácoras médicas, diagnósticos históricos y pesos corporales</p>
        </div>
      </div>

      <div className="clin-hist-layout">
        {/* Lado izquierdo: Buscador de mascotas */}
        <div className="search-panel">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Buscar paciente por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="pets-results-list">
            {loadingPets ? (
              <div className="mini-spinner">Cargando pacientes...</div>
            ) : petsList.length === 0 ? (
              <p className="no-results">No se hallaron coincidencias.</p>
            ) : (
              petsList.map((pet) => (
                <div 
                  key={pet.id} 
                  onClick={() => handleSelectPet(pet)}
                  className={`pet-result-card ${selectedPet?.id === pet.id ? "active" : ""}`}
                >
                  <Dog className="pet-card-icon" />
                  <div className="pet-card-details">
                    <h4>{pet.nombre}</h4>
                    <p>{pet.especie} - {pet.raza}</p>
                    <span className="owner-span">Dueño: {pet.propietarioNombreCompleto}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lado derecho: Ficha médica del paciente seleccionado */}
        <div className="records-panel">
          {selectedPet ? (
            <div className="medical-chart-view">
              <div className="chart-header-block">
                <Dog className="chart-avatar-icon" />
                <div className="demographics-text">
                  <h2>{selectedPet.nombre}</h2>
                  <div className="pills-row">
                    <span className="pill species">{selectedPet.especie}</span>
                    <span className="pill breed">{selectedPet.raza}</span>
                    <span className={`pill status ${selectedPet.activo ? "active" : "inactive"}`}>
                      {selectedPet.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>

              {loadingHistory ? (
                <div className="loading-history-state">
                  <div className="spinner"></div>
                  <p>Consolidando historial clínico...</p>
                </div>
              ) : (
                <div className="chart-sections-grid">
                  {/* Ficha demográfica y Pesos */}
                  <div className="demographics-weights-card">
                    <div className="demographic-details">
                      <h3>Datos Demográficos</h3>
                      <div className="demo-rows">
                        <div className="demo-row-item">
                          <Calendar className="demo-icon" />
                          <div>
                            <span className="label">Edad Estimada</span>
                            <span className="val">{calculateAge(selectedPet.fechaNacimiento)}</span>
                          </div>
                        </div>
                        <div className="demo-row-item">
                          <Award className="demo-icon" />
                          <div>
                            <span className="label">Sexo y Color</span>
                            <span className="val">{selectedPet.sexo} | {selectedPet.color || "N/D"}</span>
                          </div>
                        </div>
                        <div className="demo-row-item">
                          <User className="demo-icon" />
                          <div>
                            <span className="label">Propietario / Dueño</span>
                            <span className="val">{selectedPet.propietarioNombreCompleto}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="weights-details">
                      <div className="weights-header-bar">
                        <Scale className="scale-icon" />
                        <h3>Curva Corporal de Pesajes</h3>
                      </div>
                      
                      {weights.length === 0 ? (
                        <p className="no-weights-text">Sin pesajes previos.</p>
                      ) : (
                        <div className="weights-mini-table-wrapper">
                          <table className="weights-mini-table">
                            <thead>
                              <tr>
                                <th>Fecha</th>
                                <th className="text-right">Peso</th>
                              </tr>
                            </thead>
                            <tbody>
                              {weights.slice(0, 5).map((w) => (
                                <tr key={w.id}>
                                  <td>{new Date(w.fechaRegistro).toLocaleDateString()}</td>
                                  <td className="text-right font-bold">{w.pesoKg.toFixed(2)} kg</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Consultas y diagnósticos */}
                  <div className="consultations-history-card">
                    <div className="history-section-header">
                      <ClipboardList className="section-header-icon" />
                      <h3>Bitácoras de Atenciones Clínicas</h3>
                    </div>

                    {history.length === 0 ? (
                      <div className="no-consults">
                        <FileText className="no-consults-icon" />
                        <p>No se registran diagnósticos médicos previos para esta mascota.</p>
                      </div>
                    ) : (
                      <div className="consults-timeline">
                        {history.map((item) => (
                          <div key={item.id} className="timeline-node">
                            <div className="node-marker"></div>
                            <div className="node-content">
                              <div className="node-header">
                                <span className="node-date">
                                  {new Date(item.fechaAtencion).toLocaleDateString()} - {new Date(item.fechaAtencion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="node-vet">Atendido por: {item.veterinarioNombreCompleto}</span>
                              </div>
                              <div className="node-body">
                                <div className="diagnostic-block">
                                  <span className="field-title">Diagnóstico:</span>
                                  <p>{item.diagnostico}</p>
                                </div>
                                <div className="treatment-block">
                                  <span className="field-title">Tratamiento Prescrito:</span>
                                  <p>{item.tratamiento}</p>
                                </div>
                                {item.notasAdicionales && (
                                  <div className="notes-block">
                                    <span className="field-title">Notas Médicas:</span>
                                    <p className="notes-txt">"{item.notasAdicionales}"</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-pet-selected">
              <ClipboardList className="big-folder-icon" />
              <h3>Buscador Clínico de Expedientes</h3>
              <p>Busque y seleccione un paciente de la barra de búsqueda lateral para cargar su historia de pesajes y diagnósticos médicos.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .clin-hist-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .clin-hist-header {
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

        .clin-hist-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 30px;
          text-align: left;
        }

        .search-panel {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 700px;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          width: 16px;
          height: 16px;
          color: #64748b;
        }

        .search-box input {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 12px 10px 38px;
          color: #ffffff;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
        }

        .search-box input:focus {
          border-color: #06b6d4;
        }

        .pets-results-list {
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pet-result-card {
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pet-result-card:hover {
          border-color: #06b6d4;
          background: rgba(6, 182, 212, 0.03);
        }

        .pet-result-card.active {
          border-color: #06b6d4;
          background: rgba(6, 182, 212, 0.05);
        }

        .pet-card-icon {
          width: 36px;
          height: 36px;
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 8px;
          padding: 8px;
          box-sizing: border-box;
          flex-shrink: 0;
        }

        .pet-card-details h4 {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 2px 0;
        }

        .pet-card-details p {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }

        .owner-span {
          font-size: 11px;
          color: #94a3b8;
          display: block;
          margin-top: 4px;
        }

        .mini-spinner, .no-results {
          font-size: 13px;
          color: #64748b;
          text-align: center;
          padding: 20px 0;
        }

        .records-panel {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 24px;
          min-height: 550px;
          display: flex;
        }

        .no-pet-selected {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
          text-align: center;
          padding: 40px;
        }

        .big-folder-icon {
          width: 60px;
          height: 60px;
          color: #334155;
          margin-bottom: 16px;
        }

        .no-pet-selected h3 {
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .no-pet-selected p {
          font-size: 14px;
          max-width: 400px;
          margin: 0;
          line-height: 1.5;
        }

        .medical-chart-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .chart-header-block {
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 20px;
        }

        .chart-avatar-icon {
          width: 44px;
          height: 44px;
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 10px;
          padding: 8px;
          box-sizing: border-box;
        }

        .demographics-text h2 {
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 6px 0;
        }

        .pills-row {
          display: flex;
          gap: 8px;
        }

        .pill {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 10px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .pill.species {
          background: rgba(6, 182, 212, 0.15);
          color: #06b6d4;
        }

        .pill.breed {
          background: rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
        }

        .pill.status.active {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .pill.status.inactive {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .chart-sections-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
        }

        .demographics-weights-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .demographic-details, .weights-details, .consultations-history-card {
          background: rgba(15, 23, 42, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          padding: 16px;
        }

        .demographic-details h3, .weights-header-bar h3, .history-section-header h3 {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          margin: 0 0 14px 0;
          letter-spacing: 0.5px;
        }

        .weights-header-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .scale-icon {
          width: 14px;
          height: 14px;
          color: #06b6d4;
        }

        .weights-header-bar h3 {
          margin: 0;
        }

        .demo-rows {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .demo-row-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .demo-icon {
          width: 16px;
          height: 16px;
          color: #64748b;
          margin-top: 2px;
        }

        .demo-row-item .label {
          display: block;
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
        }

        .demo-row-item .val {
          font-size: 13px;
          color: #cbd5e1;
        }

        .no-weights-text {
          font-size: 12px;
          color: #64748b;
        }

        .weights-mini-table-wrapper {
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 6px;
          overflow: hidden;
        }

        .weights-mini-table {
          width: 100%;
          border-collapse: collapse;
        }

        .weights-mini-table th {
          padding: 6px 10px;
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .weights-mini-table td {
          padding: 8px 10px;
          font-size: 12px;
          color: #cbd5e1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .text-right {
          text-align: right;
        }

        .consultations-history-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .history-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 10px;
        }

        .section-header-icon {
          width: 16px;
          height: 16px;
          color: #06b6d4;
        }

        .history-section-header h3 {
          margin: 0;
        }

        .no-consults {
          text-align: center;
          padding: 40px 0;
          color: #64748b;
        }

        .no-consults-icon {
          width: 40px;
          height: 40px;
          color: #334155;
          margin-bottom: 10px;
        }

        .no-consults p {
          font-size: 13px;
          margin: 0;
        }

        /* Timeline de consultas */
        .consults-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-height: 480px;
          overflow-y: auto;
          padding-left: 8px;
        }

        .timeline-node {
          position: relative;
          padding-left: 20px;
          border-left: 2px solid rgba(255, 255, 255, 0.05);
        }

        .node-marker {
          position: absolute;
          left: -6px;
          top: 4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #06b6d4;
          border: 2px solid #1e293b;
        }

        .node-content {
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          padding: 14px;
        }

        .node-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 6px;
          margin-bottom: 10px;
          font-size: 12px;
        }

        .node-date {
          color: #06b6d4;
          font-weight: 700;
        }

        .node-vet {
          color: #64748b;
          font-weight: 600;
        }

        .node-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .field-title {
          display: block;
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
        }

        .node-body p {
          font-size: 13px;
          color: #cbd5e1;
          margin: 2px 0 0 0;
          line-height: 1.4;
        }

        .notes-txt {
          font-style: italic;
          color: #94a3b8 !important;
        }

        .loading-history-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
          padding: 40px;
        }

        .spinner {
          border: 3px solid rgba(255, 255, 255, 0.05);
          border-top: 3px solid #06b6d4;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
          margin-bottom: 12px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
