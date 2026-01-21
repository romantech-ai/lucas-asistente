import { db } from '@/lib/db';
import { crearTarea, buscarTareas, completarTarea } from '@/hooks/use-tareas';
import { crearRecordatorio } from '@/hooks/use-recordatorios';
import { supabase, recordatorioToSupabase } from '@/lib/supabase';
import { format, startOfDay, endOfDay, addDays, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Tarea, Recordatorio, Prioridad } from '@/types';

export const AI_FUNCTIONS = [
  {
    name: 'crear_tarea',
    description: 'Crea una nueva tarea para el usuario',
    parameters: {
      type: 'object' as const,
      properties: {
        titulo: {
          type: 'string',
          description: 'El título de la tarea',
        },
        descripcion: {
          type: 'string',
          description: 'Descripción opcional de la tarea',
        },
        prioridad: {
          type: 'string',
          enum: ['alta', 'media', 'baja'],
          description: 'Prioridad de la tarea',
        },
        categoria: {
          type: 'string',
          description: 'Categoría de la tarea (Personal, Trabajo, Salud, Compras, Hogar, Finanzas)',
        },
        fechaLimite: {
          type: 'string',
          description: 'Fecha límite en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)',
        },
      },
      required: ['titulo'],
    },
  },
  {
    name: 'crear_recordatorio',
    description: 'Crea un nuevo recordatorio con notificación',
    parameters: {
      type: 'object' as const,
      properties: {
        titulo: {
          type: 'string',
          description: 'El título del recordatorio',
        },
        descripcion: {
          type: 'string',
          description: 'Descripción opcional',
        },
        fechaHora: {
          type: 'string',
          description: 'Fecha y hora en formato ISO (YYYY-MM-DDTHH:mm:ss)',
        },
      },
      required: ['titulo', 'fechaHora'],
    },
  },
  {
    name: 'listar_tareas',
    description: 'Obtiene las tareas del usuario según un filtro',
    parameters: {
      type: 'object' as const,
      properties: {
        filtro: {
          type: 'string',
          enum: ['hoy', 'pendientes', 'completadas', 'todas'],
          description: 'Filtro para las tareas',
        },
        categoria: {
          type: 'string',
          description: 'Filtrar por categoría específica',
        },
      },
    },
  },
  {
    name: 'completar_tarea',
    description: 'Marca una tarea como completada buscándola por texto',
    parameters: {
      type: 'object' as const,
      properties: {
        busqueda: {
          type: 'string',
          description: 'Texto para buscar y encontrar la tarea a completar',
        },
      },
      required: ['busqueda'],
    },
  },
  {
    name: 'listar_recordatorios',
    description: 'Obtiene los recordatorios del usuario',
    parameters: {
      type: 'object' as const,
      properties: {
        filtro: {
          type: 'string',
          enum: ['hoy', 'proximos', 'todos'],
          description: 'Filtro para los recordatorios',
        },
      },
    },
  },
];

function parseFlexibleDate(dateStr: string): Date | null {
  // Handle relative dates
  const today = new Date();
  const lowerStr = dateStr.toLowerCase();

  if (lowerStr === 'hoy' || lowerStr === 'today') {
    return today;
  }
  if (lowerStr === 'mañana' || lowerStr === 'manana' || lowerStr === 'tomorrow') {
    return addDays(today, 1);
  }
  if (lowerStr === 'pasado mañana' || lowerStr === 'pasado manana') {
    return addDays(today, 2);
  }

  // Try parsing ISO format
  try {
    const parsed = parseISO(dateStr);
    if (isValid(parsed)) {
      return parsed;
    }
  } catch {
    // Continue to other methods
  }

  // Try parsing as a regular date
  const date = new Date(dateStr);
  if (isValid(date)) {
    return date;
  }

  return null;
}

export async function executeFunction(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  try {
    switch (name) {
      case 'crear_tarea': {
        const fechaLimite = args.fechaLimite
          ? parseFlexibleDate(args.fechaLimite as string)
          : undefined;

        const id = await crearTarea({
          titulo: args.titulo as string,
          descripcion: args.descripcion as string | undefined,
          prioridad: (args.prioridad as Prioridad) || 'media',
          categoria: (args.categoria as string) || 'Personal',
          fechaLimite: fechaLimite || undefined,
        });

        const fechaStr = fechaLimite
          ? ` para ${format(fechaLimite, "EEEE d 'de' MMMM", { locale: es })}`
          : '';

        return `He creado la tarea "${args.titulo}"${fechaStr}. ¡Ya está en tu lista!`;
      }

      case 'crear_recordatorio': {
        const fechaHora = parseFlexibleDate(args.fechaHora as string);

        if (!fechaHora) {
          return 'No pude entender la fecha y hora. ¿Podrías especificarla de otra manera?';
        }

        const recordatorioId = await crearRecordatorio({
          titulo: args.titulo as string,
          descripcion: args.descripcion as string | undefined,
          fechaHora,
          notificarAntes: [0, 15],
        });

        // Sincronizar con Supabase
        if (supabase && recordatorioId) {
          const recordatorio = await db.recordatorios.get(recordatorioId);
          if (recordatorio) {
            await supabase.from('recordatorios').upsert(recordatorioToSupabase(recordatorio));
          }
        }

        return `He creado el recordatorio "${args.titulo}" para ${format(fechaHora, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })}. Te avisaré cuando sea el momento.`;
      }

      case 'listar_tareas': {
        const filtro = (args.filtro as string) || 'pendientes';
        const allTareas = await db.tareas.toArray();
        const today = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        let tareas = allTareas.filter(t => !t.parentId);

        if (args.categoria) {
          tareas = tareas.filter(t => t.categoria === args.categoria);
        }

        switch (filtro) {
          case 'hoy':
            tareas = tareas.filter(t => {
              if (!t.fechaLimite) return false;
              const fecha = new Date(t.fechaLimite);
              return fecha >= today && fecha <= todayEnd;
            });
            break;
          case 'pendientes':
            tareas = tareas.filter(t => !t.completada);
            break;
          case 'completadas':
            tareas = tareas.filter(t => t.completada);
            break;
        }

        if (tareas.length === 0) {
          const mensajes: Record<string, string> = {
            hoy: 'No tienes tareas para hoy. ¡Día libre!',
            pendientes: '¡No tienes tareas pendientes! Todo al día.',
            completadas: 'Aún no has completado ninguna tarea.',
            todas: 'No tienes ninguna tarea creada.',
          };
          return mensajes[filtro] || 'No encontré tareas con ese filtro.';
        }

        const lista = tareas
          .slice(0, 10)
          .map((t, i) => {
            const estado = t.completada ? '✓' : '○';
            const prioridad = t.prioridad === 'alta' ? '🔴' : t.prioridad === 'media' ? '🟡' : '🟢';
            return `${i + 1}. ${estado} ${prioridad} ${t.titulo}`;
          })
          .join('\n');

        const titulo = filtro === 'hoy' ? 'para hoy' : filtro;
        return `Aquí están tus tareas ${titulo}:\n\n${lista}${tareas.length > 10 ? `\n\n...y ${tareas.length - 10} más` : ''}`;
      }

      case 'completar_tarea': {
        const busqueda = (args.busqueda as string).toLowerCase();
        const tareas = await buscarTareas(busqueda);

        const pendientes = tareas.filter(t => !t.completada && !t.parentId);

        if (pendientes.length === 0) {
          return `No encontré ninguna tarea pendiente que coincida con "${args.busqueda}". ¿Quieres que busque de otra manera?`;
        }

        if (pendientes.length === 1) {
          await completarTarea(pendientes[0].id!);
          return `¡Genial! He marcado como completada la tarea "${pendientes[0].titulo}". ¡Buen trabajo! 🎉`;
        }

        // Multiple matches
        const opciones = pendientes
          .slice(0, 5)
          .map((t, i) => `${i + 1}. ${t.titulo}`)
          .join('\n');

        return `Encontré varias tareas que coinciden:\n\n${opciones}\n\n¿Cuál quieres completar? Puedes decirme el número o ser más específico.`;
      }

      case 'listar_recordatorios': {
        const filtro = (args.filtro as string) || 'proximos';
        const allRecordatorios = await db.recordatorios.toArray();
        const today = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());
        const nextWeek = addDays(new Date(), 7);

        let recordatorios = allRecordatorios.filter(r => !r.completado);

        switch (filtro) {
          case 'hoy':
            recordatorios = recordatorios.filter(r => {
              const fecha = new Date(r.fechaHora);
              return fecha >= today && fecha <= todayEnd;
            });
            break;
          case 'proximos':
            recordatorios = recordatorios.filter(r => {
              const fecha = new Date(r.fechaHora);
              return fecha >= new Date() && fecha <= nextWeek;
            });
            break;
        }

        recordatorios.sort(
          (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
        );

        if (recordatorios.length === 0) {
          const mensajes: Record<string, string> = {
            hoy: 'No tienes recordatorios para hoy.',
            proximos: 'No tienes recordatorios próximos.',
            todos: 'No tienes ningún recordatorio activo.',
          };
          return mensajes[filtro] || 'No encontré recordatorios con ese filtro.';
        }

        const lista = recordatorios
          .slice(0, 10)
          .map((r, i) => {
            const fecha = format(new Date(r.fechaHora), "d/M 'a las' HH:mm", { locale: es });
            return `${i + 1}. 🔔 ${r.titulo} - ${fecha}`;
          })
          .join('\n');

        return `Tus recordatorios ${filtro === 'hoy' ? 'para hoy' : filtro}:\n\n${lista}`;
      }

      default:
        return 'No reconozco esa acción.';
    }
  } catch (error) {
    console.error('Error executing function:', error);
    return 'Hubo un error al procesar tu solicitud. ¿Podrías intentarlo de nuevo?';
  }
}
