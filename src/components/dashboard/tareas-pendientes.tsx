'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ListTodo, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useTareasPendientes, completarTarea } from '@/hooks/use-tareas';
import CategoriaBadge from '@/components/shared/categoria-badge';

interface TareasPendientesProps {
  onComplete?: () => void;
}

export default function TareasPendientes({ onComplete }: TareasPendientesProps) {
  const tareas = useTareasPendientes();

  const handleComplete = async (id: number) => {
    await completarTarea(id);
    onComplete?.();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">
          Todas las pendientes
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({tareas.length})
          </span>
        </CardTitle>
        <Link
          href="/tareas"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center"
        >
          Gestionar <ChevronRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {tareas.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <ListTodo className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tienes tareas pendientes</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {tareas.map((tarea) => (
                <motion.div
                  key={tarea.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => handleComplete(tarea.id!)}
                  />
                  <span className="flex-1 text-sm truncate">{tarea.titulo}</span>
                  <CategoriaBadge categoria={tarea.categoria} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
