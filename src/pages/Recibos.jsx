// src/pages/Recibos.jsx
import { useEffect, useState } from 'react';
import { recibosApi } from '../api/apis.js';
import { api } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';

export default function Recibos() {
  const [recibos, setRecibos]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [urls, setUrls]         = useState({});
  const [cargando, setCargando] = useState(null);
  const [firmando, setFirmando] = useState(null);
  const [msgFirma, setMsgFirma] = useState({});

  useEffect(() => {
    recibosApi.listar()
      .then(r => setRecibos(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function generarLink(id) {
    if (urls[id]) return;
    setCargando(id);
    try {
      const { data } = await recibosApi.getUrlDescarga(id);
      setUrls(prev => ({ ...prev, [id]: data.url }));
    } catch {
      alert('Error al generar el enlace.');
    } finally {
      setCargando(null);
    }
  }

  async function firmar(id) {
    if (!confirm('¿Confirmás que recibiste este recibo de sueldo?')) return;
    setFirmando(id);
    try {
      await api.post(`/recibos/${id}/firmar`);
      setRecibos(prev => prev.map(r => r.id === id ? { ...r, confirmado: true, fecha_confirmacion: new Date().toISOString() } : r));
      setMsgFirma(prev => ({ ...prev, [id]: 'Recibo confirmado correctamente.' }));
    } catch (err) {
      setMsgFirma(prev => ({ ...prev, [id]: err.response?.data?.error || 'Error al confirmar.' }));
    } finally {
      setFirmando(null);
    }
  }

  return (
    <div>
      <PageHeader title="Recibos de sueldo" sub="Tus recibos disponibles" />
      <div style={{ padding: '0 16px 16px' }}>
        {loading && <p style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>Cargando...</p>}
        {!loading && recibos.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>No hay recibos disponibles.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {recibos.map((r) => (
            <div key={r.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 600 }}>{formatPeriodo(r.periodo)}</p>
                  {r.confirmado && (
                    <p style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 4 }}>
                      ✓ Confirmado el {new Date(r.fecha_confirmacion).toLocaleDateString('es-AR')}
                    </p>
                  )}
                  {msgFirma[r.id] && (
                    <p style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 4 }}>
                      {msgFirma[r.id]}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  {urls[r.id] ? (
                    <a href={urls[r.id]} target="_blank" rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
                      Ver recibo
                    </a>
                  ) : (
                    <button onClick={() => generarLink(r.id)} disabled={cargando === r.id}
                      className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                      {cargando === r.id ? '...' : 'Ver recibo'}
                    </button>
                  )}
                  {!r.confirmado && (
                    <button onClick={() => firmar(r.id)} disabled={firmando === r.id}
                      className="btn btn-ghost"
                      style={{ padding: '6px 12px', fontSize: 12, border: '1px solid var(--color-success)', color: 'var(--color-success)' }}>
                      {firmando === r.id ? '...' : '✓ Confirmar recepción'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatPeriodo(p) {
  if (!p) return p;
  const [year, month] = p.split('-');
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return `${meses[parseInt(month) - 1]} ${year}`;
}
