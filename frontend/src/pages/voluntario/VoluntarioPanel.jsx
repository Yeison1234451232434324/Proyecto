import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../components/dashboard/Sidebar';
import EventosDisponibles from './modules/EventosDisponibles';
import ActividadesAsignadas from './modules/ActividadesAsignadas';
import MisCalificaciones from './modules/MisCalificaciones';
import '../Panel.css';

const menuItems = [
  { id: 'eventos', label: 'Eventos Disponibles', icon: '📅' },
  { id: 'actividades', label: 'Actividades Asignadas', icon: '✅' },
  { id: 'calificaciones', label: 'Mis Calificaciones', icon: '⭐' },
];

const views = {
  eventos: <EventosDisponibles />,
  actividades: <ActividadesAsignadas />,
  calificaciones: <MisCalificaciones />,
};

export default function VoluntarioPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('eventos');

  return (
    <div className="panel-layout">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        title="Panel Voluntario"
        subtitle="Gestión de participación"
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
