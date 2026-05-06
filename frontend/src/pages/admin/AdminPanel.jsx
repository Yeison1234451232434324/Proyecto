import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../components/dashboard/Sidebar';
import Dashboard from './modules/Dashboard';
import PublicarEventos from '../../components/dashboard/PublicarEventos';
import PublicarNoticias from '../../components/dashboard/PublicarNoticias';
import OracionDia from '../../components/dashboard/OracionDia';
import CrearUsuarios from './modules/CrearUsuarios';
import GestionUsuarios from './modules/GestionUsuarios';
import CalificarVoluntarios from '../../components/dashboard/CalificarVoluntarios';
import GestionRecursos from '../../components/dashboard/GestionRecursos';
import Actividades from '../../components/dashboard/Actividades';
import SubirReporte from '../../components/dashboard/SubirReporte';
import GenerarReportes from '../../components/dashboard/GenerarReportes';
import GestionSedes from './modules/GestionSedes';
import GestionEventos from '../../components/dashboard/GestionEventos';
import '../Panel.css';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'eventos', label: 'Publicar Eventos', icon: '📅' },
  { id: 'noticias', label: 'Publicar Noticias', icon: '📰' },
  { id: 'oracion', label: 'Oración del Día', icon: '🕊️' },
  { id: 'crear-usuarios', label: 'Crear Usuarios', icon: '👤' },
  { id: 'gestion-usuarios', label: 'Gestión de Usuarios', icon: '👥' },
  { id: 'calificar', label: 'Calificar Voluntarios', icon: '⭐' },
  { id: 'recursos', label: 'Gestión de Recursos', icon: '📦' },
  { id: 'actividades', label: 'Actividades', icon: '✅' },
  { id: 'reporte', label: 'Subir Reporte', icon: '📋' },
  { id: 'generar-reportes', label: 'Generar Reportes', icon: '📊' },
  { id: 'sedes', label: 'Gestión de Sedes', icon: '🏛️' },
];

const views = {
  dashboard: <Dashboard />,
  eventos: <PublicarEventos isAdmin={true} />,
  'gestion-eventos': <GestionEventos />,
  noticias: <PublicarNoticias isAdmin={true} />,
  oracion: <OracionDia isAdmin={true} />,
  'crear-usuarios': <CrearUsuarios />,
  'gestion-usuarios': <GestionUsuarios />,
  calificar: <CalificarVoluntarios />,
  recursos: <GestionRecursos />,
  actividades: <Actividades />,
  reporte: <SubirReporte />,
  'generar-reportes': <GenerarReportes />,
  sedes: <GestionSedes />,
};

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');

  return (
    <div className="panel-layout">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        title="Panel Administrador"
        subtitle="Gestión completa del sistema"
        menuItems={menuItems}
        activeItem={activeItem}
        onMenuClick={setActiveItem}
      />
      <main className={`panel-main ${sidebarOpen ? 'with-sidebar' : ''}`}>
        <div className="panel-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              {views[activeItem]}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
