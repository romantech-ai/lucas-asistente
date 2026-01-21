import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Tarea, Recordatorio, Mensaje, Conversacion, Categoria, Ajustes } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Sync disabled.');
    return null;
  }

  if (!isValidUrl(supabaseUrl)) {
    console.warn('Invalid Supabase URL. Sync disabled.');
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Failed to create Supabase client. Sync disabled.', error);
    return null;
  }
}

export const supabase = createSupabaseClient();

export const isSupabaseConfigured = () => !!supabase;

// Types for Supabase tables (snake_case to match SQL)
export interface TareaSupabase {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha_limite: string | null;
  prioridad: 'alta' | 'media' | 'baja';
  categoria: string;
  completada: boolean;
  completada_en: string | null;
  orden: number;
  parent_id: number | null;
  imagenes: string[];
  creada_en: string;
  actualizada_en: string;
}

export interface RecordatorioSupabase {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha_hora: string;
  notificar_antes: number[];
  completado: boolean;
  notificaciones_enviadas: number[];
  exportado_a_calendar: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface ConversacionSupabase {
  id: string;
  titulo: string;
  creada_en: string;
  actualizada_en: string;
}

export interface MensajeSupabase {
  id: number;
  conversacion_id: string;
  rol: 'user' | 'assistant';
  contenido: string;
  creado_en: string;
}

export interface CategoriaSupabase {
  id: number;
  nombre: string;
  color: string;
  es_default: boolean;
  orden: number;
}

export interface AjustesSupabase {
  id: number;
  notificaciones_activas: boolean;
  tiempos_notificacion: number[];
  categoria_default: string;
}

// Converters: Local (camelCase) <-> Supabase (snake_case)

export function tareaToSupabase(tarea: Tarea): Omit<TareaSupabase, 'id'> & { id?: number } {
  return {
    id: tarea.id,
    titulo: tarea.titulo,
    descripcion: tarea.descripcion || null,
    fecha_limite: tarea.fechaLimite ? new Date(tarea.fechaLimite).toISOString() : null,
    prioridad: tarea.prioridad,
    categoria: tarea.categoria,
    completada: tarea.completada,
    completada_en: tarea.completadaEn ? new Date(tarea.completadaEn).toISOString() : null,
    orden: tarea.orden,
    parent_id: tarea.parentId || null,
    imagenes: tarea.imagenes || [],
    creada_en: new Date(tarea.creadaEn).toISOString(),
    actualizada_en: new Date(tarea.actualizadaEn).toISOString(),
  };
}

export function tareaFromSupabase(s: TareaSupabase): Tarea {
  return {
    id: s.id,
    titulo: s.titulo,
    descripcion: s.descripcion || undefined,
    fechaLimite: s.fecha_limite ? new Date(s.fecha_limite) : undefined,
    prioridad: s.prioridad,
    categoria: s.categoria,
    completada: s.completada,
    completadaEn: s.completada_en ? new Date(s.completada_en) : undefined,
    orden: s.orden,
    parentId: s.parent_id || undefined,
    imagenes: s.imagenes || [],
    creadaEn: new Date(s.creada_en),
    actualizadaEn: new Date(s.actualizada_en),
  };
}

export function recordatorioToSupabase(r: Recordatorio): Omit<RecordatorioSupabase, 'id'> & { id?: number } {
  return {
    id: r.id,
    titulo: r.titulo,
    descripcion: r.descripcion || null,
    fecha_hora: new Date(r.fechaHora).toISOString(),
    notificar_antes: r.notificarAntes,
    completado: r.completado,
    notificaciones_enviadas: r.notificacionesEnviadas,
    exportado_a_calendar: r.exportadoACalendar,
    creado_en: new Date(r.creadoEn).toISOString(),
    actualizado_en: new Date(r.actualizadoEn).toISOString(),
  };
}

export function recordatorioFromSupabase(s: RecordatorioSupabase): Recordatorio {
  return {
    id: s.id,
    titulo: s.titulo,
    descripcion: s.descripcion || undefined,
    fechaHora: new Date(s.fecha_hora),
    notificarAntes: s.notificar_antes,
    completado: s.completado,
    notificacionesEnviadas: s.notificaciones_enviadas,
    exportadoACalendar: s.exportado_a_calendar,
    creadoEn: new Date(s.creado_en),
    actualizadoEn: new Date(s.actualizado_en),
  };
}

export function conversacionToSupabase(c: Conversacion): ConversacionSupabase {
  return {
    id: c.id!,
    titulo: c.titulo,
    creada_en: new Date(c.creadaEn).toISOString(),
    actualizada_en: new Date(c.actualizadaEn).toISOString(),
  };
}

export function conversacionFromSupabase(s: ConversacionSupabase): Conversacion {
  return {
    id: s.id,
    titulo: s.titulo,
    creadaEn: new Date(s.creada_en),
    actualizadaEn: new Date(s.actualizada_en),
  };
}

export function mensajeToSupabase(m: Mensaje): Omit<MensajeSupabase, 'id'> & { id?: number } {
  return {
    id: m.id,
    conversacion_id: m.conversacionId,
    rol: m.rol,
    contenido: m.contenido,
    creado_en: new Date(m.creadoEn).toISOString(),
  };
}

export function mensajeFromSupabase(s: MensajeSupabase): Mensaje {
  return {
    id: s.id,
    conversacionId: s.conversacion_id,
    rol: s.rol,
    contenido: s.contenido,
    creadoEn: new Date(s.creado_en),
  };
}

export function categoriaToSupabase(c: Categoria): Omit<CategoriaSupabase, 'id'> & { id?: number } {
  return {
    id: c.id,
    nombre: c.nombre,
    color: c.color,
    es_default: c.esDefault,
    orden: c.orden,
  };
}

export function categoriaFromSupabase(s: CategoriaSupabase): Categoria {
  return {
    id: s.id,
    nombre: s.nombre,
    color: s.color,
    esDefault: s.es_default,
    orden: s.orden,
  };
}

export function ajustesToSupabase(a: Ajustes): Omit<AjustesSupabase, 'id'> & { id?: number } {
  return {
    id: a.id,
    notificaciones_activas: a.notificacionesActivas,
    tiempos_notificacion: a.tiemposNotificacion,
    categoria_default: a.categoriaDefault || 'Personal',
  };
}

export function ajustesFromSupabase(s: AjustesSupabase): Ajustes {
  return {
    id: s.id,
    notificacionesActivas: s.notificaciones_activas,
    tiemposNotificacion: s.tiempos_notificacion,
    categoriaDefault: s.categoria_default,
  };
}
