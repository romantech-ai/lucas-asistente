'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ListFilter, Bell } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRecordatorios } from '@/hooks/use-recordatorios';
import RecordatorioCard from './recordatorio-card';
import type { Recordatorio, FiltroRecordatorios } from '@/types';

interface RecordatorioListProps {
  onEdit: (recordatorio: Recordatorio) => void;
  searchQuery?: string;
}

export default function RecordatorioList({ onEdit, searchQuery }: RecordatorioListProps) {
  const [filtro, setFiltro] = useState<FiltroRecordatorios>('proximos');
  const recordatorios = useRecordatorios(filtro);

  // Apply search filter
  const filteredRecordatorios = searchQuery
    ? recordatorios.filter(
        r =>
          r.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recordatorios;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={filtro} onValueChange={(v) => setFiltro(v as FiltroRecordatorios)}>
          <SelectTrigger className="w-[140px]">
            <ListFilter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="hoy">Hoy</SelectItem>
            <SelectItem value="proximos">Próximos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredRecordatorios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Bell className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No hay recordatorios</p>
          <p className="text-sm">
            {searchQuery
              ? 'No se encontraron recordatorios con esa búsqueda'
              : filtro === 'hoy'
              ? 'No tienes recordatorios para hoy'
              : 'Crea un nuevo recordatorio para comenzar'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredRecordatorios.map((recordatorio) => (
              <RecordatorioCard
                key={recordatorio.id}
                recordatorio={recordatorio}
                onEdit={onEdit}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
