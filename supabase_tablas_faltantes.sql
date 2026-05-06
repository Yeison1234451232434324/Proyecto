-- Ejecuta esto en el SQL Editor de Supabase

-- Tabla recursos
CREATE TABLE IF NOT EXISTS recursos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  categoria text,
  cantidad integer DEFAULT 0,
  disponible boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- Tabla actividades
CREATE TABLE IF NOT EXISTS actividades (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  descripcion text,
  prioridad text DEFAULT 'Media',
  evento_id uuid REFERENCES eventos(id) ON DELETE CASCADE,
  voluntario_id uuid REFERENCES usuarios(id),
  completada boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Tabla asignaciones (disponibilidad voluntarios en eventos)
CREATE TABLE IF NOT EXISTS asignaciones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id uuid REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  disponible boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  UNIQUE(evento_id, usuario_id)
);

-- Tabla evaluaciones (calificaciones)
CREATE TABLE IF NOT EXISTS evaluaciones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id uuid REFERENCES usuarios(id),
  evento_id uuid REFERENCES eventos(id),
  evaluador_id uuid REFERENCES usuarios(id),
  calificacion integer CHECK (calificacion BETWEEN 1 AND 5),
  comentario text,
  fecha_evaluacion timestamp DEFAULT now()
);

-- Tabla informes (reportes de eventos)
CREATE TABLE IF NOT EXISTS informes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id uuid REFERENCES eventos(id) UNIQUE,
  ofrenda_recaudada numeric DEFAULT 0,
  incidentes text DEFAULT 'Ninguno',
  observaciones text,
  created_at timestamp DEFAULT now()
);

-- Tabla sedes
CREATE TABLE IF NOT EXISTS sedes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  ciudad text,
  direccion text,
  telefono text,
  pastor text,
  miembros integer DEFAULT 0,
  created_at timestamp DEFAULT now()
);

-- Agregar columnas faltantes a eventos
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS titulo text;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS hora text;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS ubicacion text;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS descripcion text;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS sede_id uuid REFERENCES sedes(id);
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS voluntarios_necesarios integer DEFAULT 10;

-- Agregar columnas faltantes a usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS creado_en timestamp DEFAULT now();

-- RLS para nuevas tablas
ALTER TABLE recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE informes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acceso_autenticado" ON recursos FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "acceso_autenticado" ON actividades FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "acceso_autenticado" ON asignaciones FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "acceso_autenticado" ON evaluaciones FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "acceso_autenticado" ON informes FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "acceso_autenticado" ON sedes FOR ALL USING (auth.uid() IS NOT NULL);
