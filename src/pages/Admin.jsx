import { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Admin() {
  const [token, setToken] = useState('');
  const [legajo, setLegajo] = useState('001');
  const [password, setPassword] = useState('');
  const [logueado, setLogueado] = useState(false);
  const [tab, setTab] = useState('recibos');
  const [periodo, setPeriodo] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [empleados, setEmpleados] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [modalEmp, setModalEmp] = useState(false);
  const [empForm, setEmpForm] = useState({legajo:'',nombre_completo:'',cargo:'',area:'',manager_codigo:'',password:''});

  useEffect(() => {
    const d = new Date(); d.setMonth(d.getMonth()-1);
    setPeriodo(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'));
  }, []);

  useEffect(() => {
    if(!logueado) return;
    if(tab==='empleados') cargarEmpleados();
    if(tab==='solicitudes') cargarSolicitudes();
  }, [tab, logueado]);

  const H = () => ({'Content-Type':'application/json','Authorization':'Bearer '+token,'ngrok-skip-browser-warning':'true'});

  async function login() {
    try {
      const r = await fetch(API+'/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({legajo, password})});
      const d = await r.json();
      const t = d.token || d.accessToken;
      if(t) { setToken(t); setLogueado(true); }
      else alert('Legajo o contraseña incorrectos');
    } catch(e) { alert('Error de conexión: '+e.message); }
  }

  async function cargarEmpleados() {
    try { const r = await fetch(API+'/admin/empleados', {headers:H()}); setEmpleados(await r.json()); } catch(e) {}
  }
  async function cargarSolicitudes() {
    try { const r = await fetch(API+'/admin/solicitudes', {headers:H()}); setSolicitudes(await r.json()); } catch(e) {}
  }
 async function procesarPDF() {
    if(!pdfFile){setMsg('❌ Seleccioná el PDF primero');return;}
    if(!periodo){setMsg('❌ Escribí el período');return;}
    setCargando(true); setMsg('⏳ Leyendo PDF...');
    try {
      const pdfjsLib = await import('pdfjs-dist');
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const totalPags = pdfDoc.getPageCount();
      setMsg('⏳ Leyendo legajos... ('+totalPags+' páginas)');
      const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
      const pdf = await loadingTask.promise;
      let procesados = 0, saltados = 0, noEncontrados = [];
      for(let i = 0; i < totalPags; i += 2) {
        const page = await pdf.getPage(i + 1);
        const content = await page.getTextContent();
        const texto = content.items.map(x => x.str).join(' ');
        const match = texto.match(/Legajo\s*(\d+)/i);
        if(!match){ saltados++; continue; }
        const legajo = match[1].replace(/^0+/,'') || '0';
        setMsg('⏳ Procesando legajo '+legajo+'... ('+procesados+' subidos)');
        const pdfNuevo = await PDFDocument.create();
        const indices = [i, i+1].filter(x => x < totalPags);
        const pags = await pdfNuevo.copyPages(pdfDoc, indices);
        pags.forEach(p => pdfNuevo.addPage(p));
        const pdfEmpBytes = await pdfNuevo.save();
        const blob = new Blob([pdfEmpBytes], {type:'application/pdf'});
        const formData = new FormData();
        formData.append('pdf', blob, legajo+'.pdf');
        formData.append('legajo', legajo);
        formData.append('periodo', periodo);
        const r = await fetch(API+'/admin/subir-recibo-individual', {
          method:'POST',
          headers:{'Authorization':'Bearer '+token},
          body: formData
        });
        const data = await r.json();
        if(data.error){ noEncontrados.push(legajo); saltados++; }
        else procesados++;
      }
      setMsg('✅ Completado');
      setResultado({procesados, saltados, totalPaginas: totalPags, noEncontrados});
    } catch(e){ setMsg('❌ '+e.message); }
    setCargando(false);
  }
    reader.readAsDataURL(pdfFile);
  }
  async function guardarEmpleado() {
    try {
      const r = await fetch(API+'/admin/empleados', {method:'POST', headers:H(), body:JSON.stringify(empForm)});
      const data = await r.json();
      if(data.error){alert(data.error);return;}
      alert('✅ Empleado guardado'); setModalEmp(false);
      setEmpForm({legajo:'',nombre_completo:'',cargo:'',area:'',manager_codigo:'',password:''});
      cargarEmpleados();
    } catch(e){ alert(e.message); }
  }
  async function responder(id, estado) {
    const respuesta = prompt('Comentario:') || '';
    try { await fetch(API+'/admin/solicitudes/'+id, {method:'PUT', headers:H(), body:JSON.stringify({estado, respuesta})}); cargarSolicitudes(); } catch(e){}
  }

  const s = {
    wrap:{fontFamily:'system-ui,sans-serif',maxWidth:1000,margin:'0 auto',padding:'1rem'},
    tabs:{display:'flex',borderBottom:'1px solid #e5e5e5',marginBottom:'1.5rem'},
    tab:(a)=>({padding:'10px 18px',cursor:'pointer',borderBottom:a?'2px solid #1D9E75':'2px solid transparent',color:a?'#1D9E75':'#666',fontWeight:a?600:400,fontSize:14}),
    card:{background:'#fff',border:'1px solid #e5e5e5',borderRadius:12,padding:'1.25rem',marginBottom:'1rem'},
    btn:{padding:'8px 16px',borderRadius:8,border:'1px solid #ddd',background:'transparent',cursor:'pointer',fontSize:13},
    btnP:{padding:'8px 16px',borderRadius:8,border:'none',background:'#1D9E75',color:'#fff',cursor:'pointer',fontSize:13},
    input:{width:'100%',padding:'8px 10px',border:'1px solid #ddd',borderRadius:8,fontSize:14,marginBottom:8,boxSizing:'border-box'},
    label:{fontSize:12,color:'#555',display:'block',marginBottom:4},
    th:{textAlign:'left',padding:'8px 10px',fontSize:11,color:'#888',textTransform:'uppercase',borderBottom:'1px solid #e5e5e5'},
    td:{padding:'10px',borderBottom:'1px solid #f0f0f0',fontSize:13},
  };

  if(!logueado) return (
    <div style={{maxWidth:340,margin:'80px auto',padding:'2rem',border:'1px solid #e5e5e5',borderRadius:12,fontFamily:'system-ui'}}>
      <h2 style={{fontSize:18,marginBottom:'1.5rem'}}>⚙️ Panel Admin</h2>
      <label style={s.label}>Legajo</label>
      <input style={s.input} value={legajo} onChange={e=>setLegajo(e.target.value)} />
      <label style={s.label}>Contraseña</label>
      <input type="password" style={s.input} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} />
      <button style={s.btnP} onClick={login} style={{width:'100%',padding:'10px',background:'#1D9E75',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontSize:14}}>Ingresar</button>
    </div>
  );

  return (
    <div style={s.wrap}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:20,fontWeight:600}}>⚙️ Panel Admin</h1>
        <button style={s.btn} onClick={()=>setLogueado(false)}>Salir</button>
      </div>
      <div style={s.tabs}>
        {['recibos','empleados','solicitudes'].map(t=>(
          <div key={t} style={s.tab(tab===t)} onClick={()=>setTab(t)}>
            {t==='recibos'?'📄 Subir Recibos':t==='empleados'?'👥 Empleados':'📅 Solicitudes'}
          </div>
        ))}
      </div>

      {tab==='recibos' && (
        <div style={s.card}>
          <h3 style={{fontSize:15,marginBottom:'1rem'}}>Subir PDF de recibos</h3>
          <label style={s.label}>Período (YYYY-MM)</label>
          <input style={{...s.input,maxWidth:200}} value={periodo} onChange={e=>setPeriodo(e.target.value)} placeholder="2026-03" />
          <label style={s.label}>Archivo PDF</label>
          <input type="file" accept=".pdf" onChange={e=>setPdfFile(e.target.files[0])} style={{marginBottom:12}} />
          {pdfFile && <div style={{fontSize:12,color:'#1D9E75',marginBottom:8}}>✅ {pdfFile.name}</div>}
          <br/>
          <button style={s.btnP} onClick={procesarPDF} disabled={cargando}>{cargando?'⏳ Procesando...':'⚡ Procesar y subir recibos'}</button>
          {msg && <div style={{marginTop:12,padding:'10px 14px',borderRadius:8,background:msg.startsWith('✅')?'#E1F5EE':'#FCEBEB',color:msg.startsWith('✅')?'#0F6E56':'#A32D2D',fontSize:13}}>{msg}</div>}
          {resultado && (
            <div style={{marginTop:'1rem',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
              <div style={{background:'#E1F5EE',borderRadius:8,padding:'1rem',textAlign:'center'}}>
                <div style={{fontSize:28,fontWeight:700,color:'#0F6E56'}}>{resultado.procesados}</div>
                <div style={{fontSize:12}}>Recibos subidos</div>
              </div>
              <div style={{background:'#f0f0f0',borderRadius:8,padding:'1rem',textAlign:'center'}}>
                <div style={{fontSize:28,fontWeight:700}}>{resultado.saltados}</div>
                <div style={{fontSize:12}}>Saltados</div>
              </div>
              <div style={{background:'#f0f0f0',borderRadius:8,padding:'1rem',textAlign:'center'}}>
                <div style={{fontSize:28,fontWeight:700}}>{resultado.totalPaginas}</div>
                <div style={{fontSize:12}}>Páginas totales</div>
              </div>
              {resultado.noEncontrados?.length>0 && <div style={{gridColumn:'1/-1',background:'#FAEEDA',borderRadius:8,padding:'10px',fontSize:12,color:'#854F0B'}}>Legajos no encontrados: {resultado.noEncontrados.join(', ')}</div>}
            </div>
          )}
        </div>
      )}

      {tab==='empleados' && (
        <div>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'1rem'}}>
            <button style={s.btnP} onClick={()=>setModalEmp(true)}>+ Agregar empleado</button>
          </div>
          <div style={s.card}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><th style={s.th}>Legajo</th><th style={s.th}>Nombre</th><th style={s.th}>Cargo</th><th style={s.th}>Área</th><th style={s.th}>Cod. Manager</th></tr></thead>
              <tbody>{Array.isArray(empleados)&&empleados.map(e=><tr key={e.id}><td style={s.td}>{e.legajo}</td><td style={s.td}>{e.nombre_completo}</td><td style={s.td}>{e.cargo||'—'}</td><td style={s.td}>{e.area||'—'}</td><td style={s.td}>{e.manager_codigo||'—'}</td></tr>)}</tbody>
            </table>
          </div>
          {modalEmp && (
            <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}}>
              <div style={{background:'#fff',borderRadius:12,padding:'1.5rem',width:420,maxWidth:'95vw'}}>
                <h3 style={{fontSize:15,marginBottom:'1rem'}}>Agregar empleado</h3>
                {['legajo','nombre_completo','cargo','area','manager_codigo','password'].map(k=>(
                  <div key={k}>
                    <label style={s.label}>{k==='nombre_completo'?'Nombre':k==='manager_codigo'?'Cód. Manager':k==='password'?'Contraseña':k}</label>
                    <input style={s.input} value={empForm[k]} onChange={e=>setEmpForm({...empForm,[k]:e.target.value})} />
                  </div>
                ))}
                <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:'1rem'}}>
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
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr><th style={s.th}>Empleado</th><th style={s.th}>Tipo</th><th style={s.th}>Fecha</th><th style={s.th}>Motivo</th><th style={s.th}>Estado</th><th style={s.th}>Acciones</th></tr></thead>
            <tbody>{Array.isArray(solicitudes)&&solicitudes.map(s2=>(
              <tr key={s2.id}>
                <td style={s.td}>{s2.nombre_completo}</td>
                <td style={s.td}>{s2.tipo}</td>
                <td style={s.td}>{s2.fecha_inicio?.slice(0,10)||'—'}</td>
                <td style={s.td}>{s2.motivo||'—'}</td>
                <td style={s.td}><span style={{padding:'2px 8px',borderRadius:20,fontSize:11,background:s2.estado==='aprobado'?'#E1F5EE':s2.estado==='rechazado'?'#FCEBEB':'#FAEEDA',color:s2.estado==='aprobado'?'#0F6E56':s2.estado==='rechazado'?'#A32D2D':'#854F0B'}}>{s2.estado}</span></td>
                <td style={s.td}>
                  <button style={{...s.btn,marginRight:4,fontSize:11,padding:'3px 8px'}} onClick={()=>responder(s2.id,'aprobado')}>✅</button>
                  <button style={{...s.btn,fontSize:11,padding:'3px 8px'}} onClick={()=>responder(s2.id,'rechazado')}>❌</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}