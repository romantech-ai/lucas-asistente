'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Dexie from 'dexie';

export default function ResetPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Check if we just completed a reset
  useEffect(() => {
    const resetDone = sessionStorage.getItem('reset_complete');
    if (resetDone) {
      sessionStorage.removeItem('reset_complete');
      setStatus('success');
      setMessage('Todo limpiado correctamente!');
    }
  }, []);

  const handleReset = async () => {
    setStatus('loading');
    setMessage('Limpiando Supabase...');

    try {
      // 1. Clear Supabase FIRST
      const response = await fetch('/api/cleanup-empty-chats', { method: 'POST' });
      await response.json();

      setMessage('Eliminando base de datos local...');

      // 2. Delete IndexedDB using Dexie (more reliable)
      await Dexie.delete('LucasAsistente');

      // 3. Also try the native API as backup
      try {
        window.indexedDB.deleteDatabase('LucasAsistente');
      } catch (e) {
        // Ignore
      }

      // 4. Clear storage
      localStorage.clear();
      sessionStorage.setItem('reset_complete', 'true');

      setMessage('Recargando...');

      // 5. Hard reload
      setTimeout(() => {
        window.location.replace('/reset');
      }, 300);

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
