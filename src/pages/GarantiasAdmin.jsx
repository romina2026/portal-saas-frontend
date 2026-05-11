// src/pages/GarantiasAdmin.jsx
import { useEffect, useState } from 'react';
import { garantiasApi } from '../api/apis.js';
import PageHeader from '../components/PageHeader.jsx';

const BADGE = {
  RECEPCION:       { label: 'Recibido',          color: '#E6F1FB', text: '#185FA5' },
  DIAGNOSTICO:     { label: 'En diagnóstico',    color: '#FAEEDA', text: '#854F0B' },
  APROBACION:      { label: 'Aguard. aprobación',color: '#FAEEDA', text: '#854F0B' },
  ESPERA_REPUESTO: { label: 'Esp. repuesto',     color: '#F1EFE8', text: '#5F5E5A' },
  REPARACION:      { label: 'En reparación',     color: '#EEEDFE', text: '#534AB7' },
  LISTO:           { label: 'Listo para retirar',color: '#EAF3DE', text: '#3B6D11' },
  ENTREGADO:       { label: 'Entregado',         color: '#EAF3DE', text: '#3B6D11' },
  NO_APROBADO:     { label: 'No aprobado',       color: '#FCEBEB', text: '#A32D2D' },
};

function Badge({ codigo }) {
  const b = BADGE[codigo] || { label: codigo, color: '#F1EFE8', text: '#5F5E5A' };
  return (
    <span style={{
      background: b.color, color: b.text,
      fontSize: 11, fontWeight: 500,
      padding: '2px 9px', borderRadius: 4,
      whiteSpace: 'nowrap',
    }}>{b.label}</span>
  );
}

// ── Modal: Nueva orden ────────────────────────────────────────
function ModalNuevaOrden({ etapas, onClose, onCreada }) {
  const [form, setForm] = useState({
    nro_orden_manager: '', nro_garantia_manager: '',
    descripcion_equipo: '', nro_serie: '',
    nombre_cliente: '', telefono_cliente: '', email_cliente: '',
    tiene_garantia: false, fecha_compra: '', fecha_vencimiento_garantia: '',
    cubre_descripcion: '', tecnico_asignado: '', urgencia: 'Normal',
    observaciones: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function guardar() {
    if (!form.nro_orden_manager || !form.descripcion_equipo || !form.nombre_cliente) {
      setError('Completá Nro. Orden, Equipo y Cliente.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      await garantiasApi.crear({
        ...form,
        tiene_garantia: form.tiene_garantia,
        fecha_compra: form.fecha_compra || null,
        fecha_vencimiento_garantia: form.fecha_vencimiento_garantia || null,
      });
      onCreada();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  }

  const inp = { style: {
    width: '100%', padding: '7px 10px', fontSize: 13,
    border: '0.5px solid var(--color-border)', borderRadius: 8,
    background: 'var(--color-bg-card)', color: 'var(--color-text)',
    boxSizing: 'border-box',
  }};

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' }}>
      <div className="card" style={{ width: '100%', maxWidth: 520, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>Nueva orden de reparación</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--color-text-muted)' }}>✕</button>
        </div>

        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>DATOS DE MANAGER MAX</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>Nro. Orden *</p>
            <input {...inp} value={form.nro_orden_manager} onChange={e => set('nro_orden_manager', e.target.value.toUpperCase())} placeholder="G-0041" />
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>Nro. Garantía</p>
            <input {...inp} value={form.nro_garantia_manager} onChange={e => set('nro_garantia_manager', e.target.value.toUpperCase())} placeholder="Opcional" />
          </div>
        </div>

        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>EQUIPO</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>Descripción *</p>
            <input {...inp} value={form.descripcion_equipo} onChange={e => set('descripcion_equipo', e.target.value)} placeholder="Compresor Boge S15" />
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>N° de serie</p>
            <input {...inp} value={form.nro_serie} onChange={e => set('nro_serie', e.target.value)} placeholder="SN-8821" />
          </div>
        </div>

        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>CLIENTE</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>Nombre / Empresa *</p>
            <input {...inp} value={form.nombre_cliente} onChange={e => set('nombre_cliente', e.target.value)} placeholder="Empresa Textil SA" />
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>Teléfono</p>
            <input {...inp} value={form.telefono_cliente} onChange={e => set('telefono_cliente', e.target.value)} placeholder="03462 4XXXXX" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>Email</p>
            <input {...inp} type="email" value={form.email_cliente} onChange={e => set('email_cliente', e.target.value)} placeholder="contacto@empresa.com" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <input type="checkbox" id="chk-garantia" checked={form.tiene_garantia} onChange={e => set('tiene_garantia', e.target.checked)} />
          <label htmlFor="chk-garantia" style={{ fontSize: 13 }}>Aplica garantía de producto</label>
        </div>

        {form.tiene_garantia && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>Fecha de compra</p>
              <input {...inp} type="date" value={form.fecha_compra} onChange={e => set('fecha_compra', e.target.value)} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>Vencimiento garantía</p>
              <input {...inp} type="date" value={form.fecha_vencimiento_garantia} onChange={e => set('fecha_vencimiento_garantia', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>¿Qué cubre?</p>
              <input {...inp} value={form.cubre_descripcion} onChange={e => set('cubre_descripcion', e.target.value)} placeholder="Piezas y mano de obra" />
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>Técnico asignado</p>
            <input {...inp} value={form.tecnico_asignado} onChange={e => set('tecnico_asignado', e.target.value)} placeholder="Nombre del técnico" />
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>Urgencia</p>
            <select {...inp} value={form.urgencia} onChange={e => set('urgencia', e.target.value)}>
              <option>Normal</option>
              <option>Urgente</option>
            </select>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>Observaciones</p>
            <textarea {...inp} rows={2} value={form.observaciones} onChange={e => set('observaciones', e.target.value)} placeholder="Notas internas..." style={{ ...inp.style, resize: 'vertical' }} />
          </div>
        </div>

        {error && <p style={{ color: 'var(--color-danger, #E24B4A)', fontSize: 13, marginBottom: 10 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn" style={{ width: 'auto', padding: '8px 16px', fontSize: 13 }}>Cancelar</button>
          <button onClick={guardar} disabled={guardando} className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: 13 }}>
            {guardando ? 'Guardando...' : 'Crear orden'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: Cambiar etapa ──────────────────────────────────────
function ModalEtapa({ orden, etapas, onClose, onActualizada }) {
  const [etapaId, setEtapaId] = useState('');
  const [comentario, setComentario] = useState('');
  const [canal, setCanal] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Mostrar aviso de notificación si la etapa seleccionada es LISTO
  const etapaSel = etapas.find(e => e.id === Number(etapaId));
  const esListo = etapaSel?.codigo === 'LISTO';

  async function guardar() {
    if (!etapaId) return;
    setGuardando(true);
    try {
      await garantiasApi.cambiarEtapa(orden.id, { etapa_id: Number(etapaId), comentario });
      if (esListo && canal) {
        await garantiasApi.registrarNotif(orden.id, { canal, mensaje: 'Equipo listo para retirar.' });
      }
      onActualizada();
    } catch {
      alert('Error al cambiar la etapa.');
    } finally {
      setGuardando(false);
    }
  }

  const inp = { style: {
    width: '100%', padding: '7px 10px', fontSize: 13,
    border: '0.5px solid var(--color-border)', borderRadius: 8,
    background: 'var(--color-bg-card)', color: 'var(--color-text)',
    boxSizing: 'border-box',
  }};

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>Cambiar estado</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--color-text-muted)' }}>✕</button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>{orden.nro_orden_manager} — {orden.descripcion_equipo}</p>

        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>Nueva etapa</p>
          <select {...inp} value={etapaId} onChange={e => setEtapaId(e.target.value)}>
            <option value="">Seleccioná una etapa...</option>
            {etapas.map(e => (
              <option key={e.id} value={e.id}>{e.nombre_interno}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 3 }}>Comentario interno (opcional)</p>
          <textarea {...inp} rows={2} value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Ej: Se reemplazó el bobinado del motor" style={{ ...inp.style, resize: 'vertical' }} />
        </div>

        {esListo && (
          <div style={{ background: '#EAF3DE', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: '#3B6D11', fontWeight: 600, marginBottom: 6 }}>Registrar aviso al cliente</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['telefono', 'whatsapp', 'email'].map(c => (
                <button key={c} onClick={() => setCanal(canal === c ? '' : c)}
                  style={{
                    flex: 1, fontSize: 12, padding: '6px 0', borderRadius: 6, cursor: 'pointer',
                    border: canal === c ? '1.5px solid #3B6D11' : '0.5px solid #3B6D11',
                    background: canal === c ? '#3B6D11' : 'transparent',
                    color: canal === c ? '#fff' : '#3B6D11', fontWeight: canal === c ? 600 : 400,
                  }}>
                  {c === 'telefono' ? 'Teléfono' : c === 'whatsapp' ? 'WhatsApp' : 'Email'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn" style={{ width: 'auto', padding: '8px 16px', fontSize: 13 }}>Cancelar</button>
          <button onClick={guardar} disabled={guardando || !etapaId} className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: 13 }}>
            {guardando ? 'Guardando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Vista detalle de una orden ────────────────────────────────
function DetalleOrden({ orden, historial, etapas, onVolver, onCambiarEtapa }) {
  const dias = orden.fecha_vencimiento_garantia
    ? Math.ceil((new Date(orden.fecha_vencimiento_garantia) - new Date()) / 86400000)
    : null;

  return (
    <div>
      <button onClick={onVolver} style={{ background: 'none', border: 'none', color: 'var(--color-primary, #534AB7)', fontSize: 13, cursor: 'pointer', padding: '0 16px', marginBottom: 4 }}>
        ← Volver al listado
      </button>
      <PageHeader title={orden.nro_orden_manager} sub={`${orden.descripcion_equipo} — ${orden.nombre_cliente}`} />
      <div style={{ padding: '0 16px 24px' }}>

        {/* Datos principales */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontWeight: 600, margin: 0 }}>Datos del caso</p>
            <Badge codigo={orden.etapa_codigo} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
            <div><p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 2px' }}>Cliente</p><p style={{ margin: 0 }}>{orden.nombre_cliente}</p></div>
            <div><p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 2px' }}>Teléfono</p><p style={{ margin: 0 }}>{orden.telefono_cliente || '—'}</p></div>
            <div><p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 2px' }}>N° de serie</p><p style={{ margin: 0 }}>{orden.nro_serie || '—'}</p></div>
            <div><p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 2px' }}>Técnico</p><p style={{ margin: 0 }}>{orden.tecnico_asignado || '—'}</p></div>
            <div><p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 2px' }}>Urgencia</p><p style={{ margin: 0 }}>{orden.urgencia || 'Normal'}</p></div>
            <div><p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 2px' }}>Ingreso</p><p style={{ margin: 0 }}>{orden.fecha_ingreso}</p></div>
          </div>
          {orden.observaciones && (
            <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--color-bg-muted, #F1EFE8)', borderRadius: 6 }}>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 2px' }}>Observaciones</p>
              <p style={{ fontSize: 13, margin: 0 }}>{orden.observaciones}</p>
            </div>
          )}
        </div>

        {/* Garantía */}
        {orden.tiene_garantia && (
          <div className="card" style={{ marginBottom: 12 }}>
            <p style={{ fontWeight: 600, margin: '0 0 10px' }}>Garantía</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
              <div><p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 2px' }}>Fecha compra</p><p style={{ margin: 0 }}>{orden.fecha_compra || '—'}</p></div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 2px' }}>Vence</p>
                <p style={{ margin: 0, color: dias !== null && dias < 30 ? '#A32D2D' : dias !== null && dias < 0 ? '#A32D2D' : 'inherit' }}>
                  {orden.fecha_vencimiento_garantia || '—'}
                  {dias !== null && <span style={{ fontSize: 11, marginLeft: 6, color: 'var(--color-text-muted)' }}>({dias > 0 ? `${dias} días` : 'Vencida'})</span>}
                </p>
              </div>
              {orden.cubre_descripcion && (
                <div style={{ gridColumn: '1/-1' }}><p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 2px' }}>Cubre</p><p style={{ margin: 0 }}>{orden.cubre_descripcion}</p></div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="card" style={{ marginBottom: 12 }}>
          <p style={{ fontWeight: 600, margin: '0 0 12px' }}>Historial de estados</p>
          {historial.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < historial.length - 1 ? 4 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1D9E75', flexShrink: 0, marginTop: 3 }} />
                {i < historial.length - 1 && <div style={{ width: 1, flex: 1, minHeight: 20, background: 'var(--color-border)', margin: '2px 0' }} />}
              </div>
              <div style={{ paddingBottom: i < historial.length - 1 ? 12 : 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 2px' }}>{h.nombre_interno}</p>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
                  {new Date(h.registrado_en).toLocaleString('es-AR')}
                  {h.comentario && ` — ${h.comentario}`}
                  {h.registrado_por && ` · ${h.registrado_por}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onCambiarEtapa} className="btn btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 14 }}>
          Cambiar estado
        </button>
      </div>
    </div>
  );
}

// ── Pantalla principal ────────────────────────────────────────
export default function GarantiasAdmin() {
  const [ordenes, setOrdenes] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEtapa, setFiltroEtapa] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [modalNueva, setModalNueva] = useState(false);
  const [ordenSel, setOrdenSel] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [modalEtapa, setModalEtapa] = useState(false);

  async function cargar() {
    setLoading(true);
    try {
      const [ords, ets] = await Promise.all([
        garantiasApi.listar({ etapa: filtroEtapa, search: busqueda }),
        garantiasApi.etapas(),
      ]);
      setOrdenes(ords.data);
      setEtapas(ets.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { cargar(); }, [filtroEtapa]);

  async function abrirDetalle(orden) {
    setOrdenSel(orden);
    try {
      const { data } = await garantiasApi.getHistorial(orden.id);
      setHistorial(data);
    } catch { setHistorial([]); }
  }

  function handleBuscar(e) {
    e.preventDefault();
    cargar();
  }

  // Vista detalle
  if (ordenSel) return (
    <>
      <DetalleOrden
        orden={ordenSel} historial={historial} etapas={etapas}
        onVolver={() => setOrdenSel(null)}
        onCambiarEtapa={() => setModalEtapa(true)}
      />
      {modalEtapa && (
        <ModalEtapa
          orden={ordenSel} etapas={etapas}
          onClose={() => setModalEtapa(false)}
          onActualizada={async () => {
            setModalEtapa(false);
            const { data } = await garantiasApi.getOrden(ordenSel.id);
            setOrdenSel(data);
            const { data: h } = await garantiasApi.getHistorial(ordenSel.id);
            setHistorial(h);
            cargar();
          }}
        />
      )}
    </>
  );

  // Vista listado
  return (
    <div>
      <PageHeader title="Garantías y reparaciones" sub="Seguimiento de casos" />
      <div style={{ padding: '0 16px 24px' }}>

        {/* Buscador + filtro */}
        <form onSubmit={handleBuscar} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar cliente o N° orden..."
            style={{ flex: 1, padding: '8px 10px', fontSize: 13, border: '0.5px solid var(--color-border)', borderRadius: 8, background: 'var(--color-bg-card)', color: 'var(--color-text)' }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}>Buscar</button>
        </form>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {[{ codigo: '', nombre_interno: 'Todos' }, ...etapas.filter(e => !e.es_final)].map(e => (
            <button key={e.codigo} onClick={() => setFiltroEtapa(e.codigo)}
              style={{
                fontSize: 12, padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
                border: filtroEtapa === e.codigo ? '1.5px solid var(--color-primary, #534AB7)' : '0.5px solid var(--color-border)',
                background: filtroEtapa === e.codigo ? 'var(--color-primary, #534AB7)' : 'transparent',
                color: filtroEtapa === e.codigo ? '#fff' : 'var(--color-text)',
                fontWeight: filtroEtapa === e.codigo ? 600 : 400,
              }}>
              {e.nombre_interno}
            </button>
          ))}
        </div>

        {/* Botón nueva orden */}
        <button onClick={() => setModalNueva(true)} className="btn btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 14, marginBottom: 14 }}>
          + Nueva orden
        </button>

        {/* Listado */}
        {loading && <p style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>Cargando...</p>}
        {!loading && ordenes.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>No hay órdenes que coincidan.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ordenes.map(o => (
            <div key={o.id} className="card" onClick={() => abrirDetalle(o)}
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <p style={{ fontWeight: 600, margin: 0, fontSize: 14 }}>{o.nro_orden_manager}</p>
                  {o.tiene_garantia && <span style={{ fontSize: 10, background: '#E6F1FB', color: '#185FA5', padding: '1px 6px', borderRadius: 3, fontWeight: 500 }}>Garantía</span>}
                  {o.urgencia === 'Urgente' && <span style={{ fontSize: 10, background: '#FCEBEB', color: '#A32D2D', padding: '1px 6px', borderRadius: 3, fontWeight: 500 }}>Urgente</span>}
                </div>
                <p style={{ fontSize: 13, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.descripcion_equipo}</p>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>{o.nombre_cliente} · {o.tecnico_asignado || 'Sin asignar'} · {o.fecha_ingreso}</p>
              </div>
              <div style={{ flexShrink: 0, marginLeft: 10 }}>
                <Badge codigo={o.etapa_codigo} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalNueva && (
        <ModalNuevaOrden
          etapas={etapas}
          onClose={() => setModalNueva(false)}
          onCreada={() => { setModalNueva(false); cargar(); }}
        />
      )}
    </div>
  );
}
