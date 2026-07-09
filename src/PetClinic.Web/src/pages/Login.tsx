import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, User, AlertCircle, RefreshCw } from "lucide-react";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError("Por favor, rellene todos los campos.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5210/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.succeeded) {
        throw new Error(data.message || "Credenciales incorrectas.");
      }

      login(data.token, data.user);
      navigate("/inicio");
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Shield className="logo-icon" />
          </div>
          <h1>PetClinic</h1>
          <p className="subtitle">Clinical Precision Management System</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario o Correo Electrónico</label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                id="username"
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="ej: admin@petclinic.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <span className="spinner-wrapper">
                <RefreshCw className="spinner" /> Conectando...
              </span>
            ) : (
              "Ingresar al Sistema"
            )}
          </button>
        </form>

      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          font-family: 'Outfit', 'Inter', sans-serif;
          padding: 20px;
          box-sizing: border-box;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          animation: fadeIn 0.5s ease-out;
          color: #f8fafc;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          border-radius: 12px;
          margin-bottom: 16px;
          box-shadow: 0 8px 16px rgba(6, 182, 212, 0.25);
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          color: #ffffff;
        }

        .login-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
          background: linear-gradient(to right, #ffffff, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 24px;
          color: #fca5a5;
          font-size: 14px;
        }

        .error-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: #94a3b8;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          width: 18px;
          height: 18px;
          color: #64748b;
          pointer-events: none;
        }

        .input-wrapper input {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px 16px 12px 44px;
          color: #ffffff;
          font-size: 15px;
          outline: none;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }

        .input-wrapper input:focus {
          border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
          background: rgba(15, 23, 42, 0.8);
        }

        .btn-submit {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
          margin-top: 10px;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(6, 182, 212, 0.35);
        }

        .btn-submit:active {
          transform: translateY(0);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          animation: spin 1s linear infinite;
          width: 16px;
          height: 16px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .test-accounts-section {
          margin-top: 30px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          text-align: center;
        }

        .test-accounts-section h3 {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 12px 0;
        }

        .test-buttons {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .btn-test {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 8px 4px;
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-test:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          border-color: rgba(6, 182, 212, 0.4);
        }
      `}</style>
    </div>
  );
};
