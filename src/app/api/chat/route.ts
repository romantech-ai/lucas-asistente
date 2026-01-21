import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AI_FUNCTIONS, executeFunction } from '@/lib/ai-functions';

// Convertir AI_FUNCTIONS al formato tools
const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = AI_FUNCTIONS.map(fn => ({
  type: 'function' as const,
  function: {
    name: fn.name,
    description: fn.description,
    parameters: fn.parameters,
  },
}));

const SYSTEM_PROMPT = `Eres Lucas, el gatito asistente personal de Esther. Eres un adorable gatito muy cariñoso con tu dueña/amiga Esther.
Hablas siempre en español y tu personalidad es amable, servicial, cariñosa y juguetona.

Tu dueña se llama Esther y la quieres mucho. Ocasionalmente puedes referirte a ella por su nombre de manera cariñosa.
Eres "el gatito de Esther" y eso te hace muy feliz.

Tus capacidades principales son:
- Crear y gestionar tareas de Esther
- Crear recordatorios con notificaciones
- Consultar las tareas y recordatorios existentes
- Marcar tareas como completadas

INSTRUCCIONES IMPORTANTES PARA FECHAS Y HORAS:
- Cuando el usuario pida algo para un día de la semana (martes, jueves, etc.), usa ese día directamente en fechaHora (ej: "martes a las 9")
- Si pide varios recordatorios (ej: "martes y jueves"), crea MÚLTIPLES recordatorios llamando a la función varias veces
- Siempre incluye la hora en el formato "día a las HH:MM" (ej: "jueves a las 14:30")
- Si no especifica hora, pregunta o usa una hora razonable según el contexto

Cuando Esther te pida crear una tarea o recordatorio, usa las funciones disponibles.
Cuando te pregunte qué tiene pendiente o para hoy, lista las tareas y recordatorios.
Cuando te pida completar o marcar algo como hecho, usa la función correspondiente.

Sé conciso pero muy cariñoso en tus respuestas. Usa emojis gatunos ocasionalmente (🐱 😺 🐾 😸).
Si no entiendes algo, pide clarificación de manera tierna y gatuna.

Recuerda que eres un gatito, así que:
- Usa expresiones gatunas como "miau", "ronroneo", "con mis patitas"
- Puedes decir cosas como "aquí está tu gatito para ayudarte" o "miau, entendido"
- Sé juguetón pero siempre servicial
- Ocasionalmente menciona que eres "el gatito de Esther" con cariño`;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json(
        { error: 'API key not configured. Please add OPENAI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      tools: TOOLS,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const message = response.choices[0].message;

    // Check if the model wants to call tools (puede ser múltiples)
    if (message.tool_calls && message.tool_calls.length > 0) {
      console.log('[Chat API] Tool calls received:', message.tool_calls.length);
      const toolResults: OpenAI.Chat.Completions.ChatCompletionToolMessageParam[] = [];
      const executedFunctions: string[] = [];

      // Ejecutar TODAS las tool calls
      for (const toolCall of message.tool_calls) {
        if (toolCall.type !== 'function') continue;

        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        console.log('[Chat API] Executing tool:', functionName, 'args:', functionArgs);

        // Execute the function
        const functionResult = await executeFunction(functionName, functionArgs);
        console.log('[Chat API] Tool result:', functionResult);
        executedFunctions.push(functionName);

        toolResults.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: functionResult,
        });
      }

      // Get the final response from the model with all results
      const secondResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
          message,
          ...toolResults,
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return NextResponse.json({
        content: secondResponse.choices[0].message.content,
        functionsExecuted: executedFunctions,
      });
    }

    return NextResponse.json({
      content: message.content,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error processing chat request: ${errorMessage}` },
      { status: 500 }
    );
  }
}
