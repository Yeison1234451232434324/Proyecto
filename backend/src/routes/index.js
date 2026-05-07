const router = require('express').Router();
const supabase = require('../config/supabase');
const { supabaseAdmin } = require('../config/supabase');
const db = supabaseAdmin;
const { getNoticias } = require('../controllers/noticiasController');
const { getOracionDelDia } = require('../controllers/oracionController');
const { getEventos, getTodosEventos } = require('../controllers/eventosController');
const { login } = require('../controllers/authController');

// ── Health
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Auth
router.post('/auth/login', login);

// ── Recuperar contraseña
router.post('/auth/recuperar', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, message: 'Correo de recuperación enviado' });
});

// ── Público (con límite para el Home)
router.get('/noticias', getNoticias);
router.get('/oracion', getOracionDelDia);
router.get('/eventos', getEventos);

// ── Todos los eventos para paneles (sin límite)
router.get('/eventos/todos', getTodosEventos);

// ── Eventos con conteo de voluntarios confirmados (para panel voluntario)
router.get('/eventos/con-voluntarios', async (req, res) => {
  const { data: eventos, error } = await db.from('eventos')
    .select('*').order('fecha', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });

  // Para cada evento, contar cuántos voluntarios confirmaron disponibilidad
  const eventosConConteo = await Promise.all(eventos.map(async (ev) => {
    const { count } = await db.from('disponibilidad_eventos')
      .select('id', { count: 'exact', head: true })
      .eq('evento_id', ev.id)
      .eq('disponible', true);
    return { ...ev, voluntarios_count: count || 0 };
  }));

  res.json(eventosConConteo);
});

// ── Noticias CRUD
router.get('/noticias/todas', async (req, res) => {
  const { data, error } = await db.from('noticias').select('*').order('publicado_en', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/noticias', async (req, res) => {
  const { titulo, contenido, usuario_id, imagen_url } = req.body;
  if (!usuario_id) return res.status(400).json({ error: 'usuario_id requerido' });
  const { data, error } = await db.from('noticias').insert([{
    titulo,
    contenido,
    usuario_id,
    imagen_url: imagen_url || null,
    publicado_en: new Date().toISOString(),
  }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.put('/noticias/:id', async (req, res) => {
  const { titulo, contenido, categoria, imagen_url } = req.body;
  const updates = { titulo, contenido };
  if (imagen_url) updates.imagen_url = imagen_url;
  const { data, error } = await db.from('noticias').update(updates).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.delete('/noticias/:id', async (req, res) => {
  const { error } = await db.from('noticias').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── Eventos CRUD
router.post('/eventos', async (req, res) => {
  const { titulo, fecha, horario, ubicacion, descripcion, sede_id, voluntarios_necesarios } = req.body;
  if (!sede_id) return res.status(400).json({ error: 'Debes seleccionar una sede' });
  const { data, error } = await db.from('eventos').insert([{
    titulo, fecha, descripcion,
    hora: horario,
    ubicacion,
    sede_id,
    voluntarios_necesarios: voluntarios_necesarios || 10,
  }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.put('/eventos/:id', async (req, res) => {
  const { data, error } = await db.from('eventos').update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.delete('/eventos/:id', async (req, res) => {
  const { error } = await db.from('eventos').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── Oración POST
router.get('/oracion/todas', async (req, res) => {
  const { data, error } = await db.from('oraciones').select('*').order('publicado_en', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/oracion', async (req, res) => {
  const { contenido, versiculo, usuario_id } = req.body;
  if (!usuario_id) return res.status(400).json({ error: 'usuario_id requerido' });
  const { data, error } = await db.from('oraciones').insert([{
    contenido, versiculo, usuario_id,
    publicado_en: new Date().toISOString(),
  }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.delete('/oracion/:id', async (req, res) => {
  const { error } = await db.from('oraciones').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

router.put('/oracion/:id', async (req, res) => {
  const { contenido, versiculo } = req.body;
  const updates = {};
  if (contenido !== undefined) updates.contenido = contenido;
  if (versiculo !== undefined) updates.versiculo = versiculo;
  const { data, error } = await db.from('oraciones').update(updates).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// ── Usuarios
router.get('/usuarios', async (req, res) => {
  const { data, error } = await db.from('usuarios').select('*, roles(nombre)');
  if (error) return res.status(500).json({ error: error.message });
  const mapped = data.map(u => ({
    ...u,
    id: u.id,
    rol_nombre: u.roles?.nombre,
    correo: u.correo_electronico,
  }));
  res.json(mapped);
});

router.post('/usuarios', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const { nombre, correo, password, rol_id } = req.body;
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: correo, password, email_confirm: true,
  });
  if (authErr) return res.status(500).json({ error: authErr.message });
  const contrasena_hash = await bcrypt.hash(password, 10);
  const { data, error } = await db.from('usuarios').insert([{
    nombre, correo_electronico: correo, contrasena_hash, rol_id, activo: true,
  }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.put('/usuarios/:id', async (req, res) => {
  const updates = {};
  if (req.body.nombre !== undefined) updates.nombre = req.body.nombre;
  if (req.body.correo !== undefined) updates.correo_electronico = req.body.correo;
  if (req.body.rol_id !== undefined) updates.rol_id = req.body.rol_id;
  if (req.body.activo !== undefined) updates.activo = req.body.activo;
  const { data, error } = await db.from('usuarios').update(updates).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.delete('/usuarios/:id', async (req, res) => {
  await db.from('usuarios').delete().eq('id', req.params.id);
  res.json({ ok: true });
});

// ── Roles
router.get('/roles', async (req, res) => {
  const { data, error } = await db.from('roles').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── Recursos
router.get('/recursos', async (req, res) => {
  const { data, error } = await db.from('recursos').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const mapped = (data || []).map(r => ({
    id: r.id,
    nombre: r.nombre,
    categoria: r.categoria,
    cantidad: r.cantidad || 0,
    stock_minimo: r.stock_minimo,
    sede_id: r.sede_id,
    disponible: (r.cantidad || 0) > 0,
  }));
  res.json(mapped);
});

router.post('/recursos', async (req, res) => {
  const { nombre, categoria, cantidad, sede_id } = req.body;
  if (!sede_id) return res.status(400).json({ error: 'Debes seleccionar una sede' });
  const { data, error } = await db.from('recursos').insert([{
    nombre,
    categoria,
    cantidad: cantidad || 0,
    sede_id,
  }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.put('/recursos/:id', async (req, res) => {
  const updates = {};
  if (req.body.nombre !== undefined) updates.nombre = req.body.nombre;
  if (req.body.categoria !== undefined) updates.categoria = req.body.categoria;
  if (req.body.cantidad !== undefined) updates.cantidad = req.body.cantidad;
  const { data, error } = await db.from('recursos').update(updates).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.delete('/recursos/:id', async (req, res) => {
  const { error } = await db.from('recursos').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── Evento Recursos
router.post('/evento-recursos', async (req, res) => {
  const { evento_id, recursos } = req.body;
  if (!evento_id || !recursos?.length) return res.json({ ok: true });

  // Eliminar recursos anteriores del evento
  await db.from('evento_recursos').delete().eq('evento_id', evento_id);

  // Insertar los nuevos
  const inserts = recursos.map(r => ({
    evento_id,
    recurso_id: r.recurso_id,
    cantidad: r.cantidad || 1,
  }));

  const { data, error } = await db.from('evento_recursos').insert(inserts).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/evento-recursos/:eventoId', async (req, res) => {
  const { data, error } = await db.from('evento_recursos')
    .select('*, recursos(nombre, categoria, cantidad, disponible)')
    .eq('evento_id', req.params.eventoId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// ── Actividades
router.get('/actividades/evento/:eventoId', async (req, res) => {
  const { data, error } = await db.from('actividades')
    .select('*, usuarios(id, nombre)')
    .eq('evento_id', req.params.eventoId);
  if (error) return res.status(500).json({ error: error.message });
  const mapped = (data || []).map(a => ({
    id: a.id,
    titulo: a.nombre,
    descripcion: a.descripcion,
    prioridad: a.prioridad || 'Media',
    evento_id: a.evento_id,
    voluntario_id: a.voluntario_id || null,
    completada: a.completada || false,
    voluntario_nombre: a.usuarios?.nombre || null,
  }));
  res.json(mapped);
});

router.get('/actividades/voluntario/:userId', async (req, res) => {
  const { data, error } = await db.from('actividades')
    .select('*, eventos(titulo, fecha, hora, ubicacion)')
    .eq('voluntario_id', req.params.userId);
  if (error) return res.status(500).json({ error: error.message });
  const mapped = (data || []).map(a => ({
    id: a.id,
    titulo: a.nombre,
    descripcion: a.descripcion || a['descripción'],
    prioridad: a.prioridad || 'Media',
    completada: a.completada || false,
    evento_id: a.evento_id,
    evento_titulo: a.eventos?.titulo,
    evento_fecha: a.eventos?.fecha,
    evento_hora: a.eventos?.hora,
    evento_ubicacion: a.eventos?.ubicacion,
  }));
  res.json(mapped);
});

router.post('/actividades', async (req, res) => {
  const { titulo, descripcion, prioridad, evento_id, voluntario_id } = req.body;
  const { data, error } = await db.from('actividades').insert([{
    nombre: titulo,
    descripcion,
    evento_id: evento_id,
    voluntario_id: voluntario_id || null,
    prioridad: prioridad || 'Media',
    completada: false,
  }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.put('/actividades/:id', async (req, res) => {
  const updates = {};
  if (req.body.titulo !== undefined) updates.nombre = req.body.titulo;
  if (req.body.descripcion !== undefined) updates.descripcion = req.body.descripcion;
  if (req.body.prioridad !== undefined) updates.prioridad = req.body.prioridad;
  if (req.body.completada !== undefined) updates.completada = req.body.completada;
  if (req.body.voluntario_id !== undefined) updates.voluntario_id = req.body.voluntario_id;
  const { data, error } = await db.from('actividades').update(updates).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.delete('/actividades/:id', async (req, res) => {
  const { error } = await db.from('actividades').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── Asignaciones de actividades (para calificar voluntarios en actividades)
router.get('/asignaciones/evento/:eventoId', async (req, res) => {
  // Traer voluntarios que confirmaron disponibilidad en este evento
  const { data, error } = await db.from('disponibilidad_eventos')
    .select('*, usuarios(id, nombre)')
    .eq('evento_id', req.params.eventoId)
    .eq('disponible', true);
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(d => ({
    usuario_id: d.usuario_id,
    nombre: d.usuarios?.nombre,
    calificado: false,
  })));
});

// ── Disponibilidad voluntarios en eventos (tabla disponibilidad_eventos)
router.get('/asignaciones/usuario/:userId', async (req, res) => {
  const { data, error } = await db.from('disponibilidad_eventos')
    .select('*').eq('usuario_id', req.params.userId);
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(d => ({
    actividad_id: d.evento_id,
    usuario_id: d.usuario_id,
    estado: d.disponible ? 'confirmado' : 'pendiente',
  })));
});

router.post('/asignaciones', async (req, res) => {
  const { evento_id, usuario_id, disponible } = req.body;
  if (!evento_id || !usuario_id) return res.status(400).json({ error: 'evento_id y usuario_id requeridos' });

  const { data, error } = await db.from('disponibilidad_eventos')
    .upsert([{ evento_id, usuario_id, disponible }], { onConflict: 'evento_id,usuario_id' })
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data?.[0] || { ok: true });
});

router.delete('/asignaciones/:eventoId/:userId', async (req, res) => {
  const { error } = await db.from('disponibilidad_eventos')
    .delete().eq('evento_id', req.params.eventoId).eq('usuario_id', req.params.userId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── Evaluaciones
router.get('/evaluaciones/usuario/:userId', async (req, res) => {
  const { data, error } = await db.from('evaluaciones')
    .select('*')
    .eq('usuario_id', req.params.userId);
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(e => ({
    ...e,
    // Calcular promedio de los campos numéricos
    calificacion: Math.round(((e.puntualidad || 0) + (e.actitud || 0) + (e.desempeno || 0) + (e.compromiso || 0)) / 4),
    evaluador_nombre: e.evaluador_nombre,
    fecha_evaluacion: e.fecha,
    comentario: e.comentarios,
  })));
});

router.get('/evaluaciones/destacados', async (req, res) => {
  const { data, error } = await db.from('evaluaciones')
    .select('*, usuarios(nombre)')
    .order('puntualidad', { ascending: false })
    .limit(4);
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(e => ({
    nombre: e.usuarios?.nombre,
    calificacion: (((e.puntualidad || 0) + (e.actitud || 0) + (e.desempeno || 0) + (e.compromiso || 0)) / 4).toFixed(1),
  })));
});

router.post('/evaluaciones', async (req, res) => {
  const { usuario_id, evento_id, calificacion, comentario, evaluador_nombre } = req.body;
  // Distribuir la calificación en los 4 campos
  const { data, error } = await db.from('evaluaciones').insert([{
    usuario_id,
    evaluador_nombre: evaluador_nombre || 'Admin',
    puntualidad: calificacion,
    actitud: calificacion,
    desempeno: calificacion,
    compromiso: calificacion,
    comentarios: comentario,
    fecha: new Date().toISOString().split('T')[0],
  }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// ── Informes
router.get('/informes/evento/:eventoId', async (req, res) => {
  const { data, error } = await db.from('informes')
    .select('*').eq('evento_id', req.params.eventoId).single();
  if (error) return res.json(null);
  res.json(data);
});

router.post('/informes', async (req, res) => {
  const { data, error } = await db.from('informes')
    .upsert([req.body], { onConflict: 'evento_id' }).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// ── Reportes PDF
router.get('/reportes/:tipo', async (req, res) => {
  const { tipo } = req.params;
  const { desde, hasta } = req.query;
  let query;
  if (tipo === 'eventos') {
    query = db.from('informes').select('*, eventos(titulo, fecha)');
  } else if (tipo === 'voluntarios') {
    query = db.from('evaluaciones').select('*, usuarios(nombre), eventos(titulo)');
  } else if (tipo === 'asistencia') {
    query = db.from('asignaciones').select('*, usuarios(nombre)');
  } else {
    query = db.from('informes').select('evento_id, ofrenda_recaudada, eventos(titulo, fecha)');
  }
  if (desde) query = query.gte('created_at', desde);
  if (hasta) query = query.lte('created_at', hasta);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// ── Sedes
router.get('/sedes', async (req, res) => {
  const { data, error } = await db.from('sedes').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/sedes', async (req, res) => {
  const { data, error } = await db.from('sedes').insert([req.body]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.delete('/sedes/:id', async (req, res) => {
  const { error } = await db.from('sedes').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── Dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  const [usuarios, eventos, noticias, voluntarios, sedes, recursos, actividades, oraciones] = await Promise.all([
    db.from('usuarios').select('id', { count: 'exact', head: true }),
    db.from('eventos').select('id', { count: 'exact', head: true }),
    db.from('noticias').select('id', { count: 'exact', head: true }),
    db.from('usuarios').select('id', { count: 'exact', head: true }).eq('activo', true),
    db.from('sedes').select('id', { count: 'exact', head: true }),
    db.from('recursos').select('id', { count: 'exact', head: true }),
    db.from('actividades').select('id', { count: 'exact', head: true }),
    db.from('oraciones').select('id', { count: 'exact', head: true }),
  ]);
  res.json({
    usuarios: usuarios.count || 0,
    eventos: eventos.count || 0,
    noticias: noticias.count || 0,
    voluntarios: voluntarios.count || 0,
    sedes: sedes.count || 0,
    recursos: recursos.count || 0,
    actividades: actividades.count || 0,
    oraciones: oraciones.count || 0,
  });
});

module.exports = router;

