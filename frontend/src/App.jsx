import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import AdminPanel from './pages/admin/AdminPanel';
import ColaboradorPanel from './pages/colaborador/ColaboradorPanel';
import VoluntarioPanel from './pages/voluntario/VoluntarioPanel';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, rol, loading } = useAuth();
  if (loading) return <div className="loading-screen">Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(rol)) return <Navigate to="/" replace />;
  return children;
}

function RoleRedirect() {
  const { isAuthenticated, rol } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (rol === 'administrador') return <Navigate to="/admin" replace />;
  if (rol === 'colaborador') return <Navigate to="/colaborador" replace />;
  if (rol === 'voluntario') return <Navigate to="/voluntario" replace />;
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<RoleRedirect />} />
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['administrador']}>
            <AdminPanel />
          </ProtectedRoute>
        } />
        <Route path="/colaborador/*" element={
          <ProtectedRoute allowedRoles={['colaborador']}>
            <ColaboradorPanel />
          </ProtectedRoute>
        } />
        <Route path="/voluntario/*" element={
          <ProtectedRoute allowedRoles={['voluntario']}>
            <VoluntarioPanel />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
