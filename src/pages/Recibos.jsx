import { useEffect, useState } from 'react';
import { recibosApi } from '../api/apis.js';
import PageHeader from '../components/PageHeader.jsx';

export default function Recibos() {
  const [recibos, setRecibos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descargando, setDescargando] = useState(null);

  useEffect(() => {
    recibosApi.listar()
      .then(r => setRecibos(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function descargar(id, periodo) {
    setDescargando(id);
    try {
      const { data } = await recibosApi.getUrlDescarga(id);
      const response = await fetch(data.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo_${periodo || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Error al descargar. Intentá de nuevo.');
    } finally {
      setDescargando(null);
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
            <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600 }}>{formatPeriodo(r.periodo)}</p>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {r.monto_neto ? `$${Number(r.monto_neto).toLocaleString('es-AR')}` : 'Emitido'}
                </p>
              </div>
              <button onClick={() => descargar(r.id, r.periodo)} disabled={descargando === r.id}
                className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: 13 }}>
                {descargando === r.id ? '...' : 'Descargar'}
              </button>
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