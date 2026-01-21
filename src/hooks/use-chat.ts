'use client';

import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useSync } from '@/hooks/use-sync';
import type { Mensaje, Conversacion } from '@/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useChat(conversacionId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pushConversacion, pushMensaje } = useSync();

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
      const userMsgId = await db.mensajes.add({
        conversacionId,
        rol: 'user',
        contenido: content,
        creadoEn: new Date(),
      });

      // Sync user message to Supabase
      pushMensaje(userMsgId as number);

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
      const assistantMsgId = await db.mensajes.add({
        conversacionId,
        rol: 'assistant',
        contenido: data.content,
        creadoEn: new Date(),
      });

      // Sync assistant message to Supabase
      pushMensaje(assistantMsgId as number);

      // Update conversation timestamp
      await db.conversaciones.update(conversacionId, {
        actualizadaEn: new Date(),
      });

      // Sync conversation update to Supabase
      pushConversacion(conversacionId);

      return data.content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [conversacionId, pushMensaje, pushConversacion]);

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

  // Return undefined while loading, empty array when loaded but empty
  return conversaciones;
}

export function useChatActions() {
  const { pushConversacion, deleteConversacionRemote } = useSync();

  const crearConversacion = async (titulo?: string): Promise<string> => {
    const id = crypto.randomUUID();
    const now = new Date();

    await db.conversaciones.add({
      id,
      titulo: titulo || `Chat ${new Date().toLocaleDateString('es-ES')}`,
      creadaEn: now,
      actualizadaEn: now,
    });

    // Sync to Supabase
    pushConversacion(id);

    return id;
  };

  const eliminarConversacion = async (id: string): Promise<void> => {
    await db.mensajes.where('conversacionId').equals(id).delete();
    await db.conversaciones.delete(id);

    // Delete from Supabase
    deleteConversacionRemote(id);
  };

  return { crearConversacion, eliminarConversacion };
}

// Standalone functions for backward compatibility (without sync)
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
