import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { post } from '../services/api';
import './LoginModal.css';

function Particle({ delay }) {
  return (
    <motion.div
      className="particle"
      initial={{ y: 0, opacity: 0.6 }}
      animate={{ y: -60, opacity: 0 }}
      transition={{ duration: 3 + Math.random() * 2, delay, repeat: Infinity, ease: 'easeOut' }}
      style={{ left: `${Math.random() * 100}%`, bottom: 0 }}
    />
  );
}

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();

  // Vista: 'login' | 'recuperar' | 'enviado'
  const [vista, setVista] = useState('login');

  // Login
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Recuperar
  const [emailRecuperar, setEmailRecuperar] = useState('');
  const [loadingRec, setLoadingRec] = useState(false);
  const [errorRec, setErrorRec] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      handleClose();
      const rol = data.rol;
      if (rol === 'administrador') window.location.href = '/admin';
      else if (rol === 'colaborador') window.location.href = '/colaborador';
      else window.location.href = '/voluntario';
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperar = async (e) => {
    e.preventDefault();
    setErrorRec('');
    setLoadingRec(true);
    try {
      const res = await post('/auth/recuperar', { email: emailRecuperar });
      if (res.error) throw new Error(res.error);
      setVista('enviado');
    } catch (err) {
      setErrorRec(err.message || 'No se pudo enviar el correo');
    } finally {
      setLoadingRec(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setVista('login');
      setNombre(''); setEmail(''); setPassword(''); setError('');
      setEmailRecuperar(''); setErrorRec('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            {[...Array(14)].map((_, i) => <Particle key={i} delay={i * 0.3} />)}
          </motion.div>

          <div className="modal-wrapper">
            <motion.div
              className="modal-box"
              initial={{ scale: 0.88, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 40 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.7 }}
            >
              {/* ── Imagen ilustrativa ── */}
              <div className="modal-hero">
                <div className="modal-sky">
                  {[...Array(18)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="star-dot"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 70}%`,
                        width: `${Math.random() * 3 + 1}px`,
                        height: `${Math.random() * 3 + 1}px`,
                      }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                    />
                  ))}
                </div>
                <motion.div
                  className="modal-sun"
                  animate={{ scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="modal-hills">
                  <div className="hill hill-back" />
                  <div className="hill hill-mid" />
                  <div className="hill hill-front" />
                </div>
                <div className="modal-cross">
                  <div className="cross-v" />
                  <div className="cross-h" />
                </div>
                <div className="modal-hero-text">
                  <h2>
                    {vista === 'login' && 'Bienvenido de vuelta'}
                    {vista === 'recuperar' && 'Recuperar Contraseña'}
                    {vista === 'enviado' && '¡Correo Enviado!'}
                  </h2>
                  <p>Bajo Su Presencia · Iglesia</p>
                </div>
                <button className="modal-close" onClick={handleClose}>✕</button>
              </div>

              {/* ── Contenido según vista ── */}
              <div className="modal-body">
                <AnimatePresence mode="wait">

                  {/* LOGIN */}
                  {vista === 'login' && (
                    <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
                      <div className="modal-login-title">Iniciar Sesión</div>
                      <form onSubmit={handleLogin} className="login-form">
                        <div className="login-field">
                          <span className="lf-icon">👤</span>
                          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" required />
                        </div>
                        <div className="login-field">
                          <span className="lf-icon">✉️</span>
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo electrónico" required />
                        </div>
                        <div className="login-field">
                          <span className="lf-icon">🔒</span>
                          <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" required />
                          <button type="button" className="show-pass-btn" onClick={() => setShowPass(!showPass)}>
                            {showPass ? '🙈' : '👁️'}
                          </button>
                        </div>

                        {error && (
                          <motion.p className="form-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                            {error}
                          </motion.p>
                        )}

                        <motion.button type="submit" className="btn-submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          {loading ? 'Ingresando...' : 'INGRESAR'}
                        </motion.button>

                        <button type="button" className="link-recuperar" onClick={() => setVista('recuperar')}>
                          ¿Olvidaste tu contraseña?
                        </button>

                        <p className="login-note">Tu acceso se asigna según tu rol en la comunidad</p>
                      </form>
                    </motion.div>
                  )}

                  {/* RECUPERAR */}
                  {vista === 'recuperar' && (
                    <motion.div key="recuperar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                      <div className="modal-login-title">Recuperar Contraseña</div>
                      <p className="rec-desc">
                        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                      </p>
                      <form onSubmit={handleRecuperar} className="login-form">
                        <div className="login-field">
                          <span className="lf-icon">✉️</span>
                          <input type="email" value={emailRecuperar} onChange={e => setEmailRecuperar(e.target.value)} placeholder="Tu correo electrónico" required />
                        </div>

                        {errorRec && (
                          <motion.p className="form-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {errorRec}
                          </motion.p>
                        )}

                        <motion.button type="submit" className="btn-submit" disabled={loadingRec} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          {loadingRec ? 'Enviando...' : 'ENVIAR ENLACE'}
                        </motion.button>

                        <button type="button" className="link-recuperar" onClick={() => setVista('login')}>
                          ← Volver al inicio de sesión
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* ENVIADO */}
                  {vista === 'enviado' && (
                    <motion.div key="enviado" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="enviado-wrap">
                      <div className="enviado-icon">📧</div>
                      <h3>¡Correo enviado!</h3>
                      <p>
                        Hemos enviado un enlace de recuperación a <strong>{emailRecuperar}</strong>.
                        Revisa tu bandeja de entrada y sigue las instrucciones.
                      </p>
                      <button className="btn-submit" onClick={() => setVista('login')}>
                        VOLVER AL LOGIN
                      </button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
