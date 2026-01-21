'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ResetPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Check if we just completed a reset
  useEffect(() => {
    const resetDone = localStorage.getItem('reset_complete');
    if (resetDone) {
      localStorage.removeItem('reset_complete');
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
      const data = await response.json();

      setMessage('Limpiando base de datos local...');

      // 2. Delete the entire IndexedDB database
      const databases = await window.indexedDB.databases();
      for (const dbInfo of databases) {
        if (dbInfo.name) {
          window.indexedDB.deleteDatabase(dbInfo.name);
        }
      }

      // 3. Clear all localStorage except essential items
      localStorage.clear();

      // 4. Mark reset as complete and reload
      localStorage.setItem('reset_complete', 'true');

      setMessage('Recargando...');

      // 5. Hard reload to clear all React state and caches
      setTimeout(() => {
        window.location.href = '/reset?t=' + Date.now();
      }, 500);

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
