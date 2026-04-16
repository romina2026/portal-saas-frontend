import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Admin() {
  const token = useAuthStore((s) => s.token);
  const [tab, setTab] = useState('recibos');
  const [periodo, setPeriodo] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [empleados, setEmpleados] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [modalEmp, setModalEmp] = useState(false);
  const [empForm, setEmpForm] = useState({ legajo:'', nombre_completo:'', cargo:'', area:'', manager_codigo:'', password:'' });
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);

  const h = { 'Content-Type':'application/json', 'Authorization':'Bearer '+token, 'ngrok-skip-browser-warning':'true' };

  useEffect(() => {
    const d = new Date(); d.setMonth(d.getMonth()-1);
    setPeriodo(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'));
    if(tab==='empleados') cargarEmpleados();
    if(tab==='solicitudes') cargarSolicitudes();
  }, [tab]);

  async function cargarEmpleados() {
    const r = await fetch(API+'/admin/empleados', {headers:h});
    setEmpleados(await r.json());
  }

  async function cargarSolicitudes() {
    const r = await fetch(API+'/admin/solicitudes', {headers:h});
    setSolicitudes(await r.json());
  }

  async function procesarPDF() {
    if(!pdfFile) { setMsg('❌ Seleccioná el PDF primero'); return; }
    if(!periodo) { setMsg('❌ Escribí el período (ej: 2026-03)'); return; }
    setCargando(true); setMsg('⏳ Procesando... puede tardar unos minutos...');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result.split(',')[1];
      try {
        const r = await fetch(API+'/admin/subir-recibos', { method:'POST', headers:h, body:JSON.stringify({pdfBase64:base64, periodo}) });
        const data = await r.json();
        if(data.error) { setMsg('❌ '+data.error); }
        else { setMsg('✅ Completado'); setResultado(data); }
      } catch(e) { setMsg('❌ Error de conexión: '+e.message); }
      setCargando(false);
    };
    reader.readAsDataURL(pdfFile);
  }

  async function guardarEmpleado() {
    const r = await fetch(API+'/admin/empleados', { method:'POST', headers:h, body:JSON.stringify(empForm) });
    const data = await r.json();
    if(data.error) { alert(data.error); return; }
    alert('✅ Empleado guardado');
    setModalEmp(false);
    setEmpForm({ legajo:'', nombre_completo:'', cargo:'', area:'', manager_codigo:'', password:'' });
    cargarEmpleados();
  }

  async function responder(id, estado) {
    const respuesta = prompt('Comentario (opcional):') || '';
    await fetch(API+'/admin/solicitudes/'+id, { method:'PUT', headers:h, body:JSON.stringify({estado, respuesta}) });
    cargarSolicitudes();
  }

  const s = {
    wrap: { fontFamily:'system-ui,sans-serif', maxWidth:1000, margin:'0 auto', padding:'1rem' },
    tabs: { display:'flex', gap:4, borderBottom:'1px solid #e5e5e5', marginBottom:'1.5rem' },
    tab: (a) => ({ padding:'10px 18px', cursor:'pointer', borderBottom: a?'2px solid #1D9E75':'2px solid transparent', color:a?'#1D9E75':'#666', fontWeight:a?600:400, fontSize:14 }),
    card: { background:'#fff', border:'1px solid #e5e5e5', borderRadius:12, padding:'1.25rem', marginBottom:'1rem' },
    btn: { padding:'8px 16px', borderRadius:8, border:'1px solid #ddd', background:'transparent', cursor:'pointer', fontSize:13, fontWeight:500 },
    btnP: { padding:'8px 16px', borderRadius:8, border:'none', background:'#1D9E75', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:500 },
    input: { width:'100%', padding:'8px 10px', border:'1px solid #ddd', borderRadius:8, fontSize:14, marginBottom:8, boxSizing:'border-box' },
    label: { fontSize:12, color:'#555', display:'block', marginBottom:4 },
    th: { textAlign:'left', padding:'8px 10px', fontSize:11, color:'#888', textTransform:'uppercase', borderBottom:'1px solid #e5e5e5' },
    td: { padding:'10px', borderBottom:'1px solid #f0f0f0', fontSize:13 },
  };

  return (
    <div style={s.wrap}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:20, fontWeight:600}}>⚙️ Panel Admin</h1>
        <a href="/" style={{fontSize:13, color:'#1D9E75'}}>← Volver al portal</a>
      </div>
      <div style={s.tabs}>
        {['recibos','empleados','solicitudes'].map(t => (
          <div key={t} style={s.tab(tab===t)} onClick={()=>setTab(t)}>
            {t==='recibos'?'📄 Subir Recibos':t==='empleados'?'👥 Empleados':'📅 Solicitudes'}
          </div>
        ))}
      </div>

      {tab==='recibos' && (
        <div style={s.card}>
          <h3 style={{fontSize:15, marginBottom:'1rem'}}>Subir PDF de recibos</h3>
          <label style={s.label}>Período (YYYY-MM)</label>
          <input style={{...s.input, maxWidth:200}} value={periodo} onChange={e=>setPeriodo(e.target.value)} placeholder="2026-03" />
          <label style={s.label}>Archivo PDF</label>
          <input type="file" accept=".pdf" onChange={e=>setPdfFile(e.target.files[0])} style={{marginBottom:12}} />
          {pdfFile && <div style={{fontSize:12, color:'#1D9E75', marginBottom:8}}>✅ {pdfFile.name}</div>}
          <br/>
          <button style={s.btnP} onClick={procesarPDF} disabled={cargando}>
            {cargando ? '⏳ Procesando...' : '⚡ Procesar y subir recibos'}
          </button>
          {msg && <div style={{marginTop:12, padding:'10px 14px', borderRadius:8, background: msg.startsWith('✅')?'#E1F5EE':'#FCEBEB', color: msg.startsWith('✅')?'#0F6E56':'#A32D2D', fontSize:13}}>{msg}</div>}
          {resultado && (
            <div style={{marginTop:'1rem', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
              <div style={{background:'#E1F5EE', borderRadius:8, padding:'1rem', textAlign:'center'}}>
                <div style={{fontSize:28, fontWeight:700, color:'#0F6E56'}}>{resultado.procesados}</div>
                <div style={{fontSize:12, color:'#555'}}>Recibos subidos</div>
              </div>
              <div style={{background:'#f0f0f0', borderRadius:8, padding:'1rem', textAlign:'center'}}>
                <div style={{fontSize:28, fontWeight:700, color:'#555'}}>{resultado.saltados}</div>
                <div style={{fontSize:12, color:'#555'}}>Saltados</div>
              </div>
              <div style={{background:'#f0f0f0', borderRadius:8, padding:'1rem', textAlign:'center'}}>
                <div style={{fontSize:28, fontWeight:700, color:'#555'}}>{resultado.totalPaginas}</div>
                <div style={{fontSize:12, color:'#555'}}>Páginas totales</div>
              </div>
              {resultado.noEncontrados?.length > 0 && (
                <div style={{gridColumn:'1/-1', background:'#FAEEDA', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#854F0B'}}>
                  Legajos no encontrados: {resultado.noEncontrados.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab==='empleados' && (
        <div>
          <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'1rem'}}>
            <button style={s.btnP} onClick={()=>setModalEmp(true)}>+ Agregar empleado</button>
          </div>
          <div style={s.card}>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead><tr><th style={s.th}>Legajo</th><th style={s.th}>Nombre</th><th style={s.th}>Cargo</th><th style={s.th}>Área</th><th style={s.th}>Cod. Manager</th></tr></thead>
              <tbody>
                {Array.isArray(empleados) && empleados.map(e => (
                  <tr key={e.id}><td style={s.td}>{e.legajo}</td><td style={s.td}>{e.nombre_completo}</td><td style={s.td}>{e.cargo||'—'}</td><td style={s.td}>{e.area||'—'}</td><td style={s.td}>{e.manager_codigo||'—'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          {modalEmp && (
            <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100}}>
              <div style={{background:'#fff', borderRadius:12, padding:'1.5rem', width:420, maxWidth:'95vw'}}>
                <h3 style={{fontSize:15, marginBottom:'1rem'}}>Agregar empleado</h3>
                {['legajo','nombre_completo','cargo','area','manager_codigo','password'].map(k => (
                  <div key={k}>
                    <label style={s.label}>{k==='nombre_completo'?'Nombre completo':k==='manager_codigo'?'Código Manager':k==='password'?'Contraseña (default: Portal2025!)':k.charAt(0).toUpperCase()+k.slice(1)}</label>
                    <input style={s.input} value={empForm[k]} onChange={e=>setEmpForm({...empForm,[k]:e.target.value})} placeholder={k==='password'?'dejar vacío = Portal2025!':''} />
                  </div>
                ))}
                <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:'1rem'}}>
                  <button style={s.btn} onClick={()=>setModalEmp(false)}>Cancelar</button>
                  <button style={s.btnP} onClick={guardarEmpleado}>Guardar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab==='solicitudes' && (
        <div style={s.card}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead><tr><th style={s.th}>Empleado</th><th style={s.th}>Tipo</th><th style={s.th}>Fecha</th><th style={s.th}>Motivo</th><th style={s.th}>Estado</th><th style={s.th}>Acciones</th></tr></thead>
            <tbody>
              {Array.isArray(solicitudes) && solicitudes.map(s2 => (
                <tr key={s2.id}>
                  <td style={s.td}>{s2.nombre_completo}</td>
                  <td style={s.td}>{s2.tipo}</td>
                  <td style={s.td}>{s2.fecha_inicio?.slice(0,10)||'—'}</td>
                  <td style={s.td}>{s2.motivo||'—'}</td>
                  <td style={s.td}><span style={{padding:'2px 8px', borderRadius:20, fontSize:11, background:s2.estado==='aprobado'?'#E1F5EE':s2.estado==='rechazado'?'#FCEBEB':'#FAEEDA', color:s2.estado==='aprobado'?'#0F6E56':s2.estado==='rechazado'?'#A32D2D':'#854F0B'}}>{s2.estado}</span></td>
                  <td style={s.td}>
                    <button style={{...s.btn, marginRight:4, fontSize:11, padding:'3px 8px'}} onClick={()=>responder(s2.id,'aprobado')}>✅</button>
                    <button style={{...s.btn, fontSize:11, padding:'3px 8px'}} onClick={()=>responder(s2.id,'rechazado')}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}