'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Plus, X, ImagePlus } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useCategorias } from '@/hooks/use-categorias';
import { crearTarea, actualizarTarea } from '@/hooks/use-tareas';
import type { Tarea, Prioridad } from '@/types';
import { db } from '@/lib/db';

interface TareaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tarea?: Tarea | null;
}

interface SubtareaInput {
  id: string;
  titulo: string;
}

export default function TareaForm({ open, onOpenChange, tarea }: TareaFormProps) {
  const categorias = useCategorias();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('media');
  const [categoria, setCategoria] = useState('Personal');
  const [fechaLimite, setFechaLimite] = useState<Date | undefined>();
  const [subtareas, setSubtareas] = useState<SubtareaInput[]>([]);
  const [nuevaSubtarea, setNuevaSubtarea] = useState('');
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tarea) {
      setTitulo(tarea.titulo);
      setDescripcion(tarea.descripcion || '');
      setPrioridad(tarea.prioridad);
      setCategoria(tarea.categoria);
      setFechaLimite(tarea.fechaLimite ? new Date(tarea.fechaLimite) : undefined);
      setImagenes(tarea.imagenes || []);
      // Load existing subtareas
      if (tarea.id) {
        db.tareas.where('parentId').equals(tarea.id).toArray().then((subs) => {
          setSubtareas(subs.map(s => ({ id: s.id!.toString(), titulo: s.titulo })));
        });
      }
    } else {
      resetForm();
    }
  }, [tarea, open]);

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setPrioridad('media');
    setCategoria(categorias[0]?.nombre || 'Personal');
    setFechaLimite(undefined);
    setSubtareas([]);
    setNuevaSubtarea('');
    setImagenes([]);
  };

  const handleAddSubtarea = () => {
    if (nuevaSubtarea.trim()) {
      setSubtareas([...subtareas, { id: Date.now().toString(), titulo: nuevaSubtarea.trim() }]);
      setNuevaSubtarea('');
    }
  };

  const handleRemoveSubtarea = (id: string) => {
    setSubtareas(subtareas.filter(s => s.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setImagenes(prev => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    setIsSubmitting(true);

    try {
      if (tarea?.id) {
        // Update existing task
        await actualizarTarea(tarea.id, {
          titulo,
          descripcion: descripcion || undefined,
          prioridad,
          categoria,
          fechaLimite,
          imagenes,
        });

        // Handle subtareas - delete old ones and create new ones
        await db.tareas.where('parentId').equals(tarea.id).delete();
        for (const subtarea of subtareas) {
          await crearTarea({
            titulo: subtarea.titulo,
            prioridad,
            categoria,
            fechaLimite,
            parentId: tarea.id,
          });
        }
      } else {
        // Create new task
        const newId = await crearTarea({
          titulo,
          descripcion: descripcion || undefined,
          prioridad,
          categoria,
          fechaLimite,
          imagenes,
        });

        // Create subtareas
        for (const subtarea of subtareas) {
          await crearTarea({
            titulo: subtarea.titulo,
            prioridad,
            categoria,
            fechaLimite,
            parentId: newId,
          });
        }
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tarea ? 'Editar tarea' : 'Nueva tarea'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="¿Qué necesitas hacer?"
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
              <Label>Prioridad</Label>
              <Select value={prioridad} onValueChange={(v) => setPrioridad(v as Prioridad)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Alta
                    </span>
                  </SelectItem>
                  <SelectItem value="media">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Media
                    </span>
                  </SelectItem>
                  <SelectItem value="baja">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Baja
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
          </div>

          <div className="space-y-2">
            <Label>Fecha límite (opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !fechaLimite && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaLimite
                    ? format(fechaLimite, "d 'de' MMMM, yyyy", { locale: es })
                    : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaLimite}
                  onSelect={setFechaLimite}
                  locale={es}
                />
                {fechaLimite && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setFechaLimite(undefined)}
                    >
                      Quitar fecha
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Subtareas */}
          <div className="space-y-2">
            <Label>Subtareas</Label>
            <div className="flex gap-2">
              <Input
                value={nuevaSubtarea}
                onChange={(e) => setNuevaSubtarea(e.target.value)}
                placeholder="Agregar subtarea"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtarea();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddSubtarea}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {subtareas.length > 0 && (
              <div className="space-y-2 mt-2">
                {subtareas.map((subtarea) => (
                  <div
                    key={subtarea.id}
                    className="flex items-center justify-between bg-muted rounded-md px-3 py-2"
                  >
                    <span className="text-sm">{subtarea.titulo}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveSubtarea(subtarea.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Imágenes */}
          <div className="space-y-2">
            <Label>Imágenes (opcional)</Label>
            <div className="flex flex-wrap gap-2">
              {imagenes.map((img, index) => (
                <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-5 w-5"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary transition-colors">
                <ImagePlus className="w-6 h-6 text-muted-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!titulo.trim() || isSubmitting}>
              {isSubmitting ? 'Guardando...' : tarea ? 'Guardar cambios' : 'Crear tarea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
