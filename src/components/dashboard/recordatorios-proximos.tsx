'use client';

import { Bell, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRecordatoriosProximos } from '@/hooks/use-recordatorios';

export default function RecordatoriosProximos() {
  const recordatorios = useRecordatoriosProximos();

  const getDateLabel = (fecha: Date) => {
    if (isToday(fecha)) return 'Hoy';
    if (isTomorrow(fecha)) return 'Mañana';
    return format(fecha, "EEE d", { locale: es });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Recordatorios</CardTitle>
        <Link
          href="/recordatorios"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center"
        >
          Ver todos <ChevronRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {recordatorios.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay recordatorios próximos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recordatorios.slice(0, 4).map((recordatorio) => {
              const fecha = new Date(recordatorio.fechaHora);

              return (
                <div
                  key={recordatorio.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {recordatorio.titulo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getDateLabel(fecha)} a las {format(fecha, 'HH:mm')}
                    </p>
                  </div>
                </div>
              );
            })}
            {recordatorios.length > 4 && (
              <p className="text-xs text-muted-foreground text-center">
                +{recordatorios.length - 4} más
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
