// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api.js';
import { useAuthStore } from '../store/auth.store.js';

export default function Login() {
  const [legajo, setLegajo]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await authApi.login(legajo, password);
      setAuth(data.empleado, data.accessToken, data.refreshToken);
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
        <h1 style={{ fontSize: 26, fontWeight: 600, color: 'var(--color-text)' }}>Mi Portal</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 6 }}>Ingresá con tu legajo y contraseña</p>
      </div>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label>Legajo</label>
          <input type="text" value={legajo} onChange={e => setLegajo(e.target.value)}
            placeholder="001" autoComplete="username" inputMode="numeric" required />
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
