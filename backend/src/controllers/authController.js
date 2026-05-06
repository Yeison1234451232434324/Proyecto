const supabase = require('../config/supabase');
const { supabaseAdmin } = require('../config/supabase');

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

  // 1. Autenticar con Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Credenciales incorrectas' });

  const userId = data.user.id;

  // 2. Buscar usuario por correo_electronico (ya que la PK tiene tilde y da problemas)
  const { data: usuario, error: userError } = await supabaseAdmin
    .from('usuarios')
    .select('*')
    .eq('correo_electronico', email)
    .single();

  if (userError || !usuario) {
    return res.status(404).json({
      error: 'Usuario no encontrado. Asegúrate de que el correo esté registrado en la tabla usuarios.'
    });
  }

  // 3. Obtener el rol
  const { data: rol } = await supabaseAdmin
    .from('roles')
    .select('nombre')
    .eq('id', usuario.rol_id)
    .single();

  const rolNombre = rol?.nombre || 'voluntario';

  res.json({
    user: {
      id: usuario.id,           // ID real de la tabla usuarios (para FKs)
      auth_id: userId,          // UUID de Supabase Auth
      nombre: usuario.nombre,
      correo: usuario.correo_electronico,
      rol: rolNombre,
      rol_id: usuario.rol_id,
      activo: usuario.activo,
    },
    rol: rolNombre,
    session: data.session,
  });
};

module.exports = { login };
