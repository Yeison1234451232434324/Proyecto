import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { get, post, del } from '../../../services/api';
import '../../../components/dashboard/Module.css';

export default function GestionSedes() {
  const [sedes, setSedes] = useState([]);
  const [sedeSel, setSedeSel] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', ciudad: '', direccion: '', telefono: '', pastor: '', miembros: '' });
  const [contenido, setContenido] = useState({ tipo: 'evento', titulo: '', descripcion: '', fecha: '', hora: '' });
  const [msg, setMsg] = useState(null);

  const cargar = () => get('/sedes').then(r => Array.isArray(r) && setSedes(r));
  useEffect(() => { cargar(); }, []);

  const crearSede = async (e) => {
    e.preventDefault();
    const res = await post('/sedes', form);
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }
    setMsg({ type: 'ok', text: 'Sede creada' });
    setShowForm(false);
    setForm({ nombre: '', ciudad: '', direccion: '', telefono: '', pastor: '', miembros: '' });
    cargar();
  };

  const eliminarSede = async (id) => {
    if (!confirm('¿Eliminar esta sede?')) return;
    await del(`/sedes/${id}`);
    cargar();
  };

  const publicarContenido = async () => {
    const endpoint = contenido.tipo === 'evento' ? '/eventos' : contenido.tipo === 'noticia' ? '/noticias' : '/oracion';
    const res = await post(endpoint, { ...contenido, sede_id: sedeSel.id });
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }
    setMsg({ type: 'ok', text: `${contenido.tipo} publicado para ${sedeSel.nombre}` });
    setContenido({ tipo: 'evento', titulo: '', descripcion: '', fecha: '', hora: '' });
  };

  return (
    <motion.div className="module-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="module-header">
        <h2>🏛️ Gestión de Sedes</h2>
        <p>Administra las ubicaciones de la iglesia</p>
      </div>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

      <div className="module-toolbar">
        <button className="btn-gold" onClick={() => setShowForm(!showForm)}>+ Agregar Sede</button>
      </div>

      {showForm && (
        <form onSubmit={crearSede} className="module-form card-form">
          <h3>Nueva Sede</h3>
          <div className="form-grid-2">
            <div className="form-group"><label>Nombre *</label><input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required /></div>
            <div className="form-group"><label>Ciudad *</label><input value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})} required /></div>
            <div className="form-group"><label>Dirección *</label><input value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} required /></div>
            <div className="form-group"><label>Teléfono</label><input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
            <div className="form-group"><label>Pastor/a Responsable</label><input value={form.pastor} onChange={e => setForm({...form, pastor: e.target.value})} /></div>
            <div className="form-group"><label>Número de Miembros</label><input type="number" value={form.miembros} onChange={e => setForm({...form, miembros: e.target.value})} /></div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-gold">Guardar Sede</button>
            <button type="button" className="btn-outline-dark" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="cards-grid">
        {sedes.map(s => (
          <div key={s.id} className={`event-card ${sedeSel?.id === s.id ? 'selected' : ''}`}>
            <h4>🏛️ {s.nombre}</h4>
            <p>📍 {s.direccion}, {s.ciudad}</p>
            {s.telefono && <p>📞 {s.telefono}</p>}
            {s.pastor && <p>👤 {s.pastor}</p>}
            {s.miembros && <p>👥 {s.miembros} miembros</p>}
            <div className="form-actions" style={{ marginTop: 12 }}>
              <button className="btn-gold" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={() => setSedeSel(s)}>Seleccionar</button>
              <button className="icon-btn del" onClick={() => eliminarSede(s.id)}>🗑️</button>
            </div>
          </div>
        ))}
        {sedes.length === 0 && <p className="empty-msg">No hay sedes registradas.</p>}
      </div>

      {sedeSel && (
        <div className="card-form" style={{ marginTop: 24 }}>
          <h3>Publicar contenido en: {sedeSel.nombre}</h3>
          <div className="form-group">
            <label>Tipo de contenido</label>
            <select value={contenido.tipo} onChange={e => setContenido({...contenido, tipo: e.target.value})}>
              <option value="evento">Evento</option>
              <option value="noticia">Noticia</option>
              <option value="oracion">Oración</option>
            </select>
          </div>
          <div className="form-group"><label>Título</label><input value={contenido.titulo} onChange={e => setContenido({...contenido, titulo: e.target.value})} /></div>
          <div className="form-group"><label>Descripción</label><textarea value={contenido.descripcion} onChange={e => setContenido({...contenido, descripcion: e.target.value})} rows={3} /></div>
          {contenido.tipo === 'evento' && (
            <div className="form-grid-2">
              <div className="form-group"><label>Fecha</label><input type="date" value={contenido.fecha} onChange={e => setContenido({...contenido, fecha: e.target.value})} /></div>
              <div className="form-group"><label>Hora</label><input value={contenido.hora} onChange={e => setContenido({...contenido, hora: e.target.value})} placeholder="Ej: 10:00 AM" /></div>
            </div>
          )}
          <button className="btn-gold" onClick={publicarContenido}>Publicar</button>
        </div>
      )}
    </motion.div>
  );
}
