import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { get, post, del } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Module.css';

export default function OracionDia({ isAdmin = false }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ versiculo: '', contenido: '' });
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
    const res = await post('/oracion', { ...form, usuario_id: user?.id });
    setLoading(false);
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }
    setMsg({ type: 'ok', text: '¡Oración publicada!' });
    setForm({ versiculo: '', contenido: '' });
    cargar();
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
        <h2>🕊️ Oración del Día</h2>
        <p>Redacta y publica la oración diaria para la comunidad</p>
      </div>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

      <form onSubmit={handleSubmit} className="module-form">
        <div className="form-group">
          <label>Versículo Bíblico</label>
          <input value={form.versiculo} onChange={e => setForm({...form, versiculo: e.target.value})} placeholder="Ej: Filipenses 4:13" />
        </div>
        <div className="form-group">
          <label>Reflexión / Oración *</label>
          <textarea value={form.contenido} onChange={e => setForm({...form, contenido: e.target.value})} rows={7} required placeholder="Escribe la oración del día..." />
        </div>
        <button type="submit" className="btn-gold" disabled={loading}>
          {loading ? 'Publicando...' : '🕊️ Publicar Oración'}
        </button>
      </form>

      {isAdmin && (
        <div className="crud-list-section">
          <h3>📋 Oraciones Publicadas</h3>
          {oraciones.length === 0 && <p className="empty-msg">No hay oraciones publicadas.</p>}
          {oraciones.map(o => (
            <div key={o.id} className="crud-list-row">
              <div className="crud-list-info">
                <strong>{o.versiculo || 'Sin versículo'}</strong>
                <span>{o.contenido?.substring(0, 80)}...</span>
                <span>{o.publicado_en ? new Date(o.publicado_en).toLocaleDateString('es-CO') : ''}</span>
              </div>
              <div className="crud-list-actions">
                <button className="icon-btn del" onClick={() => handleDelete(o.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
