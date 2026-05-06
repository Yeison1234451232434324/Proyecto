const supabase = require('../config/supabase');
const { supabaseAdmin } = require('../config/supabase');

// Para la página pública — solo 2 próximos eventos
const getEventos = async (req, res) => {
  const hoy = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('eventos')
    .select('id, titulo, descripcion, fecha, hora, ubicacion, voluntarios_necesarios')
    .gte('fecha', hoy)
    .order('fecha', { ascending: true })
    .limit(2);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// Para los paneles — todos los eventos sin límite
const getTodosEventos = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('eventos')
    .select('id, titulo, descripcion, fecha, hora, ubicacion, voluntarios_necesarios, sede_id')
    .order('fecha', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

module.exports = { getEventos, getTodosEventos };
