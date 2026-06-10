// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store.js';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function Login() {
  const [empresaId, setEmpresaId] = useState('');
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/login`, {
        username: username.trim(),
        password,
        empresa_id: empresaId.trim(),
      });
      setAuth(data.empleado, data.accessToken);
      navigate(data.debeCambiarPass ? '/cambiar-password' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px', background: 'var(--color-bg)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: 'var(--color-text)' }}>Portal del Empleado</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 6 }}>Ingresá con tus datos</p>
      </div>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label>ID de Empresa</label>
          <input type="text" value={empresaId} onChange={e => setEmpresaId(e.target.value)}
            placeholder="ID de tu empresa" required />
        </div>
        <div>
          <label>Usuario</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)}
            placeholder="Tu usuario" autoComplete="username" required />
        </div>
        <div>
          <label>Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" autoComplete="current-password" required />
        </div>
        {error && <p style={{ color: 'var(--color-danger)', fontSize: 14 }}>{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
