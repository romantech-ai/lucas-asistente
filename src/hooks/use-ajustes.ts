'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
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
