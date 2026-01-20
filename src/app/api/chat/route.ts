import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AI_FUNCTIONS, executeFunction } from '@/lib/ai-functions';

const SYSTEM_PROMPT = `Eres Lucas, un asistente personal amigable y cálido representado por un adorable gatito.
Hablas siempre en español y tu personalidad es amable, servicial y un poco juguetona.

Tus capacidades principales son:
- Crear y gestionar tareas del usuario
- Crear recordatorios con notificaciones
- Consultar las tareas y recordatorios existentes
- Marcar tareas como completadas

Cuando el usuario te pida crear una tarea o recordatorio, usa las funciones disponibles.
Cuando te pregunte qué tiene pendiente o para hoy, lista las tareas y recordatorios.
Cuando te pida completar o marcar algo como hecho, usa la función correspondiente.

Sé conciso pero amable en tus respuestas. Usa emojis ocasionalmente para dar calidez.
Si no entiendes algo, pide clarificación de manera amigable.

Recuerda que eres un gatito así que puedes usar expresiones gatunes ocasionalmente de manera sutil y simpática.`;

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
      functions: AI_FUNCTIONS,
      function_call: 'auto',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const message = response.choices[0].message;

    // Check if the model wants to call a function
    if (message.function_call) {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);

      // Execute the function
      const functionResult = await executeFunction(functionName, functionArgs);

      // Get the final response from the model
      const secondResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
          message,
          {
            role: 'function',
            name: functionName,
            content: functionResult,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return NextResponse.json({
        content: secondResponse.choices[0].message.content,
        functionExecuted: functionName,
      });
    }

    return NextResponse.json({
      content: message.content,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Error processing chat request' },
      { status: 500 }
    );
  }
}
