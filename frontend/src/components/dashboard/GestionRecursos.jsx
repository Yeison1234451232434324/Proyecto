import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { get, post, put, del } from '../../services/api';
import './Module.css';

const categorias = ['audio', 'instrumentos', 'mobiliario', 'oficina', 'audiovisual'];

export default function GestionRecursos() {
  const [recursos, setRecursos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nombre: '', categoria: 'audio', cantidad: 1, sede_id: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const cargar = () => get('/recursos').then(r => Array.isArray(r) && setRecursos(r));
  useEffect(() => {
    cargar();
    get('/sedes').then(r => Array.isArray(r) && setSedes(r));
  }, []);

  const filtrados = recursos.filter(r =>
    r.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.categoria?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = editId
      ? await put(`/recursos/${editId}`, form)
      : await post('/recursos', form);
    setLoading(false);
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }
    setMsg({ type: 'ok', text: editId ? 'Recurso actualizado' : 'Recurso agregado' });
    setShowForm(false); setEditId(null);
    setForm({ nombre: '', categoria: 'Mobiliario', cantidad: 1 });
    cargar();
  };

  const handleEdit = (r) => {
    setEditId(r.id);
    setForm({ nombre: r.nombre, categoria: r.categoria, cantidad: r.cantidad, sede_id: r.sede_id || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este recurso?')) return;
    await del(`/recursos/${id}`);
    cargar();
  };

  const ajustarCantidad = async (r, delta) => {
    const nueva = Math.max(0, (r.cantidad || 0) + delta);
    await put(`/recursos/${r.id}`, { cantidad: nueva });
    cargar();
  };

  return (
    <motion.div className="module-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="module-header">
        <h2>📦 Gestión de Recursos</h2>
        <p>Administra el inventario de recursos de la iglesia</p>
      </div>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

      <div className="module-toolbar">
        <input
          className="search-input"
          placeholder="🔍 Buscar por nombre o categoría..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <button className="btn-gold" onClick={() => {
          setShowForm(!showForm);
          setEditId(null);
          setForm({ nombre: '', categoria: 'audio', cantidad: 1, sede_id: '' });
        }}>
          + Agregar Recurso
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="module-form card-form">
          <h3>{editId ? 'Editar Recurso' : 'Nuevo Recurso'}</h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                value={form.nombre}
                onChange={e => setForm({...form, nombre: e.target.value})}
                required
                placeholder="Ej: Sillas plásticas"
              />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                {categorias.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad disponible</label>
              <input
                type="number"
                min={0}
                value={form.cantidad}
                onChange={e => setForm({...form, cantidad: +e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Sede *</label>
              {sedes.length === 0
                ? <p className="warn-msg">⚠️ No hay sedes registradas</p>
                : <select value={form.sede_id} onChange={e => setForm({...form, sede_id: e.target.value})} required>
                    <option value="">— Selecciona una sede —</option>
                    {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
              }
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-gold" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" className="btn-outline-dark" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="recursos-list">
        {filtrados.map(r => (
          <div key={r.id} className="recurso-row">
            <div className="recurso-icon">📦</div>
            <div className="recurso-info">
              <strong>{r.nombre}</strong>
              <span>{r.categoria}</span>
            </div>

            {/* Control de cantidad */}
            <div className="cantidad-control">
              <button className="cant-btn" onClick={() => ajustarCantidad(r, -1)}>−</button>
              <span className={`cant-val ${r.cantidad === 0 ? 'agotado' : ''}`}>
                {r.cantidad}
              </span>
              <button className="cant-btn" onClick={() => ajustarCantidad(r, +1)}>+</button>
            </div>

            <span className={`estado-badge ${r.disponible ? 'ok' : 'no'}`}>
              {r.disponible ? '✅ Disponible' : '❌ Agotado'}
            </span>

            <button className="icon-btn edit" onClick={() => handleEdit(r)}>✏️</button>
            <button className="icon-btn del" onClick={() => handleDelete(r.id)}>🗑️</button>
          </div>
        ))}
        {filtrados.length === 0 && <p className="empty-msg">No hay recursos registrados.</p>}
      </div>
    </motion.div>
  );
}
