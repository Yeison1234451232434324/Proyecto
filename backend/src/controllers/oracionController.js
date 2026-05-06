const supabase = require('../config/supabase');

const getOracionDelDia = async (req, res) => {
  const hoy = new Date().toISOString().split('T')[0];

  // Busca oración publicada hoy
  let { data, error } = await supabase
    .from('oraciones')
    .select('id, contenido, versiculo, imagen_url, publicado_en')
    .gte('publicado_en', `${hoy}T00:00:00`)
    .lte('publicado_en', `${hoy}T23:59:59`)
    .limit(1)
    .single();

  // Si no hay para hoy, trae la más reciente
  if (error || !data) {
    const { data: ultima, error: err2 } = await supabase
      .from('oraciones')
      .select('id, contenido, versiculo, imagen_url, publicado_en')
      .order('publicado_en', { ascending: false })
      .limit(1)
      .single();

    if (err2) return res.status(500).json({ error: err2.message });
    return res.json(ultima);
  }

  res.json(data);
};

module.exports = { getOracionDelDia };
