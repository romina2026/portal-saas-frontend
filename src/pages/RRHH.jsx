// src/pages/RRHH.jsx
import { useEffect, useState } from 'react';
import { rrhhApi } from '../api/apis.js';
import PageHeader from '../components/PageHeader.jsx';

const TIPOS = [
  { value: 'dia_personal', label: 'Día personal' },
  { value: 'vacaciones',   label: 'Vacaciones'   },
  { value: 'cert_medico',  label: 'Cert. médico' },
  { value: 'consulta',     label: 'Consulta'     },
];

const BADGE_MAP = {
  pendiente:   'badge-warning',
  aprobada:    'badge-success',
  rechazada:   'badge-danger',
  en_revision: 'badge-primary',
};

export default function RRHH() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [vista, setVista]             = useState('lista'); // 'lista' | 'nueva'
  const [tipo, setTipo]               = useState('dia_personal');
  const [fecha, setFecha]             = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando]       = useState(false);
  const [ok, setOk]                   = useState(false);

  useEffect(() => {
    rrhhApi.listar().then(r => setSolicitudes(r.data)).catch(() => {});
  }, []);

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    try {
      const { data } = await rrhhApi.crear({ tipo, fecha_solicitada: fecha, descripcion });
      setSolicitudes(prev => [data, ...prev]);
      setOk(true);
      setTimeout(() => { setOk(false); setVista('lista'); setFecha(''); setDescripcion(''); }, 2000);
    } catch (err) {
      alert(err.response?.data?.error || 'Error enviando solicitud.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <PageHeader title="Recursos humanos" sub="Solicitudes al equipo de RRHH" />
      <div style={{ padding: '0 16px 16px' }}>

        <div style={{ display: 'flex', gap: 10, marginTop: 12, marginBottom: 20 }}>
          <button onClick={() => setVista('lista')} className={`btn ${vista === 'lista' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, padding: '10px' }}>Mis solicitudes</button>
          <button onClick={() => setVista('nueva')} className={`btn ${vista === 'nueva' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, padding: '10px' }}>Nueva solicitud</button>
        </div>

        {vista === 'lista' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {solicitudes.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No tenés solicitudes aún.</p>}
            {solicitudes.map((s) => (
              <div key={s.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{TIPOS.find(t => t.value === s.tipo)?.label ?? s.tipo}</p>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {new Date(s.fecha_solicitada).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <span className={`badge ${BADGE_MAP[s.estado] ?? 'badge-primary'}`}>{s.estado}</span>
                </div>
                {s.respuesta_rrhh && (
                  <p style={{ marginTop: 10, fontSize: 13, padding: '8px 10px',
                    background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)' }}>
                    {s.respuesta_rrhh}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {vista === 'nueva' && (
          <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label>Tipo de solicitud</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                {TIPOS.map((t) => (
                  <button type="button" key={t.value} onClick={() => setTipo(t.value)}
                    style={{ padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', border: `1px solid ${tipo === t.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: tipo === t.value ? 'var(--color-primary-light)' : 'var(--color-bg)',
                      color: tipo === t.value ? 'var(--color-primary)' : 'var(--color-text)' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label>Fecha</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
            </div>
            <div>
              <label>Detalle (opcional)</label>
              <textarea rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)}
                placeholder="Describí brevemente el motivo..." />
            </div>
            {ok && <p style={{ color: 'var(--color-success)', fontSize: 14 }}>Solicitud enviada correctamente.</p>}
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
