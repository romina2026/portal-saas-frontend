import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';

export default function Capacitaciones() {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/capacitaciones/empleado')
      .then(r => setCapacitaciones(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pendientes = capacitaciones.filter(c => !c.completado);
  const completadas = capacitaciones.filter(c => c.completado);

  return (
    <div>
      <PageHeader title="Capacitaciones" sub="Tus capacitaciones asignadas" />
      <div style={{ padding: '0 16px 16px' }}>
        {loading && <p style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>Cargando...</p>}
        {!loading && capacitaciones.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>No tenés capacitaciones asignadas.</p>
        )}

        {pendientes.length > 0 && (
          <>
            <p className="section-title" style={{ marginTop: 16 }}>Pendientes</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {pendientes.map(c => (
                <div key={c.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 15 }}>{c.nombre}</p>
                      {c.descripcion && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>{c.descripcion}</p>}
                      {c.fecha_limite && (
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>
                          Fecha limite: {new Date(c.fecha_limite).toLocaleDateString('es-AR')}
                        </p>
                      )}
                    </div>
                    <span className="badge badge-warning">Pendiente</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {completadas.length > 0 && (
          <>
            <p className="section-title" style={{ marginTop: 20 }}>Completadas</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {completadas.map(c => (
                <div key={c.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 15 }}>{c.nombre}</p>
                      {c.descripcion && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>{c.descripcion}</p>}
                      {c.fecha_completado && (
                        <p style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 6 }}>
                          Completada el {new Date(c.fecha_completado).toLocaleDateString('es-AR')}
                        </p>
                      )}
                    </div>
                    <span className="badge badge-success">Completada</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
