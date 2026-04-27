import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SUPA_URL = 'https://huklwvkrykemdqpglwzr.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1a2x3dmtyeWtlbWRxcGdsd3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYxMjEyMSwiZXhwIjoyMDkwMTg4MTIxfQ.hvbuWwtb0jjP06qd6ayZgOA_A3rRfxvN2Jl1HPQaWkg';

function FichajesAdmin({ token, s }) {
  const [fichajes, setFichajes] = useState([]);
  const [desde, setDesde] = useState(new Date().toISOString().slice(0, 10));
  const [hasta, setHasta] = useState(new Date().toISOString().slice(0, 10));
  useEffect(() => { cargar(); }, [desde, hasta]);
  async function cargar() {
    try {
      const r = await fetch(`${API}/fichajes/admin?desde=${desde}&hasta=${hasta}`, {
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
      });
      const data = await r.json();
      setFichajes(Array.isArray(data) ? data : []);
    } catch (e) { setFichajes([]); }
  }
  function calcDuracion(entrada, salida) {
    if (!entrada || !salida) return '-';
    const mins = Math.round((new Date(salida) - new Date(entrada)) / 60000);
    if (mins <= 0) return '-';
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }
  async function exportarExcel() {
    const XLSX = await import('xlsx');
    const filas = fichajes.map(f => ({
      Empleado: f.nombre_completo || '',
      Legajo: f.legajo || '',
      Fecha: f.entrada ? new Date(f.entrada).toLocaleDateString('es-AR') : '',
      Entrada: f.entrada ? new Date(f.entrada).toLocaleTimeString('es-AR') : '',
      Salida: f.salida ? new Date(f.salida).toLocaleTimeString('es-AR') : '',
      Duracion: calcDuracion(f.entrada, f.salida),
      Estado: f.estado || ''
    }));
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fichajes');
    XLSX.writeFile(wb, `fichajes_${desde}_${hasta}.xlsx`);
  }
  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 4 }}>Desde</label>
          <input type="date" style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 8 }} value={desde} onChange={e => setDesde(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 4 }}>Hasta</label>
          <input type="date" style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 8 }} value={hasta} onChange={e => setHasta(e.target.value)} />
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#1D9E75', color: '#fff', cursor: 'pointer', fontSize: 13, marginBottom: 8 }} onClick={exportarExcel} disabled={fichajes.length === 0}>Exportar Excel</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, color: '#888', textTransform: 'uppercase', borderBottom: '1px solid #e5e5e5' }}>Empleado</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, color: '#888', textTransform: 'uppercase', borderBottom: '1px solid #e5e5e5' }}>Legajo</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, color: '#888', textTransform: 'uppercase', borderBottom: '1px solid #e5e5e5' }}>Fecha</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, color: '#888', textTransform: 'uppercase', borderBottom: '1px solid #e5e5e5' }}>Entrada</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, color: '#888', textTransform: 'uppercase', borderBottom: '1px solid #e5e5e5' }}>Salida</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, color: '#888', textTransform: 'uppercase', borderBottom: '1px solid #e5e5e5' }}>Duración</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, color: '#888', textTransform: 'uppercase', borderBottom: '1px solid #e5e5e5' }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {fichajes.length === 0
            ? <tr><td colSpan={7} style={{ padding: '10px', textAlign: 'center', color: '#888' }}>Sin fichajes para este periodo</td></tr>
            : fichajes.map((f, i) => (
              <tr key={i}>
                <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>{f.nombre_completo || '—'}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>{f.legajo || '—'}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>{f.entrada ? new Date(f.entrada).toLocaleDateString('es-AR') : '—'}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>{f.entrada ? new Date(f.entrada).toLocaleTimeString('es-AR') : '—'}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>{f.salida ? new Date(f.salida).toLocaleTimeString('es-AR') : '—'}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>{calcDuracion(f.entrada, f.salida)}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, background: f.estado === 'activo' ? '#E1F5EE' : '#f0f0f0', color: f.estado === 'activo' ? '#0F6E56' : '#555' }}>{f.estado}</span>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

function AvisosAdmin({ token, s }) {
  const [avisos, setAvisos] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [importante, setImportante] = useState(false);
  const [adjunto, setAdjunto] = useState(null);
  const [msg, setMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => { cargarAvisos(); }, []);

  async function cargarAvisos() {
    try {
      const r = await fetch(API + '/avisos', { headers: { 'Authorization': 'Bearer ' + token } });
      const data = await r.json();
      setAvisos(Array.isArray(data) ? data : []);
    } catch (e) { }
  }

  async function publicar() {
    if (!titulo || !contenido) { setMsg('Completa titulo y contenido'); return; }
    setCargando(true);
    try {
      let url_adjunto = null, tipo_adjunto = null;
      if (adjunto) {
        const ext = adjunto.name.split('.').pop();
        const ruta = `avisos/${Date.now()}.${ext}`;
        const up = await fetch(`${SUPA_URL}/storage/v1/object/${ruta}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${SUPA_KEY}`, 'apikey': SUPA_KEY, 'Content-Type': adjunto.type, 'x-upsert': 'true' },
          body: adjunto
        });
        if (up.ok) { url_adjunto = ruta; tipo_adjunto = adjunto.type.startsWith('image') ? 'imagen' : 'pdf'; }
      }
      const r = await fetch(API + '/avisos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ titulo, contenido, importante, url_adjunto, tipo_adjunto })
      });
      const data = await r.json();
      if (data.error) { setMsg('Error: ' + data.error); }
      else { setMsg('Aviso publicado'); setTitulo(''); setContenido(''); setAdjunto(null); setImportante(false); cargarAvisos(); }
    } catch (e) { setMsg('Error: ' + e.message); }
    setCargando(false);
  }

  async function eliminar(id) {
    if (!confirm('Desactivar este aviso?')) return;
    await fetch(API + '/avisos/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
    cargarAvisos();
  }

  return (
    <div>
      <div style={s.card}>
        <h3 style={{ fontSize: 15, marginBottom: '1rem' }}>Publicar nuevo aviso</h3>
        <label style={s.label}>Titulo</label>
        <input style={s.input} value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Titulo del aviso" />
        <label style={s.label}>Contenido</label>
        <textarea style={{ ...s.input, minHeight: 80, resize: 'vertical' }} value={contenido} onChange={e => setContenido(e.target.value)} placeholder="Escribi el aviso..." />
        <label style={s.label}>Adjunto (PDF o imagen, opcional)</label>
        <input type="file" accept=".pdf,image/*" onChange={e => setAdjunto(e.target.files[0])} style={{ marginBottom: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <input type="checkbox" id="importante" checked={importante} onChange={e => setImportante(e.target.checked)} />
          <label htmlFor="importante" style={{ fontSize: 13, cursor: 'pointer' }}>Marcar como importante</label>
        </div>
        <button style={s.btnP} onClick={publicar} disabled={cargando}>{cargando ? 'Publicando...' : 'Publicar aviso'}</button>
        {msg && <div style={{ marginTop: 8, fontSize: 13, color: msg.startsWith('Error') ? '#A32D2D' : '#0F6E56' }}>{msg}</div>}
      </div>
      <div style={s.card}>
        <h3 style={{ fontSize: 15, marginBottom: '1rem' }}>Avisos activos</h3>
        {avisos.length === 0 ? <p style={{ fontSize: 13, color: '#888' }}>No hay avisos activos</p> : avisos.map(a => (
          <div key={a.id} style={{ padding: '12px', borderRadius: 8, border: `1px solid ${a.importante ? '#F5A623' : '#e5e5e5'}`, background: a.importante ? '#FFFBF0' : '#fff', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{a.importante && '⚠️ '}{a.titulo}</div>
              <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>{a.contenido}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{new Date(a.created_at).toLocaleDateString('es-AR')}</div>
            </div>
            <button style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid #ddd', background: 'transparent', cursor: 'pointer', fontSize: 11, color: '#A32D2D' }} onClick={() => eliminar(a.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [logueado, setLogueado] = useState(!!localStorage.getItem('admin_token'));
  const [legajo, setLegajo] = useState('001');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('recibos');
  const [periodo, setPeriodo] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [empleados, setEmpleados] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [modalEmp, setModalEmp] = useState(false);
  const [empForm, setEmpForm] = useState({ legajo: '', nombre_completo: '', cargo: '', area: '', manager_codigo: '', password: '' });

  useEffect(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    setPeriodo(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
  }, []);

  useEffect(() => {
    if (!logueado) return;
    if (tab === 'empleados') cargarEmpleados();
    if (tab === 'solicitudes') cargarSolicitudes();
  }, [tab, logueado]);

  const H = () => ({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });

  async function login() {
    try {
      const r = await fetch(API + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ legajo, password }) });
      const d = await r.json();
      const t = d.token || d.accessToken;
      if (t) { setToken(t); setLogueado(true); localStorage.setItem('admin_token', t); }
      else alert('Legajo o contrasena incorrectos');
    } catch (e) { alert('Error de conexion: ' + e.message); }
  }

  async function cargarEmpleados() {
    try { const r = await fetch(API + '/admin/empleados', { headers: H() }); setEmpleados(await r.json()); } catch (e) { }
  }

  async function cargarSolicitudes() {
    try { const r = await fetch(API + '/admin/solicitudes', { headers: H() }); setSolicitudes(await r.json()); } catch (e) { }
  }

  async function procesarPDF() {
    if (!pdfFile) { setMsg('Selecciona el PDF primero'); return; }
    if (!periodo) { setMsg('Escribi el periodo'); return; }
    setCargando(true); setMsg('Leyendo PDF...');
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const totalPags = pdfDoc.getPageCount();
      setMsg('Leyendo legajos... (' + totalPags + ' paginas)');
      const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
      const pdf = await loadingTask.promise;
      const empR = await fetch(API + '/admin/empleados', { headers: H() });
      const empList = await empR.json();
      let procesados = 0, saltados = 0, noEncontrados = [];
      for (let i = 0; i < totalPags; i += 2) {
        const page = await pdf.getPage(i + 1);
        const content = await page.getTextContent();
        const texto = content.items.map(x => x.str).join(' ');
        const match = texto.match(/Legajo\s*(\d+)/i);
        if (!match) { saltados++; continue; }
        const leg = match[1].replace(/^0+/, '') || '0';
        setMsg('Procesando legajo ' + leg + '... (' + procesados + ' subidos)');
        const emp = Array.isArray(empList) && empList.find(e => e.legajo === leg || e.legajo === leg.padStart(8, '0') || e.legajo.replace(/^0+/, '') === leg);
        if (!emp) { noEncontrados.push(leg); saltados++; continue; }
        const pdfNuevo = await PDFDocument.create();
        const indices = [i, i + 1].filter(x => x < totalPags);
        const pags = await pdfNuevo.copyPages(pdfDoc, indices);
        pags.forEach(p => pdfNuevo.addPage(p));
        const pdfEmpBytes = await pdfNuevo.save();
        const ruta = `recibos/${emp.id}/${periodo}.pdf`;
        const uploadR = await fetch(`${SUPA_URL}/storage/v1/object/${ruta}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${SUPA_KEY}`, 'apikey': SUPA_KEY, 'Content-Type': 'application/pdf', 'x-upsert': 'true' },
          body: pdfEmpBytes
        });
        if (!uploadR.ok) { noEncontrados.push(leg); saltados++; continue; }
        const regR = await fetch(API + '/admin/registrar-recibo', { method: 'POST', headers: H(), body: JSON.stringify({ empleado_id: emp.id, periodo, url_archivo: ruta }) });
        const regData = await regR.json();
        if (regData.error) { saltados++; } else procesados++;
      }
      setMsg('Completado');
      setResultado({ procesados, saltados, totalPaginas: totalPags, noEncontrados });
    } catch (e) { setMsg('Error: ' + e.message); }
    setCargando(false);
  }

  async function guardarEmpleado() {
    try {
      const r = await fetch(API + '/admin/empleados', { method: 'POST', headers: H(), body: JSON.stringify(empForm) });
      const data = await r.json();
      if (data.error) { alert(data.error); return; }
      alert('Empleado guardado'); setModalEmp(false);
      setEmpForm({ legajo: '', nombre_completo: '', cargo: '', area: '', manager_codigo: '', password: '' });
      cargarEmpleados();
    } catch (e) { alert(e.message); }
  }

  async function responder(id, estado) {
    const respuesta = prompt('Comentario:') || '';
    try { await fetch(API + '/admin/solicitudes/' + id, { method: 'PUT', headers: H(), body: JSON.stringify({ estado, respuesta }) }); cargarSolicitudes(); } catch (e) { }
  }

  const s = {
    wrap: { fontFamily: 'system-ui,sans-serif', maxWidth: 1000, margin: '0 auto', padding: '1rem' },
    tabs: { display: 'flex', borderBottom: '1px solid #e5e5e5', marginBottom: '1.5rem' },
    tab: (a) => ({ padding: '10px 18px', cursor: 'pointer', borderBottom: a ? '2px solid #1D9E75' : '2px solid transparent', color: a ? '#1D9E75' : '#666', fontWeight: a ? 600 : 400, fontSize: 14 }),
    card: { background: '#fff', border: '1px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' },
    btn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: 'transparent', cursor: 'pointer', fontSize: 13 },
    btnP: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#1D9E75', color: '#fff', cursor: 'pointer', fontSize: 13 },
    input: { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 8, boxSizing: 'border-box' },
    label: { fontSize: 12, color: '#555', display: 'block', marginBottom: 4 },
    th: { textAlign: 'left', padding: '8px 10px', fontSize: 11, color: '#888', textTransform: 'uppercase', borderBottom: '1px solid #e5e5e5' },
    td: { padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: 13 },
  };

  if (!logueado) return (
    <div style={{ maxWidth: 340, margin: '80px auto', padding: '2rem', border: '1px solid #e5e5e5', borderRadius: 12, fontFamily: 'system-ui' }}>
      <h2 style={{ fontSize: 18, marginBottom: '1.5rem' }}>Panel Admin</h2>
      <label style={s.label}>Legajo</label>
      <input style={s.input} value={legajo} onChange={e => setLegajo(e.target.value)} />
      <label style={s.label}>Contrasena</label>
      <input type="password" style={s.input} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
      <button onClick={login} style={{ width: '100%', padding: '10px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>Ingresar</button>
    </div>
  );

  return (
    <div style={s.wrap}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Panel Admin</h1>
        <button style={s.btn} onClick={() => { setLogueado(false); localStorage.removeItem('admin_token'); }}>Salir</button>
      </div>
      <div style={s.tabs}>
        {['recibos', 'empleados', 'solicitudes', 'fichajes', 'avisos'].map(t => (
          <div key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
            {t === 'recibos' ? 'Subir Recibos' : t === 'empleados' ? 'Empleados' : t === 'solicitudes' ? 'Solicitudes' : t === 'fichajes' ? 'Fichajes' : 'Cartelera'}
          </div>
        ))}
      </div>

      {tab === 'recibos' && (
        <div style={s.card}>
          <h3 style={{ fontSize: 15, marginBottom: '1rem' }}>Subir PDF de recibos</h3>
          <label style={s.label}>Periodo (YYYY-MM)</label>
          <input style={{ ...s.input, maxWidth: 200 }} value={periodo} onChange={e => setPeriodo(e.target.value)} placeholder="2026-03" />
          <label style={s.label}>Archivo PDF</label>
          <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0])} style={{ marginBottom: 12 }} />
          {pdfFile && <div style={{ fontSize: 12, color: '#1D9E75', marginBottom: 8 }}>{pdfFile.name}</div>}
          <br />
          <button style={s.btnP} onClick={procesarPDF} disabled={cargando}>{cargando ? 'Procesando...' : 'Procesar y subir recibos'}</button>
          {msg && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: msg.startsWith('Error') || msg.startsWith('Selec') || msg.startsWith('Escri') ? '#FCEBEB' : '#E1F5EE', color: msg.startsWith('Error') || msg.startsWith('Selec') || msg.startsWith('Escri') ? '#A32D2D' : '#0F6E56', fontSize: 13 }}>{msg}</div>}
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
              {resultado.noEncontrados?.length > 0 && <div style={{ gridColumn: '1/-1', background: '#FAEEDA', borderRadius: 8, padding: '10px', fontSize: 12, color: '#854F0B' }}>Legajos no encontrados: {resultado.noEncontrados.join(', ')}</div>}
            </div>
          )}
        </div>
      )}

      {tab === 'empleados' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button style={s.btnP} onClick={() => setModalEmp(true)}>+ Agregar empleado</button>
          </div>
          <div style={s.card}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={s.th}>Legajo</th><th style={s.th}>Nombre</th><th style={s.th}>Cargo</th><th style={s.th}>Area</th><th style={s.th}>Cod. Manager</th></tr></thead>
              <tbody>{Array.isArray(empleados) && empleados.map(e => <tr key={e.id}><td style={s.td}>{e.legajo}</td><td style={s.td}>{e.nombre_completo}</td><td style={s.td}>{e.cargo || '-'}</td><td style={s.td}>{e.area || '-'}</td><td style={s.td}>{e.manager_codigo || '-'}</td></tr>)}</tbody>
            </table>
          </div>
          {modalEmp && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', width: 420, maxWidth: '95vw' }}>
                <h3 style={{ fontSize: 15, marginBottom: '1rem' }}>Agregar empleado</h3>
                {['legajo', 'nombre_completo', 'cargo', 'area', 'manager_codigo', 'password'].map(k => (
                  <div key={k}>
                    <label style={s.label}>{k === 'nombre_completo' ? 'Nombre' : k === 'manager_codigo' ? 'Cod. Manager' : k === 'password' ? 'Contrasena' : k}</label>
                    <input style={s.input} value={empForm[k]} onChange={e => setEmpForm({ ...empForm, [k]: e.target.value })} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button style={s.btn} onClick={() => setModalEmp(false)}>Cancelar</button>
                  <button style={s.btnP} onClick={guardarEmpleado}>Guardar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'solicitudes' && (
        <div style={s.card}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={s.th}>Empleado</th><th style={s.th}>Tipo</th><th style={s.th}>Fecha</th><th style={s.th}>Descripcion</th><th style={s.th}>Estado</th><th style={s.th}>Acciones</th></tr></thead>
            <tbody>{Array.isArray(solicitudes) && solicitudes.map(s2 => (
              <tr key={s2.id}>
                <td style={s.td}>{s2.nombre_completo}</td>
                <td style={s.td}>{s2.tipo}</td>
                <td style={s.td}>{s2.fecha_solicitada?.slice(0, 10) || '-'}</td>
                <td style={s.td}>
                  {s2.descripcion || '-'}
                  {s2.url_adjunto && <a href={s2.url_adjunto} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#1D9E75', display: 'block', marginTop: 2 }}>Ver adjunto</a>}
                </td>
                <td style={s.td}><span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, background: s2.estado === 'aprobado' ? '#E1F5EE' : s2.estado === 'rechazado' ? '#FCEBEB' : '#FAEEDA', color: s2.estado === 'aprobado' ? '#0F6E56' : s2.estado === 'rechazado' ? '#A32D2D' : '#854F0B' }}>{s2.estado}</span></td>
                <td style={s.td}>
                  <button style={{ ...s.btn, marginRight: 4, fontSize: 11, padding: '3px 8px' }} onClick={() => responder(s2.id, 'aprobado')}>Aprobar</button>
                  <button style={{ ...s.btn, fontSize: 11, padding: '3px 8px' }} onClick={() => responder(s2.id, 'rechazado')}>Rechazar</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {tab === 'fichajes' && (
        <div style={s.card}>
          <h3 style={{ fontSize: 15, marginBottom: '1rem' }}>Control de fichajes</h3>
          <FichajesAdmin token={token} s={s} />
        </div>
      )}

      {tab === 'avisos' && (
        <AvisosAdmin token={token} s={s} />
      )}
    </div>
  );
}
