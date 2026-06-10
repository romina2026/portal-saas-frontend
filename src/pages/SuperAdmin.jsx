// src/pages/SuperAdmin.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store.js';
import { superApi } from '../api/client.js';

const PLANES = ['starter', 'growth', 'pro'];
const PLAN_LABELS = { starter: 'Starter (25 emp)', growth: 'Growth (75 emp)', pro: 'Pro (150 emp)' };
const PLAN_PRECIOS = { starter: '$35.000', growth: '$75.000', pro: '$130.000' };

export default function SuperAdmin() {
  const navigate = useNavigate();
  const { superAdmin, logoutSuper, isSuperAdmin } = useAuthStore();
  const [tab, setTab] = useState('empresas');
  const [empresas, setEmpresas] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', cuit: '', email_admin: '', plan: 'starter', password_admin: '', nombre_admin: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin()) { navigate('/super/login'); return; }
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [empRes, statsRes] = await Promise.all([
        superApi.get('/super/empresas'),
        superApi.get('/super/stats'),
      ]);
      setEmpresas(empRes.data);
      setStats(statsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function crearEmpresa(e) {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      await superApi.post('/super/empresas', form);
      setModal(false);
      setForm({ nombre: '', cuit: '', email_admin: '', plan: 'starter', password_admin: '', nombre_admin: '' });
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear empresa.');
    } finally {
      setSaving(false);
    }
  }

  async function cambiarEstado(id, estado) {
    try {
      await superApi.put(`/super/empresas/${id}`, { estado });
      cargarDatos();
    } catch (e) { console.error(e); }
  }

  function handleLogout() {
    logoutSuper();
    navigate('/super/login');
  }

  const s = { background: '#0f172a', minHeight: '100dvh', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' };

  return (
    <div style={s}>
      {/* Header */}
      <div style={{ background: '#1e293b', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>⚙️ Portal SaaS</span>
          <span style={{ color: '#94a3b8', fontSize: 13, marginLeft: 12 }}>Super Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>{superAdmin?.nombre}</span>
          <button onClick={handleLogout} style={{ padding: '6px 14px', borderRadius: 6, background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Empresas activas', value: stats.empresas_activas, color: '#22c55e' },
              { label: 'Total empleados', value: stats.total_empleados, color: '#6366f1' },
              { label: 'Plan Starter', value: stats.plan_starter, color: '#f59e0b' },
              { label: 'Plan Growth', value: stats.plan_growth, color: '#3b82f6' },
              { label: 'Plan Pro', value: stats.plan_pro, color: '#8b5cf6' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#1e293b', borderRadius: 12, padding: '20px', border: '1px solid #334155' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color }}>{value || 0}</div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Botón nueva empresa */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Empresas</h2>
          <button onClick={() => setModal(true)}
            style={{ padding: '10px 20px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            + Nueva Empresa
          </button>
        </div>

        {/* Tabla empresas */}
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Cargando...</p>
        ) : (
          <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  {['Empresa', 'Email Admin', 'Plan', 'Empleados', 'Estado', 'Vencimiento', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {empresas.map(emp => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{emp.nombre}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{emp.cuit}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{emp.email_admin}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: emp.plan === 'pro' ? '#4c1d95' : emp.plan === 'growth' ? '#1e3a8a' : '#1c1917',
                        color: emp.plan === 'pro' ? '#c4b5fd' : emp.plan === 'growth' ? '#93c5fd' : '#a8a29e' }}>
                        {emp.plan}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{emp.total_empleados}/{emp.max_empleados}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: emp.estado === 'activa' ? '#14532d' : '#450a0a',
                        color: emp.estado === 'activa' ? '#86efac' : '#fca5a5' }}>
                        {emp.estado}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 13 }}>
                      {emp.fecha_vencimiento ? new Date(emp.fecha_vencimiento).toLocaleDateString('es-AR') : '-'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => cambiarEstado(emp.id, emp.estado === 'activa' ? 'inactiva' : 'activa')}
                          style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: 'none',
                            background: emp.estado === 'activa' ? '#7f1d1d' : '#14532d',
                            color: emp.estado === 'activa' ? '#fca5a5' : '#86efac' }}>
                          {emp.estado === 'activa' ? 'Suspender' : 'Activar'}
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(emp.id)}
                          style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: '1px solid #334155', background: 'transparent', color: '#94a3b8' }}>
                          Copiar ID
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {empresas.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>No hay empresas registradas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal nueva empresa */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}>
          <div style={{ background: '#1e293b', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, border: '1px solid #334155' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Nueva Empresa</h3>
            <form onSubmit={crearEmpresa} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Nombre de la empresa *', key: 'nombre', placeholder: 'Empresa S.A.' },
                { label: 'CUIT', key: 'cuit', placeholder: '30-12345678-9' },
                { label: 'Email del admin *', key: 'email_admin', placeholder: 'admin@empresa.com', type: 'email' },
                { label: 'Nombre del admin', key: 'nombre_admin', placeholder: 'Juan García' },
                { label: 'Contraseña inicial del admin *', key: 'password_admin', placeholder: '••••••••', type: 'password' },
              ].map(({ label, key, placeholder, type = 'text' }) => (
                <div key={key}>
                  <label style={{ fontSize: 13, color: '#94a3b8' }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder} required={label.includes('*')}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#fff', marginTop: 4, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8' }}>Plan</label>
                <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#fff', marginTop: 4 }}>
                  {PLANES.map(p => <option key={p} value={p}>{PLAN_LABELS[p]} — {PLAN_PRECIOS[p]}/mes</option>)}
                </select>
              </div>
              {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  {saving ? 'Creando...' : 'Crear Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
