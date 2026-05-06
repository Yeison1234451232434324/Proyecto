const supabase = require('../config/supabase');

const SUPABASE_URL = process.env.SUPABASE_URL;
const STORAGE_BUCKET = 'noticias'; // nombre del bucket en Supabase Storage

const buildImageUrl = (imagen_url) => {
  if (!imagen_url) return null;
  // Si ya es una URL completa, la devuelve tal cual
  if (imagen_url.startsWith('http')) return imagen_url;
  // Si es solo un nombre de archivo, construye la URL del Storage
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${imagen_url}`;
};

const getNoticias = async (req, res) => {
  const { data, error } = await supabase
    .from('noticias')
    .select('id, titulo, contenido, imagen_url, publicado_en, Descripcion')
    .order('publicado_en', { ascending: false })
    .limit(2);

  if (error) return res.status(500).json({ error: error.message });

  const noticias = data.map((n) => ({
    ...n,
    imagen_url: buildImageUrl(n.imagen_url),
  }));

  res.json(noticias);
};

module.exports = { getNoticias };
