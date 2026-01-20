'use client';

import { useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { showNotification } from '@/lib/notifications';
import { marcarNotificacionEnviada } from '@/hooks/use-recordatorios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CHECK_INTERVAL = 30000; // Check every 30 seconds

export function useNotificationChecker() {
  const checkingRef = useRef(false);

  const ajustes = useLiveQuery(async () => {
    const all = await db.ajustes.toArray();
    return all[0];
  });

  const recordatorios = useLiveQuery(async () => {
    return db.recordatorios.where('completado').equals(0).toArray();
  });

  useEffect(() => {
    if (!ajustes?.notificacionesActivas) return;

    const checkNotifications = async () => {
      if (checkingRef.current || !recordatorios) return;
      checkingRef.current = true;

      const now = new Date();

      for (const recordatorio of recordatorios) {
        if (recordatorio.completado) continue;

        const fechaHora = new Date(recordatorio.fechaHora);

        for (const minutos of recordatorio.notificarAntes) {
          // Skip if already sent
          if (recordatorio.notificacionesEnviadas.includes(minutos)) continue;

          // Calculate notification time
          const tiempoNotificacion = new Date(fechaHora.getTime() - minutos * 60 * 1000);

          // Check if it's time to send
          if (tiempoNotificacion <= now && now < fechaHora) {
            const timeLabel = minutos === 0
              ? 'ahora'
              : `en ${minutos < 60 ? `${minutos} minutos` : `${minutos / 60} hora${minutos > 60 ? 's' : ''}`}`;

            await showNotification(
              recordatorio.titulo,
              minutos === 0
                ? `Es hora de: ${recordatorio.titulo}`
                : `Recordatorio ${timeLabel}: ${recordatorio.titulo}`,
              {
                tag: `recordatorio-${recordatorio.id}-${minutos}`,
                data: { recordatorioId: recordatorio.id, url: '/recordatorios' },
              }
            );

            await marcarNotificacionEnviada(recordatorio.id!, minutos);
          }
        }
      }

      checkingRef.current = false;
    };

    // Initial check
    checkNotifications();

    // Set up interval
    const interval = setInterval(checkNotifications, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [ajustes?.notificacionesActivas, recordatorios]);
}
