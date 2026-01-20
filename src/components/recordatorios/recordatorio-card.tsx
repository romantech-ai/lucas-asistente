'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Clock,
  Bell,
  Trash2,
  Edit,
  Calendar as CalendarIcon,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { completarRecordatorio, eliminarRecordatorio } from '@/hooks/use-recordatorios';
import ConfirmDialog from '@/components/shared/confirm-dialog';
import type { Recordatorio } from '@/types';
import { TIEMPOS_NOTIFICACION } from '@/types';

interface RecordatorioCardProps {
  recordatorio: Recordatorio;
  onEdit: (recordatorio: Recordatorio) => void;
}

export default function RecordatorioCard({ recordatorio, onEdit }: RecordatorioCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fecha = new Date(recordatorio.fechaHora);
  const pasado = isPast(fecha) && !recordatorio.completado;

  const getDateLabel = () => {
    if (isToday(fecha)) return 'Hoy';
    if (isTomorrow(fecha)) return 'Mañana';
    return format(fecha, "EEEE d 'de' MMMM", { locale: es });
  };

  const handleComplete = async () => {
    await completarRecordatorio(recordatorio.id!);
  };

  const handleDelete = async () => {
    await eliminarRecordatorio(recordatorio.id!);
    setShowDeleteDialog(false);
  };

  const notificacionesLabel = recordatorio.notificarAntes
    .map(min => TIEMPOS_NOTIFICACION.find(t => t.value === min)?.label)
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          'group bg-card border border-border rounded-lg p-4 transition-colors',
          recordatorio.completado && 'opacity-60',
          pasado && 'border-destructive/50'
        )}
      >
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 rounded-full shrink-0 mt-0.5',
              recordatorio.completado && 'text-green-500'
            )}
            onClick={handleComplete}
          >
            <CheckCircle2
              className={cn(
                'w-5 h-5',
                recordatorio.completado ? 'fill-current' : 'text-muted-foreground'
              )}
            />
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3
                  className={cn(
                    'font-medium text-foreground',
                    recordatorio.completado && 'line-through text-muted-foreground'
                  )}
                >
                  {recordatorio.titulo}
                </h3>

                {recordatorio.descripcion && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {recordatorio.descripcion}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className={cn(
                    'flex items-center gap-1 text-sm',
                    pasado ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    <CalendarIcon className="w-4 h-4" />
                    {getDateLabel()}
                  </span>

                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {format(fecha, 'HH:mm')}
                  </span>

                  {notificacionesLabel && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Bell className="w-3 h-3" />
                      {notificacionesLabel}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(recordatorio)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar recordatorio"
        description={`¿Estás seguro de que quieres eliminar "${recordatorio.titulo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}
