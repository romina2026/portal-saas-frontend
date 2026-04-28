import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/auth.store.js';
import { api } from '../api/client.js';
const LOGO = 'https://huklwvkrykemdqpglwzr.supabase.co/storage/v1/object/public/adjuntos/mecan-logo.png';
const SUPA_URL = 'https://huklwvkrykemdqpglwzr.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1a2x3dmtyeWtlbWRxcGdsd3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYxMjEyMSwiZXhwIjoyMDkwMTg4MTIxfQ.hvbuWwtb0jjP06qd6ayZgOA_A3rRfxvN2Jl1HPQaWkg';
export default function Beneficios() {
  const empleado = useAuthStore((s) => s.empleado);
  const [beneficios, setBeneficios] = useState([]);
  const [foto, setFoto] = useState(null);
  const [sacandoFoto, setSacandoFoto] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  useEffect(() => {
    api.get('/beneficios').then(r => setBeneficios(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    cargarFoto();
  }, []);
  async function cargarFoto() {
    if (!empleado?.id) return;
    const url = SUPA_URL + '/storage/v1/object/public/adjuntos/' + empleado.id + '.jpg';
    const r = await fetch(url, { method: 'HEAD' }).catch(() => null);
    if (r?.ok) setFoto(url + '?t=' + Date.now());
  }
  async function abrirCamara() {
    setSacandoFoto(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch (e) { alert('No se pudo acceder a la camara'); setSacandoFoto(false); }
  }
  function cerrarCamara() {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setSacandoFoto(false);
  }
  async function sacarFoto() {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = 300; canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 300, 300);
    canvas.toBlob(async (blob) => {
      setSubiendo(true); cerrarCamara();
      const ruta = 'adjuntos/' + empleado.id + '.jpg';
      await fetch(SUPA_URL + '/storage/v1/object/' + ruta, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + SUPA_KEY, 'apikey': SUPA_KEY, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
        body: blob
      });
      setSubiendo(false); cargarFoto();
    }, 'image/jpeg', 0.85);
  }
  const hoy = new Date();
  return (
    <div style={{ padding: '16px', fontFamily: 'system-ui, sans-serif', maxWidth: 420, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', borderRadius: 16, padding: '20px', color: '#fff', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <img src={LOGO} alt="MECAN" style={{ height: 40, marginBottom: 12 }} />
            <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.8, marginBottom: 6 }}>Credencial de beneficios</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{empleado?.nombreCompleto}</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{empleado?.cargo} — {empleado?.area}</div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>Legajo {empleado?.legajo}</div>
          </div>
          <div style={{ marginLeft: 16 }}>
            {foto ? (
              <div style={{ position: 'relative' }}>
                <img src={foto} alt="foto" style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.5)', objectFit: 'cover' }} />
                <button onClick={abrirCamara} style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12 }}>📷</button>
              </div>
            ) : (
              <button onClick={abrirCamara} style={{ width: 72, height: 72, borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.1)', cursor: 'pointer', color: '#fff', fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <span style={{ fontSize: 20 }}>📷</span><span>Foto</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {sacandoFoto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: 280, height: 280, borderRadius: '50%', objectFit: 'cover', border: '3px solid #1D9E75' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={sacarFoto} style={{ padding: '12px 24px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}>Tomar foto</button>
            <button onClick={cerrarCamara} style={{ padding: '12px 24px', background: '#555', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}
      {subiendo && <div style={{ textAlign: 'center', color: '#1D9E75', marginBottom: 12 }}>Guardando foto...</div>}
      {beneficios.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888', fontSize: 14 }}>No hay beneficios activos</p>
      ) : beneficios.map(b => {
        const venc = new Date(b.vencimiento);
        const vencido = venc < hoy;
        const dias = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
        return (
          <div key={b.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: '16px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{b.nombre}</div>
              {vencido ? <span style={{ fontSize: 10, background: '#FCEBEB', color: '#A32D2D', padding: '2px 8px', borderRadius: 20 }}>Vencido</span>
              : dias <= 7 ? <span style={{ fontSize: 10, background: '#FAEEDA', color: '#854F0B', padding: '2px 8px', borderRadius: 20 }}>Vence en {dias}d</span>
              : <span style={{ fontSize: 10, background: '#E1F5EE', color: '#0F6E56', padding: '2px 8px', borderRadius: 20 }}>Vigente</span>}
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{b.comercio}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1D9E75', marginTop: 8 }}>{b.descuento}</div>
            {b.descripcion && <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>{b.descripcion}</div>}
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 8 }}>Valido hasta {venc.toLocaleDateString('es-AR')}</div>
          </div>
        );
      })}
    </div>
  );
}
