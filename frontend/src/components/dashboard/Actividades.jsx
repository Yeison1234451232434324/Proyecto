import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { get, post, put, del } from '../../services/api';
import './Module.css';

const prioridadColor = { Alta: 'red', Media: 'amber', Baja: 'green' };

export default function Actividades() {
  const [eventos, setEventos] = useState([]);
  const [eventoSel, setEventoSel] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [voluntarios, setVoluntarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ titulo: '', voluntario_id: '', descripcion: '', prioridad: 'Media' });
  const [msg, setMsg] = useState(null);

  useEffect(() => { get('/eventos/todos').then(r => Array.isArray(r) && setEventos(r)); }, []);

  const selEvento = async (ev) => {
    setEventoSel(ev);
    const [acts, vols] = await Promise.all([
      get(`/actividades/evento/${ev.id}`),
      get(`/asignaciones/evento/${ev.id}`),
    ]);
    setActividades(Array.isArray(acts) ? acts : []);
    setVoluntarios(Array.isArray(vols) ? vols : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, evento_id: eventoSel.id };
    const res = editId ? await put(`/actividades/${editId}`, payload) : await post('/actividades', payload);
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }
    setMsg({ type: 'ok', text: editId ? 'Actividad actualizada' : 'Actividad creada' });
    setShowForm(false); setEditId(null);
    setForm({ titulo: '', voluntario_id: '', descripcion: '', prioridad: 'Media' });
    selEvento(eventoSel);
  };

  const toggleCompleta = async (act) => {
    await put(`/actividades/${act.id}`, { ...act, completada: !act.completada });
    selEvento(eventoSel);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar actividad?')) return;
    await del(`/actividades/${id}`);
    selEvento(eventoSel);
  };

  const completadas = actividades.filter(a => a.completada).length;

  return (
    <motion.div className="module-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="module-header">
        <h2>✅ Actividades</h2>
        <p>Gestiona actividades vinculadas a eventos</p>
      </div>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

      <AnimatePresence mode="wait">
        {!eventoSel ? (
          <motion.div key="eventos" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="cards-grid">
              {eventos.map(ev => (
                <div key={ev.id} className="event-card" onClick={() => selEvento(ev)}>
                  <h4>{ev.titulo}</h4>
                  <p>📅 {ev.fecha}</p>
                  <p>🕐 {ev.horario || ev.hora}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="acts" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="event-banner">
              <button className="btn-back" onClick={() => setEventoSel(null)}>← Volver a Eventos</button>
              <h3>{eventoSel.titulo}</h3>
              <span>📅 {eventoSel.fecha} · 🕐 {eventoSel.horario} · 📍 {eventoSel.ubicacion}</span>
            </div>

            <div className="acts-toolbar">
              <span className="acts-counter">{completadas} de {actividades.length} completadas</span>
              <button className="btn-gold" onClick={() => { setShowForm(true); setEditId(null); setForm({ titulo: '', voluntario_id: '', descripcion: '', prioridad: 'Media' }); }}>
                + Nueva Actividad
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="module-form card-form">
                <h3>{editId ? 'Editar Actividad' : 'Nueva Actividad'}</h3>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Título *</label>
                    <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Voluntario Asignado</label>
                    {voluntarios.length === 0
                      ? <p className="warn-msg">⚠️ No hay voluntarios disponibles</p>
                      : <select value={form.voluntario_id} onChange={e => setForm({...form, voluntario_id: e.target.value})}>
                          <option value="">Sin asignar</option>
                          {voluntarios.map(v => <option key={v.usuario_id} value={v.usuario_id}>{v.nombre}</option>)}
                        </select>
                    }
                  </div>
                  <div className="form-group">
                    <label>Prioridad</label>
                    <select value={form.prioridad} onChange={e => setForm({...form, prioridad: e.target.value})}>
                      {['Baja','Media','Alta'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} rows={3} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-gold">Guardar</button>
                  <button type="button" className="btn-outline-dark" onClick={() => setShowForm(false)}>Cancelar</button>
                </div>
              </form>
            )}

            <div className="acts-list">
              {actividades.map(act => (
                <div key={act.id} className={`act-row ${act.completada ? 'done' : ''}`}>
                  <button className="complete-btn" onClick={() => toggleCompleta(act)}>
                    {act.completada ? '✅' : '⭕'}
                  </button>
                  <div className="act-info">
                    <p className={act.completada ? 'tachado' : ''}>{act.titulo}</p>
                    <span>{act.descripcion}</span>
                    <span className="vol-name">👤 {act.voluntario_nombre || 'Sin asignar'}</span>
                  </div>
                  <span className={`prioridad-badge ${prioridadColor[act.prioridad]}`}>{act.prioridad}</span>
                  <button className="icon-btn edit" onClick={() => { setEditId(act.id); setForm({ titulo: act.titulo, voluntario_id: act.voluntario_id || '', descripcion: act.descripcion, prioridad: act.prioridad }); setShowForm(true); }}>✏️</button>
                  <button className="icon-btn del" onClick={() => handleDelete(act.id)}>🗑️</button>
                </div>
              ))}
              {actividades.length === 0 && <p className="empty-msg">No hay actividades para este evento.</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

