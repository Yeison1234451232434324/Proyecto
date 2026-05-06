import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { get } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import '../../../components/dashboard/Module.css';
import './Voluntario.css';

function Estrellas({ valor, max = 5 }) {
  return (
    <div className="estrellas">
      {[...Array(max)].map((_, i) => (
        <span key={i} className={i < Math.round(valor) ? 'star-filled' : 'star-empty'}>★</span>
      ))}
    </div>
  );
}

function nivelVoluntario(prom) {
  if (prom >= 4.5) return 'Destacado';
  if (prom >= 3.5) return 'Bueno';
  if (prom >= 2.5) return 'Regular';
  return 'En desarrollo';
}

export default function MisCalificaciones() {
  const { user } = useAuth();
  const [cals, setCals] = useState([]);

  useEffect(() => {
    if (user?.id) get(`/evaluaciones/usuario/${user.id}`).then(r => Array.isArray(r) && setCals(r));
  }, [user]);

  const promedio = cals.length > 0
    ? (cals.reduce((s, c) => s + (c.calificacion || 0), 0) / cals.length).toFixed(1)
    : 0;
  const nivel = nivelVoluntario(+promedio);

  return (
    <motion.div className="module-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="module-header">
        <h2>⭐ Mis Calificaciones</h2>
        <p>Historial de evaluaciones recibidas</p>
      </div>

      {/* Resumen */}
      <div className="cal-resumen">
        <div className="cal-stat-card">
          <span className="cal-stat-val">{promedio}</span>
          <Estrellas valor={+promedio} />
          <span className="cal-stat-label">Calificación Promedio</span>
        </div>
        <div className="cal-stat-card">
          <span className="cal-stat-val">{cals.length}</span>
          <span className="cal-stat-sub">Este mes</span>
          <span className="cal-stat-label">Eventos Participados</span>
        </div>
        <div className="cal-stat-card">
          <span className="cal-stat-val nivel">{nivel}</span>
          <span className="cal-stat-sub">En progreso</span>
          <span className="cal-stat-label">Nivel de Voluntario</span>
        </div>
      </div>

      {/* Historial */}
      <div className="cal-list">
        {cals.map((c, i) => (
          <motion.div
            key={i}
            className="cal-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="cal-card-header">
              <div>
                <h4>{c.evento_titulo}</h4>
                <p>📅 {c.evento_fecha ? new Date(c.evento_fecha).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
              </div>
              <div className="cal-score">
                <Estrellas valor={c.calificacion} />
                <span>{c.calificacion}.0 de 5.0</span>
              </div>
            </div>
            {c.comentario && (
              <div className="cal-comentario">
                <p>"{c.comentario}"</p>
              </div>
            )}
            <div className="cal-evaluador">
              <div className="eval-avatar">{c.evaluador_nombre?.[0]}</div>
              <div>
                <p>{c.evaluador_nombre}</p>
                <span>{c.fecha_evaluacion ? new Date(c.fecha_evaluacion).toLocaleDateString('es-CO') : ''}</span>
              </div>
            </div>
          </motion.div>
        ))}
        {cals.length === 0 && <p className="empty-msg">Aún no tienes calificaciones registradas.</p>}
      </div>
    </motion.div>
  );
}
