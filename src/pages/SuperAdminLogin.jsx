// src/pages/SuperAdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store.js';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function SuperAdminLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const setSuperAuth = useAuthStore((s) => s.setSuperAuth);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/login-super`, { email, password });
      setSuperAuth(data.superAdmin, data.accessToken);
      navigate('/super');
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px', background: '#0f172a' }}>
      <div style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>⚙️ Super Admin</h1>
          <p style={{ color: '#94a3b8', marginTop: 6 }}>Panel de administración del SaaS</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ color: '#cbd5e1', fontSize: 14 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@portal-saas.com" required
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#fff', marginTop: 4 }} />
          </div>
          <div>
            <label style={{ color: '#cbd5e1', fontSize: 14 }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#fff', marginTop: 4 }} />
          </div>
          {error && <p style={{ color: '#f87171', fontSize: 14 }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ padding: '12px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
