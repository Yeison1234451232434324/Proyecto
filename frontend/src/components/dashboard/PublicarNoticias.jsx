import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { get, post, put, del } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import './Module.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const EMPTY = { titulo: '', categoria: 'General', contenido: '' };
const categorias = ['Anuncio', 'Testimonio', 'Enseñanza', 'Comunidad', 'General'];

export default function PublicarNoticias({ isAdmin = false }) {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  // Imagen
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef();

  const cargar = () => {
    if (isAdmin) get('/noticias/todas').then(r => Array.isArray(r) && setNoticias(r));
  };

  useEffect(() => { cargar(); }, []);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validar tipo y tamaño (max 5MB)
    if (!file.type.startsWith('image/')) {
      setMsg({ type: 'error', text: 'Solo se permiten imágenes' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'La imagen no puede superar 5MB' });
      return;
    }
    setImagen(file);
    setImagenPreview(URL.createObjectURL(file));
  };

  const subirImagen = async () => {
    if (!imagen) return null;
    setUploadingImg(true);
    const ext = imagen.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage
      .from('noticias')
      .upload(fileName, imagen, { cacheControl: '3600', upsert: false });
    setUploadingImg(false);
    if (error) { setMsg({ type: 'error', text: 'Error al subir imagen: ' + error.message }); return null; }
    const { data: urlData } = supabase.storage.from('noticias').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    // Subir imagen si hay una seleccionada
    let imagen_url = null;
    if (imagen) {
      imagen_url = await subirImagen();
      if (!imagen_url) { setLoading(false); return; }
    }

    const payload = { ...form, usuario_id: user?.id };
    if (imagen_url) payload.imagen_url = imagen_url;

    const res = editId
      ? await put(`/noticias/${editId}`, payload)
      : await post('/noticias', payload);

    setLoading(false);
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }
    setMsg({ type: 'ok', text: editId ? '¡Noticia actualizada!' : '¡Noticia publicada!' });
    setForm(EMPTY);
    setEditId(null);
    setImagen(null);
    setImagenPreview(null);
    cargar();
  };

  const handleEdit = (n) => {
    setEditId(n.id);
    setForm({ titulo: n.titulo, categoria: n.categoria || 'General', contenido: n.contenido });
    setImagenPreview(n.imagen_url || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, titulo) => {
    if (!confirm(`¿Eliminar "${titulo}"?`)) return;
    const res = await del(`/noticias/${id}`);
    if (res.error) { setMsg({ type: 'error', text: res.error }); return; }
    setMsg({ type: 'ok', text: 'Noticia eliminada' });
    cargar();
  };

  const quitarImagen = () => {
    setImagen(null);
    setImagenPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <motion.div className="module-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="module-header">
        <h2>📰 {editId ? 'Editar Noticia' : 'Publicar Noticia'}</h2>
        <p>Crea y publica una noticia para la comunidad</p>
      </div>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

      <form onSubmit={handleSubmit} className="module-form">
        <div className="form-grid-2">
          <div className="form-group">
            <label>Título *</label>
            <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required placeholder="Título de la noticia" />
          </div>
          <div className="form-group">
            <label>Categoría</label>
            <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
              {categorias.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Contenido *</label>
          <textarea value={form.contenido} onChange={e => setForm({...form, contenido: e.target.value})} rows={6} required placeholder="Escribe el contenido de la noticia..." />
        </div>

        {/* Upload de imagen */}
        <div className="form-group">
          <label>Imagen</label>
          <div
            className={`img-upload-area ${imagenPreview ? 'has-image' : ''}`}
            onClick={() => fileRef.current?.click()}
          >
            {imagenPreview ? (
              <div className="img-preview-wrap">
                <img src={imagenPreview} alt="Preview" className="img-preview" />
                <button
                  type="button"
                  className="img-remove-btn"
                  onClick={e => { e.stopPropagation(); quitarImagen(); }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="img-upload-placeholder">
                <span className="img-upload-icon">🖼️</span>
                <p>Haz clic o arrastra una imagen aquí</p>
                <span>JPG, PNG, WEBP · Máx. 5MB</span>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImagenChange}
            style={{ display: 'none' }}
            capture="environment"
          />
          {imagen && (
            <p className="img-file-name">📎 {imagen.name} ({(imagen.size / 1024).toFixed(0)} KB)</p>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-gold" disabled={loading || uploadingImg}>
            {uploadingImg ? '⬆️ Subiendo imagen...' : loading ? 'Guardando...' : editId ? '💾 Actualizar' : '📰 Publicar Noticia'}
          </button>
          {editId && (
            <button type="button" className="btn-outline-dark" onClick={() => { setEditId(null); setForm(EMPTY); quitarImagen(); }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista admin */}
      {isAdmin && (
        <div className="crud-list-section">
          <h3>📋 Noticias Publicadas</h3>
          {noticias.length === 0 && <p className="empty-msg">No hay noticias publicadas.</p>}
          {noticias.map(n => (
            <div key={n.id} className="crud-list-row">
              {n.imagen_url && (
                <img src={n.imagen_url} alt={n.titulo} className="crud-thumb" />
              )}
              <div className="crud-list-info">
                <strong>{n.titulo}</strong>
                <span>{n.categoria} · {n.publicado_en ? new Date(n.publicado_en).toLocaleDateString('es-CO') : ''}</span>
              </div>
              <div className="crud-list-actions">
                <button className="icon-btn edit" onClick={() => handleEdit(n)}>✏️</button>
                <button className="icon-btn del" onClick={() => handleDelete(n.id, n.titulo)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
