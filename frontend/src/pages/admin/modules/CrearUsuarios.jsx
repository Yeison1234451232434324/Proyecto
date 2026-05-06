import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { get, post } from '../../../services/api';
import '../../../components/dashboard/Module.css';

export default function CrearUsuarios() {
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', rol_id: '' });
  const [roles, setRoles] = useState([]);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { get('/roles').then(r => Array.isArray(r) && setRoles(r)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setMsg({ type: 'error', text: 'La contraseña debe tener mínimo 6 caracteres' }); return; }
    setLoading(true);
    const res = await post('/usuarios', form);
    setLoading(false);
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }
    setMsg({ type: 'ok', text: '¡Usuario creado exitosamente!' });
    setForm({ nombre: '', correo: '', password: '', rol_id: '' });
  };

  return (
    <motion.div className="module-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="module-header">
        <h2>👤 Crear Usuario</h2>
        <p>Registra una nueva cuenta en el sistema</p>
      </div>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}
      <form onSubmit={handleSubmit} className="module-form" style={{ maxWidth: 520 }}>
        <div className="form-group">
          <label>Nombre Completo *</label>
          <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required placeholder="Nombre completo" />
        </div>
        <div className="form-group">
          <label>Correo Electrónico *</label>
          <input type="email" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} required placeholder="correo@ejemplo.com" />
        </div>
        <div className="form-group">
          <label>Contraseña *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required
              placeholder="Mínimo 6 caracteres"
              style={{ paddingRight: 44 }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>Rol Asignado *</label>
          <select value={form.rol_id} onChange={e => setForm({...form, rol_id: e.target.value})} required>
            <option value="">Selecciona un rol</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-gold" disabled={loading}>
          {loading ? 'Creando...' : '👤 Crear Usuario'}
        </button>
      </form>
    </motion.div>
  );
}
