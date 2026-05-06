import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { get, del } from '../../services/api';
import './Module.css';

export default function GestionEventos() {
  const [eventos, setEventos] = useState([]);
  const [msg, setMsg] = useState(null);

  const cargar = () => get('/eventos/todos').then(r => Array.isArray(r) && setEventos(r));
  useEffect(() => { cargar(); }, []);

  const eliminar = async (id, titulo) => {
    if (!confirm(`¿Eliminar el evento "${titulo}"? Esta acción no se puede deshacer.`)) return;
    const res = await del(`/eventos/${id}`);
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }
    setMsg({ type: 'ok', text: 'Evento eliminado correctamente' });
    cargar();
  };

  return (
    <motion.div className="module-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="module-header">
        <h2>🗂️ Gestión de Eventos</h2>
        <p>Administra todos los eventos creados</p>
      </div>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

      <div className="eventos-gestion-list">
        {eventos.map(ev => (
          <div key={ev.id} className="evento-gestion-row">
            <div className="evento-gestion-info">
              <strong>{ev.titulo}</strong>
              <div className="evento-gestion-meta">
                <span>📅 {ev.fecha}</span>
                <span>🕐 {ev.hora}</span>
                {ev.ubicacion && <span>📍 {ev.ubicacion}</span>}
                <span>👥 {ev.voluntarios_necesarios} voluntarios</span>
              </div>
              {ev.descripcion && <p>{ev.descripcion}</p>}
            </div>
            <button
              className="icon-btn del"
              onClick={() => eliminar(ev.id, ev.titulo)}
              title="Eliminar evento"
            >
              🗑️
            </button>
          </div>
        ))}
        {eventos.length === 0 && <p className="empty-msg">No hay eventos creados.</p>}
      </div>
    </motion.div>
  );
}
