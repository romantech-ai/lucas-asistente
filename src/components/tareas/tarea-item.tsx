'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronRight,
  Calendar,
  Trash2,
  Edit,
  ChevronDown,
  ImageIcon,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { completarTarea, eliminarTarea, useSubtareas } from '@/hooks/use-tareas';
import CategoriaBadge from '@/components/shared/categoria-badge';
import PrioridadBadge from '@/components/shared/prioridad-badge';
import ConfirmDialog from '@/components/shared/confirm-dialog';
import type { Tarea } from '@/types';

interface TareaItemProps {
  tarea: Tarea;
  onEdit: (tarea: Tarea) => void;
  onComplete?: () => void;
}

export default function TareaItem({ tarea, onEdit, onComplete }: TareaItemProps) {
  const [showSubtareas, setShowSubtareas] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const subtareas = useSubtareas(tarea.id!);

  const handleComplete = async () => {
    await completarTarea(tarea.id!);
    if (!tarea.completada) {
      onComplete?.();
    }
  };

  const handleDelete = async () => {
    await eliminarTarea(tarea.id!);
    setShowDeleteDialog(false);
  };

  const hasSubtareas = subtareas.length > 0;
  const completedSubtareas = subtareas.filter(s => s.completada).length;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          'group bg-card border border-border rounded-lg p-4 transition-colors',
          tarea.completada && 'opacity-60'
        )}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={tarea.completada}
            onCheckedChange={handleComplete}
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3
                  className={cn(
                    'font-medium text-foreground',
                    tarea.completada && 'line-through text-muted-foreground'
                  )}
                >
                  {tarea.titulo}
                </h3>

                {tarea.descripcion && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {tarea.descripcion}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <PrioridadBadge prioridad={tarea.prioridad} />
                  <CategoriaBadge categoria={tarea.categoria} />

                  {tarea.fechaLimite && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(tarea.fechaLimite), "d 'de' MMM", { locale: es })}
                    </span>
                  )}

                  {tarea.imagenes && tarea.imagenes.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ImageIcon className="w-3 h-3" />
                      {tarea.imagenes.length}
                    </span>
                  )}

                  {hasSubtareas && (
                    <span className="text-xs text-muted-foreground">
                      {completedSubtareas}/{subtareas.length} subtareas
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(tarea)}
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

            {hasSubtareas && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setShowSubtareas(!showSubtareas)}
                >
                  {showSubtareas ? (
                    <ChevronDown className="w-3 h-3 mr-1" />
                  ) : (
                    <ChevronRight className="w-3 h-3 mr-1" />
                  )}
                  Ver subtareas
                </Button>

                {showSubtareas && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 pl-4 border-l-2 border-border space-y-2"
                  >
                    {subtareas.map((subtarea) => (
                      <div
                        key={subtarea.id}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          checked={subtarea.completada}
                          onCheckedChange={() => completarTarea(subtarea.id!)}
                          className="h-4 w-4"
                        />
                        <span
                          className={cn(
                            'text-sm',
                            subtarea.completada && 'line-through text-muted-foreground'
                          )}
                        >
                          {subtarea.titulo}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar tarea"
        description={`¿Estás seguro de que quieres eliminar "${tarea.titulo}"? ${hasSubtareas ? `También se eliminarán ${subtareas.length} subtareas.` : ''} Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}
