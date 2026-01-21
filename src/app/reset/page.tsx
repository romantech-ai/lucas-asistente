'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ResetPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    setStatus('loading');
    setMessage('Limpiando...');

    try {
      // 1. Clear local IndexedDB
      await db.mensajes.clear();
      await db.conversaciones.clear();
      setMessage('IndexedDB local limpiado...');

      // 2. Clear Supabase
      const response = await fetch('/api/cleanup-empty-chats', { method: 'POST' });
      const data = await response.json();

      if (data.success || data.deleted === 0) {
        setStatus('success');
        setMessage(`Listo! Eliminadas ${data.deleted || 0} conversaciones de Supabase y todas las locales.`);
      } else if (data.error) {
        setStatus('success'); // Local still cleaned
        setMessage(`IndexedDB limpiado. Supabase: ${data.error}`);
      } else {
        setStatus('success');
        setMessage('Todo limpiado correctamente.');
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Reset de Conversaciones</h1>
          <p className="text-muted-foreground">
            Esto eliminará TODAS las conversaciones y mensajes del chat, tanto localmente como en Supabase.
          </p>
        </div>

        {status === 'idle' && (
          <Button onClick={handleReset} variant="destructive" size="lg" className="w-full">
            <Trash2 className="w-5 h-5 mr-2" />
            Eliminar todas las conversaciones
          </Button>
        )}

        {status === 'loading' && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{message}</span>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>{message}</span>
            </div>
            <Button onClick={() => window.location.href = '/chat'} className="w-full">
              Ir al Chat
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{message}</span>
            </div>
            <Button onClick={handleReset} variant="outline" className="w-full">
              Reintentar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
