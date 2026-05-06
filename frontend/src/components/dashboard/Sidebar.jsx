import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const logoUrl = 'https://ring-jolly-65702283.figma.site/_components/v2/e0408a7a35d33af08a7755bdceb796e3d4222435/WhatsApp_Image_2026-02-22_at_6.32.28_PM.749377f2.png';

export default function Sidebar({ open, onToggle, title, subtitle, menuItems, activeItem, onMenuClick }) {
  const { user, logout } = useAuth();
  const initial = user?.nombre ? user.nombre[0].toUpperCase() : '?';

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className="sidebar"
        initial={false}
        animate={{ x: open ? 0 : -288 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* ── Logo + Título ── */}
        <div className="sidebar-header">
          <div className="sidebar-logo-wrap">
            <img src={logoUrl} alt="Logo Bajo Su Presencia" className="sidebar-logo" />
          </div>
          <div className="sidebar-brand">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          {/* Usuario */}
          <div className="sidebar-user">
            <div className="user-avatar">{initial}</div>
            <div>
              <p className="user-name">{user?.nombre || 'Usuario'}</p>
              <span className="user-role-badge">{user?.rol || ''}</span>
            </div>
          </div>
        </div>

        {/* ── Navegación ── */}
        <nav className="sidebar-nav">
          <a href="/" className="sidebar-back-link">← Volver al Inicio</a>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => onMenuClick(item.id)}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* ── Logout ── */}
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={logout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </motion.aside>

      <button
        className="sidebar-toggle"
        onClick={onToggle}
        style={{ left: open ? '300px' : '16px' }}
      >
        {open ? '✕' : '☰'}
      </button>
    </>
  );
}
