// src/pages/Admin.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import { useAuthStore } from '../store/auth.store.js';
import { api } from '../api/client.js';

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yafatdsiminstyalocxw.supabase.co';
const SUPA_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';

const s = {
  card: { background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: '1.5rem', marginBottom: '1rem' },
  th: { padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 500, borderBottom: '1px solid #e5e5e5' },
  td: { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f0f0f0' },
  btn: { padding: '6px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13 },
  btnP: { padding: '6px 14px', borderRadius: 8, border: 'none', background: '#1D9E75', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  label: { fontSize: 12, color: '#555', display: 'block', marginBottom: 4, marginTop: 12 },
  input: { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' },
};

// ===================== RECIBOS =====================
function RecibosAdmin() {
  const [pdfFile, setPdfFile] = useState(null);
  const [periodo, setPeriodo] = useState('');
  const [msg, setMsg] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    setPeriodo(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
  }, []);

  async function procesarPDF() {
    if (!pdfFile) { setMsg('Seleccioná el PDF primero'); return; }
    if (!periodo) { setMsg('Ingresá el periodo'); return; }
    setCargando(true); setMsg('Leyendo PDF...'); setResultado(null);
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const totalPags = pdfDoc.getPageCount();
      setMsg(`Leyendo legajos... (${totalPags} páginas)`);
      const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
      const empR = await api.get('/admin/empleados');
      const empList = empR.data;
      let procesados = 0, saltados = 0, noEncontrados = [];

      for (let i = 0; i < totalPags; i += 2) {
        const page = await pdf.getPage(i + 1);
        const content = await page.getTextContent();
        const texto = content.items.map(x => x.str).join(' ');
        const match = texto.match(/Legajo\s*(\d+)/i);
        if (!match) { saltados++; continue; }
        const leg = match[1].replace(/^0+/, '') || '0';
        setMsg(`Procesando legajo ${leg}...`);
        const emp = empList.find(e =>
          e.legajo === leg ||
          e.legajo === leg.padStart(8, '0') ||
          (e.legajo || '').replace(/^0+/, '') === leg
        );
        if (!emp) { noEncontrados.push(leg); saltados++; continue; }

        const pdfNuevo = await PDFDocument.create();
        const indices = [i, i + 1].filter(x => x < totalPags);
        const pags = await pdfNuevo.copyPages(pdfDoc, indices);
        pags.forEach(p => pdfNuevo.addPage(p));
        const pdfEmpBytes = await pdfNuevo.save();

        const ruta = `recibos/${emp.id}/${periodo}.pdf`;
        const uploadR = await fetch(`${SUPA_URL}/storage/v1/object/${ruta}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPA_KEY}`,
            'apikey': SUPA_KEY,
            'Content-Type': 'application/pdf',
            'x-upsert': 'true'
          },
          body: pdfEmpBytes
        });

        if (!uploadR.ok) { noEncontrados.push(leg); saltados++; continue; }

        try {
          await api.post('/admin/recibos/subir', { empleado_id: emp.id, periodo, archivo_url: ruta });
          procesados++;
        } catch { saltados++; }
      }

      setMsg('Completado');
      setResultado({ procesados, saltados, totalPaginas: totalPags, noEncontrados });
    } catch (e) {
      setMsg('Error: ' + e.message);
    }
    setCargando(false);
  }

  return (
    <div style={s.card}>
      <h3 style={{ fontSize: 15, marginBottom: '1rem' }}>Subir PDF de recibos</h3>
      <label style={s.label}>Periodo (YYYY-MM)</label>
      <input style={{ ...s.input, maxWidth: 200 }} value={periodo} onChange={e => setPeriodo(e.target.value)} placeholder="2026-05" />
      <label style={s.label}>Archivo PDF</label>
      <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0])} style={{ marginBottom: 12 }} />
      {pdfFile && <div style={{ fontSize: 12, color: '#1D9E75', marginBottom: 8 }}>{pdfFile.name}</div>}
      <br />
      <button style={s.btnP} onClick={procesarPDF} disabled={cargando}>
        {cargando ? 'Procesando...' : 'Procesar y subir recibos'}
      </button>
      {msg && (
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, fontSize: 13,
          background: msg.startsWith('Error') || msg.startsWith('Selec') || msg.startsWith('Ingres') ? '#FCEBEB' : '#E1F5EE',
          color: msg.startsWith('Error') || msg.startsWith('Selec') || msg.startsWith('Ingres') ? '#A32D2D' : '#0F6E56' }}>
          {msg}
        </div>
      )}
      {resultado && (
        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div style={{ background: '#E1F5EE', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0F6E56' }}>{resultado.procesados}</div>
            <div style={{ fontSize: 12 }}>Recibos subidos</div>
          </div>
          <div style={{ background: '#f0f0f0', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{resultado.saltados}</div>
            <div style={{ fontSize: 12 }}>Saltados</div>
          </div>
          <div style={{ background: '#f0f0f0', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{resultado.totalPaginas}</div>
            <div style={{ fontSize: 12 }}>Paginas totales</div>
          </div>
          {resultado.noEncontrados?.length > 0 && (
            <div style={{ gridColumn: '1/-1', background: '#FAEEDA', borderRadius: 8, padding: '10px', fontSize: 12, color: '#854F0B' }}>
              No encontrados: {resultado.noEncontrados.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===================== EMPLEADOS =====================
function EmpleadosAdmin() {
  const [empleados, setEmpleados] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', legajo: '', dni: '', cargo: '', sector: '', username: '', password: '', es_admin_empresa: false });
  const [msg, setMsg] = useState('');

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try { const r = await api.get('/admin/empleados'); setEmpleados(r.data); } catch (e) { }
  }

  function abrirNuevo() {
    setEditando(null);
    setForm({ nombre: '', apellido: '', legajo: '', dni: '', cargo: '', sector: '', username: '', password: '', es_admin_empresa: false });
    setModal(true);
  }

  function abrirEditar(e) {
    setEditando(e.id);
    setForm({ nombre: e.nombre, apellido: e.apellido, legajo: e.legajo || '', dni: e.dni || '', cargo: e.cargo || '', sector: e.sector || '', username: e.username || '', password: '', es_admin_empresa: e.es_admin_empresa || false });
    setModal(true);
  }

  async function guardar() {
    setMsg('');
    try {
      if (editando) {
        await api.put(`/admin/empleados/${editando}`, form);
      } else {
        await api.post('/admin/empleados', form);
      }
      setModal(false);
      cargar();
    } catch (e) {
      setMsg(e.response?.data?.error || 'Error al guardar.');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button style={s.btnP} onClick={abrirNuevo}>+ Agregar empleado</button>
      </div>
      <div style={s.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={s.th}>Legajo</th>
            <th style={s.th}>Nombre</th>
            <th style={s.th}>Cargo</th>
            <th style={s.th}>Usuario</th>
            <th style={s.th}>Admin</th>
            <th style={s.th}>Acciones</th>
          </tr></thead>
          <tbody>{empleados.map(e => (
            <tr key={e.id}>
              <td style={s.td}>{e.legajo || '-'}</td>
              <td style={s.td}>{e.nombre} {e.apellido}</td>
              <td style={s.td}>{e.cargo || '-'}</td>
              <td style={s.td}>{e.username || '-'}</td>
              <td style={s.td}>{e.es_admin_empresa ? '✓' : '-'}</td>
              <td style={s.td}>
                <button style={{ ...s.btn, fontSize: 11, padding: '3px 8px' }} onClick={() => abrirEditar(e)}>Editar</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', width: 460, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 15, marginBottom: '1rem' }}>{editando ? 'Editar empleado' : 'Nuevo empleado'}</h3>
            {[
              { k: 'nombre', label: 'Nombre *' },
              { k: 'apellido', label: 'Apellido *' },
              { k: 'legajo', label: 'Legajo' },
              { k: 'dni', label: 'DNI' },
              { k: 'cargo', label: 'Cargo' },
              { k: 'sector', label: 'Sector' },
              { k: 'username', label: 'Usuario *' },
              { k: 'password', label: editando ? 'Nueva contrasena (vacio=no cambiar)' : 'Contrasena *', type: 'password' },
            ].map(({ k, label, type = 'text' }) => (
              <div key={k}>
                <label style={s.label}>{label}</label>
                <input style={s.input} type={type} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="es_admin" checked={form.es_admin_empresa} onChange={e => setForm({ ...form, es_admin_empresa: e.target.checked })} />
              <label htmlFor="es_admin" style={{ fontSize: 13 }}>Es admin de empresa</label>
            </div>
            {msg && <div style={{ fontSize: 13, color: '#A32D2D', marginTop: 8 }}>{msg}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button style={s.btn} onClick={() => setModal(false)}>Cancelar</button>
              <button style={s.btnP} onClick={guardar}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== FICHAJES =====================
function FichajesAdmin() {
  const [fichajes, setFichajes] = useState([]);
  const [desde, setDesde] = useState(new Date().toISOString().slice(0, 10));
  const [hasta, setHasta] = useState(new Date().toISOString().slice(0, 10));

  async function cargar() {
    try {
      const r = await api.get('/admin/fichajes', { params: { desde, hasta } });
      setFichajes(r.data);
    } catch (e) { }
  }

  useEffect(() => { cargar(); }, []);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: '1rem', alignItems: 'flex-end' }}>
        <div>
          <label style={s.label}>Desde</label>
          <input type="date" style={{ ...s.input, maxWidth: 160 }} value={desde} onChange={e => setDesde(e.target.value)} />
        </div>
        <div>
          <label style={s.label}>Hasta</label>
          <input type="date" style={{ ...s.input, maxWidth: 160 }} value={hasta} onChange={e => setHasta(e.target.value)} />
        </div>
        <button style={s.btnP} onClick={cargar}>Buscar</button>
      </div>
      <div style={s.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={s.th}>Empleado</th>
            <th style={s.th}>Legajo</th>
            <th style={s.th}>Tipo</th>
            <th style={s.th}>Fecha/Hora</th>
          </tr></thead>
          <tbody>{fichajes.map(f => (
            <tr key={f.id}>
              <td style={s.td}>{f.nombre} {f.apellido}</td>
              <td style={s.td}>{f.legajo || '-'}</td>
              <td style={s.td}>
                <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  background: f.tipo === 'entrada' ? '#E1F5EE' : '#FCEBEB',
                  color: f.tipo === 'entrada' ? '#0F6E56' : '#A32D2D' }}>
                  {f.tipo}
                </span>
              </td>
              <td style={s.td}>{new Date(f.created_at).toLocaleString('es-AR')}</td>
            </tr>
          ))}</tbody>
        </table>
        {fichajes.length === 0 && <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: 20 }}>No hay fichajes en ese periodo</p>}
      </div>
    </div>
  );
}

// ===================== SOLICITUDES =====================
function SolicitudesAdmin() {
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try { const r = await api.get('/admin/solicitudes'); setSolicitudes(r.data); } catch (e) { }
  }

  async function responder(id, estado) {
    try {
      await api.put(`/admin/solicitudes/${id}`, { estado });
      cargar();
    } catch (e) { }
  }

  return (
    <div style={s.card}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          <th style={s.th}>Empleado</th>
          <th style={s.th}>Tipo</th>
          <th style={s.th}>Desde</th>
          <th style={s.th}>Hasta</th>
          <th style={s.th}>Estado</th>
          <th style={s.th}>Acciones</th>
        </tr></thead>
        <tbody>{solicitudes.map(s2 => (
          <tr key={s2.id}>
            <td style={s.td}>{s2.nombre} {s2.apellido}</td>
            <td style={s.td}>{s2.tipo}</td>
            <td style={s.td}>{s2.fecha_inicio || '-'}</td>
            <td style={s.td}>{s2.fecha_fin || '-'}</td>
            <td style={s.td}>
              <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11,
                background: s2.estado === 'aprobada' ? '#E1F5EE' : s2.estado === 'rechazada' ? '#FCEBEB' : '#FAEEDA',
                color: s2.estado === 'aprobada' ? '#0F6E56' : s2.estado === 'rechazada' ? '#A32D2D' : '#854F0B' }}>
                {s2.estado}
              </span>
            </td>
            <td style={s.td}>
              {s2.estado === 'pendiente' && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button style={{ ...s.btn, fontSize: 11, padding: '3px 8px', color: '#0F6E56' }} onClick={() => responder(s2.id, 'aprobada')}>Aprobar</button>
                  <button style={{ ...s.btn, fontSize: 11, padding: '3px 8px', color: '#A32D2D' }} onClick={() => responder(s2.id, 'rechazada')}>Rechazar</button>
                </div>
              )}
            </td>
          </tr>
        ))}</tbody>
      </table>
      {solicitudes.length === 0 && <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: 20 }}>No hay solicitudes</p>}
    </div>
  );
}

// ===================== PANEL PRINCIPAL =====================
const TABS = [
  { key: 'recibos', label: 'Recibos' },
  { key: 'empleados', label: 'Empleados' },
  { key: 'fichajes', label: 'Fichajes' },
  { key: 'solicitudes', label: 'Solicitudes' },
];

export default function Admin() {
  const navigate = useNavigate();
  const { empleado, logout } = useAuthStore();
  const [tab, setTab] = useState('recibos');

  useEffect(() => {
    if (!empleado) { navigate('/login'); return; }
    if (!empleado?.es_admin) { navigate('/'); }
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f9f9f9', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Panel Admin</span>
          <span style={{ fontSize: 13, color: '#888', marginLeft: 10 }}>{empleado?.nombre} {empleado?.apellido}</span>
        </div>
        <button style={{ ...s.btn, color: '#A32D2D' }} onClick={handleLogout}>Salir</button>
      </div>
      <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #e5e5e5' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '10px 20px', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
                background: tab === t.key ? '#fff' : 'transparent',
                borderBottom: tab === t.key ? '2px solid #1D9E75' : '2px solid transparent',
                color: tab === t.key ? '#1D9E75' : '#555' }}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'recibos' && <RecibosAdmin />}
        {tab === 'empleados' && <EmpleadosAdmin />}
        {tab === 'fichajes' && <FichajesAdmin />}
        {tab === 'solicitudes' && <SolicitudesAdmin />}
      </div>
    </div>
  );
}
