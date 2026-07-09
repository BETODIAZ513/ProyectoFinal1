import React, { useState, useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { 
  LogOut, 
  Sun, 
  Moon, 
  Heart, 
  TrendingUp, 
  ChevronRight,
  ShieldAlert,
  Calendar,
  ShoppingBag,
  History,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const API_BASE = "http://localhost:5210/api";

// Interfaces
interface MascotaDto {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  fechaNacimiento: string;
  sexo: string;
  color: string;
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
  fechaIngreso: string;
  motivo: string;
  numeroJaula: string;
}

interface UserStatus {
  linked: boolean;
  activo?: boolean;
  nombreCompleto?: string;
  email?: string;
}

// JWT base64url Encoder for offline development
const generateMockFirebaseToken = (uid: string, email: string) => {
  return `mock_${uid}_${email}`;
};

export default function App() {
  // Theme State
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  // Auth & Status States
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'link' | 'register-remote' | 'dashboard'>('login');
  
  // Tab Navigation State
  const [currentTab, setCurrentTab] = useState<'pets' | 'citas' | 'tienda'>('pets');
  
  // Dashboard Data State
  const [pets, setPets] = useState<MascotaDto[]>([]);
  const [selectedPet, setSelectedPet] = useState<MascotaDto | null>(null);
  const [petHistory, setPetHistory] = useState<PortalConsultaDto[]>([]);
  const [petWeights, setPetWeights] = useState<RegistroPeso[]>([]);
  const [petHospitalization, setPetHospitalization] = useState<HospitalizacionDto | null>(null);

  // Form Inputs
  const [googleEmail, setGoogleEmail] = useState('juan.perez@test.com');
  const [otpCode, setOtpCode] = useState('');
  const [remoteName, setRemoteName] = useState('');
  const [remotePhone, setRemotePhone] = useState('');
  const [remoteAddress, setRemoteAddress] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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

  // Fetch status on token change
  useEffect(() => {
    if (token) {
      fetchStatus();
    } else {
      setStatus(null);
      setCurrentView('login');
    }
  }, [token]);

  const fetchStatus = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`${API_BASE}/portal/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data: UserStatus = await response.json();
        setStatus(data);
        if (!data.linked) {
          setCurrentView('link');
        } else if (data.activo === false) {
          setCurrentView('dashboard'); // pending verification view
        } else {
          setCurrentView('dashboard');
          loadPets();
        }
      } else {
        handleLogout();
      }
    } catch (err) {
      setErrorMsg("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const loadPets = async () => {
    try {
      const response = await fetch(`${API_BASE}/portal/pets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPets(data);
      }
    } catch (err) {
      console.error("Error al cargar mascotas:", err);
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

  // Google Login Real trigger using Firebase Auth popup
  const handleGoogleLoginReal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userToken = await result.user.getIdToken();
      setToken(userToken);
      localStorage.setItem('token', userToken);
    } catch (err: any) {
      console.error("Error en Firebase Auth: ", err);
      // Friendly message for popups blocked or closed by user
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg("Inicio de sesión cancelado por el usuario.");
      } else {
        setErrorMsg("Error al iniciar sesión con Google (Firebase): " + (err.message || "Inténtelo de nuevo"));
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Login Mock trigger
  const handleGoogleLoginMock = () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Generate a mock UID based on the email
      const mockUid = "google-uid-" + googleEmail.replace(/[^a-zA-Z0-9]/g, "");
      const generatedToken = generateMockFirebaseToken(mockUid, googleEmail);
      
      setToken(generatedToken);
      localStorage.setItem('token', generatedToken);
    } catch (err) {
      setErrorMsg("Error al simular inicio de sesión de Google.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Link Action
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`${API_BASE}/portal/vincular`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ codigo: otpCode })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(data.message || "Cuenta vinculada correctamente.");
        setOtpCode('');
        fetchStatus();
      } else {
        setErrorMsg(data.message || "Código de vinculación inválido o expirado.");
      }
    } catch (err) {
      setErrorMsg("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Remote Sign-up Action
  const handleRemoteSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remoteName || !remotePhone || !remoteAddress) {
      setErrorMsg("Por favor, complete todos los campos.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`${API_BASE}/portal/registro-remoto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombreCompleto: remoteName,
          telefono: remotePhone,
          direccion: remoteAddress
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(data.message);
        fetchStatus();
      } else {
        setErrorMsg(data.message || "Error al registrar el perfil remoto.");
      }
    } catch (err) {
      setErrorMsg("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setStatus(null);
    setPets([]);
    setSelectedPet(null);
    localStorage.removeItem('token');
    setCurrentView('login');
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
        {errorMsg && <div className="alert alert-danger" style={{ marginBottom: '16px' }}>{errorMsg}</div>}
        {successMsg && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{successMsg}</div>}

        {currentView === 'login' && (
          /* Google Authentication View */
          <div className="auth-box">
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Acceso con Google</h2>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Utilice su cuenta de Google registrada en la clínica para ingresar al portal.
            </p>

            <button 
              onClick={handleGoogleLoginReal} 
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#4285F4', marginBottom: '20px' }}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.8 2.72v2.24h2.9c1.7-1.57 2.7-3.88 2.7-6.59z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.58-5.05-3.71H.95v2.32C2.43 15.89 5.5 18 9 18z" fill="#34A853"/>
                <path d="M3.95 10.72A5.4 5.4 0 0 1 3.6 9c0-.6.1-1.19.35-1.72V4.96H.95A9 9 0 0 0 .95 13.04l3-2.32z" fill="#FBBC05"/>
                <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2A9 9 0 0 0 .95 4.96l3 2.32C4.66 5.16 6.65 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              {loading ? 'Conectando...' : 'Iniciar Sesión con Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-secondary)' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)', opacity: 0.3 }} />
              <span style={{ padding: '0 10px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}>Ó MOCK LOGIN (Desarrollo)</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)', opacity: 0.3 }} />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Simular Correo de Google</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="email"
                  className="form-input" 
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="ej: juan.perez@test.com"
                  style={{ flex: 1 }}
                />
                <button 
                  onClick={handleGoogleLoginMock}
                  className="btn-primary"
                  style={{ width: 'auto', padding: '0 16px', background: '#3b82f6', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                  disabled={loading}
                >
                  Simular
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'link' && (
          /* Link Account OTP View */
          <div className="auth-box">
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Vincular tu Perfil</h2>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Tu cuenta de Google no está asociada a ningún cliente. Si ya eres cliente presencial, ingresa el código único de 6 dígitos brindado en recepción.
            </p>

            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Código de Vinculación (6 dígitos)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="ej: 123456"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required 
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Validando...' : 'Verificar y Enlazar'}
              </button>
            </form>

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '16px', textAlign: 'center' }}>
              <button 
                className="btn-link"
                onClick={() => setCurrentView('register-remote')}
              >
                No tengo código / Soy un cliente nuevo
              </button>
            </div>
          </div>
        )}

        {currentView === 'register-remote' && (
          /* Remote Sign-up Form */
          <div className="auth-box">
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Completar Registro</h2>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Registra tus datos básicos para crear tu cuenta en línea. Estará en proceso de verificación por la clínica.
            </p>

            <form onSubmit={handleRemoteSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="ej: Carlos Sánchez"
                  value={remoteName}
                  onChange={(e) => setRemoteName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="ej: 987654321"
                  value={remotePhone}
                  onChange={(e) => setRemotePhone(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="ej: Av. Primavera 123"
                  value={remoteAddress}
                  onChange={(e) => setRemoteAddress(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Enviar Registro'}
              </button>
            </form>

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '16px', textAlign: 'center' }}>
              <button 
                className="btn-link"
                onClick={() => setCurrentView('link')}
              >
                Volver a ingresar código único
              </button>
            </div>
          </div>
        )}

        {currentView === 'dashboard' && (
          /* Dashboard View (Unverified / Verified) */
          <div>
            {status?.activo === false ? (
              /* Pending Verification Locked Screen */
              <div className="auth-box" style={{ textAlign: 'center', padding: '32px 20px', border: '1px solid var(--warning-color)' }}>
                <ShieldAlert size={64} style={{ color: 'var(--warning-color)', margin: '0 auto 20px', opacity: 0.8 }} />
                <h2 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Cuenta por Verificar</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  ¡Hola <strong>{status.nombreCompleto}</strong>! Tu cuenta ha sido creada exitosamente pero se encuentra en proceso de validación por la clínica. 
                </p>
                <div style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning-color)', padding: '12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, textAlign: 'left', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <HelpCircle size={18} style={{ flexShrink: 0 }} />
                  <span>Para agendar tu primera cita y registrar tus mascotas, el personal administrativo debe validar tu identidad. Te esperamos en recepción o puedes comunicarte con nosotros.</span>
                </div>
              </div>
            ) : (
              /* Normal Active Dashboard */
              <div>
                {currentTab === 'pets' && (
                  <div>
                    {!selectedPet ? (
                      /* Pets list */
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                          <CheckCircle size={20} className="primary-color" style={{ color: 'var(--success-color)' }} />
                          <div>
                            <h2 style={{ fontSize: '1.2rem' }}>¡Hola, {status?.nombreCompleto}!</h2>
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
                      /* Pet details */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <button 
                          className="btn-link"
                          onClick={() => setSelectedPet(null)}
                          style={{ textAlign: 'left', display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0 }}
                        >
                          ← Volver a mis mascotas
                        </button>

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
                                      <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
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
          </div>
        )}
      </main>

      {/* Bottom Fixed Navigation Bar */}
      {token && (
        <nav className="bottom-nav">
          <button 
            className={`nav-item ${currentTab === 'pets' ? 'active' : ''} ${status?.activo === false ? 'disabled' : ''}`}
            disabled={status?.activo === false}
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
