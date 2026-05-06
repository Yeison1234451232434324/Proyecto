import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { get, post } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Module.css';

const labels = ['', 'Muy Bajo', 'Bajo', 'Regular', 'Bueno', 'Excelente'];

export default function CalificarVoluntarios() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [eventoSel, setEventoSel] = useState(null);
  const [voluntarios, setVoluntarios] = useState([]);
  const [volSel, setVolSel] = useState(null);
  const [estrellas, setEstrellas] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { get('/eventos/todos').then(r => Array.isArray(r) && setEventos(r)); }, []);

  const seleccionarEvento = async (ev) => {
    setEventoSel(ev);
    const vols = await get(`/asignaciones/evento/${ev.id}`);
    setVoluntarios(Array.isArray(vols) ? vols : []);
    setVolSel(null); setEstrellas(0); setComentario('');
  };

  const guardar = async () => {
    if (!volSel || estrellas === 0) return;
    setLoading(true);
    const res = await post('/evaluaciones', {
      usuario_id: volSel.usuario_id,
      evento_id: eventoSel.id,
      calificacion: estrellas,
      comentario,
      evaluador_nombre: user?.nombre || 'Admin',
    });
    setLoading(false);
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }
    setMsg({ type: 'ok', text: '¡Calificación guardada!' });
    setVoluntarios(prev => prev.map(v => v.usuario_id === volSel.usuario_id ? { ...v, calificado: true } : v));
    setVolSel(null); setEstrellas(0); setComentario('');
  };

  return (
    <motion.div className="module-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="module-header">
        <h2>⭐ Calificar Voluntarios</h2>
        <p>Evalúa el desempeño de voluntarios por evento</p>
      </div>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

      <AnimatePresence mode="wait">
        {!eventoSel ? (
          <motion.div key="eventos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="cards-grid">
              {eventos.map(ev => (
                <div key={ev.id} className="event-card" onClick={() => seleccionarEvento(ev)}>
                  <h4>{ev.titulo}</h4>
                  <p>📅 {ev.fecha ? new Date(ev.fecha).toLocaleDateString('es-CO') : ''}</p>
                  <p>📍 {ev.ubicacion || ev.lugar}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="calificar" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="event-banner">
              <button className="btn-back" onClick={() => setEventoSel(null)}>← Volver a Eventos</button>
              <h3>{eventoSel.titulo}</h3>
              <span>📅 {eventoSel.fecha} · 📍 {eventoSel.ubicacion || eventoSel.lugar}</span>
            </div>

            <div className="calificar-layout">
              {/* Lista voluntarios */}
              <div className="vol-list">
                <h4>Voluntarios</h4>
                {voluntarios.map(v => (
                  <button
                    key={v.usuario_id}
                    className={`vol-item ${volSel?.usuario_id === v.usuario_id ? 'active' : ''}`}
                    onClick={() => setVolSel(v)}
                  >
                    <div className="vol-avatar">{v.nombre?.[0]}</div>
                    <div>
                      <p>{v.nombre}</p>
                      <span className={v.calificado ? 'badge-ok' : 'badge-pend'}>
                        {v.calificado ? '✅ Calificado' : '⏳ Pendiente'}
                      </span>
                    </div>
                  </button>
                ))}
                {voluntarios.length === 0 && <p className="empty-msg">Sin voluntarios asignados</p>}
              </div>

              {/* Formulario */}
              {volSel && (
                <div className="calificar-form">
                  <h4>Calificar a {volSel.nombre}</h4>
                  <p className="cal-info">Evento: {eventoSel.titulo} · {eventoSel.fecha}</p>
                  <div className="stars-row">
                    {[1,2,3,4,5].map(s => (
                      <button
                        key={s}
                        className={`star ${s <= (hover || estrellas) ? 'filled' : ''}`}
                        onMouseEnter={() => setHover(s)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setEstrellas(s)}
                      >★</button>
                    ))}
                  </div>
                  {(hover || estrellas) > 0 && (
                    <p className="star-label">{labels[hover || estrellas]}</p>
                  )}
                  <div className="form-group">
                    <label>Comentarios y Observaciones</label>
                    <textarea value={comentario} onChange={e => setComentario(e.target.value)} rows={4} placeholder="Escribe tus observaciones..." />
                  </div>
                  <div className="form-actions">
                    <button className="btn-gold" onClick={guardar} disabled={loading || estrellas === 0}>
                      {loading ? 'Guardando...' : 'Guardar Calificación'}
                    </button>
                    <button className="btn-outline-dark" onClick={() => setVolSel(null)}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

