// src/components/BottomNav.jsx
import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { path: '/',        label: 'Inicio',  icon: '🏠' },
  { path: '/recibos', label: 'Recibos', icon: '📄' },
  { path: '/cuenta',  label: 'Cuenta',  icon: '💳' },
  { path: '/rrhh',    label: 'RRHH',    icon: '👤' },
  { path: '/fichaje', label: 'Fichar',  icon: '🕐' },
];

export default function BottomNav() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'var(--nav-height)',
      background: 'var(--color-card)',
      borderTop: '1px solid var(--color-border)',
      display: 'flex', alignItems: 'stretch',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 100,
    }}>
      {TABS.map((tab) => {
        const active = pathname === tab.path;
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, background: 'none', border: 'none',
              cursor: 'pointer', padding: '6px 0',
              color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
