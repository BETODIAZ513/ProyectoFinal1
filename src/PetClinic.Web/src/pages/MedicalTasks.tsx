import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, Play, CheckSquare, X, 
  AlertCircle, CheckCircle, Dog, RefreshCw 
} from "lucide-react";

interface TareaClinica {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string; // Pendiente, En Progreso, Completada
  mascotaId: number;
  mascotaNombre: string;
  veterinarioId: number;
  veterinarioNombre: string;
  citaId?: number;
}

interface TareaPredefinida {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Pet {
  id: number;
  nombre: string;
}

export const MedicalTasks: React.FC = () => {
  const { token, hasRole } = useAuth();
  
  const [tasks, setTasks] = useState<TareaClinica[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Catálogos
  const [predefinedTasks, setPredefinedTasks] = useState<TareaPredefinida[]>([]);
  const [petsList, setPetsList] = useState<Pet[]>([]);
  
  // Modal de Creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    mascotaId: "",
    citaId: ""
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const isVetOrAdmin = hasRole(["Administrador", "Veterinario"]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5210/api/tareas-clinicas", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setTasks(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogs = async () => {
    try {
      const predRes = await fetch("http://localhost:5210/api/tareas-predefinidas", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const petsRes = await fetch("http://localhost:5210/api/mascotas?pageSize=100", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (predRes.ok && petsRes.ok) {
        const predData = await predRes.json();
        const petsData = await petsRes.json();
        setPredefinedTasks(predData);
        setPetsList(petsData.items.filter((p: any) => p.activo));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchCatalogs();
  }, [token]);

  const handleTemplateChange = (e: string) => {
    setSelectedTemplateId(e);
    if (!e) {
      setFormData(prev => ({ ...prev, titulo: "", descripcion: "" }));
      return;
    }
    const template = predefinedTasks.find(t => t.id.toString() === e);
    if (template) {
      setFormData(prev => ({
        ...prev,
        titulo: template.nombre,
        descripcion: template.descripcion
      }));
    }
  };

  const handleOpenModal = () => {
    setSelectedTemplateId("");
    setFormData({
      titulo: "",
      descripcion: "",
      mascotaId: petsList[0]?.id.toString() || "",
      citaId: ""
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.mascotaId) {
      setFormError("El título y el paciente son campos requeridos.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const response = await fetch("http://localhost:5210/api/tareas-clinicas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          mascotaId: parseInt(formData.mascotaId),
          veterinarioApplicationUserId: "temp", // Lo resuelve el controller
          citaId: formData.citaId ? parseInt(formData.citaId) : null
        })
      });

      if (!response.ok) {
        const errResult = await response.json();
        throw new Error(errResult.message || "Error al crear la tarea clínica.");
      }

      setIsModalOpen(false);
      await fetchTasks();
    } catch (err: any) {
      setFormError(err.message || "Error de conexión.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleTransition = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:5210/api/tareas-clinicas/${id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id, estado: newStatus })
      });

      if (!response.ok) throw new Error("Error al transicionar la tarea.");
      await fetchTasks();
    } catch (err) {
      alert("Error al actualizar la tarea.");
    }
  };

  // Filtrar tareas por columnas
  const pendingTasks = tasks.filter(t => t.estado === "Pendiente");
  const inProgressTasks = tasks.filter(t => t.estado === "En Progreso");
  const completedTasks = tasks.filter(t => t.estado === "Completada");

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <div className="title-section">
          <h1>Tablero Kanban de Tareas Médicas</h1>
          <p className="subtitle">Coordinación de cuidados clínicos intrahospitalarios y flujos auxiliares</p>
        </div>
        
        <div className="header-actions">
          <button onClick={fetchTasks} className="btn-refresh">
            <RefreshCw className="btn-icon" /> Refrescar Tablero
          </button>
          {isVetOrAdmin && (
            <button onClick={handleOpenModal} className="btn-add">
              <Plus className="btn-icon" /> Asignar Tarea
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Sincronizando tablero Kanban...</p>
        </div>
      ) : (
        <div className="kanban-board">
          {/* Columna: Pendientes */}
          <div className="kanban-column">
            <div className="column-header pending">
              <h3>Pendientes</h3>
              <span className="task-count">{pendingTasks.length}</span>
            </div>
            <div className="column-body">
              {pendingTasks.length === 0 ? (
                <div className="empty-column-state">Sin tareas pendientes</div>
              ) : (
                pendingTasks.map((t) => (
                  <div key={t.id} className="task-kanban-card">
                    <div className="card-header">
                      <Dog className="card-avatar" />
                      <div>
                        <h4>{t.mascotaNombre}</h4>
                        <span className="assigned-vet">Ordenado por: {t.veterinarioNombre}</span>
                      </div>
                    </div>
                    <div className="card-body">
                      <h5>{t.titulo}</h5>
                      <p>{t.descripcion}</p>
                    </div>
                    <div className="card-footer">
                      <button 
                        onClick={() => handleTransition(t.id, "En Progreso")}
                        className="btn-transition start"
                      >
                        <Play className="btn-action-icon" /> Iniciar Cuidado
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna: En Progreso */}
          <div className="kanban-column">
            <div className="column-header progress">
              <h3>En Progreso</h3>
              <span className="task-count">{inProgressTasks.length}</span>
            </div>
            <div className="column-body">
              {inProgressTasks.length === 0 ? (
                <div className="empty-column-state">Ningún cuidado en curso</div>
              ) : (
                inProgressTasks.map((t) => (
                  <div key={t.id} className="task-kanban-card progress-border">
                    <div className="card-header">
                      <Dog className="card-avatar" />
                      <div>
                        <h4>{t.mascotaNombre}</h4>
                        <span className="assigned-vet">Ordenado por: {t.veterinarioNombre}</span>
                      </div>
                    </div>
                    <div className="card-body">
                      <h5>{t.titulo}</h5>
                      <p>{t.descripcion}</p>
                    </div>
                    <div className="card-footer">
                      <button 
                        onClick={() => handleTransition(t.id, "Completada")}
                        className="btn-transition complete"
                      >
                        <CheckSquare className="btn-action-icon" /> Completar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna: Completadas */}
          <div className="kanban-column">
            <div className="column-header completed">
              <h3>Completadas</h3>
              <span className="task-count">{completedTasks.length}</span>
            </div>
            <div className="column-body">
              {completedTasks.length === 0 ? (
                <div className="empty-column-state">Sin tareas completadas hoy</div>
              ) : (
                completedTasks.map((t) => (
                  <div key={t.id} className="task-kanban-card completed-opacity">
                    <div className="card-header">
                      <Dog className="card-avatar" />
                      <div>
                        <h4>{t.mascotaNombre}</h4>
                        <span className="assigned-vet">Ordenado por: {t.veterinarioNombre}</span>
                      </div>
                    </div>
                    <div className="card-body">
                      <h5>{t.titulo}</h5>
                      <p>{t.descripcion}</p>
                    </div>
                    <div className="card-footer-completed">
                      <CheckCircle className="done-icon" />
                      <span className="done-txt">Completado</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Creación */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Asignar Cuidado Clínico</h2>
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
                <div className="form-group span-2">
                  <label htmlFor="task-template">Plantillas Predefinidas (REQ-NEG-07)</label>
                  <select
                    id="task-template"
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    disabled={formLoading}
                    className="form-select"
                  >
                    <option value="">-- Cargar de plantilla predefinida (Opcional) --</option>
                    {predefinedTasks.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group span-2">
                  <label htmlFor="task-pet">Paciente (Mascota) *</label>
                  <select
                    id="task-pet"
                    value={formData.mascotaId}
                    onChange={(e) => setFormData({ ...formData, mascotaId: e.target.value })}
                    disabled={formLoading}
                    className="form-select"
                  >
                    {petsList.length === 0 ? (
                      <option value="">No hay mascotas activas registradas</option>
                    ) : (
                      petsList.map((pet) => (
                        <option key={pet.id} value={pet.id}>{pet.nombre}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group span-2">
                  <label htmlFor="task-title">Título de la Tarea *</label>
                  <input
                    id="task-title"
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="ej: Control de temperatura horaria"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="task-desc">Instrucciones Clínicas</label>
                  <textarea
                    id="task-desc"
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="ej: Tomar temperatura cada 4 horas y reportar variaciones..."
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
                  {formLoading ? "Asignando..." : "Asignar Cuidado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .kanban-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .kanban-header {
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

        .kanban-board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: start;
        }

        .kanban-column {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 500px;
        }

        .column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 2px solid;
          text-align: left;
        }

        .column-header.pending { border-color: #64748b; }
        .column-header.progress { border-color: #f59e0b; }
        .column-header.completed { border-color: #10b981; }

        .column-header h3 {
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .task-count {
          background: rgba(255, 255, 255, 0.06);
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .column-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .empty-column-state {
          text-align: center;
          padding: 40px 0;
          color: #64748b;
          font-size: 13px;
          border: 1px dashed rgba(255, 255, 255, 0.04);
          border-radius: 8px;
        }

        .task-kanban-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
          transition: all 0.2s ease;
        }

        .task-kanban-card.progress-border {
          border-color: rgba(245, 158, 11, 0.3);
          background: rgba(245, 158, 11, 0.01);
        }

        .task-kanban-card.completed-opacity {
          opacity: 0.6;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 8px;
        }

        .card-avatar {
          width: 32px;
          height: 32px;
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 6px;
          padding: 6px;
          box-sizing: border-box;
        }

        .card-header h4 {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .assigned-vet {
          font-size: 11px;
          color: #64748b;
          display: block;
        }

        .card-body h5 {
          font-size: 14px;
          font-weight: 600;
          color: #06b6d4;
          margin: 0 0 4px 0;
        }

        .card-body p {
          font-size: 12px;
          color: #cbd5e1;
          margin: 0;
          line-height: 1.4;
        }

        .card-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 10px;
        }

        .btn-transition {
          width: 100%;
          border: 1px solid;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .btn-transition.start {
          background: rgba(6, 182, 212, 0.08);
          border-color: rgba(6, 182, 212, 0.2);
          color: #06b6d4;
        }

        .btn-transition.start:hover {
          background: #06b6d4;
          color: #ffffff;
        }

        .btn-transition.complete {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .btn-transition.complete:hover {
          background: #10b981;
          color: #ffffff;
        }

        .btn-action-icon {
          width: 13px;
          height: 13px;
        }

        .card-footer-completed {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #10b981;
          font-size: 12px;
          font-weight: 600;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 10px;
        }

        .done-icon {
          width: 14px;
          height: 14px;
        }

        .loading-state {
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
