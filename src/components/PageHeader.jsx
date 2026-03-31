// src/components/PageHeader.jsx
import { useNavigate } from 'react-router-dom';

export default function PageHeader({ title, sub, backPath }) {
  const navigate = useNavigate();
  return (
    <div style={{
      padding: '16px 16px 12px',
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-card)',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      {backPath && (
        <button onClick={() => navigate(backPath)}
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)',
            fontSize: 14, cursor: 'pointer', marginBottom: 8, padding: 0 }}>
          ← Volver
        </button>
      )}
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>{title}</h2>
      {sub && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}
