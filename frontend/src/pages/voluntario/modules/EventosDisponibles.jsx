import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { get, post, del } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import '../../../components/dashboard/Module.css';
import './Voluntario.css';

export default function EventosDisponibles() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const cargar = async () => {
    const evs = await get('/eventos/con-voluntarios');
    if (Array.isArray(evs)) setEventos(evs);

    if (user?.id) {
      const disps = await get(`/asignaciones/usuario/${user.id}`);
      if (Array.isArray(disps)) {
        const map = {};
        disps.forEach(d => {
          const eventoId = d.actividad_id;
          if (eventoId) {
            // confirmado = disponible, pendiente = no disponible
            if (d.estado === 'confirmado') map[eventoId] = true;
            else if (d.estado === 'pendiente') map[eventoId] = false;
          }
        });
        setDisponibilidades(map);
      }
    }
  };

  useEffect(() => { cargar(); }, [user]);

  const marcar = async (eventoId, disponible) => {
    if (!user?.id) return;

    setLoadingId(eventoId);

    // Si ya tiene ese estado, lo elimina (toggle off)
    if (disponibilidades[eventoId] === disponible) {
      await del(`/asignaciones/${eventoId}/${user.id}`);
      setDisponibilidades(prev => {
        const n = { ...prev };
        delete n[eventoId];
        return n;
      });
      setLoadingId(null);
      // Recargar para actualizar conteo
      cargar();
      return;
    }

    // Guardar nueva disponibilidad
    const res = await post('/asignaciones', {
      evento_id: eventoId,
      usuario_id: user.id,
      disponible,
    });
    setLoadingId(null);

    if (res.error) {
      alert('Error al guardar: ' + res.error);
      return;
    }

    setDisponibilidades(prev => ({ ...prev, [eventoId]: disponible }));
    // Recargar para actualizar conteo en la barra
    cargar();
  };

  return (
    <motion.div className="module-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="module-header">
        <h2>📅 Eventos Disponibles</h2>
        <p>Consulta los eventos e indica tu disponibilidad</p>
      </div>

      <div className="eventos-vol-list">
        {eventos.map((ev, i) => {
          const registrados = ev.voluntarios_count || 0;
          const necesarios = ev.voluntarios_necesarios || 10;
          const progreso = Math.min((registrados / necesarios) * 100, 100);
          const completo = registrados >= necesarios;
          const miDisp = disponibilidades[ev.id];
          const cargando = loadingId === ev.id;

          return (
            <motion.div
              key={ev.id}
              className="evento-vol-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="ev-vol-header">
                <h4>{ev.titulo}</h4>
                <div className="ev-vol-meta">
                  <span>📅 {ev.fecha ? new Date(ev.fecha).toLocaleDateString('es-CO', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  }) : ''}</span>
                  {(ev.hora || ev.horario) && <span>🕐 {ev.hora || ev.horario}</span>}
                  {ev.ubicacion && <span>📍 {ev.ubicacion}</span>}
                </div>
                {ev.descripcion && <p className="ev-vol-desc">{ev.descripcion}</p>}
              </div>

              <div className="ev-vol-progress">
                <div className="progress-info">
                  <span>👥 {registrados} / {necesarios} voluntarios</span>
                  {!completo
                    ? <span className="alerta-vol">⚠️ Se necesitan {necesarios - registrados} más</span>
                    : <span className="completo-vol">✅ ¡Cupo completo!</span>
                  }
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${completo ? 'full' : ''}`} style={{ width: `${progreso}%` }} />
                </div>
              </div>

              <div className="ev-vol-actions">
                <button
                  className={`disp-btn disponible ${miDisp === true ? 'selected' : ''}`}
                  onClick={() => marcar(ev.id, true)}
                  disabled={cargando || (completo && miDisp !== true)}
                >
                  {cargando ? '⏳' : '✅'} Disponible
                </button>
                <button
                  className={`disp-btn no-disponible ${miDisp === false ? 'selected' : ''}`}
                  onClick={() => marcar(ev.id, false)}
                  disabled={cargando}
                >
                  {cargando ? '⏳' : '❌'} No Disponible
                </button>
              </div>

              {miDisp !== undefined && (
                <div className={`disp-confirm ${miDisp ? 'si' : 'no'}`}>
                  {miDisp
                    ? '✅ Has confirmado tu disponibilidad para este evento'
                    : '❌ Has indicado que no estarás disponible'}
                </div>
              )}
            </motion.div>
          );
        })}
        {eventos.length === 0 && <p className="empty-msg">No hay eventos disponibles.</p>}
      </div>
    </motion.div>
  );
}

