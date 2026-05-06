import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { get, put, del } from '../../../services/api';
import '../../../components/dashboard/Module.css';
import './GestionUsuarios.css';

const rolColor = { administrador: 'purple', colaborador: 'blue', voluntario: 'green' };

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [msg, setMsg] = useState(null);

  const cargar = () => {
    get('/usuarios').then(r => Array.isArray(r) && setUsuarios(r));
    get('/roles').then(r => Array.isArray(r) && setRoles(r));
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = usuarios.filter(u => {
    const matchBusq = u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || u.correo?.toLowerCase().includes(busqueda.toLowerCase());
    const matchRol = filtroRol === 'todos' || u.rol_nombre === filtroRol;
    return matchBusq && matchRol;
  });

  const toggleActivo = async (u) => {
    await put(`/usuarios/${u.id}`, { activo: !u.activo });
    cargar();
  };

  const handleEdit = (u) => {
    setEditId(u.id);
    setEditForm({ nombre: u.nombre, correo: u.correo, rol_id: u.rol_id });
  };

  const saveEdit = async (id) => {
    const res = await put(`/usuarios/${id}`, editForm);
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }
    setMsg({ type: 'ok', text: 'Usuario actualizado' });
    setEditId(null);
    cargar();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    await del(`/usuarios/${id}`);
    cargar();
  };

  const activos = filtrados.filter(u => u.activo).length;
  const inactivos = filtrados.filter(u => !u.activo).length;

  return (
    <motion.div className="module-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="module-header">
        <h2>👥 Gestión de Usuarios</h2>
        <p>Administra todos los usuarios del sistema</p>
      </div>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

      <div className="module-toolbar">
        <input className="search-input" placeholder="🔍 Buscar por nombre o correo..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        <select className="search-input" style={{ flex: 'none', width: 180 }} value={filtroRol} onChange={e => setFiltroRol(e.target.value)}>
          <option value="todos">Todos los roles</option>
          <option value="administrador">Administradores</option>
          <option value="colaborador">Colaboradores</option>
          <option value="voluntario">Voluntarios</option>
        </select>
      </div>

      <div className="user-counters">
        <span>Total: <strong>{filtrados.length}</strong></span>
        <span className="ok">Activos: <strong>{activos}</strong></span>
        <span className="no">Inactivos: <strong>{inactivos}</strong></span>
      </div>

      <div className="users-list">
        {filtrados.map(u => (
          <div key={u.id} className={`user-card ${!u.activo ? 'inactive' : ''}`}>
            {editId === u.id ? (
              <div className="user-edit-form">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Correo</label>
                    <input value={editForm.correo} onChange={e => setEditForm({...editForm, correo: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Rol</label>
                    <select value={editForm.rol_id} onChange={e => setEditForm({...editForm, rol_id: e.target.value})}>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn-gold" onClick={() => saveEdit(u.id)}>Guardar</button>
                  <button className="btn-outline-dark" onClick={() => setEditId(null)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div className={`user-avatar-lg ${u.activo ? 'active' : 'gray'}`}>{u.nombre?.[0]}</div>
                <div className="user-details">
                  <div className="user-name-row">
                    <strong>{u.nombre}</strong>
                    <span className={`rol-badge ${rolColor[u.rol_nombre] || 'gray'}`}>{u.rol_nombre}</span>
                    {!u.activo && <span className="inactivo-badge">Inactivo</span>}
                  </div>
                  <p>{u.correo}</p>
                  <p className="fecha-creacion">Creado: {u.creado_en ? new Date(u.creado_en).toLocaleDateString('es-CO') : '—'}</p>
                </div>
                <div className="user-actions">
                  <button className={`toggle-btn ${u.activo ? 'deactivate' : 'activate'}`} onClick={() => toggleActivo(u)} title={u.activo ? 'Desactivar' : 'Activar'}>
                    {u.activo ? '🔴' : '🟢'}
                  </button>
                  <button className="icon-btn edit" onClick={() => handleEdit(u)}>✏️</button>
                  <button className="icon-btn del" onClick={() => handleDelete(u.id)}>🗑️</button>
                </div>
              </>
            )}
          </div>
        ))}
        {filtrados.length === 0 && <p className="empty-msg">No se encontraron usuarios.</p>}
      </div>
    </motion.div>
  );
}
