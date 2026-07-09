import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Search, Plus, Edit2, Trash2, X, AlertCircle, 
  ChevronLeft, ChevronRight, ShieldAlert, Key, UserCheck 
} from "lucide-react";

interface Propietario {
  id: number;
  nombreCompleto: string;
  telefono: string;
  correoElectronico: string;
  direccion: string;
  activo: boolean;
  firebaseUserId?: string;
}

interface PagedResponse {
  items: Propietario[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const Owners: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<PagedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterTab, setFilterTab] = useState<"todos" | "pendientes">("todos");
  
  // OTP States
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  
  // Estado para el modal de edición/creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Propietario | null>(null);
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    telefono: "",
    correoElectronico: "",
    direccion: ""
  });
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchOwners = async (page: number, search: string) => {
    setLoading(true);
    try {
      const url = `http://localhost:5210/api/propietarios?page=${page}&pageSize=6&searchTerm=${encodeURIComponent(search)}&onlyPending=${filterTab === "pendientes"}`;
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Error al obtener la lista de propietarios.");
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners(currentPage, searchTerm);
  }, [currentPage, token]);

  useEffect(() => {
    setCurrentPage(1);
    fetchOwners(1, searchTerm);
  }, [filterTab]);

  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleGenerateCode = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5210/api/propietarios/${id}/generar-codigo`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Error al generar el código.");
      const data = await response.json();
      setOtpCode(data.codigo);
      setOtpTimer(150); // 150 segundos
    } catch (err) {
      alert("Error al generar el código.");
    }
  };

  const handleActivate = async (id: number) => {
    if (!window.confirm("¿Desea verificar y activar este propietario?")) return;
    try {
      const response = await fetch(`http://localhost:5210/api/propietarios/${id}/activar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Error al activar.");
      fetchOwners(currentPage, searchTerm);
    } catch (err) {
      alert("Error al activar al propietario.");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOwners(1, searchTerm);
  };

  const handleOpenCreateModal = () => {
    setSelectedOwner(null);
    setFormData({ nombreCompleto: "", telefono: "", correoElectronico: "", direccion: "" });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (owner: Propietario) => {
    setSelectedOwner(owner);
    setFormData({
      nombreCompleto: owner.nombreCompleto,
      telefono: owner.telefono,
      correoElectronico: owner.correoElectronico,
      direccion: owner.direccion || ""
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreCompleto || !formData.telefono || !formData.correoElectronico) {
      setFormError("Por favor, rellene todos los campos obligatorios.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    const isEdit = !!selectedOwner;
    const url = isEdit 
      ? `http://localhost:5210/api/propietarios/${selectedOwner.id}`
      : "http://localhost:5210/api/propietarios";
    const method = isEdit ? "PUT" : "POST";

    const payload = isEdit 
      ? { id: selectedOwner.id, ...formData }
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
      fetchOwners(currentPage, searchTerm);
    } catch (err: any) {
      setFormError(err.message || "Error al conectar con el servidor.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm("¿Está seguro de que desea desactivar este propietario? No se eliminará físicamente para preservar el historial clínico.")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5210/api/propietarios/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Error al desactivar.");
      fetchOwners(currentPage, searchTerm);
    } catch (err) {
      alert("Error al desactivar al propietario.");
    }
  };

  return (
    <div className="owners-container">
      <div className="owners-header">
        <div className="title-section">
          <h1>Gestión de Propietarios</h1>
          <p className="subtitle">Administración de expedientes de clientes de la clínica</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn-add">
          <Plus className="btn-icon" /> Registrar Propietario
        </button>
      </div>

      <div className="filter-bar">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button 
            type="button"
            onClick={() => setFilterTab("todos")} 
            className={`btn-search ${filterTab === "todos" ? "active" : ""}`}
            style={{ 
              background: filterTab === "todos" ? "#06b6d4" : "#1e293b", 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#ffffff'
            }}
          >
            Todos los Clientes
          </button>
          <button 
            type="button"
            onClick={() => setFilterTab("pendientes")} 
            className={`btn-search ${filterTab === "pendientes" ? "active" : ""}`}
            style={{ 
              background: filterTab === "pendientes" ? "#f97316" : "#1e293b", 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#ffffff'
            }}
          >
            Pendientes de Verificación
          </button>
        </div>
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o correo..."
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
            <p>Cargando registros clínicos...</p>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="empty-state">
            <ShieldAlert className="empty-icon" />
            <p>No se encontraron registros de propietarios.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Nombre Completo</th>
                    <th>Teléfono</th>
                    <th>Correo Electrónico</th>
                    <th>Dirección</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((owner) => (
                    <tr key={owner.id} className={!owner.activo && !owner.firebaseUserId ? "inactive-row" : ""}>
                      <td className="font-semibold">{owner.nombreCompleto}</td>
                      <td>{owner.telefono}</td>
                      <td>{owner.correoElectronico}</td>
                      <td>{owner.direccion || <span className="text-muted">-</span>}</td>
                      <td>
                        {!owner.activo && owner.firebaseUserId ? (
                          <span className="badge-status pending" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
                            Por Verificar
                          </span>
                        ) : (
                          <span className={`badge-status ${owner.activo ? "active" : "inactive"}`}>
                            {owner.activo ? "Activo" : "Inactivo"}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button 
                            onClick={() => handleOpenEditModal(owner)} 
                            className="btn-action-icon edit" 
                            title="Editar Perfil"
                          >
                            <Edit2 />
                          </button>
                          {owner.activo && (
                            <>
                              <button 
                                onClick={() => handleGenerateCode(owner.id)} 
                                className="btn-action-icon edit" 
                                title="Generar Código de Acceso"
                                style={{ color: '#06b6d4' }}
                              >
                                <Key />
                              </button>
                              <button 
                                onClick={() => handleDeactivate(owner.id)} 
                                className="btn-action-icon delete" 
                                title="Desactivar lógicamente"
                              >
                                <Trash2 />
                              </button>
                            </>
                          )}
                          {!owner.activo && owner.firebaseUserId && (
                            <button 
                              onClick={() => handleActivate(owner.id)} 
                              className="btn-action-icon edit" 
                              title="Verificar y Activar Cuenta"
                              style={{ color: '#10b981' }}
                            >
                              <UserCheck />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {otpCode && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                  <div className="modal-header">
                    <h2>Código de Acceso</h2>
                    <button onClick={() => setOtpCode(null)} className="btn-close-modal">
                      <X />
                    </button>
                  </div>
                  <div style={{ padding: '20px 0' }}>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '10px' }}>
                      Entregue este código temporal al cliente para vincular su cuenta de Google.
                    </p>
                    {otpTimer > 0 ? (
                      <>
                        <div style={{ fontSize: '42px', fontWeight: 800, color: '#06b6d4', letterSpacing: '6px', margin: '20px 0', fontFamily: 'monospace' }}>
                          {otpCode}
                        </div>
                        <div style={{ color: '#ef4444', fontSize: '14px', fontWeight: 600 }}>
                          Vence en: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                        </div>
                      </>
                    ) : (
                      <div style={{ color: '#ef4444', fontSize: '16px', fontWeight: 700, margin: '20px 0' }}>
                        CÓDIGO EXPIRADO
                      </div>
                    )}
                  </div>
                  <div className="modal-actions" style={{ justifyContent: 'center' }}>
                    <button onClick={() => setOtpCode(null)} className="btn-cancel">
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

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

      {/* Modal de CRUD */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedOwner ? "Editar Propietario" : "Registrar Nuevo Propietario"}</h2>
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
                  <label htmlFor="owner-name">Nombre Completo *</label>
                  <input
                    id="owner-name"
                    type="text"
                    required
                    value={formData.nombreCompleto}
                    onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                    placeholder="ej: Juan Pérez"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="owner-phone">Teléfono *</label>
                  <input
                    id="owner-phone"
                    type="text"
                    required
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="ej: 987654321"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="owner-email">Correo Electrónico *</label>
                  <input
                    id="owner-email"
                    type="email"
                    required
                    value={formData.correoElectronico}
                    onChange={(e) => setFormData({ ...formData, correoElectronico: e.target.value })}
                    placeholder="ej: juan@email.com"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="owner-address">Dirección de Domicilio</label>
                  <input
                    id="owner-address"
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    placeholder="ej: Av. Larco 456, Lima"
                    disabled={formLoading}
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
                  {formLoading ? "Guardando..." : "Guardar Propietario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .owners-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .owners-header {
          display: flex;
          align-items: center;
          justify-content: justify;
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
          font-weight: 500;
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
