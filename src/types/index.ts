export interface Tarea {
  id?: number;
  titulo: string;
  descripcion?: string;
  fechaLimite?: Date;
  prioridad: 'alta' | 'media' | 'baja';
  categoria: string;
  completada: boolean;
  completadaEn?: Date;
  orden: number;
  parentId?: number;
  imagenes?: string[];
  creadaEn: Date;
  actualizadaEn: Date;
}

export interface Recordatorio {
  id?: number;
  titulo: string;
  descripcion?: string;
  fechaHora: Date;
  notificarAntes: number[];
  completado: boolean;
  notificacionesEnviadas: number[];
  exportadoACalendar: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface Mensaje {
  id?: number;
  conversacionId: string;
  rol: 'user' | 'assistant';
  contenido: string;
  creadoEn: Date;
}

export interface Conversacion {
  id?: string;
  titulo: string;
  creadaEn: Date;
  actualizadaEn: Date;
}

export interface Categoria {
  id?: number;
  nombre: string;
  color: string;
  esDefault: boolean;
  orden: number;
}

export interface Ajustes {
  id?: number;
  notificacionesActivas: boolean;
  tiemposNotificacion: number[];
  categoriaDefault?: string;
}

export type FiltroTareas = 'todas' | 'hoy' | 'pendientes' | 'completadas';
export type FiltroRecordatorios = 'todos' | 'hoy' | 'proximos';
export type Prioridad = 'alta' | 'media' | 'baja';

export const CATEGORIAS_DEFAULT: Omit<Categoria, 'id'>[] = [
  { nombre: 'Personal', color: '#8B5CF6', esDefault: true, orden: 0 },
  { nombre: 'Trabajo', color: '#3B82F6', esDefault: true, orden: 1 },
  { nombre: 'Salud', color: '#10B981', esDefault: true, orden: 2 },
  { nombre: 'Compras', color: '#F59E0B', esDefault: true, orden: 3 },
  { nombre: 'Hogar', color: '#EC4899', esDefault: true, orden: 4 },
  { nombre: 'Finanzas', color: '#6366F1', esDefault: true, orden: 5 },
];

export const PRIORIDAD_CONFIG = {
  alta: { label: 'Alta', color: '#EF4444' },
  media: { label: 'Media', color: '#F59E0B' },
  baja: { label: 'Baja', color: '#10B981' },
} as const;

export const TIEMPOS_NOTIFICACION = [
  { value: 0, label: 'A la hora exacta' },
  { value: 5, label: '5 minutos antes' },
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 1440, label: '1 día antes' },
] as const;
