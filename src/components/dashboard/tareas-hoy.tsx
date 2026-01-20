'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useTareasHoy, completarTarea } from '@/hooks/use-tareas';
import PrioridadBadge from '@/components/shared/prioridad-badge';

interface TareasHoyProps {
  onComplete?: () => void;
}

export default function TareasHoy({ onComplete }: TareasHoyProps) {
  const tareas = useTareasHoy();

  const handleComplete = async (id: number, isCompleted: boolean) => {
    await completarTarea(id);
    if (!isCompleted) {
      onComplete?.();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Tareas para hoy</CardTitle>
        <Link
          href="/tareas"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center"
        >
          Ver todas <ChevronRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {tareas.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tienes tareas para hoy</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {tareas.slice(0, 5).map((tarea) => (
                <motion.div
                  key={tarea.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg transition-colors',
                    'hover:bg-accent/50',
                    tarea.completada && 'opacity-50'
                  )}
                >
                  <Checkbox
                    checked={tarea.completada}
                    onCheckedChange={() => handleComplete(tarea.id!, tarea.completada)}
                  />
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      tarea.completada && 'line-through text-muted-foreground'
                    )}
                  >
                    {tarea.titulo}
                  </span>
                  <PrioridadBadge prioridad={tarea.prioridad} />
                </motion.div>
              ))}
            </AnimatePresence>
            {tareas.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{tareas.length - 5} más
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
