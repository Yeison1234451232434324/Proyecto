import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const logoUrl = 'https://ring-jolly-65702283.figma.site/_components/v2/e0408a7a35d33af08a7755bdceb796e3d4222435/WhatsApp_Image_2026-02-22_at_6.32.28_PM.749377f2.png';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase maneja el token del link automáticamente via onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setMsg({ type: 'error', text: 'La contraseña debe tener mínimo 6 caracteres' });
      return;
    }
    if (password !== confirm) {
      setMsg({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setMsg({ type: 'error', text: error.message });
      return;
    }
    setMsg({ type: 'ok', text: '¡Contraseña actualizada exitosamente!' });
    setTimeout(() => { window.location.href = '/'; }, 2500);
  };

  return (
    <div className="reset-page">
      {/* Fondo */}
      <div className="reset-bg" />
      <div className="reset-overlay" />

      <motion.div
        className="reset-card"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="reset-logo-wrap">
          <img src={logoUrl} alt="Logo" className="reset-logo" />
        </div>

        <h1 className="reset-title">Nueva Contraseña</h1>
        <p className="reset-sub">Ingresa tu nueva contraseña para acceder a tu cuenta</p>

        {msg && (
          <motion.div
            className={`reset-alert ${msg.type}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {msg.type === 'ok' ? '✅' : '⚠️'} {msg.text}
          </motion.div>
        )}

        {msg?.type !== 'ok' && (
          <form onSubmit={handleSubmit} className="reset-form">
            <div className="reset-field">
              <label>Nueva contraseña</label>
              <div className="reset-input-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="reset-eye">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="reset-field">
              <label>Confirmar contraseña</label>
              <div className="reset-input-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repite la contraseña"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="reset-btn"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Actualizando...' : 'ACTUALIZAR CONTRASEÑA'}
            </motion.button>

            <a href="/" className="reset-back">← Volver al inicio</a>
          </form>
        )}

        {msg?.type === 'ok' && (
          <p className="reset-redirect">Redirigiendo al inicio en unos segundos...</p>
        )}
      </motion.div>

      <style>{`
        .reset-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 24px;
          font-family: 'Crimson Text', 'Georgia', serif;
        }

        .reset-bg {
          position: fixed;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1769590280436-41d1e2252e50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920') center/cover no-repeat;
          filter: brightness(0.3) saturate(0.5);
        }

        .reset-overlay {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, rgba(11,26,46,0.85), rgba(7,16,32,0.9));
        }

        .reset-card {
          position: relative;
          z-index: 1;
          background: #fff;
          border-radius: 24px;
          padding: 40px 44px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.15);
          text-align: center;
        }

        .reset-logo-wrap {
          margin-bottom: 20px;
        }

        .reset-logo {
          height: 80px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 2px 8px rgba(201,168,76,0.3));
        }

        .reset-title {
          font-family: 'Cormorant Garamond', 'Georgia', serif;
          font-size: 1.9rem;
          font-weight: 700;
          color: #0B1A2E;
          margin: 0 0 8px;
        }

        .reset-sub {
          color: #4A6080;
          font-size: 0.95rem;
          font-style: italic;
          margin: 0 0 24px;
          line-height: 1.5;
        }

        .reset-alert {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.9rem;
          margin-bottom: 20px;
          text-align: left;
        }

        .reset-alert.ok { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
        .reset-alert.error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

        .reset-form { display: flex; flex-direction: column; gap: 16px; text-align: left; }

        .reset-field { display: flex; flex-direction: column; gap: 6px; }

        .reset-field label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #0B1A2E;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
        }

        .reset-input-wrap { position: relative; }

        .reset-input-wrap input {
          width: 100%;
          padding: 13px 44px 13px 16px;
          background: #EEF3F8;
          border: 2px solid #c8d8e8;
          border-radius: 12px;
          font-size: 1rem;
          color: #0B1A2E;
          outline: none;
          transition: all 0.2s;
          font-family: 'Crimson Text', serif;
          box-sizing: border-box;
        }

        .reset-input-wrap input:focus {
          border-color: #C9A84C;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(201,168,76,0.12);
        }

        .reset-eye {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; font-size: 1rem;
          opacity: 0.5; transition: opacity 0.2s;
        }

        .reset-eye:hover { opacity: 1; }

        .reset-btn {
          padding: 14px;
          background: linear-gradient(135deg, #C9A84C 0%, #1E4D8C 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          letter-spacing: 2px;
          box-shadow: 0 6px 20px rgba(201,168,76,0.3);
          transition: all 0.25s;
          margin-top: 4px;
        }

        .reset-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(201,168,76,0.4); }
        .reset-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .reset-back {
          text-align: center;
          color: #4A6080;
          font-size: 0.88rem;
          font-style: italic;
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
          display: block;
        }

        .reset-back:hover { color: #1E4D8C; }

        .reset-redirect {
          color: #4A6080;
          font-size: 0.9rem;
          font-style: italic;
          margin-top: 16px;
        }
      `}</style>
    </div>
  );
}
