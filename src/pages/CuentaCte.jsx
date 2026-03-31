// src/pages/CuentaCte.jsx
import { useEffect, useState } from 'react';
import { cuentaApi } from '../api/apis.js';
import PageHeader from '../components/PageHeader.jsx';

export default function CuentaCte() {
  const [saldo, setSaldo]           = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([cuentaApi.getSaldo(), cuentaApi.getMovimientos()])
      .then(([s, m]) => { setSaldo(s.data); setMovimientos(m.data.items || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Cuenta corriente" sub="Datos en tiempo real desde el manager" />
      <div style={{ padding: '0 16px 16px' }}>
        {saldo && (
          <div className="card" style={{ marginTop: 8, marginBottom: 4 }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Saldo actual</p>
            <p style={{ fontSize: 30, fontWeight: 700, marginTop: 4 }}>
              {saldo.moneda} {Number(saldo.saldo).toLocaleString('es-AR')}
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Actualizado: {new Date(saldo.ultimaActualizacion).toLocaleString('es-AR')}
            </p>
          </div>
        )}
        <p className="section-title">Historial</p>
        {loading && <p style={{ color: 'var(--color-text-muted)' }}>Cargando...</p>}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {movimientos.map((m, i) => (
            <div key={m.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: 14 }}>{m.descripcion}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {new Date(m.fecha).toLocaleDateString('es-AR')}
                </p>
              </div>
              <p style={{ fontWeight: 600, fontSize: 15, color: m.monto >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {m.monto >= 0 ? '+' : ''}{Number(m.monto).toLocaleString('es-AR')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
