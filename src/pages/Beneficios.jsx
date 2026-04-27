import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store.js';
import { api } from '../api/client.js';

export default function Beneficios() {
  const empleado = useAuthStore((s) => s.empleado);
  const [beneficios, setBeneficios] = useState([]);

  useEffect(() => {
    api.get('/beneficios').then(r => setBeneficios(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const hoy = new Date();

  return (
    <div style={{ padding: '16px', fontFamily: 'system-ui, sans-serif', maxWidth: 420, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', borderRadius: 16, padding: '20px', color: '#fff', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.8, marginBottom: 8 }}>Credencial de beneficios</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{empleado?.nombreCompleto}</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{empleado?.cargo} — {empleado?.area}</div>
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 8 }}>Legajo {empleado?.legajo}</div>
        <div style={{ marginTop: 12, fontSize: 11, opacity: 0.7 }}>MECAN RRHH</div>
      </div>

      {beneficios.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888', fontSize: 14 }}>No hay beneficios activos</p>
      ) : (
        beneficios.map(b => {
          const venc = new Date(b.vencimiento);
          const vencido = venc < hoy;
          const diasRestantes = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
          return (
            <div key={b.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: '16px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{b.nombre}</div>
                {vencido
                  ? <span style={{ fontSize: 10, background: '#FCEBEB', color: '#A32D2D', padding: '2px 8px', borderRadius: 20 }}>Vencido</span>
                  : diasRestantes <= 7
                  ? <span style={{ fontSize: 10, background: '#FAEEDA', color: '#854F0B', padding: '2px 8px', borderRadius: 20 }}>Vence en {diasRestantes}d</span>
                  : <span style={{ fontSize: 10, background: '#E1F5EE', color: '#0F6E56', padding: '2px 8px', borderRadius: 20 }}>Vigente</span>
                }
              </div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{b.comercio}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1D9E75', marginTop: 8 }}>{b.descuento}</div>
              {b.descripcion && <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>{b.descripcion}</div>}
              <div style={{ fontSize: 11, color: '#bbb', marginTop: 8 }}>Válido hasta {venc.toLocaleDateString('es-AR')}</div>
            </div>
          );
        })
      )}
    </div>
  );
}