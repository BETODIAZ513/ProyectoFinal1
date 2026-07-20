import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, Edit2, Trash2, X, AlertCircle, 
  Dog, Mail, Phone, FileText, ShieldAlert 
} from "lucide-react";

interface Veterinario {
  id: number;
  nombreCompleto: string;
  especialidad: string;
  numeroColegiatura: string;
  telefono: string;
  correoElectronico: string;
  activo: boolean;
}

export const Veterinarians: React.FC = () => {
  const { token, hasRole } = useAuth();
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [loading, setLoading] = useState(false);

  // Estado para el modal de registro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVet, setSelectedVet] = useState<Veterinario | null>(null);
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    especialidad: "",
    numeroColegiatura: "",
    telefono: "",
    correoElectronico: "",
    password: ""
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchVets = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL + "/api/veterinarios", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Error al obtener la lista de veterinarios.");
      const result = await response.json();
      setVeterinarios(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVets();
  }, [token]);

  const handleOpenCreateModal = () => {
    setSelectedVet(null);
    setFormData({
      nombreCompleto: "",
      especialidad: "",
      numeroColegiatura: "",
      telefono: "",
      correoElectronico: "",
      password: ""
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vet: Veterinario) => {
    setSelectedVet(vet);
    setFormData({
      nombreCompleto: vet.nombreCompleto,
      especialidad: vet.especialidad,
      numeroColegiatura: vet.numeroColegiatura,
      telefono: vet.telefono,
      correoElectronico: vet.correoElectronico,
      password: "" // No editamos contraseña en este formulario
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreCompleto || !formData.especialidad || !formData.numeroColegiatura || !formData.telefono || !formData.correoElectronico) {
      setFormError("Por favor, rellene todos los campos obligatorios.");
      return;
    }

    const isEdit = !!selectedVet;
    if (!isEdit && !formData.password) {
      setFormError("La contraseña es obligatoria para crear la cuenta del veterinario.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    const url = isEdit 
      ? `${API_BASE_URL}/api/veterinarios/${selectedVet.id}`
      : API_BASE_URL + "/api/veterinarios";
    const method = isEdit ? "PUT" : "POST";

    const payload = isEdit 
      ? { id: selectedVet.id, ...formData }
      : formData;

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
        throw new Error(errorData.message || "Error al procesar la solicitud.");
      }

      setIsModalOpen(false);
      fetchVets();
    } catch (err: any) {
      setFormError(err.message || "Error al conectar con el servidor.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm("¿Está seguro de que desea dar de baja a este veterinario? Su registro se mantendrá inactivo.")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/veterinarios/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Error al desactivar.");
      fetchVets();
    } catch (err) {
      alert("Error al dar de baja al veterinario.");
    }
  };

  const isAdmin = hasRole("Administrador");

  return (
    <div className="vets-container">
      <div className="vets-header">
        <div className="title-section">
          <h1>Mantenimiento de Veterinarios</h1>
          <p className="subtitle">Gestión del personal médico y cuentas de acceso clínico</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenCreateModal} className="btn-add">
            <Plus className="btn-icon" /> Registrar Veterinario
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando personal médico...</p>
        </div>
      ) : veterinarios.length === 0 ? (
        <div className="empty-state">
          <ShieldAlert className="empty-icon" />
          <p>No se encontraron registros de veterinarios en el sistema.</p>
        </div>
      ) : (
        <div className="vets-grid">
          {veterinarios.map((vet) => (
            <div key={vet.id} className={`vet-card ${!vet.activo ? "inactive" : ""}`}>
              <div className="vet-card-header">
                <div className="vet-avatar">
                  <Dog className="avatar-icon" />
                </div>
                <div className="vet-identity">
                  <h3>{vet.nombreCompleto}</h3>
                  <span className="vet-specialty">{vet.especialidad}</span>
                </div>
              </div>

              <div className="vet-card-details">
                <div className="detail-item">
                  <FileText className="detail-icon" />
                  <span>CNV: {vet.numeroColegiatura}</span>
                </div>
                <div className="detail-item">
                  <Phone className="detail-icon" />
                  <span>{vet.telefono}</span>
                </div>
                <div className="detail-item">
                  <Mail className="detail-icon" />
                  <span className="email-text" title={vet.correoElectronico}>{vet.correoElectronico}</span>
                </div>
              </div>

              <div className="vet-card-footer">
                <span className={`badge-status ${vet.activo ? "active" : "inactive"}`}>
                  {vet.activo ? "Activo" : "Inactivo"}
                </span>

                {isAdmin && (
                  <div className="card-actions">
                    <button onClick={() => handleOpenEditModal(vet)} className="btn-card-action edit" title="Editar Perfil">
                      <Edit2 />
                    </button>
                    {vet.activo && (
                      <button onClick={() => handleDeactivate(vet.id)} className="btn-card-action delete" title="Dar de baja">
                        <Trash2 />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de CRUD */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedVet ? "Editar Veterinario" : "Registrar Nuevo Veterinario"}</h2>
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
                  <label htmlFor="vet-name">Nombre Completo *</label>
                  <input
                    id="vet-name"
                    type="text"
                    required
                    value={formData.nombreCompleto}
                    onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                    placeholder="ej: Dr. Carlos Pérez"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="vet-specialty">Especialidad *</label>
                  <input
                    id="vet-specialty"
                    type="text"
                    required
                    value={formData.especialidad}
                    onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                    placeholder="ej: Cirugía / General"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="vet-license">N° Colegiatura *</label>
                  <input
                    id="vet-license"
                    type="text"
                    required
                    value={formData.numeroColegiatura}
                    onChange={(e) => setFormData({ ...formData, numeroColegiatura: e.target.value })}
                    placeholder="ej: CNV-9875"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="vet-phone">Teléfono *</label>
                  <input
                    id="vet-phone"
                    type="text"
                    required
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="ej: 987654321"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="vet-email">Correo Electrónico *</label>
                  <input
                    id="vet-email"
                    type="email"
                    required
                    value={formData.correoElectronico}
                    onChange={(e) => setFormData({ ...formData, correoElectronico: e.target.value })}
                    placeholder="ej: carlos.perez@petclinic.com"
                    disabled={formLoading}
                  />
                  <p className="field-hint">Este correo se usará como nombre de usuario para iniciar sesión.</p>
                </div>

                {!selectedVet && (
                  <div className="form-group span-2">
                    <label htmlFor="vet-password">Contraseña de Acceso *</label>
                    <input
                      id="vet-password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Contraseña inicial para el usuario (mín. 6 caracteres)"
                      disabled={formLoading}
                    />
                  </div>
                )}
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
                  {formLoading ? "Guardando..." : "Guardar Veterinario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .vets-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .vets-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
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

        .vets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .vet-card {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
          transition: all 0.2s ease;
        }

        .vet-card:hover {
          transform: translateY(-2px);
          border-color: rgba(6, 182, 212, 0.2);
        }

        .vet-card.inactive {
          opacity: 0.6;
        }

        .vet-card-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .vet-avatar {
          background: rgba(6, 182, 212, 0.1);
          border-radius: 10px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #06b6d4;
        }

        .avatar-icon {
          width: 24px;
          height: 24px;
        }

        .vet-identity h3 {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 2px 0;
        }

        .vet-specialty {
          font-size: 13px;
          color: #06b6d4;
          font-weight: 500;
        }

        .vet-card-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #94a3b8;
        }

        .detail-icon {
          width: 16px;
          height: 16px;
          color: #64748b;
        }

        .email-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vet-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .badge-status {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .badge-status.active {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .badge-status.inactive {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .card-actions {
          display: flex;
          gap: 6px;
        }

        .btn-card-action {
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

        .btn-card-action svg {
          width: 14px;
          height: 14px;
        }

        .btn-card-action:hover.edit {
          color: #06b6d4;
          border-color: rgba(6, 182, 212, 0.3);
          background: rgba(6, 182, 212, 0.05);
        }

        .btn-card-action:hover.delete {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
        }

        .loading-state, .empty-state {
          text-align: center;
          padding: 60px 0;
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

        /* Modal */
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

        .form-group input {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 14px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .form-group input:focus {
          border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
        }

        .field-hint {
          font-size: 11px;
          color: #64748b;
          margin: 4px 0 0 0;
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
