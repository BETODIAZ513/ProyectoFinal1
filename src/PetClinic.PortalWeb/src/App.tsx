import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Heart, 
  TrendingUp, 
  ChevronRight,
  ShieldAlert,
  Calendar,
  ShoppingBag,
  History
} from 'lucide-react';

const API_BASE = "http://localhost:5210/api";

// Interfaces
interface UserDto {
  id: string;
  username: string;
  email: string;
  nombreCompleto: string;
  roles: string[];
  propietarioId?: number;
}

interface MascotaDto {
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

interface PortalConsultaDto {
  id: number;
  fechaAtencion: string;
  diagnostico: string;
  tratamiento: string;
  veterinarioNombreCompleto: string;
}

interface RegistroPeso {
  id: number;
  pesoKg: number;
  fechaRegistro: string;
}

interface HospitalizacionDto {
  id: number;
  mascotaId: number;
  mascotaNombre: string;
  especie: string;
  raza: string;
  sexo: string;
  fechaIngreso: string;
  fechaAlta?: string;
  motivo: string;
  estado: string;
  numeroJaula: string;
}

export default function App() {
  // Theme State
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  // Auth State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<UserDto | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation State
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<'pets' | 'citas' | 'tienda'>('pets');
  
  // Dashboard Data State
  const [pets, setPets] = useState<MascotaDto[]>([]);
  const [selectedPet, setSelectedPet] = useState<MascotaDto | null>(null);
  const [petHistory, setPetHistory] = useState<PortalConsultaDto[]>([]);
  const [petWeights, setPetWeights] = useState<RegistroPeso[]>([]);
  const [petHospitalization, setPetHospitalization] = useState<HospitalizacionDto | null>(null);

  // Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Apply Theme on change
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Load Dashboard Data if authenticated
  useEffect(() => {
    if (token && user?.propietarioId) {
      loadPets();
    }
  }, [token, user]);

  const loadPets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/portal/pets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPets(data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error("Error al cargar mascotas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPet = async (pet: MascotaDto) => {
    setSelectedPet(pet);
    setDetailsLoading(true);
    setPetHistory([]);
    setPetWeights([]);
    setPetHospitalization(null);

    try {
      // 1. Cargar Historial Clínico
      const resHist = await fetch(`${API_BASE}/portal/pets/${pet.id}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resHist.ok) {
        const historyData = await resHist.json();
        setPetHistory(historyData);
      }

      // 2. Cargar Historial de Pesos
      const resWeight = await fetch(`${API_BASE}/portal/pets/${pet.id}/weights`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resWeight.ok) {
        const weightData = await resWeight.json();
        setPetWeights(weightData);
      }

      // 3. Cargar Hospitalización Activa
      const resHosp = await fetch(`${API_BASE}/portal/pets/${pet.id}/hospitalization`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resHosp.status === 200) {
        const hospData = await resHosp.json();
        setPetHospitalization(hospData);
      }
    } catch (err) {
      console.error("Error al cargar detalles de la mascota:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: email, password })
      });

      const data = await response.json();
      if (response.ok && data.succeeded) {
        if (!data.user.roles.includes('Propietario')) {
          setAuthError("Esta cuenta no tiene permisos para acceder al portal de clientes.");
          setLoading(false);
          return;
        }

        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setAuthError(data.message || "Error al iniciar sesión.");
      }
    } catch (err) {
      setAuthError("No se pudo conectar al servidor. Inténtelo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register-portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        setAuthSuccess(data.message || "Registro exitoso. Ahora puede iniciar sesión.");
        setAuthView('login');
      } else {
        setAuthError(data.message || "Error al registrar la cuenta.");
      }
    } catch (err) {
      setAuthError("No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setPets([]);
    setSelectedPet(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const getEspecieEmoji = (especie: string) => {
    const esp = especie.toLowerCase();
    if (esp.includes('perro') || esp.includes('can')) return '🐶';
    if (esp.includes('gato') || esp.includes('fel')) return '🐱';
    if (esp.includes('ave') || esp.includes('paj')) return '🦜';
    if (esp.includes('conejo')) return '🐰';
    return '🐾';
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Portal Header */}
      <header className="portal-header">
        <h1>PetClinic Portal</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="theme-toggle-btn"
            onClick={() => setIsDark(!isDark)}
            aria-label="Alternar tema"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {token && (
            <button 
              className="theme-toggle-btn"
              onClick={handleLogout}
              style={{ color: '#ef4444' }}
              aria-label="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="portal-container animate-fade-in" style={{ flex: 1 }}>
        {!token ? (
          /* Authentication Forms */
          <div className="auth-box">
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>
              {authView === 'login' ? 'Iniciar Sesión' : 'Registrar Cuenta'}
            </h2>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              {authView === 'login' 
                ? 'Accede al historial de tus mascotas registradas en la clínica' 
                : 'Crea tu cuenta de propietario usando tu correo registrado en la clínica'}
            </p>

            {authError && <div className="alert alert-danger">{authError}</div>}
            {authSuccess && <div className="alert alert-success">{authSuccess}</div>}

            <form onSubmit={authView === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label"><Mail size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Correo Electrónico</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label"><Lock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Contraseña</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Procesando...' : (authView === 'login' ? 'Ingresar' : 'Registrar')}
              </button>
            </form>

            <button 
              className="btn-link"
              onClick={() => {
                setAuthView(authView === 'login' ? 'register' : 'login');
                setAuthError(null);
                setAuthSuccess(null);
              }}
            >
              {authView === 'login' 
                ? '¿No tienes cuenta? Registrate aquí' 
                : '¿Ya tienes una cuenta? Inicia sesión'}
            </button>
          </div>
        ) : (
          /* Logged In Views */
          <div>
            {currentTab === 'pets' && (
              <div>
                {!selectedPet ? (
                  /* Pets Dashboard */
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <User size={20} className="primary-color" />
                      <div>
                        <h2 style={{ fontSize: '1.2rem' }}>¡Hola, {user?.nombreCompleto}!</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aquí tienes el estado de tus mascotas</p>
                      </div>
                    </div>

                    {loading ? (
                      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>Cargando tus mascotas...</p>
                    ) : pets.length === 0 ? (
                      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>No tienes mascotas registradas.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {pets.map((pet) => (
                          <div 
                            key={pet.id} 
                            className="pet-card"
                            onClick={() => handleSelectPet(pet)}
                          >
                            <div className="pet-card-header">
                              <div className="pet-card-title">
                                <div className="pet-avatar">
                                  {getEspecieEmoji(pet.especie)}
                                </div>
                                <div>
                                  <h3 style={{ fontSize: '1.1rem' }}>{pet.nombre}</h3>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{pet.especie} • {pet.raza}</p>
                                </div>
                              </div>
                              <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Pet Detail Sub-view */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Back to list button */}
                    <button 
                      className="btn-link"
                      onClick={() => setSelectedPet(null)}
                      style={{ textAlign: 'left', display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0 }}
                    >
                      ← Volver a mis mascotas
                    </button>

                    {/* Pet Info Card */}
                    <div className="pet-card" style={{ cursor: 'default' }}>
                      <div className="pet-card-header">
                        <div className="pet-card-title">
                          <div className="pet-avatar">
                            {getEspecieEmoji(selectedPet.especie)}
                          </div>
                          <div>
                            <h2 style={{ fontSize: '1.3rem' }}>{selectedPet.nombre}</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedPet.especie} • {selectedPet.raza}</p>
                          </div>
                        </div>
                        {petHospitalization ? (
                          <span className="badge badge-warning">Internado</span>
                        ) : (
                          <span className="badge badge-success">Estable</span>
                        )}
                      </div>

                      <div className="pet-details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Sexo</span>
                          <span className="detail-value">{selectedPet.sexo}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Color</span>
                          <span className="detail-value">{selectedPet.color}</span>
                        </div>
                        <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                          <span className="detail-label">Fecha de Nacimiento</span>
                          <span className="detail-value">{formatDate(selectedPet.fechaNacimiento)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Hospitalization Cage Banner */}
                    {petHospitalization && (
                      <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <ShieldAlert size={24} style={{ flexShrink: 0 }} />
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Mascota Hospitalizada</h4>
                          <p style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                            Ubicación: <strong>{petHospitalization.numeroJaula}</strong>
                          </p>
                          <p style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                            Motivo: <em>{petHospitalization.motivo}</em>
                          </p>
                        </div>
                      </div>
                    )}

                    {detailsLoading ? (
                      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>Cargando historial de la mascota...</p>
                    ) : (
                      <>
                        {/* Weight Log Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={18} style={{ color: 'var(--primary-color)' }} /> Historial de Pesos
                          </h3>
                          {petWeights.length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No hay pesos registrados.</p>
                          ) : (
                            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                              {petWeights.map((w) => (
                                <div 
                                  key={w.id} 
                                  style={{ 
                                    backgroundColor: 'var(--bg-card)', 
                                    border: '1px solid var(--border-color)', 
                                    borderRadius: '12px', 
                                    padding: '10px 14px', 
                                    textAlign: 'center',
                                    minWidth: '95px',
                                    boxShadow: 'var(--shadow-sm)'
                                  }}
                                >
                                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-color)' }}>{w.pesoKg} kg</div>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{formatDate(w.fechaRegistro)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Medical History Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <History size={18} style={{ color: 'var(--primary-color)' }} /> Consultas y Diagnósticos
                          </h3>
                          {petHistory.length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No hay consultas previas registradas.</p>
                          ) : (
                            <div className="history-section">
                              {petHistory.map((h) => (
                                <div key={h.id} className="history-item">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="history-date">{formatDate(h.fechaAtencion)}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dr. {h.veterinarioNombreCompleto}</div>
                                  </div>
                                  <div className="history-diag">{h.diagnostico}</div>
                                  <div className="history-treat">
                                    <strong>Tratamiento:</strong> {h.tratamiento}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'citas' && (
              /* Appointments Placeholder */
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Calendar size={64} style={{ color: 'var(--primary-color)', margin: '0 auto 20px', opacity: 0.8 }} />
                <h2>Reservar Cita Online</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '10px' }}>
                  Próximamente podrás agendar y gestionar las citas médicas para tus mascotas directamente desde tu celular.
                </p>
                <div style={{ marginTop: '24px', display: 'inline-block', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                  ¡Próximamente disponible!
                </div>
              </div>
            )}

            {currentTab === 'tienda' && (
              /* Store Placeholder */
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <ShoppingBag size={64} style={{ color: 'var(--primary-color)', margin: '0 auto 20px', opacity: 0.8 }} />
                <h2>Tienda de Alimentos y Accesorios</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '10px' }}>
                  Próximamente podrás comprar alimentos balanceados, juguetes y accesorios recomendados por nuestros veterinarios.
                </p>
                <div style={{ marginTop: '24px', display: 'inline-block', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                  ¡Próximamente disponible!
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Fixed Navigation Bar */}
      {token && (
        <nav className="bottom-nav">
          <button 
            className={`nav-item ${currentTab === 'pets' ? 'active' : ''}`}
            onClick={() => {
              setCurrentTab('pets');
              setSelectedPet(null);
            }}
          >
            <Heart size={22} />
            <span>Mascotas</span>
          </button>

          <button 
            className={`nav-item ${currentTab === 'citas' ? 'active' : ''} disabled`}
            onClick={() => setCurrentTab('citas')}
          >
            <Calendar size={22} />
            <span>Citas <span>Próximamente</span></span>
          </button>

          <button 
            className={`nav-item ${currentTab === 'tienda' ? 'active' : ''} disabled`}
            onClick={() => setCurrentTab('tienda')}
          >
            <ShoppingBag size={22} />
            <span>Tienda <span>Próximamente</span></span>
          </button>
        </nav>
      )}
    </div>
  );
}
