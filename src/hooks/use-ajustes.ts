'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useSync } from '@/hooks/use-sync';
import type { Ajustes } from '@/types';

export function useAjustes() {
  const ajustes = useLiveQuery(async () => {
    const all = await db.ajustes.toArray();
    return all[0] || {
      notificacionesActivas: false,
      tiemposNotificacion: [0, 15],
      categoriaDefault: 'Personal',
    };
  });

  return ajustes;
}

export function useAjustesActions() {
  const { pushAjustes } = useSync();

  const actualizarAjustes = async (cambios: Partial<Ajustes>): Promise<void> => {
    const all = await db.ajustes.toArray();

    if (all.length > 0 && all[0].id) {
      await db.ajustes.update(all[0].id, cambios);
    } else {
      await db.ajustes.add({
        notificacionesActivas: false,
        tiemposNotificacion: [0, 15],
        categoriaDefault: 'Personal',
        ...cambios,
      });
    }

    // Sync to Supabase
    pushAjustes();
  };

  return { actualizarAjustes };
}

// Standalone function for backward compatibility (without sync)
export async function actualizarAjustes(cambios: Partial<Ajustes>): Promise<void> {
  const all = await db.ajustes.toArray();

  if (all.length > 0 && all[0].id) {
    await db.ajustes.update(all[0].id, cambios);
  } else {
    await db.ajustes.add({
      notificacionesActivas: false,
      tiemposNotificacion: [0, 15],
      categoriaDefault: 'Personal',
      ...cambios,
    });
  }
}
