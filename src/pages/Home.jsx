import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store.js';
import { cuentaApi } from '../api/apis.js';
import { api } from '../api/client.js';
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export default function Home() {
  const empleado = useAuthStore((s) => s.empleado);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [saldo, setSaldo] = useState(null);
  const [avisos, setAvisos] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { cuentaApi.getSaldo().then(r => setSaldo(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    
    api.get('/avisos').then(r => setAvisos(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);
  }, [accessToken]);
  const accesos = [
    { label: 'Recibos', sub: 'Descarga tus recibos', path: '/recibos', color: '#EEF2FF', icon: '📄' },
    { label: 'Cuenta cte.', sub: 'Ver movimientos', path: '/cuenta', color: '#DCFCE7', icon: '📊' },
    { label: 'RRHH', sub: 'Solicitudes', path: '/rrhh', color: '#FEF3C7', icon: '📋' },
    { label: 'Fichar', sub: 'Entrada / salida', path: '/fichaje', color: '#F3E8FF', icon: '🕐' },
  ];
  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>Hola, {empleado?.nombreCompleto?.split(' ')[0]}</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 4, fontSize: 14 }}>{empleado?.cargo} en {empleado?.area}</p>
      </div>
      {saldo && (
        <div className="card" style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Saldo cuenta corriente</p>
          <p style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}><span className="moneda">{Number(saldo.saldo).toLocaleString('es-AR')}</span></p>
          <span className={`badge badge-${saldo.estado === 'al_dia' ? 'success' : 'warning'}`} style={{ marginTop: 8 }}>{saldo.estado === 'al_dia' ? 'Al dia' : saldo.estado}</span>
        </div>
      )}
      {avisos.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>Cartelera de avisos</p>
          {avisos.map(a => (
            <div key={a.id} style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid #e5e5e5', background: a.importante ? '#FFFBF0' : '#fff', marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{a.importante ? '⚠️ ' : ''}{a.titulo}</div>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>{a.contenido}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>{new Date(a.created_at).toLocaleDateString('es-AR')}</div>
            </div>
          ))}
        </div>
      )}
      <p className="section-title">Accesos rapidos</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {accesos.map((a) => (
          <button key={a.path} onClick={() => navigate(a.path)} style={{ background: a.color, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 16, textAlign: 'left', cursor: 'pointer' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{a.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{a.label}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{a.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

