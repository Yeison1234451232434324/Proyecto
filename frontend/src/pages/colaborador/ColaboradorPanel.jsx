import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../components/dashboard/Sidebar';
import PublicarEventos from '../../components/dashboard/PublicarEventos';
import PublicarNoticias from '../../components/dashboard/PublicarNoticias';
import OracionDia from '../../components/dashboard/OracionDia';
import GestionRecursos from '../../components/dashboard/GestionRecursos';
import CalificarVoluntarios from '../../components/dashboard/CalificarVoluntarios';
import Actividades from '../../components/dashboard/Actividades';
import SubirReporte from '../../components/dashboard/SubirReporte';
import GenerarReportes from '../../components/dashboard/GenerarReportes';
import '../Panel.css';

const menuItems = [
  { id: 'eventos', label: 'Crear Eventos', icon: '📅' },
  { id: 'noticias', label: 'Publicar Noticias', icon: '📰' },
  { id: 'oracion', label: 'Oración del Día', icon: '🕊️' },
  { id: 'recursos', label: 'Gestión de Recursos', icon: '📦' },
  { id: 'calificar', label: 'Calificar Voluntarios', icon: '⭐' },
  { id: 'actividades', label: 'Actividades', icon: '✅' },
  { id: 'reporte', label: 'Subir Reporte', icon: '📋' },
  { id: 'generar-reportes', label: 'Generar Reportes', icon: '📊' },
];

const views = {
  eventos: <PublicarEventos />,
  noticias: <PublicarNoticias />,
  oracion: <OracionDia />,
  recursos: <GestionRecursos />,
  calificar: <CalificarVoluntarios />,
  actividades: <Actividades />,
  reporte: <SubirReporte />,
  'generar-reportes': <GenerarReportes />,
};

export default function ColaboradorPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('eventos');

  return (
    <div className="panel-layout">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        title="Panel Colaborador"
        subtitle="Gestión de contenido"
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
