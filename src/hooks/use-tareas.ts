'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useSync } from '@/hooks/use-sync';
import type { Tarea, FiltroTareas, Prioridad } from '@/types';
import {
  startOfDay,
  endOfDay,
  isBefore,
} from 'date-fns';

export function useTareas(filtro: FiltroTareas = 'todas', categoria?: string) {
  const tareas = useLiveQuery(async () => {
    let query = db.tareas.orderBy('orden');
    const allTareas = await query.toArray();

    let filtered = allTareas;

    // Filter by parent (only main tasks, not subtasks)
    filtered = filtered.filter(t => !t.parentId);

    // Apply category filter
    if (categoria) {
      filtered = filtered.filter(t => t.categoria === categoria);
    }

    // Apply status filter
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    switch (filtro) {
      case 'hoy':
        filtered = filtered.filter(t => {
          if (!t.fechaLimite) return false;
          const fecha = new Date(t.fechaLimite);
          return fecha >= todayStart && fecha <= todayEnd;
        });
        break;
      case 'pendientes':
        filtered = filtered.filter(t => !t.completada);
        break;
      case 'completadas':
        filtered = filtered.filter(t => t.completada);
        break;
    }

    // Sort: incomplete first by priority, then completed at bottom
    const prioridadOrden: Record<Prioridad, number> = { alta: 0, media: 1, baja: 2 };

    filtered.sort((a, b) => {
      // Completed tasks go to bottom
      if (a.completada !== b.completada) {
        return a.completada ? 1 : -1;
      }
      // Sort by priority
      return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
    });

    return filtered;
  }, [filtro, categoria]);

  return tareas || [];
}

export function useSubtareas(parentId: number) {
  const subtareas = useLiveQuery(async () => {
    return db.tareas.where('parentId').equals(parentId).toArray();
  }, [parentId]);

  return subtareas || [];
}

export function useTarea(id: number) {
  return useLiveQuery(() => db.tareas.get(id), [id]);
}

export function useTareasActions() {
  const { pushTarea, deleteTareaRemote } = useSync();

  const crearTarea = async (
    tarea: Omit<Tarea, 'id' | 'creadaEn' | 'actualizadaEn' | 'orden' | 'completada'>
  ): Promise<number> => {
    const count = await db.tareas.count();
    const now = new Date();

    const id = await db.tareas.add({
      ...tarea,
      completada: false,
      orden: count,
      creadaEn: now,
      actualizadaEn: now,
    } as Tarea);

    // Sync to Supabase
    pushTarea(id as number);

    return id as number;
  };

  const actualizarTarea = async (id: number, cambios: Partial<Tarea>): Promise<void> => {
    await db.tareas.update(id, {
      ...cambios,
      actualizadaEn: new Date(),
    });

    // Sync to Supabase
    pushTarea(id);
  };

  const completarTarea = async (id: number): Promise<void> => {
    const tarea = await db.tareas.get(id);
    if (!tarea) return;

    await db.tareas.update(id, {
      completada: !tarea.completada,
      completadaEn: !tarea.completada ? new Date() : undefined,
      actualizadaEn: new Date(),
    });

    // Sync to Supabase
    pushTarea(id);
  };

  const eliminarTarea = async (id: number): Promise<void> => {
    // Get subtasks to delete from remote too
    const subtareas = await db.tareas.where('parentId').equals(id).toArray();

    // Delete locally
    await db.tareas.where('parentId').equals(id).delete();
    await db.tareas.delete(id);

    // Delete from Supabase
    for (const subtarea of subtareas) {
      if (subtarea.id) {
        deleteTareaRemote(subtarea.id);
      }
    }
    deleteTareaRemote(id);
  };

  return { crearTarea, actualizarTarea, completarTarea, eliminarTarea };
}

// Standalone functions for backward compatibility (without sync)
export async function crearTarea(
  tarea: Omit<Tarea, 'id' | 'creadaEn' | 'actualizadaEn' | 'orden' | 'completada'>
): Promise<number> {
  const count = await db.tareas.count();
  const now = new Date();

  const id = await db.tareas.add({
    ...tarea,
    completada: false,
    orden: count,
    creadaEn: now,
    actualizadaEn: now,
  } as Tarea);

  return id as number;
}

export async function actualizarTarea(id: number, cambios: Partial<Tarea>): Promise<void> {
  await db.tareas.update(id, {
    ...cambios,
    actualizadaEn: new Date(),
  });
}

export async function completarTarea(id: number): Promise<void> {
  const tarea = await db.tareas.get(id);
  if (!tarea) return;

  await db.tareas.update(id, {
    completada: !tarea.completada,
    completadaEn: !tarea.completada ? new Date() : undefined,
    actualizadaEn: new Date(),
  });
}

export async function eliminarTarea(id: number): Promise<void> {
  // Also delete subtasks
  await db.tareas.where('parentId').equals(id).delete();
  await db.tareas.delete(id);
}

export async function buscarTareas(query: string): Promise<Tarea[]> {
  const allTareas = await db.tareas.toArray();
  const lowerQuery = query.toLowerCase();

  return allTareas.filter(
    t =>
      t.titulo.toLowerCase().includes(lowerQuery) ||
      t.descripcion?.toLowerCase().includes(lowerQuery)
  );
}

export function useTareasHoy() {
  return useTareas('hoy');
}

export function useTareasPendientes() {
  return useTareas('pendientes');
}

export function useTareasStats() {
  const tareas = useLiveQuery(async () => {
    const allTareas = await db.tareas.toArray();
    const mainTasks = allTareas.filter(t => !t.parentId);

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const hoy = mainTasks.filter(t => {
      if (!t.fechaLimite) return false;
      const fecha = new Date(t.fechaLimite);
      return fecha >= todayStart && fecha <= todayEnd;
    });

    const pendientes = mainTasks.filter(t => !t.completada);
    const completadas = mainTasks.filter(t => t.completada);
    const vencidas = mainTasks.filter(t => {
      if (!t.fechaLimite || t.completada) return false;
      return isBefore(new Date(t.fechaLimite), todayStart);
    });

    return {
      total: mainTasks.length,
      hoy: hoy.length,
      pendientes: pendientes.length,
      completadas: completadas.length,
      vencidas: vencidas.length,
    };
  });

  return tareas || { total: 0, hoy: 0, pendientes: 0, completadas: 0, vencidas: 0 };
}
