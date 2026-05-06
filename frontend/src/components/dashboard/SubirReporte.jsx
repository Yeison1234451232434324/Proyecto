import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { get, post } from '../../services/api';
import './Module.css';

export default function SubirReporte() {
  const [eventos, setEventos] = useState([]);
  const [eventoSel, setEventoSel] = useState(null);
  const [reporteExistente, setReporteExistente] = useState(null);
  const [form, setForm] = useState({ ofrenda: '', incidentes: '', observaciones: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { get('/eventos/todos').then(r => Array.isArray(r) && setEventos(r)); }, []);

  const selEvento = async (ev) => {
    setEventoSel(ev);
    const rep = await get(`/informes/evento/${ev.id}`);
    setReporteExistente(rep?.id ? rep : null);
    setForm({ ofrenda: '', incidentes: '', observaciones: '' });
    setMsg(null);
  };

  const formatCOP = (val) => {
    const num = val.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await post('/informes', {
      evento_id: eventoSel.id,
      ofrenda_recaudada: +form.ofrenda.replace(/\./g, ''),
      incidentes: form.incidentes || 'Ninguno',
      observaciones: form.observaciones,
    });
    setLoading(false);
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }
    setMsg({ type: 'ok', text: '¡Reporte cargado exitosamente!' });
    selEvento(eventoSel);
  };

  return (
    <motion.div className="module-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="module-header">
        <h2>📋 Subir Reporte</h2>
        <p>Registra el cierre de un evento finalizado</p>
      </div>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

      <AnimatePresence mode="wait">
        {!eventoSel ? (
          <motion.div key="eventos" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="cards-grid">
              {eventos.map(ev => {
                const tieneReporte = ev.tiene_reporte;
                return (
                  <div key={ev.id} className={`event-card ${tieneReporte ? 'has-report' : ''}`} onClick={() => selEvento(ev)}>
                    {tieneReporte && <span className="report-badge">✅ Reporte cargado</span>}
                    {!tieneReporte && <span className="pending-badge">⏳ Pendiente de reporte</span>}
                    <h4>{ev.titulo}</h4>
                    <p>📅 {ev.fecha}</p>
                    <p>📍 {ev.ubicacion}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="event-banner">
              <button className="btn-back" onClick={() => setEventoSel(null)}>← Volver a Eventos</button>
              <h3>{eventoSel.titulo}</h3>
              <span>📅 {eventoSel.fecha} · 📍 {eventoSel.ubicacion}</span>
            </div>

            <form onSubmit={handleSubmit} className="module-form">
              <div className="form-group">
                <label>Ofrenda Recaudada (COP)</label>
                <input
                  value={form.ofrenda}
                  onChange={e => setForm({...form, ofrenda: formatCOP(e.target.value)})}
                  placeholder="Ej: 1.500.000"
                />
              </div>
              <div className="form-group">
                <label>Incidentes</label>
                <textarea value={form.incidentes} onChange={e => setForm({...form, incidentes: e.target.value})} rows={3} placeholder="Deja vacío si no hubo incidentes" />
              </div>
              <div className="form-group">
                <label>Observaciones *</label>
                <textarea value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} rows={5} required placeholder="Nivel de asistencia, participación, aspectos a mejorar, logros..." />
              </div>
              <button type="submit" className="btn-gold" disabled={loading}>
                {loading ? 'Cargando...' : '📋 Cargar Reporte'}
              </button>
            </form>

            {reporteExistente && (
              <div className="reporte-existente">
                <h4>📄 Reporte Existente</h4>
                <p><strong>Ofrenda:</strong> ${reporteExistente.ofrenda_recaudada?.toLocaleString('es-CO')} COP</p>
                <p><strong>Incidentes:</strong> {reporteExistente.incidentes}</p>
                <p><strong>Observaciones:</strong> {reporteExistente.observaciones}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

