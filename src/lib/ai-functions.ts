import { db } from '@/lib/db';
import { crearTarea, buscarTareas, completarTarea } from '@/hooks/use-tareas';
import { crearRecordatorio } from '@/hooks/use-recordatorios';
import { supabase, recordatorioToSupabase } from '@/lib/supabase';
import { format, startOfDay, endOfDay, addDays, parseISO, isValid, setHours, setMinutes, getDay, nextDay, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Tarea, Recordatorio, Prioridad } from '@/types';

// Mapeo de días de la semana en español a índices (0 = domingo, 1 = lunes, etc.)
const DIAS_SEMANA: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
  'domingo': 0,
  'lunes': 1,
  'martes': 2,
  'miercoles': 3,
  'miércoles': 3,
  'jueves': 4,
  'viernes': 5,
  'sabado': 6,
  'sábado': 6,
};

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

function extractTime(str: string): { hours: number; minutes: number } | null {
  // Patrones de hora: "9", "9:00", "9:30", "09:00", "21:00", "9am", "9pm", "9 am", "9 de la mañana", "9 de la tarde"
  const patterns = [
    /(\d{1,2}):(\d{2})/,                           // 9:00, 09:30, 21:00
    /(\d{1,2})\s*(am|a\.m\.|a\.m)/i,               // 9am, 9 am, 9 a.m.
    /(\d{1,2})\s*(pm|p\.m\.|p\.m)/i,               // 9pm, 9 pm, 9 p.m.
    /(\d{1,2})\s*de la mañana/i,                   // 9 de la mañana
    /(\d{1,2})\s*de la tarde/i,                    // 5 de la tarde
    /(\d{1,2})\s*de la noche/i,                    // 9 de la noche
    /a las (\d{1,2})(?::(\d{2}))?/i,               // a las 9, a las 9:30
    /(\d{1,2})\s*(?:hrs?|horas?)/i,                // 9h, 9hrs, 9 horas
  ];

  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match) {
      let hours = parseInt(match[1], 10);
      let minutes = match[2] ? parseInt(match[2], 10) : 0;

      // Ajustar PM
      if (/pm|p\.m|de la tarde/i.test(str) && hours < 12) {
        hours += 12;
      }
      if (/de la noche/i.test(str) && hours < 12) {
        hours += 12;
      }
      // Ajustar AM (12am = 0)
      if (/am|a\.m|de la mañana/i.test(str) && hours === 12) {
        hours = 0;
      }

      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return { hours, minutes };
      }
    }
  }

  return null;
}

function getNextDayOfWeek(dayIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6, includeToday = false): Date {
  const today = new Date();
  const currentDay = getDay(today) as 0 | 1 | 2 | 3 | 4 | 5 | 6;

  if (includeToday && currentDay === dayIndex) {
    return today;
  }

  return nextDay(today, dayIndex);
}

function parseFlexibleDate(dateStr: string): Date | null {
  const today = new Date();
  const lowerStr = dateStr.toLowerCase().trim();

  // Extraer hora si existe
  const timeInfo = extractTime(lowerStr);

  let resultDate: Date | null = null;

  // 1. Fechas relativas simples
  if (/^hoy|today/.test(lowerStr)) {
    resultDate = today;
  } else if (/^mañana|^manana|tomorrow/.test(lowerStr)) {
    resultDate = addDays(today, 1);
  } else if (/^pasado\s*mañana|^pasado\s*manana/.test(lowerStr)) {
    resultDate = addDays(today, 2);
  }

  // 2. Días de la semana
  if (!resultDate) {
    for (const [dia, index] of Object.entries(DIAS_SEMANA)) {
      // Patrones: "martes", "el martes", "este martes", "próximo martes", "proximo martes"
      const diaPattern = new RegExp(`(?:el\\s+|este\\s+|pr[oó]ximo\\s+)?${dia}`, 'i');
      if (diaPattern.test(lowerStr)) {
        resultDate = getNextDayOfWeek(index);
        break;
      }
    }
  }

  // 3. Expresiones como "en X días", "dentro de X días"
  if (!resultDate) {
    const enDiasMatch = lowerStr.match(/(?:en|dentro de)\s+(\d+)\s*d[ií]as?/i);
    if (enDiasMatch) {
      resultDate = addDays(today, parseInt(enDiasMatch[1], 10));
    }
  }

  // 4. "la próxima semana"
  if (!resultDate && /pr[oó]xima\s+semana|siguiente\s+semana/.test(lowerStr)) {
    resultDate = addWeeks(today, 1);
  }

  // 5. Intentar parsear como ISO
  if (!resultDate) {
    try {
      const parsed = parseISO(dateStr);
      if (isValid(parsed)) {
        resultDate = parsed;
      }
    } catch {
      // Continue
    }
  }

  // 6. Intentar parsear como fecha normal
  if (!resultDate) {
    const date = new Date(dateStr);
    if (isValid(date) && date.getFullYear() > 2000) {
      resultDate = date;
    }
  }

  // Si no encontramos fecha pero sí hora, usar hoy
  if (!resultDate && timeInfo) {
    resultDate = today;
  }

  // Aplicar la hora si existe
  if (resultDate && timeInfo) {
    resultDate = setHours(resultDate, timeInfo.hours);
    resultDate = setMinutes(resultDate, timeInfo.minutes);
  } else if (resultDate) {
    // Si no hay hora específica, poner una hora por defecto (9:00)
    const currentHours = resultDate.getHours();
    if (currentHours === 0 && resultDate.getMinutes() === 0) {
      resultDate = setHours(resultDate, 9);
      resultDate = setMinutes(resultDate, 0);
    }
  }

  return resultDate;
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
