import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { get, put } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import '../../../components/dashboard/Module.css';
import './Voluntario.css';

const prioridadColor = { Alta: 'red', Media: 'amber', Baja: 'green' };

export default function ActividadesAsignadas() {
  const { user } = useAuth();
  const [grupos, setGrupos] = useState([]);

  const cargar = async () => {
    const data = await get(`/actividades/voluntario/${user?.id}`);
    if (!Array.isArray(data)) return;
    // Agrupar por evento
    const map = {};
    data.forEach(act => {
      const key = act.evento_id;
      if (!map[key]) map[key] = { evento: { id: act.evento_id, titulo: act.evento_titulo, fecha: act.evento_fecha, hora: act.evento_hora, ubicacion: act.evento_ubicacion }, actividades: [] };
      map[key].actividades.push(act);
    });
    setGrupos(Object.values(map));
  };

  useEffect(() => { if (user?.id) cargar(); }, [user]);

  const toggleCompleta = async (act) => {
    await put(`/actividades/${act.id}`, { ...act, completada: !act.completada });
    cargar();
  };

  const totalActs = grupos.reduce((s, g) => s + g.actividades.length, 0);
  const totalComp = grupos.reduce((s, g) => s + g.actividades.filter(a => a.completada).length, 0);
  const pct = totalActs > 0 ? Math.round((totalComp / totalActs) * 100) : 0;

  return (
    <motion.div className="module-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="module-header">
        <h2>✅ Mis Actividades Asignadas</h2>
        <p>Tareas asignadas en los eventos donde confirmaste disponibilidad</p>
      </div>

      <div className="progress-global">
        <div className="progress-info">
          <span>{totalComp} de {totalActs} completadas</span>
          <span>{pct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill full" style={{ width: `${pct}%`, background: 'linear-gradient(to right, #10B981, #059669)' }} />
        </div>
      </div>

      {grupos.map((g, gi) => {
        const comp = g.actividades.filter(a => a.completada).length;
        const tot = g.actividades.length;
        const pctG = tot > 0 ? Math.round((comp / tot) * 100) : 0;
        return (
          <div key={gi} className="grupo-evento">
            <div className="grupo-header">
              <h3>{g.evento.titulo}</h3>
              <div className="grupo-meta">
                <span>📅 {g.evento.fecha}</span>
                <span>🕐 {g.evento.hora}</span>
                <span>📍 {g.evento.ubicacion}</span>
                <span className="grupo-counter">{comp}/{tot} completadas</span>
              </div>
              <div className="progress-bar sm">
                <div className="progress-fill" style={{ width: `${pctG}%`, background: '#10B981' }} />
              </div>
            </div>

            {g.actividades.map(act => (
              <div key={act.id} className={`act-row ${act.completada ? 'done' : ''}`}>
                <button className="complete-btn" onClick={() => toggleCompleta(act)}>
                  {act.completada ? '✅' : '⭕'}
                </button>
                <div className="act-info">
                  <p className={act.completada ? 'tachado' : ''}>{act.titulo}</p>
                  <span>{act.descripcion}</span>
                  {act.completada && <span className="completada-tag">🎉 ¡Completada!</span>}
                </div>
                <span className={`prioridad-badge ${prioridadColor[act.prioridad]}`}>{act.prioridad}</span>
              </div>
            ))}
          </div>
        );
      })}
      {grupos.length === 0 && <p className="empty-msg">No tienes actividades asignadas.</p>}
    </motion.div>
  );
}
