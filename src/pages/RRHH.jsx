// src/pages/RRHH.jsx
import { useEffect, useState } from 'react';
import { rrhhApi } from '../api/apis.js';
import PageHeader from '../components/PageHeader.jsx';

const TIPOS = [
  { value: 'vacaciones',        label: 'Vacaciones'       },
  { value: 'licencia_medica',   label: 'Licencia médica'  },
  { value: 'licencia_sin_goce', label: 'Sin goce de sueldo' },
  { value: 'otro',              label: 'Otro'             },
];

const BADGE_MAP = {
  pendiente:  { bg: '#FAEEDA', color: '#854F0B' },
  aprobada:   { bg: '#E1F5EE', color: '#0F6E56' },
  rechazada:  { bg: '#FCEBEB', color: '#A32D2D' },
};

export default function RRHH() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [vista, setVista]             = useState('lista');
  const [tipo, setTipo]               = useState('vacaciones');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin]       = useState('');
  const [motivo, setMotivo]           = useState('');
  const [enviando, setEnviando]       = useState(false);
  const [ok, setOk]                   = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    rrhhApi.listar().then(r => setSolicitudes(r.data)).catch(() => {});
  }, []);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const { data } = await rrhhApi.crear({
        tipo,
        fecha_inicio: fechaInicio || null,
        fecha_fin: fechaFin || null,
        motivo: motivo || null,
      });
      setSolicitudes(prev => [data, ...prev]);
      setOk(true);
      setTimeout(() => {
        setOk(false);
        setVista('lista');
        setFechaInicio('');
        setFechaFin('');
        setMotivo('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error enviando solicitud.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <PageHeader title="Recursos humanos" sub="Solicitudes al equipo de RRHH" />
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', gap: 10, marginTop: 12, marginBottom: 20 }}>
          <button onClick={() => setVista('lista')}
            className={`btn ${vista === 'lista' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, padding: '10px' }}>Mis solicitudes</button>
          <button onClick={() => setVista('nueva')}
            className={`btn ${vista === 'nueva' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, padding: '10px' }}>Nueva solicitud</button>
        </div>

        {vista === 'lista' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {solicitudes.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)' }}>No tenés solicitudes aún.</p>
            )}
            {solicitudes.map((s) => {
              const badge = BADGE_MAP[s.estado] || BADGE_MAP.pendiente;
              return (
                <div key={s.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 600 }}>{TIPOS.find(t => t.value === s.tipo)?.label ?? s.tipo}</p>
                      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {s.fecha_inicio ? new Date(s.fecha_inicio).toLocaleDateString('es-AR') : ''}
                        {s.fecha_fin ? ` al ${new Date(s.fecha_fin).toLocaleDateString('es-AR')}` : ''}
                      </p>
                      {s.motivo && (
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{s.motivo}</p>
                      )}
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: badge.bg, color: badge.color }}>
                      {s.estado}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {vista === 'nueva' && (
          <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label>Tipo de solicitud</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                {TIPOS.map((t) => (
                  <button type="button" key={t.value} onClick={() => setTipo(t.value)}
                    style={{ padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      border: `1px solid ${tipo === t.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: tipo === t.value ? 'var(--color-primary-light)' : 'var(--color-bg)',
                      color: tipo === t.value ? 'var(--color-primary)' : 'var(--color-text)' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label>Fecha inicio</label>
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            </div>
            <div>
              <label>Fecha fin</label>
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            </div>
            <div>
              <label>Motivo (opcional)</label>
              <textarea rows={3} value={motivo} onChange={e => setMotivo(e.target.value)}
                placeholder="Describí brevemente el motivo..." />
            </div>
            {error && <p style={{ color: 'var(--color-danger)', fontSize: 14 }}>{error}</p>}
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
