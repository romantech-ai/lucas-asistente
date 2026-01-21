-- =====================================================
-- Lucas Asistente - Schema de Supabase
-- =====================================================
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
-- Dashboard → SQL Editor → New Query → Pega y ejecuta

-- Tareas
CREATE TABLE IF NOT EXISTS tareas (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_limite TIMESTAMPTZ,
  prioridad TEXT NOT NULL CHECK (prioridad IN ('alta', 'media', 'baja')),
  categoria TEXT NOT NULL,
  completada BOOLEAN DEFAULT FALSE,
  completada_en TIMESTAMPTZ,
  orden INTEGER NOT NULL,
  parent_id INTEGER REFERENCES tareas(id) ON DELETE CASCADE,
  imagenes JSONB DEFAULT '[]',
  creada_en TIMESTAMPTZ DEFAULT NOW(),
  actualizada_en TIMESTAMPTZ DEFAULT NOW()
);

-- Recordatorios
CREATE TABLE IF NOT EXISTS recordatorios (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_hora TIMESTAMPTZ NOT NULL,
  notificar_antes JSONB DEFAULT '[0, 15]',
  completado BOOLEAN DEFAULT FALSE,
  notificaciones_enviadas JSONB DEFAULT '[]',
  exportado_a_calendar BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Conversaciones
CREATE TABLE IF NOT EXISTS conversaciones (
  id UUID PRIMARY KEY,
  titulo TEXT NOT NULL,
  creada_en TIMESTAMPTZ DEFAULT NOW(),
  actualizada_en TIMESTAMPTZ DEFAULT NOW()
);

-- Mensajes
CREATE TABLE IF NOT EXISTS mensajes (
  id SERIAL PRIMARY KEY,
  conversacion_id UUID REFERENCES conversaciones(id) ON DELETE CASCADE,
  rol TEXT NOT NULL CHECK (rol IN ('user', 'assistant')),
  contenido TEXT NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Categorías
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  es_default BOOLEAN DEFAULT FALSE,
  orden INTEGER NOT NULL
);

-- Ajustes
CREATE TABLE IF NOT EXISTS ajustes (
  id SERIAL PRIMARY KEY,
  notificaciones_activas BOOLEAN DEFAULT FALSE,
  tiempos_notificacion JSONB DEFAULT '[0, 15]',
  categoria_default TEXT DEFAULT 'Personal'
);

-- =====================================================
-- Row Level Security (RLS) - Acceso público (usuario único)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajustes ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (solo tú tienes las credenciales)
CREATE POLICY "Allow all for tareas" ON tareas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for recordatorios" ON recordatorios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for conversaciones" ON conversaciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for mensajes" ON mensajes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for categorias" ON categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for ajustes" ON ajustes FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- Habilitar Realtime para sincronización en tiempo real
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE tareas;
ALTER PUBLICATION supabase_realtime ADD TABLE recordatorios;
ALTER PUBLICATION supabase_realtime ADD TABLE conversaciones;
ALTER PUBLICATION supabase_realtime ADD TABLE mensajes;
ALTER PUBLICATION supabase_realtime ADD TABLE categorias;
ALTER PUBLICATION supabase_realtime ADD TABLE ajustes;

-- =====================================================
-- Índices para mejorar el rendimiento
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tareas_categoria ON tareas(categoria);
CREATE INDEX IF NOT EXISTS idx_tareas_completada ON tareas(completada);
CREATE INDEX IF NOT EXISTS idx_tareas_parent_id ON tareas(parent_id);
CREATE INDEX IF NOT EXISTS idx_tareas_fecha_limite ON tareas(fecha_limite);
CREATE INDEX IF NOT EXISTS idx_recordatorios_fecha_hora ON recordatorios(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_recordatorios_completado ON recordatorios(completado);
CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion_id ON mensajes(conversacion_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_actualizada_en ON conversaciones(actualizada_en);
