import { supabase, tareaToSupabase, recordatorioToSupabase } from '@/lib/supabase';
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
          description: 'Fecha y hora del recordatorio. Usa formato "día a las HH:MM" (ej: "martes a las 9", "jueves a las 14:30") o ISO (YYYY-MM-DDTHH:mm:ss)',
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
  const patterns = [
    /(\d{1,2}):(\d{2})/,
    /(\d{1,2})\s*(am|a\.m\.|a\.m)/i,
    /(\d{1,2})\s*(pm|p\.m\.|p\.m)/i,
    /(\d{1,2})\s*de la mañana/i,
    /(\d{1,2})\s*de la tarde/i,
    /(\d{1,2})\s*de la noche/i,
    /a las (\d{1,2})(?::(\d{2}))?/i,
    /(\d{1,2})\s*(?:hrs?|horas?)/i,
  ];

  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2] && !isNaN(parseInt(match[2], 10)) ? parseInt(match[2], 10) : 0;

      if (/pm|p\.m|de la tarde/i.test(str) && hours < 12) {
        hours += 12;
      }
      if (/de la noche/i.test(str) && hours < 12) {
        hours += 12;
      }
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

function getNextDayOfWeek(dayIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6): Date {
  const today = new Date();
  const currentDay = getDay(today) as 0 | 1 | 2 | 3 | 4 | 5 | 6;

  if (currentDay === dayIndex) {
    // Si es el mismo día, devolver la próxima semana
    return addDays(today, 7);
  }

  return nextDay(today, dayIndex);
}

function parseFlexibleDate(dateStr: string): Date | null {
  const today = new Date();
  const lowerStr = dateStr.toLowerCase().trim();
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
      const diaPattern = new RegExp(`(?:el\\s+|este\\s+|pr[oó]ximo\\s+)?${dia}`, 'i');
      if (diaPattern.test(lowerStr)) {
        resultDate = getNextDayOfWeek(index as 0 | 1 | 2 | 3 | 4 | 5 | 6);
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

// Funciones para crear en Supabase directamente (servidor)
async function crearTareaEnSupabase(data: {
  titulo: string;
  descripcion?: string;
  prioridad: Prioridad;
  categoria: string;
  fechaLimite?: Date;
}): Promise<number | null> {
  if (!supabase) {
    console.error('Supabase not configured');
    return null;
  }

  const now = new Date();
  const tarea: Tarea = {
    titulo: data.titulo,
    descripcion: data.descripcion,
    prioridad: data.prioridad,
    categoria: data.categoria,
    fechaLimite: data.fechaLimite,
    completada: false,
    orden: Date.now(),
    imagenes: [],
    creadaEn: now,
    actualizadaEn: now,
  };

  const supabaseData = tareaToSupabase(tarea);
  // Remove id since it's auto-generated
  const { id: _, ...dataWithoutId } = supabaseData;

  const { data: result, error } = await supabase
    .from('tareas')
    .insert(dataWithoutId)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating tarea in Supabase:', error);
    return null;
  }

  return result?.id || null;
}

async function crearRecordatorioEnSupabase(data: {
  titulo: string;
  descripcion?: string;
  fechaHora: Date;
  notificarAntes: number[];
}): Promise<number | null> {
  if (!supabase) {
    console.error('Supabase not configured');
    return null;
  }

  const now = new Date();
  const recordatorio: Recordatorio = {
    titulo: data.titulo,
    descripcion: data.descripcion,
    fechaHora: data.fechaHora,
    notificarAntes: data.notificarAntes,
    completado: false,
    notificacionesEnviadas: [],
    exportadoACalendar: false,
    creadoEn: now,
    actualizadoEn: now,
  };

  const supabaseData = recordatorioToSupabase(recordatorio);
  // Remove id since it's auto-generated
  const { id: _, ...dataWithoutId } = supabaseData;

  const { data: result, error } = await supabase
    .from('recordatorios')
    .insert(dataWithoutId)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating recordatorio in Supabase:', error);
    return null;
  }

  return result?.id || null;
}

async function listarTareasDeSupabase(filtro: string, categoria?: string) {
  if (!supabase) return [];

  let query = supabase.from('tareas').select('*').is('parent_id', null);

  if (categoria) {
    query = query.eq('categoria', categoria);
  }

  const today = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  switch (filtro) {
    case 'hoy':
      query = query
        .gte('fecha_limite', today.toISOString())
        .lte('fecha_limite', todayEnd.toISOString());
      break;
    case 'pendientes':
      query = query.eq('completada', false);
      break;
    case 'completadas':
      query = query.eq('completada', true);
      break;
  }

  const { data, error } = await query.order('creada_en', { ascending: false }).limit(10);

  if (error) {
    console.error('Error listing tareas:', error);
    return [];
  }

  return data || [];
}

async function buscarYCompletarTarea(busqueda: string) {
  if (!supabase) return null;

  const { data: tareas, error } = await supabase
    .from('tareas')
    .select('*')
    .eq('completada', false)
    .is('parent_id', null)
    .ilike('titulo', `%${busqueda}%`)
    .limit(5);

  if (error || !tareas || tareas.length === 0) {
    return { found: false, tareas: [] };
  }

  if (tareas.length === 1) {
    // Completar la tarea
    await supabase
      .from('tareas')
      .update({ completada: true, completada_en: new Date().toISOString() })
      .eq('id', tareas[0].id);

    return { found: true, completed: true, tarea: tareas[0] };
  }

  return { found: true, completed: false, tareas };
}

async function listarRecordatoriosDeSupabase(filtro: string) {
  if (!supabase) return [];

  let query = supabase.from('recordatorios').select('*').eq('completado', false);

  const today = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const nextWeek = addDays(new Date(), 7);

  switch (filtro) {
    case 'hoy':
      query = query
        .gte('fecha_hora', today.toISOString())
        .lte('fecha_hora', todayEnd.toISOString());
      break;
    case 'proximos':
      query = query
        .gte('fecha_hora', new Date().toISOString())
        .lte('fecha_hora', nextWeek.toISOString());
      break;
  }

  const { data, error } = await query.order('fecha_hora', { ascending: true }).limit(10);

  if (error) {
    console.error('Error listing recordatorios:', error);
    return [];
  }

  return data || [];
}

export async function executeFunction(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  console.log('[AI Function] Executing:', name, 'with args:', JSON.stringify(args));

  try {
    switch (name) {
      case 'crear_tarea': {
        const fechaLimite = args.fechaLimite
          ? parseFlexibleDate(args.fechaLimite as string)
          : undefined;

        const id = await crearTareaEnSupabase({
          titulo: args.titulo as string,
          descripcion: args.descripcion as string | undefined,
          prioridad: (args.prioridad as Prioridad) || 'media',
          categoria: (args.categoria as string) || 'Personal',
          fechaLimite: fechaLimite || undefined,
        });

        if (!id) {
          return 'Hubo un error al crear la tarea. ¿Podrías intentarlo de nuevo?';
        }

        const fechaStr = fechaLimite
          ? ` para ${format(fechaLimite, "EEEE d 'de' MMMM", { locale: es })}`
          : '';

        return `He creado la tarea "${args.titulo}"${fechaStr}. ¡Ya está en tu lista!`;
      }

      case 'crear_recordatorio': {
        console.log('[crear_recordatorio] Raw fechaHora:', args.fechaHora);
        const fechaHora = parseFlexibleDate(args.fechaHora as string);
        console.log('[crear_recordatorio] Parsed fechaHora:', fechaHora);

        if (!fechaHora) {
          return `No pude entender la fecha "${args.fechaHora}". ¿Podrías decirme de otra forma? Por ejemplo: "martes a las 9" o "mañana a las 14:30"`;
        }

        const recordatorioId = await crearRecordatorioEnSupabase({
          titulo: args.titulo as string,
          descripcion: args.descripcion as string | undefined,
          fechaHora,
          notificarAntes: [0, 15],
        });

        if (!recordatorioId) {
          return 'Hubo un error al crear el recordatorio. ¿Podrías intentarlo de nuevo?';
        }

        return `He creado el recordatorio "${args.titulo}" para ${format(fechaHora, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })}. Te avisaré cuando sea el momento.`;
      }

      case 'listar_tareas': {
        const filtro = (args.filtro as string) || 'pendientes';
        const tareas = await listarTareasDeSupabase(filtro, args.categoria as string | undefined);

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
          .map((t, i) => {
            const estado = t.completada ? '✓' : '○';
            const prioridad = t.prioridad === 'alta' ? '🔴' : t.prioridad === 'media' ? '🟡' : '🟢';
            return `${i + 1}. ${estado} ${prioridad} ${t.titulo}`;
          })
          .join('\n');

        const titulo = filtro === 'hoy' ? 'para hoy' : filtro;
        return `Aquí están tus tareas ${titulo}:\n\n${lista}`;
      }

      case 'completar_tarea': {
        const busqueda = (args.busqueda as string).toLowerCase();
        const resultado = await buscarYCompletarTarea(busqueda);

        if (!resultado || !resultado.found) {
          return `No encontré ninguna tarea pendiente que coincida con "${args.busqueda}". ¿Quieres que busque de otra manera?`;
        }

        if (resultado.completed && resultado.tarea) {
          return `¡Genial! He marcado como completada la tarea "${resultado.tarea.titulo}". ¡Buen trabajo! 🎉`;
        }

        if (resultado.tareas && resultado.tareas.length > 1) {
          const opciones = resultado.tareas
            .slice(0, 5)
            .map((t, i) => `${i + 1}. ${t.titulo}`)
            .join('\n');

          return `Encontré varias tareas que coinciden:\n\n${opciones}\n\n¿Cuál quieres completar? Puedes decirme el número o ser más específico.`;
        }

        return 'No pude completar la tarea. ¿Podrías intentarlo de nuevo?';
      }

      case 'listar_recordatorios': {
        const filtro = (args.filtro as string) || 'proximos';
        const recordatorios = await listarRecordatoriosDeSupabase(filtro);

        if (recordatorios.length === 0) {
          const mensajes: Record<string, string> = {
            hoy: 'No tienes recordatorios para hoy.',
            proximos: 'No tienes recordatorios próximos.',
            todos: 'No tienes ningún recordatorio activo.',
          };
          return mensajes[filtro] || 'No encontré recordatorios con ese filtro.';
        }

        const lista = recordatorios
          .map((r, i) => {
            const fecha = format(new Date(r.fecha_hora), "d/M 'a las' HH:mm", { locale: es });
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
