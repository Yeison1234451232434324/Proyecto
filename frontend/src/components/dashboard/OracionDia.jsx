import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { get, post, put, del } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Module.css';

export default function OracionDia({ isAdmin = false }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ versiculo: '', contenido: '' });
  const [editId, setEditId] = useState(null);
  const [oraciones, setOraciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const cargar = () => {
    if (isAdmin) get('/oracion/todas').then(r => Array.isArray(r) && setOraciones(r));
  };

  useEffect(() => { cargar(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = editId
      ? await put(`/oracion/${editId}`, form)
      : await post('/oracion', { ...form, usuario_id: user?.id });
    setLoading(false);
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }
    setMsg({ type: 'ok', text: editId ? '¡Oración actualizada!' : '¡Oración publicada!' });
    setForm({ versiculo: '', contenido: '' });
    setEditId(null);
    cargar();
  };

  const handleEdit = (o) => {
    setEditId(o.id);
    setForm({ versiculo: o.versiculo || '', contenido: o.contenido || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta oración?')) return;
    const res = await del(`/oracion/${id}`);
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }
    setMsg({ type: 'ok', text: 'Oración eliminada' });
    cargar();
  };

  return (
    <motion.div className="module-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="module-header">
        <h2>🕊️ {editId ? 'Editar Oración' : 'Oración del Día'}</h2>
        <p>Redacta y publica la oración diaria para la comunidad</p>
      </div>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

      <form onSubmit={handleSubmit} className="module-form">
        <div className="form-group">
          <label>Versículo Bíblico</label>
          <input
            value={form.versiculo}
            onChange={e => setForm({...form, versiculo: e.target.value})}
            placeholder="Ej: Filipenses 4:13"
          />
        </div>
        <div className="form-group">
          <label>Reflexión / Oración *</label>
          <textarea
            value={form.contenido}
            onChange={e => setForm({...form, contenido: e.target.value})}
            rows={7}
            required
            placeholder="Escribe la oración del día..."
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-gold" disabled={loading}>
            {loading ? 'Guardando...' : editId ? '💾 Actualizar Oración' : '🕊️ Publicar Oración'}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-outline-dark"
              onClick={() => { setEditId(null); setForm({ versiculo: '', contenido: '' }); }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista — solo admin/colaborador con isAdmin */}
      {isAdmin && (
        <div className="crud-list-section">
          <h3>📋 Oraciones Publicadas</h3>
          {oraciones.length === 0 && <p className="empty-msg">No hay oraciones publicadas.</p>}
          {oraciones.map(o => (
            <div key={o.id} className="crud-list-row">
              <div className="crud-list-info">
                <strong>{o.versiculo || 'Sin versículo'}</strong>
                <span>{o.contenido?.substring(0, 90)}{o.contenido?.length > 90 ? '...' : ''}</span>
                <span>{o.publicado_en ? new Date(o.publicado_en).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
              </div>
              <div className="crud-list-actions">
                <button className="icon-btn edit" onClick={() => handleEdit(o)}>✏️</button>
                <button className="icon-btn del" onClick={() => handleDelete(o.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
