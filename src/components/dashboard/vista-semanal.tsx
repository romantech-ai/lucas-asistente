'use client';

import { useMemo } from 'react';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useLiveQuery } from 'dexie-react-hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db';

export default function VistaSemanal() {
  const tareas = useLiveQuery(async () => {
    return db.tareas.filter(t => !t.parentId && !t.completada && !!t.fechaLimite).toArray();
  });

  const recordatorios = useLiveQuery(async () => {
    return db.recordatorios.filter(r => !r.completado).toArray();
  });

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, []);

  const getItemsForDay = (day: Date) => {
    const dayTareas = (tareas || []).filter(t =>
      t.fechaLimite && isSameDay(new Date(t.fechaLimite), day)
    );
    const dayRecordatorios = (recordatorios || []).filter(r =>
      isSameDay(new Date(r.fechaHora), day)
    );

    return { tareas: dayTareas, recordatorios: dayRecordatorios };
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Esta semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const items = getItemsForDay(day);
            const hasItems = items.tareas.length > 0 || items.recordatorios.length > 0;
            const today = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'p-2 rounded-lg text-center min-h-[80px] transition-colors',
                  today && 'bg-primary/10 ring-1 ring-primary',
                  !today && hasItems && 'bg-accent/50'
                )}
              >
                <p className="text-xs text-muted-foreground mb-1">
                  {format(day, 'EEE', { locale: es })}
                </p>
                <p
                  className={cn(
                    'text-lg font-semibold',
                    today && 'text-primary'
                  )}
                >
                  {format(day, 'd')}
                </p>
                <div className="mt-1 space-y-0.5">
                  {items.tareas.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {items.tareas.length} tarea{items.tareas.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {items.recordatorios.length > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {items.recordatorios.length} rec.
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
