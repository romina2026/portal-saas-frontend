// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store.js';
import Login      from './pages/Login.jsx';
import Home       from './pages/Home.jsx';
import Recibos    from './pages/Recibos.jsx';
import CuentaCte  from './pages/CuentaCte.jsx';
import RRHH       from './pages/RRHH.jsx';
import Fichaje    from './pages/Fichaje.jsx';
import CambiarPass from './pages/CambiarPass.jsx';
import Admin from './pages/Admin.jsx';
import BottomNav  from './components/BottomNav.jsx';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'var(--nav-height)' }}>
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cambiar-password" element={<PrivateRoute><CambiarPass /></PrivateRoute>} />
      <Route path="/" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
      <Route path="/recibos" element={<PrivateRoute><Layout><Recibos /></Layout></PrivateRoute>} />
      <Route path="/cuenta" element={<PrivateRoute><Layout><CuentaCte /></Layout></PrivateRoute>} />
      <Route path="/rrhh" element={<PrivateRoute><Layout><RRHH /></Layout></PrivateRoute>} />
      <Route path="/fichaje" element={<PrivateRoute><Layout><Fichaje /></Layout></PrivateRoute>} />
     <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
  );
}
