import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { get, post, put, del } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Module.css';

const EMPTY = {
  titulo: '', fecha: '', hora: '', asistentes: '',
  descripcion: '', sede_id: '', voluntarios_necesarios: 10
};

export default function PublicarEventos({ isAdmin = false }) {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [sedes, setSedes] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [editId, setEditId] = useState(null);

  const cargarEventos = () => {
    if (isAdmin) get('/eventos/todos').then(r => Array.isArray(r) && setEventos(r));
  };

  useEffect(() => {
    get('/sedes').then(r => Array.isArray(r) && setSedes(r));
    get('/recursos').then(r => Array.isArray(r) && setRecursos(r));
    cargarEventos();
  }, []);

  const sedeSeleccionada = sedes.find(s => s.id === form.sede_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sede_id) { setMsg({ type: 'error', text: 'Debes seleccionar una sede' }); return; }
    setLoading(true);

    const payload = {
      ...form,
      horario: form.hora,
      ubicacion: sedeSeleccionada
        ? `${sedeSeleccionada.nombre} — ${sedeSeleccionada.direccion || ''}`
        : '',
    };

    const res = editId ? await put(`/eventos/${editId}`, payload) : await post('/eventos', payload);
    setLoading(false);
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }

    // Guardar recursos seleccionados
    const eventoId = res.id || editId;
    const recursosSelec = Object.entries(seleccionados)
      .filter(([, v]) => v.checked)
      .map(([id, v]) => ({ recurso_id: id, cantidad: v.cantidad }));

    if (recursosSelec.length > 0 && eventoId) {
      await post('/evento-recursos', { evento_id: eventoId, recursos: recursosSelec });
    }

    setMsg({ type: 'ok', text: editId ? '¡Evento actualizado!' : '¡Evento publicado!' });
    setForm(EMPTY); setEditId(null); setSeleccionados({});
    cargarEventos();
  };

  const handleEdit = (ev) => {
    setEditId(ev.id);
    setForm({
      titulo: ev.titulo || '',
      fecha: ev.fecha || '',
      hora: ev.hora || '',
      asistentes: ev.asistentes || '',
      descripcion: ev.descripcion || '',
      sede_id: ev.sede_id || '',
      voluntarios_necesarios: ev.voluntarios_necesarios || 10,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, titulo) => {
    if (!confirm(`¿Eliminar "${titulo}"?`)) return;
    const res = await del(`/eventos/${id}`);
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }
    setMsg({ type: 'ok', text: 'Evento eliminado' });
    cargarEventos();
  };

  const toggleRecurso = (id) => {
    setSeleccionados(prev => ({
      ...prev,
      [id]: { checked: !prev[id]?.checked, cantidad: prev[id]?.cantidad || 1 }
    }));
  };

  return (
    <motion.div className="module-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="module-header">
        <h2>📅 {editId ? 'Editar Evento' : 'Publicar Evento'}</h2>
        <p>Crea y publica un nuevo evento para la comunidad</p>
      </div>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

      <form onSubmit={handleSubmit} className="module-form">
        <div className="form-grid-2">
          <div className="form-group">
            <label>Título *</label>
            <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required placeholder="Ej: Servicio Dominical" />
          </div>

          <div className="form-group">
            <label>Fecha *</label>
            <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} required />
          </div>

          {/* Selector de hora con reloj */}
          <div className="form-group">
            <label>Hora</label>
            <input
              type="time"
              value={form.hora}
              onChange={e => setForm({...form, hora: e.target.value})}
              className="hora-input-full"
            />
            {form.hora && (
              <span className="hora-preview">
                🕐 {(() => {
                  const [h, m] = form.hora.split(':');
                  const hr = parseInt(h);
                  const ampm = hr < 12 ? 'AM' : 'PM';
                  const h12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
                  return `${h12}:${m} ${ampm}`;
                })()}
              </span>
            )}
          </div>

          <div className="form-group">
            <label>Voluntarios Necesarios</label>
            <input type="number" min={1} value={form.voluntarios_necesarios}
              onChange={e => setForm({...form, voluntarios_necesarios: +e.target.value})} />
          </div>

          <div className="form-group">
            <label>Asistentes Esperados</label>
            <input value={form.asistentes} onChange={e => setForm({...form, asistentes: e.target.value})} placeholder="Ej: 200+" />
          </div>

          <div className="form-group">
            <label>Sede *</label>
            {sedes.length === 0
              ? <p className="warn-msg">⚠️ No hay sedes. Crea una primero.</p>
              : <select value={form.sede_id} onChange={e => setForm({...form, sede_id: e.target.value})} required>
                  <option value="">— Selecciona una sede —</option>
                  {sedes.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}{s.direccion ? ` — ${s.direccion}` : ''}
                    </option>
                  ))}
                </select>
            }
          </div>
        </div>

        {/* Info sede */}
        {sedeSeleccionada && (
          <div className="sede-info-card">
            <span className="sede-info-icon">🏛️</span>
            <div>
              <strong>{sedeSeleccionada.nombre}</strong>
              {sedeSeleccionada.direccion && <p>📍 {sedeSeleccionada.direccion}</p>}
              {sedeSeleccionada.pastor_encargado && <p>👤 {sedeSeleccionada.pastor_encargado}</p>}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Descripción</label>
          <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} rows={3} placeholder="Descripción del evento..." />
        </div>

        {/* Recursos */}
        {recursos.length > 0 && (
          <div className="recursos-section">
            <h3>📦 Recursos Necesarios</h3>
            <div className="recursos-grid">
              {recursos.map(r => (
                <div key={r.id} className={`recurso-item ${!r.disponible ? 'disabled' : ''}`}>
                  <label className="recurso-check">
                    <input
                      type="checkbox"
                      disabled={!r.disponible}
                      checked={!!seleccionados[r.id]?.checked}
                      onChange={() => toggleRecurso(r.id)}
                    />
                    <span>{r.nombre}</span>
                    <span className="recurso-cat">{r.categoria}</span>
                    <span className={`recurso-estado ${r.disponible ? 'ok' : 'no'}`}>
                      {r.disponible ? `✅ Disponible (${r.cantidad})` : '❌ No disponible'}
                    </span>
                  </label>
                  {seleccionados[r.id]?.checked && (
                    <div className="recurso-cantidad-wrap">
                      <label>Cantidad a usar:</label>
                      <input
                        type="number" min={1} max={r.cantidad}
                        value={seleccionados[r.id]?.cantidad || 1}
                        onChange={e => setSeleccionados(prev => ({
                          ...prev,
                          [r.id]: { ...prev[r.id], cantidad: +e.target.value }
                        }))}
                        className="recurso-cantidad"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-gold" disabled={loading || sedes.length === 0}>
            {loading ? 'Guardando...' : editId ? '💾 Actualizar Evento' : '📅 Publicar Evento'}
          </button>
          {editId && (
            <button type="button" className="btn-outline-dark" onClick={() => { setEditId(null); setForm(EMPTY); }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista admin */}
      {isAdmin && (
        <div className="crud-list-section">
          <h3>📋 Eventos Creados</h3>
          {eventos.length === 0 && <p className="empty-msg">No hay eventos creados.</p>}
          {eventos.map(ev => (
            <div key={ev.id} className="crud-list-row">
              <div className="crud-list-info">
                <strong>{ev.titulo}</strong>
                <span>📅 {ev.fecha} · 🕐 {ev.hora} · 👥 {ev.voluntarios_necesarios} voluntarios</span>
                {ev.ubicacion && <span>📍 {ev.ubicacion}</span>}
              </div>
              <div className="crud-list-actions">
                <button className="icon-btn edit" onClick={() => handleEdit(ev)}>✏️</button>
                <button className="icon-btn del" onClick={() => handleDelete(ev.id, ev.titulo)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
