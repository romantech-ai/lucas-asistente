'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ListFilter, Inbox } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTareas } from '@/hooks/use-tareas';
import { useCategorias } from '@/hooks/use-categorias';
import TareaItem from './tarea-item';
import type { Tarea, FiltroTareas } from '@/types';

interface TareaListProps {
  onEdit: (tarea: Tarea) => void;
  onComplete?: () => void;
  searchQuery?: string;
}

export default function TareaList({ onEdit, onComplete, searchQuery }: TareaListProps) {
  const [filtro, setFiltro] = useState<FiltroTareas>('pendientes');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const categorias = useCategorias();

  const tareas = useTareas(
    filtro,
    categoriaFiltro !== 'todas' ? categoriaFiltro : undefined
  );

  // Apply search filter
  const filteredTareas = searchQuery
    ? tareas.filter(
        t =>
          t.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tareas;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={filtro} onValueChange={(v) => setFiltro(v as FiltroTareas)}>
          <SelectTrigger className="w-[140px]">
            <ListFilter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="hoy">Hoy</SelectItem>
            <SelectItem value="pendientes">Pendientes</SelectItem>
            <SelectItem value="completadas">Completadas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat.id} value={cat.nombre}>
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.nombre}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredTareas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No hay tareas</p>
          <p className="text-sm">
            {searchQuery
              ? 'No se encontraron tareas con esa búsqueda'
              : filtro === 'completadas'
              ? 'No has completado ninguna tarea aún'
              : 'Crea una nueva tarea para comenzar'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTareas.map((tarea) => (
              <TareaItem
                key={tarea.id}
                tarea={tarea}
                onEdit={onEdit}
                onComplete={onComplete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
