'use client';

import { useState, useEffect } from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { crearRecordatorio, actualizarRecordatorio } from '@/hooks/use-recordatorios';
import type { Recordatorio } from '@/types';
import { TIEMPOS_NOTIFICACION } from '@/types';

interface RecordatorioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordatorio?: Recordatorio | null;
}

export default function RecordatorioForm({ open, onOpenChange, recordatorio }: RecordatorioFormProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState<Date>(new Date());
  const [hora, setHora] = useState('12:00');
  const [notificarAntes, setNotificarAntes] = useState<number[]>([0, 15]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (recordatorio) {
      setTitulo(recordatorio.titulo);
      setDescripcion(recordatorio.descripcion || '');
      const fechaHora = new Date(recordatorio.fechaHora);
      setFecha(fechaHora);
      setHora(format(fechaHora, 'HH:mm'));
      setNotificarAntes(recordatorio.notificarAntes);
    } else {
      resetForm();
    }
  }, [recordatorio, open]);

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setFecha(new Date());
    setHora('12:00');
    setNotificarAntes([0, 15]);
  };

  const toggleNotificacion = (value: number) => {
    if (notificarAntes.includes(value)) {
      setNotificarAntes(notificarAntes.filter(n => n !== value));
    } else {
      setNotificarAntes([...notificarAntes, value].sort((a, b) => a - b));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    setIsSubmitting(true);

    try {
      const [horas, minutos] = hora.split(':').map(Number);
      const fechaHora = setMinutes(setHours(fecha, horas), minutos);

      if (recordatorio?.id) {
        await actualizarRecordatorio(recordatorio.id, {
          titulo,
          descripcion: descripcion || undefined,
          fechaHora,
          notificarAntes,
        });
      } else {
        await crearRecordatorio({
          titulo,
          descripcion: descripcion || undefined,
          fechaHora,
          notificarAntes,
        });
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving reminder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {recordatorio ? 'Editar recordatorio' : 'Nuevo recordatorio'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="¿Qué quieres recordar?"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Agrega más detalles..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(fecha, "d MMM", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fecha}
                    onSelect={(d) => d && setFecha(d)}
                    locale={es}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Hora</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notificarme</Label>
            <div className="grid grid-cols-2 gap-2">
              {TIEMPOS_NOTIFICACION.map((tiempo) => (
                <label
                  key={tiempo.value}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors',
                    notificarAntes.includes(tiempo.value)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Checkbox
                    checked={notificarAntes.includes(tiempo.value)}
                    onCheckedChange={() => toggleNotificacion(tiempo.value)}
                  />
                  <span className="text-sm">{tiempo.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!titulo.trim() || isSubmitting}>
              {isSubmitting ? 'Guardando...' : recordatorio ? 'Guardar cambios' : 'Crear recordatorio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
