// src/pages/CambiarPass.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

export default function CambiarPass() {
  const [actual, setActual]   = useState('');
  const [nueva, setNueva]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (nueva.length < 6) return setError('Mínimo 6 caracteres.');
    setError(''); setLoading(true);
    try {
      await api.post('/auth/cambiar-password', { passwordActual: actual, passwordNueva: nueva });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px', background: 'var(--color-bg)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text)' }}>Cambiá tu contraseña</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 6 }}>Requerido en el primer ingreso</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label>Contraseña actual</label>
          <input type="password" value={actual} onChange={e => setActual(e.target.value)} required />
        </div>
        <div>
          <label>Nueva contraseña</label>
          <input type="password" value={nueva} onChange={e => setNueva(e.target.value)} required minLength={6} />
        </div>
        {error && <p style={{ color: 'var(--color-danger)', fontSize: 14 }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </form>
    </div>
  );
}
