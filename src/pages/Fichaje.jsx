// src/pages/Fichaje.jsx
import { useEffect, useState } from 'react';
import { fichajesApi } from '../api/apis.js';
import PageHeader from '../components/PageHeader.jsx';

export default function Fichaje() {
  const [estado, setEstado]     = useState(null); // { activo, entrada }
  const [semana, setSemana]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [hora, setHora]         = useState(new Date());

  useEffect(() => {
    fichajesApi.estadoHoy().then(r => setEstado(r.data)).catch(() => {});
    fichajesApi.semana().then(r => setSemana(r.data)).catch(() => {});
    const t = setInterval(() => setHora(new Date()), 10000);
    return () => clearInterval(t);
  }, []);

  async function fichar() {
    setLoading(true);
    try {
      let lat = null, lng = null;
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {} // GPS opcional

      if (estado?.activo) {
        await fichajesApi.salida(lat, lng);
        setEstado({ activo: false, entrada: null });
      } else {
        await fichajesApi.entrada(lat, lng);
        setEstado({ activo: true, entrada: new Date().toISOString() });
      }
      const r = await fichajesApi.semana();
      setSemana(r.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al fichar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Fichaje" sub="Registro de asistencia" />
      <div style={{ padding: '0 16px 16px' }}>
        <div className="card" style={{ textAlign: 'center', marginTop: 12, marginBottom: 16 }}>
          <p style={{ fontSize: 48, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {hora.toTimeString().slice(0, 5)}
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4 }}>
            {hora.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          {estado?.activo && estado.entrada && (
            <p style={{ marginTop: 8, fontSize: 13, color: 'var(--color-success)' }}>
              Entrada registrada: {new Date(estado.entrada).toTimeString().slice(0, 5)}
            </p>
          )}
        </div>

        <button onClick={fichar} disabled={loading || estado === null}
          className={`btn ${estado?.activo ? 'btn-danger' : 'btn-success'}`}
          style={{ fontSize: 16, padding: '16px', marginBottom: 24 }}>
          {loading ? 'Registrando...' : estado?.activo ? 'Registrar salida' : 'Registrar entrada'}
        </button>

        <p className="section-title">Esta semana</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {semana.map((f) => (
            <div key={f.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: 14 }}>
                  {new Date(f.entrada).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })}
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {new Date(f.entrada).toTimeString().slice(0, 5)}
                  {f.salida ? ` – ${new Date(f.salida).toTimeString().slice(0, 5)}` : ' · en curso'}
                </p>
              </div>
              {f.horas_trabajadas && (
                <span className="badge badge-success">{f.horas_trabajadas}h</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
