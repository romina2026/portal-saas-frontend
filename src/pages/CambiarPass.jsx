// src/pages/CambiarPass.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api.js';
import PageHeader from '../components/PageHeader.jsx';

export default function CambiarPass() {
  const [actual, setActual]   = useState('');
  const [nueva, setNueva]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (nueva.length < 8) return setError('Mínimo 8 caracteres.');
    setError(''); setLoading(true);
    try {
      await authApi.cambiarPassword(actual, nueva);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Cambiá tu contraseña" sub="Requerido en el primer ingreso" />
      <div style={{ padding: '16px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>Contraseña actual</label>
            <input type="password" value={actual} onChange={e => setActual(e.target.value)} required />
          </div>
          <div>
            <label>Nueva contraseña</label>
            <input type="password" value={nueva} onChange={e => setNueva(e.target.value)} required minLength={8} />
          </div>
          {error && <p style={{ color: 'var(--color-danger)', fontSize: 14 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
