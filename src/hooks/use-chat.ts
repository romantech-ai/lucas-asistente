'use client';

import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Mensaje, Conversacion } from '@/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useChat(conversacionId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mensajes = useLiveQuery(async () => {
    if (!conversacionId) return [];
    return db.mensajes
      .where('conversacionId')
      .equals(conversacionId)
      .sortBy('creadoEn');
  }, [conversacionId]);

  const sendMessage = useCallback(async (content: string): Promise<string | null> => {
    if (!conversacionId || !content.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      // Save user message
      await db.mensajes.add({
        conversacionId,
        rol: 'user',
        contenido: content,
        creadoEn: new Date(),
      });

      // Get conversation history for context
      const history = await db.mensajes
        .where('conversacionId')
        .equals(conversacionId)
        .sortBy('creadoEn');

      const messages: ChatMessage[] = history.map((m) => ({
        role: m.rol,
        content: m.contenido,
      }));

      // Add current message
      messages.push({ role: 'user', content });

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Save assistant message
      await db.mensajes.add({
        conversacionId,
        rol: 'assistant',
        contenido: data.content,
        creadoEn: new Date(),
      });

      // Update conversation timestamp
      await db.conversaciones.update(conversacionId, {
        actualizadaEn: new Date(),
      });

      return data.content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [conversacionId]);

  return {
    mensajes: mensajes || [],
    sendMessage,
    isLoading,
    error,
  };
}

export function useConversaciones() {
  const conversaciones = useLiveQuery(async () => {
    return db.conversaciones.orderBy('actualizadaEn').reverse().toArray();
  });

  return conversaciones || [];
}

export async function crearConversacion(titulo?: string): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date();

  await db.conversaciones.add({
    id,
    titulo: titulo || `Chat ${new Date().toLocaleDateString('es-ES')}`,
    creadaEn: now,
    actualizadaEn: now,
  });

  return id;
}

export async function eliminarConversacion(id: string): Promise<void> {
  await db.mensajes.where('conversacionId').equals(id).delete();
  await db.conversaciones.delete(id);
}
