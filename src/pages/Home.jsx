// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store.js';

export default function Home() {
  const empleado = useAuthStore((s) => s.empleado);
  const navigate = useNavigate();

  const accesos = [
    { label: 'Recibos',     sub: 'Descarga tus recibos',  path: '/recibos',       color: '#EEF2FF', icon: '📄' },
    { label: 'Cuenta cte.', sub: 'Ver movimientos',       path: '/cuenta',        color: '#DCFCE7', icon: '📈' },
    { label: 'RRHH',        sub: 'Solicitudes',           path: '/rrhh',          color: '#FEF3C7', icon: '📋' },
    { label: 'Fichar',      sub: 'Entrada / salida',      path: '/fichaje',       color: '#F3E8FF', icon: '🕐' },
    { label: 'Capacitaciones', sub: 'Ver cursos',         path: '/capacitaciones',color: '#FFF1F0', icon: '📚' },
    { label: 'Beneficios',  sub: 'Ver beneficios',        path: '/beneficios',    color: '#F0FFF4', icon: '🎁' },
  ];

  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>
          Hola, {empleado?.nombre?.split(' ')[0]}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 4, fontSize: 14 }}>
          {empleado?.cargo}
          {empleado?.sector ? ` · ${empleado.sector}` : ''}
        </p>
      </div>

      <p className="section-title">Accesos rápidos</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {accesos.map((a) => (
          <button key={a.path} onClick={() => navigate(a.path)}
            style={{
              background: a.color,
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              textAlign: 'left',
              cursor: 'pointer'
            }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{a.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{a.label}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{a.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
