import Dexie, { type EntityTable } from 'dexie';
import type {
  Tarea,
  Recordatorio,
  Mensaje,
  Conversacion,
  Categoria,
  Ajustes
} from '@/types';
import { CATEGORIAS_DEFAULT } from '@/types';

const db = new Dexie('LucasAsistente') as Dexie & {
  tareas: EntityTable<Tarea, 'id'>;
  recordatorios: EntityTable<Recordatorio, 'id'>;
  mensajes: EntityTable<Mensaje, 'id'>;
  conversaciones: EntityTable<Conversacion, 'id'>;
  categorias: EntityTable<Categoria, 'id'>;
  ajustes: EntityTable<Ajustes, 'id'>;
};

db.version(1).stores({
  tareas: '++id, titulo, fechaLimite, prioridad, categoria, completada, parentId, orden, creadaEn',
  recordatorios: '++id, titulo, fechaHora, completado, creadoEn',
  mensajes: '++id, conversacionId, rol, creadoEn',
  conversaciones: '++id, titulo, creadaEn, actualizadaEn',
  categorias: '++id, nombre, esDefault, orden',
  ajustes: '++id',
});

export async function initializeDb() {
  const categoriasCount = await db.categorias.count();
  if (categoriasCount === 0) {
    await db.categorias.bulkAdd(CATEGORIAS_DEFAULT as Categoria[]);
  }

  const ajustesCount = await db.ajustes.count();
  if (ajustesCount === 0) {
    await db.ajustes.add({
      notificacionesActivas: false,
      tiemposNotificacion: [0, 15],
      categoriaDefault: 'Personal',
    });
  }
}

export { db };
