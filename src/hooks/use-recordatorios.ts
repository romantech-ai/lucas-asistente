'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Recordatorio, FiltroRecordatorios } from '@/types';
import {
  startOfDay,
  endOfDay,
  addDays,
  isBefore,
  isAfter,
} from 'date-fns';

export function useRecordatorios(filtro: FiltroRecordatorios = 'todos') {
  const recordatorios = useLiveQuery(async () => {
    const all = await db.recordatorios.orderBy('fechaHora').toArray();

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const nextWeek = addDays(today, 7);

    let filtered = all;

    switch (filtro) {
      case 'hoy':
        filtered = all.filter(r => {
          const fecha = new Date(r.fechaHora);
          return fecha >= todayStart && fecha <= todayEnd && !r.completado;
        });
        break;
      case 'proximos':
        filtered = all.filter(r => {
          const fecha = new Date(r.fechaHora);
          return fecha >= today && fecha <= nextWeek && !r.completado;
        });
        break;
    }

    // Sort: upcoming first, then by date
    filtered.sort((a, b) => {
      if (a.completado !== b.completado) {
        return a.completado ? 1 : -1;
      }
      return new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime();
    });

    return filtered;
  }, [filtro]);

  return recordatorios || [];
}

export function useRecordatorio(id: number) {
  return useLiveQuery(() => db.recordatorios.get(id), [id]);
}

export async function crearRecordatorio(
  recordatorio: Omit<Recordatorio, 'id' | 'creadoEn' | 'actualizadoEn' | 'completado' | 'notificacionesEnviadas' | 'exportadoACalendar'>
): Promise<number> {
  const now = new Date();

  const id = await db.recordatorios.add({
    ...recordatorio,
    completado: false,
    notificacionesEnviadas: [],
    exportadoACalendar: false,
    creadoEn: now,
    actualizadoEn: now,
  } as Recordatorio);

  return id as number;
}

export async function actualizarRecordatorio(
  id: number,
  cambios: Partial<Recordatorio>
): Promise<void> {
  await db.recordatorios.update(id, {
    ...cambios,
    actualizadoEn: new Date(),
  });
}

export async function completarRecordatorio(id: number): Promise<void> {
  const recordatorio = await db.recordatorios.get(id);
  if (!recordatorio) return;

  await db.recordatorios.update(id, {
    completado: !recordatorio.completado,
    actualizadoEn: new Date(),
  });
}

export async function eliminarRecordatorio(id: number): Promise<void> {
  await db.recordatorios.delete(id);
}

export async function marcarNotificacionEnviada(
  id: number,
  minutosAntes: number
): Promise<void> {
  const recordatorio = await db.recordatorios.get(id);
  if (!recordatorio) return;

  const enviadas = [...(recordatorio.notificacionesEnviadas || []), minutosAntes];

  await db.recordatorios.update(id, {
    notificacionesEnviadas: enviadas,
    actualizadoEn: new Date(),
  });
}

export function useRecordatoriosHoy() {
  return useRecordatorios('hoy');
}

export function useRecordatoriosProximos() {
  return useRecordatorios('proximos');
}

export function useRecordatoriosStats() {
  const stats = useLiveQuery(async () => {
    const all = await db.recordatorios.toArray();
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const hoy = all.filter(r => {
      const fecha = new Date(r.fechaHora);
      return fecha >= todayStart && fecha <= todayEnd && !r.completado;
    });

    const pendientes = all.filter(r => !r.completado && isAfter(new Date(r.fechaHora), today));
    const pasados = all.filter(r => !r.completado && isBefore(new Date(r.fechaHora), today));

    return {
      total: all.length,
      hoy: hoy.length,
      pendientes: pendientes.length,
      pasados: pasados.length,
    };
  });

  return stats || { total: 0, hoy: 0, pendientes: 0, pasados: 0 };
}

export function useRecordatoriosPendientes() {
  const recordatorios = useLiveQuery(async () => {
    const all = await db.recordatorios.toArray();
    const now = new Date();

    return all.filter(r => {
      if (r.completado) return false;
      const fecha = new Date(r.fechaHora);

      // Check each notification time
      for (const minutos of r.notificarAntes) {
        const tiempoNotificacion = new Date(fecha.getTime() - minutos * 60 * 1000);

        // If notification time has passed and we haven't sent it yet
        if (tiempoNotificacion <= now && !r.notificacionesEnviadas.includes(minutos)) {
          return true;
        }
      }

      return false;
    });
  });

  return recordatorios || [];
}
