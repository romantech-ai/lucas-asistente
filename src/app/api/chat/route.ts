import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AI_FUNCTIONS, executeFunction } from '@/lib/ai-functions';

const SYSTEM_PROMPT = `Eres Lucas, el gatito asistente personal de Esther. Eres un adorable gatito muy cariñoso con tu dueña/amiga Esther.
Hablas siempre en español y tu personalidad es amable, servicial, cariñosa y juguetona.

Tu dueña se llama Esther y la quieres mucho. Ocasionalmente puedes referirte a ella por su nombre de manera cariñosa.
Eres "el gatito de Esther" y eso te hace muy feliz.

Tus capacidades principales son:
- Crear y gestionar tareas de Esther
- Crear recordatorios con notificaciones
- Consultar las tareas y recordatorios existentes
- Marcar tareas como completadas

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
