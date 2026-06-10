import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store.js';
import Login            from './pages/Login.jsx';
import Home             from './pages/Home.jsx';
import Recibos          from './pages/Recibos.jsx';
import CuentaCte        from './pages/CuentaCte.jsx';
import RRHH             from './pages/RRHH.jsx';
import Fichaje          from './pages/Fichaje.jsx';
import CambiarPass      from './pages/CambiarPass.jsx';
import Beneficios       from './pages/Beneficios.jsx';
import Capacitaciones   from './pages/Capacitaciones.jsx';
import Admin            from './pages/Admin.jsx';
import BottomNav        from './components/BottomNav.jsx';
import SuperAdminLogin  from './pages/SuperAdminLogin.jsx';
import SuperAdmin       from './pages/SuperAdmin.jsx';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function SuperRoute({ children }) {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin());
  return isSuperAdmin ? children : <Navigate to="/super/login" replace />;
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
      {/* Super Admin */}
      <Route path="/super/login" element={<SuperAdminLogin />} />
      <Route path="/super" element={<SuperRoute><SuperAdmin /></SuperRoute>} />

      {/* Empleados */}
      <Route path="/login" element={<Login />} />
      <Route path="/cambiar-password" element={<PrivateRoute><CambiarPass /></PrivateRoute>} />
      <Route path="/" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
      <Route path="/recibos" element={<PrivateRoute><Layout><Recibos /></Layout></PrivateRoute>} />
      <Route path="/cuenta" element={<PrivateRoute><Layout><CuentaCte /></Layout></PrivateRoute>} />
      <Route path="/rrhh" element={<PrivateRoute><Layout><RRHH /></Layout></PrivateRoute>} />
      <Route path="/beneficios" element={<PrivateRoute><Layout><Beneficios /></Layout></PrivateRoute>} />
      <Route path="/fichaje" element={<PrivateRoute><Layout><Fichaje /></Layout></PrivateRoute>} />
      <Route path="/capacitaciones" element={<PrivateRoute><Layout><Capacitaciones /></Layout></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
