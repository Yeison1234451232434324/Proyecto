const supabase = require('../config/supabase');

// Ejemplo: obtener todos los registros de una tabla
const getAll = async (req, res) => {
  const { data, error } = await supabase
    .from('nombre_de_tu_tabla') // <-- cambia esto por tu tabla
    .select('*');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// Ejemplo: insertar un registro
const create = async (req, res) => {
  const { data, error } = await supabase
    .from('nombre_de_tu_tabla') // <-- cambia esto por tu tabla
    .insert([req.body])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

module.exports = { getAll, create };
