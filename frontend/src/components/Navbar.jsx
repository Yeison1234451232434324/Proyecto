import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import './Navbar.css';

const logoUrl = 'https://ring-jolly-65702283.figma.site/_components/v2/e0408a7a35d33af08a7755bdceb796e3d4222435/WhatsApp_Image_2026-02-22_at_6.32.28_PM.749377f2.png';

export default function Navbar() {
  const { user, rol, isAuthenticated } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: 'Inicio', href: '#hero' },
    { label: 'Oración', href: '#oracion' },
    { label: 'Noticias', href: '#noticias' },
    { label: 'Eventos', href: '#eventos' },
  ];

  // Ruta del panel según el rol
  const panelUrl = rol === 'administrador' ? '/admin'
    : rol === 'colaborador' ? '/colaborador'
    : '/voluntario';

  return (
    <>
      <motion.nav
        className="navbar"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Brand */}
        <a href="#hero" className="navbar-brand">
          <img src={logoUrl} alt="Logo" className="navbar-logo" />
          <div>
            <span className="brand-name">Bajo Su Presencia</span>
            <span className="brand-sub">Donde mora su espíritu</span>
          </div>
        </a>

        {/* Desktop links */}
        <div className="navbar-links desktop-only">
          {links.map((l) => (
            <motion.a
              key={l.label}
              href={l.href}
              className="nav-link"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              {l.label}
            </motion.a>
          ))}
        </div>

        {/* Actions */}
        <div className="navbar-actions desktop-only">
          {isAuthenticated ? (
            // Usuario autenticado — muestra su nombre y botón al panel
            <>
              <div className="user-pill">
                <div className="user-pill-avatar">{user?.nombre?.[0]?.toUpperCase()}</div>
                <span>{user?.nombre}</span>
              </div>
              <motion.a
                href={panelUrl}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Mi Panel
              </motion.a>
            </>
          ) : (
            // No autenticado — muestra botón de login
            <>
              <motion.button
                className="btn-outline"
                onClick={() => setLoginOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Iniciar Sesión
              </motion.button>
              <motion.a
                href="#contacto"
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contacto
              </motion.a>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button className="hamburger mobile-only" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {links.map((l) => (
              <a key={l.label} href={l.href} className="mobile-link" onClick={() => setMenuOpen(false)}>
                {l.label}
              </a>
            ))}
            {isAuthenticated ? (
              <a href={panelUrl} className="btn-primary" style={{ textAlign: 'center' }}>
                Mi Panel — {user?.nombre}
              </a>
            ) : (
              <button className="btn-outline" onClick={() => { setLoginOpen(true); setMenuOpen(false); }}>
                Iniciar Sesión
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
