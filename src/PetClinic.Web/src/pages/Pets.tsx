import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Search, Plus, Edit2, Trash2, X, AlertCircle, 
  ChevronLeft, ChevronRight, Dog, User, Calendar, 
  Activity, Scale, Eye, ShieldAlert, Award
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

interface Owner {
  id: number;
  nombreCompleto: string;
}

interface PagedPetsResponse {
  items: Mascota[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface WeightRecord {
  id: number;
  fechaRegistro: string;
  pesoKg: number;
  mascotaId: number;
}

export const Pets: React.FC = () => {
  const { token } = useAuth();
  
  // Estados de carga de datos
  const [data, setData] = useState<PagedPetsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Listado de propietarios para el selector de registro
  const [ownersList, setOwnersList] = useState<Owner[]>([]);
  
  // Estado para el modal de Mascota (Crear/Editar)
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Mascota | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    especie: "Canino",
    raza: "",
    fechaNacimiento: "",
    sexo: "Macho",
    color: "",
    propietarioId: ""
  });
  
  // Estado para el modal de Ficha Clínica (Clinical Chart & Weights)
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [chartPet, setChartPet] = useState<Mascota | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>([]);
  const [weightHistoryLoading, setWeightHistoryLoading] = useState(false);
  
  // Formulario de pesaje
  const [newWeight, setNewWeight] = useState("");
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split("T")[0]);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [weightLoading, setWeightLoading] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchPets = async (page: number, search: string) => {
    setLoading(true);
    try {
      const url = `http://localhost:5210/api/mascotas?page=${page}&pageSize=6&searchTerm=${encodeURIComponent(search)}`;
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Error al obtener la lista de mascotas.");
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      // Obtenemos una lista simple de propietarios para el desplegable (máximo 100 por simplicidad)
      const response = await fetch("http://localhost:5210/api/propietarios?pageSize=100", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setOwnersList(result.items.filter((o: any) => o.activo));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPets(currentPage, searchTerm);
    fetchOwners();
  }, [currentPage, token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPets(1, searchTerm);
  };

  const handleOpenCreateModal = () => {
    setSelectedPet(null);
    setFormData({
      nombre: "",
      especie: "Canino",
      raza: "",
      fechaNacimiento: "",
      sexo: "Macho",
      color: "",
      propietarioId: ownersList[0]?.id.toString() || ""
    });
    setFormError(null);
    setIsPetModalOpen(true);
  };

  const handleOpenEditModal = (pet: Mascota) => {
    setSelectedPet(pet);
    setFormData({
      nombre: pet.nombre,
      especie: pet.especie,
      raza: pet.raza,
      fechaNacimiento: pet.fechaNacimiento.split("T")[0],
      sexo: pet.sexo,
      color: pet.color || "",
      propietarioId: pet.propietarioId.toString()
    });
    setFormError(null);
    setIsPetModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.especie || !formData.raza || !formData.fechaNacimiento || !formData.sexo || !formData.propietarioId) {
      setFormError("Por favor, rellene todos los campos obligatorios.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    const isEdit = !!selectedPet;
    const url = isEdit 
      ? `http://localhost:5210/api/mascotas/${selectedPet.id}`
      : "http://localhost:5210/api/mascotas";
    const method = isEdit ? "PUT" : "POST";

    const payload = isEdit 
      ? { id: selectedPet.id, ...formData, propietarioId: parseInt(formData.propietarioId) }
      : { ...formData, propietarioId: parseInt(formData.propietarioId) };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar la mascota.");
      }

      setIsPetModalOpen(false);
      fetchPets(currentPage, searchTerm);
    } catch (err: any) {
      setFormError(err.message || "Error al conectar con el servidor.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm("¿Está seguro de que desea dar de baja a esta mascota? Su expediente clínico se conservará.")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5210/api/mascotas/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Error al dar de baja.");
      fetchPets(currentPage, searchTerm);
    } catch (err) {
      alert("Error al desactivar al paciente.");
    }
  };

  // Métodos de Ficha Clínica e Historial de Peso
  const handleOpenClinicalChart = async (pet: Mascota) => {
    setChartPet(pet);
    setIsChartOpen(true);
    setNewWeight("");
    setNewWeightDate(new Date().toISOString().split("T")[0]);
    setWeightError(null);
    await fetchWeightHistory(pet.id);
  };

  const fetchWeightHistory = async (petId: number) => {
    setWeightHistoryLoading(true);
    try {
      const response = await fetch(`http://localhost:5210/api/mascotas/${petId}/pesos`, {
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
      setWeightHistoryLoading(false);
    }
  };

  const handleAddWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || !chartPet) return;

    const weightVal = parseFloat(newWeight);
    if (isNaN(weightVal) || weightVal <= 0) {
      setWeightError("El peso debe ser un valor numérico mayor a 0 kg.");
      return;
    }

    setWeightLoading(true);
    setWeightError(null);

    try {
      const response = await fetch(`http://localhost:5210/api/mascotas/${chartPet.id}/pesos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          pesoKg: weightVal,
          fechaRegistro: newWeightDate,
          mascotaId: chartPet.id
        })
      });

      if (!response.ok) {
        const errResult = await response.json();
        throw new Error(errResult.message || "Error al guardar el pesaje.");
      }

      setNewWeight("");
      await fetchWeightHistory(chartPet.id);
    } catch (err: any) {
      setWeightError(err.message || "Error de conexión.");
    } finally {
      setWeightLoading(false);
    }
  };

  // Helper para formatear edades
  const calculateAge = (birthdate: string) => {
    const born = new Date(birthdate);
    const now = new Date();
    let years = now.getFullYear() - born.getFullYear();
    let months = now.getMonth() - born.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < born.getDate())) {
      years--;
      months += 12;
    }
    if (years === 0) {
      return `${months} meses`;
    }
    return `${years} años y ${months} meses`;
  };

  return (
    <div className="pets-container">
      <div className="pets-header">
        <div className="title-section">
          <h1>Control de Pacientes (Mascotas)</h1>
          <p className="subtitle">Gestión de historias demográficas e indicadores clínicos básicos</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn-add">
          <Plus className="btn-icon" /> Registrar Paciente
        </button>
      </div>

      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, especie o propietario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-search">Buscar</button>
        </form>
      </div>

      <div className="table-panel">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Consultando expedientes...</p>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="empty-state">
            <ShieldAlert className="empty-icon" />
            <p>No se encontraron registros de pacientes.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Nombre Mascota</th>
                    <th>Especie / Raza</th>
                    <th>Propietario (Dueño)</th>
                    <th>Sexo</th>
                    <th>Edad Estimada</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((pet) => (
                    <tr key={pet.id} className={!pet.activo ? "inactive-row" : ""}>
                      <td className="font-semibold">{pet.nombre}</td>
                      <td>
                        <div className="species-col">
                          <span className="spec-name">{pet.especie}</span>
                          <span className="breed-name">{pet.raza}</span>
                        </div>
                      </td>
                      <td>{pet.propietarioNombreCompleto}</td>
                      <td>{pet.sexo}</td>
                      <td>{calculateAge(pet.fechaNacimiento)}</td>
                      <td>
                        <span className={`badge-status ${pet.activo ? "active" : "inactive"}`}>
                          {pet.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button 
                            onClick={() => handleOpenClinicalChart(pet)}
                            className="btn-action-icon view"
                            title="Ver Ficha Clínica"
                          >
                            <Eye />
                          </button>
                          <button 
                            onClick={() => handleOpenEditModal(pet)} 
                            className="btn-action-icon edit" 
                            title="Editar Perfil"
                          >
                            <Edit2 />
                          </button>
                          {pet.activo && (
                            <button 
                              onClick={() => handleDeactivate(pet.id)} 
                              className="btn-action-icon delete" 
                              title="Dar de baja"
                            >
                              <Trash2 />
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
                  Mostrando página {data.page} de {data.totalPages} ({data.totalCount} registros en total)
                </span>
                <div className="pagination-buttons">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="btn-page"
                  >
                    <ChevronLeft />
                  </button>
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`btn-page ${currentPage === p ? "active" : ""}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button 
                    disabled={currentPage === data.totalPages} 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.totalPages))}
                    className="btn-page"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Mascota (Crear/Editar) */}
      {isPetModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedPet ? "Editar Datos de Mascota" : "Registrar Nueva Mascota"}</h2>
              <button onClick={() => setIsPetModalOpen(false)} className="btn-close-modal">
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
                  <label htmlFor="pet-name">Nombre de Mascota *</label>
                  <input
                    id="pet-name"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="ej: Toby"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pet-species">Especie *</label>
                  <select
                    id="pet-species"
                    value={formData.especie}
                    onChange={(e) => setFormData({ ...formData, especie: e.target.value })}
                    disabled={formLoading}
                    className="form-select"
                  >
                    <option value="Canino">Canino</option>
                    <option value="Felino">Felino</option>
                    <option value="Roedor">Roedor</option>
                    <option value="Ave">Ave</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="pet-breed">Raza *</label>
                  <input
                    id="pet-breed"
                    type="text"
                    required
                    value={formData.raza}
                    onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
                    placeholder="ej: Beagle / Mestizo"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pet-sex">Sexo *</label>
                  <select
                    id="pet-sex"
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                    disabled={formLoading}
                    className="form-select"
                  >
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="pet-color">Color de Manto</label>
                  <input
                    id="pet-color"
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="ej: Marrón y Negro"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pet-birth">Fecha de Nacimiento *</label>
                  <input
                    id="pet-birth"
                    type="date"
                    required
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="pet-owner">Vincular a Propietario (Dueño) *</label>
                  <select
                    id="pet-owner"
                    value={formData.propietarioId}
                    onChange={(e) => setFormData({ ...formData, propietarioId: e.target.value })}
                    disabled={formLoading}
                    className="form-select"
                  >
                    {ownersList.length === 0 ? (
                      <option value="">No hay propietarios activos registrados</option>
                    ) : (
                      ownersList.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.nombreCompleto} (ID: {owner.id})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setIsPetModalOpen(false)} 
                  className="btn-cancel" 
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={formLoading}>
                  {formLoading ? "Guardando..." : "Guardar Mascota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ficha Clínica Detallada (Clinical Chart & Weight tracking) */}
      {isChartOpen && chartPet && (
        <div className="modal-overlay">
          <div className="modal-content clinical-chart-modal">
            <div className="modal-header">
              <div className="chart-title-group">
                <Activity className="clinical-icon" />
                <h2>Ficha Clínica de Paciente</h2>
              </div>
              <button onClick={() => setIsChartOpen(false)} className="btn-close-modal">
                <X />
              </button>
            </div>

            <div className="clinical-layout">
              {/* Sección izquierda: Ficha demográfica */}
              <div className="clinical-sidebar">
                <div className="demographic-card">
                  <div className="demographic-header">
                    <Dog className="pet-avatar-icon" />
                    <h3>{chartPet.nombre}</h3>
                    <span className="breed-badge">{chartPet.especie} - {chartPet.raza}</span>
                  </div>
                  
                  <div className="demographic-body">
                    <div className="demo-field">
                      <Calendar className="demo-icon" />
                      <div>
                        <span className="demo-label">Edad Estimada</span>
                        <span className="demo-value">{calculateAge(chartPet.fechaNacimiento)}</span>
                      </div>
                    </div>
                    <div className="demo-field">
                      <Award className="demo-icon" />
                      <div>
                        <span className="demo-label">Sexo & Manto</span>
                        <span className="demo-value">{chartPet.sexo} | {chartPet.color || "No definido"}</span>
                      </div>
                    </div>
                    <div className="demo-field">
                      <User className="demo-icon" />
                      <div>
                        <span className="demo-label">Propietario / Dueño</span>
                        <span className="demo-value">{chartPet.propietarioNombreCompleto}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección derecha: Historial de peso corporal */}
              <div className="clinical-main">
                <div className="weight-section-card">
                  <div className="section-header">
                    <Scale className="section-icon" />
                    <h3>Historial de Variación de Peso</h3>
                  </div>

                  {/* Formulario de registro de peso */}
                  {chartPet.activo && (
                    <form onSubmit={handleAddWeightSubmit} className="weight-form">
                      <div className="weight-inputs">
                        <div className="weight-input-group">
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="Peso en kg (ej: 14.5)"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            disabled={weightLoading}
                          />
                          <span className="unit-label">kg</span>
                        </div>
                        <input
                          type="date"
                          required
                          value={newWeightDate}
                          onChange={(e) => setNewWeightDate(e.target.value)}
                          disabled={weightLoading}
                        />
                        <button type="submit" className="btn-add-weight" disabled={weightLoading}>
                          {weightLoading ? "..." : "Registrar"}
                        </button>
                      </div>
                      {weightError && <div className="weight-error-msg">{weightError}</div>}
                    </form>
                  )}

                  {/* Tabla de registros de peso */}
                  <div className="weight-history-panel">
                    {weightHistoryLoading ? (
                      <div className="mini-loader">Cargando pesos...</div>
                    ) : weightHistory.length === 0 ? (
                      <p className="no-weights">No se han registrado mediciones de peso para este paciente.</p>
                    ) : (
                      <table className="weight-table">
                        <thead>
                          <tr>
                            <th>Fecha de Registro</th>
                            <th className="text-right">Peso (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weightHistory.map((row) => (
                            <tr key={row.id}>
                              <td>{new Date(row.fechaRegistro).toLocaleDateString()}</td>
                              <td className="text-right font-semibold">{row.pesoKg.toFixed(2)} kg</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .pets-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .pets-header {
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

        .filter-bar {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .search-form {
          display: flex;
          gap: 12px;
        }

        .search-wrapper {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          width: 18px;
          height: 18px;
          color: #64748b;
        }

        .search-wrapper input {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 16px 10px 44px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .search-wrapper input:focus {
          border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
        }

        .btn-search {
          background: #334155;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-search:hover {
          background: #475569;
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

        .species-col {
          display: flex;
          flex-direction: column;
        }

        .spec-name {
          font-weight: 600;
          color: #ffffff;
        }

        .breed-name {
          font-size: 12px;
          color: #64748b;
        }

        .inactive-row {
          opacity: 0.6;
        }

        .badge-status {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-status.active {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .badge-status.inactive {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .actions-cell {
          display: flex;
          gap: 8px;
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
          width: 14px;
          height: 14px;
        }

        .btn-action-icon:hover.view {
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.05);
        }

        .btn-action-icon:hover.edit {
          color: #06b6d4;
          border-color: rgba(6, 182, 212, 0.3);
          background: rgba(6, 182, 212, 0.05);
        }

        .btn-action-icon:hover.delete {
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
          align-items: center;
          gap: 6px;
        }

        .btn-page {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #cbd5e1;
          border-radius: 6px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .btn-page svg {
          width: 16px;
          height: 16px;
        }

        .btn-page:hover:not(:disabled) {
          border-color: #06b6d4;
          color: #06b6d4;
        }

        .btn-page.active {
          background: #06b6d4;
          color: #ffffff;
          border-color: #06b6d4;
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
          max-width: 600px;
          padding: 32px;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
          animation: modalFadeIn 0.3s ease-out;
        }

        .modal-content.clinical-chart-modal {
          max-width: 900px;
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

        .chart-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .clinical-icon {
          color: #06b6d4;
          width: 26px;
          height: 26px;
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

        .form-group input, .form-select {
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

        .form-group input:focus, .form-select:focus {
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

        /* Clinical layout specific */
        .clinical-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 28px;
          text-align: left;
        }

        .clinical-sidebar {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 20px;
        }

        .demographic-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
          text-align: center;
        }

        .pet-avatar-icon {
          width: 50px;
          height: 50px;
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 12px;
          padding: 10px;
          margin-bottom: 12px;
          box-sizing: border-box;
        }

        .demographic-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 4px 0;
        }

        .breed-badge {
          font-size: 12px;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 10px;
          border-radius: 20px;
        }

        .demographic-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .demo-field {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .demo-icon {
          width: 18px;
          height: 18px;
          color: #64748b;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .demo-label {
          display: block;
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
        }

        .demo-value {
          font-size: 14px;
          color: #cbd5e1;
        }

        .weight-section-card {
          background: rgba(15, 23, 42, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 10px;
        }

        .section-icon {
          color: #06b6d4;
          width: 18px;
          height: 18px;
        }

        .section-header h3 {
          font-size: 15px;
          color: #ffffff;
          margin: 0;
        }

        .weight-form {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 14px;
        }

        .weight-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr 100px;
          gap: 10px;
        }

        .weight-input-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .weight-input-group input {
          width: 100%;
          padding-right: 38px;
        }

        .unit-label {
          position: absolute;
          right: 12px;
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
        }

        .btn-add-weight {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }

        .weight-error-msg {
          font-size: 12px;
          color: #fca5a5;
          margin-top: 8px;
        }

        .weight-history-panel {
          max-height: 240px;
          overflow-y: auto;
        }

        .weight-table {
          width: 100%;
          border-collapse: collapse;
        }

        .weight-table th {
          padding: 8px 12px;
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .weight-table td {
          padding: 10px 12px;
          font-size: 13px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .text-right {
          text-align: right;
        }

        .no-weights {
          font-size: 13px;
          color: #64748b;
          text-align: center;
          padding: 20px 0;
        }

        .mini-loader {
          text-align: center;
          font-size: 13px;
          color: #64748b;
          padding: 20px 0;
        }
      `}</style>
    </div>
  );
};
