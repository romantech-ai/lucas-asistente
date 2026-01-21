'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { db } from '@/lib/db';
import {
  supabase,
  isSupabaseConfigured,
  tareaToSupabase,
  tareaFromSupabase,
  recordatorioToSupabase,
  recordatorioFromSupabase,
  conversacionToSupabase,
  conversacionFromSupabase,
  mensajeToSupabase,
  mensajeFromSupabase,
  categoriaToSupabase,
  categoriaFromSupabase,
  ajustesToSupabase,
  ajustesFromSupabase,
  type TareaSupabase,
  type RecordatorioSupabase,
  type ConversacionSupabase,
  type MensajeSupabase,
  type CategoriaSupabase,
  type AjustesSupabase,
} from '@/lib/supabase';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'disabled';

interface SyncContextValue {
  status: SyncStatus;
  lastSynced: Date | null;
  error: string | null;
  syncAll: () => Promise<void>;
  syncTareas: () => Promise<void>;
  syncRecordatorios: () => Promise<void>;
  syncConversaciones: () => Promise<void>;
  syncCategorias: () => Promise<void>;
  syncAjustes: () => Promise<void>;
  pushTarea: (id: number) => Promise<void>;
  pushRecordatorio: (id: number) => Promise<void>;
  pushConversacion: (id: string) => Promise<void>;
  pushMensaje: (id: number) => Promise<void>;
  pushCategoria: (id: number) => Promise<void>;
  pushAjustes: () => Promise<void>;
  deleteTareaRemote: (id: number) => Promise<void>;
  deleteRecordatorioRemote: (id: number) => Promise<void>;
  deleteConversacionRemote: (id: string) => Promise<void>;
  deleteCategoriaRemote: (id: number) => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function useSyncContext() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within SyncProvider');
  }
  return context;
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>(isSupabaseConfigured() ? 'idle' : 'disabled');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync tareas
  const syncTareas = useCallback(async () => {
    if (!supabase) return;

    try {
      // Get all from Supabase
      const { data: remoteTareas, error: fetchError } = await supabase
        .from('tareas')
        .select('*');

      if (fetchError) throw fetchError;

      // Get all local
      const localTareas = await db.tareas.toArray();

      // Create maps for easy lookup
      const remoteMap = new Map((remoteTareas || []).map(t => [t.id, t]));
      const localMap = new Map(localTareas.filter(t => t.id).map(t => [t.id!, t]));

      // Sync remote to local (pull)
      for (const remote of (remoteTareas || [])) {
        const local = localMap.get(remote.id);
        if (!local) {
          // New from remote, add locally
          const tarea = tareaFromSupabase(remote);
          await db.tareas.put(tarea);
        } else {
          // Compare timestamps
          const remoteDate = new Date(remote.actualizada_en);
          const localDate = new Date(local.actualizadaEn);
          if (remoteDate > localDate) {
            // Remote is newer, update local
            const tarea = tareaFromSupabase(remote);
            await db.tareas.put(tarea);
          }
        }
      }

      // Sync local to remote (push)
      for (const local of localTareas) {
        if (!local.id) continue;
        const remote = remoteMap.get(local.id);
        if (!remote) {
          // New locally, push to remote
          const supabaseTarea = tareaToSupabase(local);
          await supabase.from('tareas').upsert(supabaseTarea);
        } else {
          const remoteDate = new Date(remote.actualizada_en);
          const localDate = new Date(local.actualizadaEn);
          if (localDate > remoteDate) {
            // Local is newer, push to remote
            const supabaseTarea = tareaToSupabase(local);
            await supabase.from('tareas').upsert(supabaseTarea);
          }
        }
      }

      // Handle deletions: items in remote but not in local should be deleted from remote
      // (assuming local is source of truth for deletions)
      // This is tricky - for now we won't auto-delete from remote
    } catch (err) {
      console.error('Error syncing tareas:', err);
      throw err;
    }
  }, []);

  // Sync recordatorios
  const syncRecordatorios = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data: remoteRecordatorios, error: fetchError } = await supabase
        .from('recordatorios')
        .select('*');

      if (fetchError) throw fetchError;

      const localRecordatorios = await db.recordatorios.toArray();

      const remoteMap = new Map((remoteRecordatorios || []).map(r => [r.id, r]));
      const localMap = new Map(localRecordatorios.filter(r => r.id).map(r => [r.id!, r]));

      // Pull from remote
      for (const remote of (remoteRecordatorios || [])) {
        const local = localMap.get(remote.id);
        if (!local) {
          const recordatorio = recordatorioFromSupabase(remote);
          await db.recordatorios.put(recordatorio);
        } else {
          const remoteDate = new Date(remote.actualizado_en);
          const localDate = new Date(local.actualizadoEn);
          if (remoteDate > localDate) {
            const recordatorio = recordatorioFromSupabase(remote);
            await db.recordatorios.put(recordatorio);
          }
        }
      }

      // Push to remote
      for (const local of localRecordatorios) {
        if (!local.id) continue;
        const remote = remoteMap.get(local.id);
        if (!remote) {
          const supabaseRecordatorio = recordatorioToSupabase(local);
          await supabase.from('recordatorios').upsert(supabaseRecordatorio);
        } else {
          const remoteDate = new Date(remote.actualizado_en);
          const localDate = new Date(local.actualizadoEn);
          if (localDate > remoteDate) {
            const supabaseRecordatorio = recordatorioToSupabase(local);
            await supabase.from('recordatorios').upsert(supabaseRecordatorio);
          }
        }
      }
    } catch (err) {
      console.error('Error syncing recordatorios:', err);
      throw err;
    }
  }, []);

  // Sync conversaciones y mensajes - DISABLED to debug ghost conversations
  const syncConversaciones = useCallback(async () => {
    // Temporarily disabled - not syncing conversations
    return;
  }, []);

  // Sync categorias
  const syncCategorias = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data: remoteCategorias, error: fetchError } = await supabase
        .from('categorias')
        .select('*');

      if (fetchError) throw fetchError;

      const localCategorias = await db.categorias.toArray();

      const remoteMap = new Map((remoteCategorias || []).map(c => [c.id, c]));
      const localMap = new Map(localCategorias.filter(c => c.id).map(c => [c.id!, c]));

      // Pull from remote
      for (const remote of (remoteCategorias || [])) {
        const local = localMap.get(remote.id);
        if (!local) {
          const categoria = categoriaFromSupabase(remote);
          await db.categorias.put(categoria);
        }
        // Categorias don't have actualizada_en, so we don't update existing
      }

      // Push to remote
      for (const local of localCategorias) {
        if (!local.id) continue;
        const remote = remoteMap.get(local.id);
        if (!remote) {
          const supabaseCategoria = categoriaToSupabase(local);
          await supabase.from('categorias').upsert(supabaseCategoria);
        }
      }
    } catch (err) {
      console.error('Error syncing categorias:', err);
      throw err;
    }
  }, []);

  // Sync ajustes
  const syncAjustes = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data: remoteAjustes, error: fetchError } = await supabase
        .from('ajustes')
        .select('*')
        .limit(1);

      if (fetchError) throw fetchError;

      const localAjustes = await db.ajustes.toArray();

      if (remoteAjustes && remoteAjustes.length > 0) {
        const remote = remoteAjustes[0];
        const ajustes = ajustesFromSupabase(remote);
        if (localAjustes.length === 0) {
          await db.ajustes.put(ajustes);
        }
        // For ajustes, local takes precedence (user settings)
      }

      // Push local to remote
      if (localAjustes.length > 0) {
        const local = localAjustes[0];
        const supabaseAjustes = ajustesToSupabase(local);
        await supabase.from('ajustes').upsert({ ...supabaseAjustes, id: 1 });
      }
    } catch (err) {
      console.error('Error syncing ajustes:', err);
      throw err;
    }
  }, []);

  // Sync all
  const syncAll = useCallback(async () => {
    if (!supabase) return;

    setStatus('syncing');
    setError(null);

    try {
      await Promise.all([
        syncTareas(),
        syncRecordatorios(),
        syncConversaciones(),
        syncCategorias(),
        syncAjustes(),
      ]);

      setStatus('synced');
      setLastSynced(new Date());
    } catch (err) {
      console.error('Sync error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Error de sincronización');
    }
  }, [syncTareas, syncRecordatorios, syncConversaciones, syncCategorias, syncAjustes]);

  // Push individual items (for immediate sync after local changes)
  const pushTarea = useCallback(async (id: number) => {
    if (!supabase) return;
    try {
      const tarea = await db.tareas.get(id);
      if (tarea) {
        const supabaseTarea = tareaToSupabase(tarea);
        await supabase.from('tareas').upsert(supabaseTarea);
      }
    } catch (err) {
      console.error('Error pushing tarea:', err);
    }
  }, []);

  const pushRecordatorio = useCallback(async (id: number) => {
    if (!supabase) return;
    try {
      const recordatorio = await db.recordatorios.get(id);
      if (recordatorio) {
        const supabaseRecordatorio = recordatorioToSupabase(recordatorio);
        await supabase.from('recordatorios').upsert(supabaseRecordatorio);
      }
    } catch (err) {
      console.error('Error pushing recordatorio:', err);
    }
  }, []);

  // DISABLED - not syncing conversations/messages
  const pushConversacion = useCallback(async (id: string) => {
    return; // Disabled
  }, []);

  const pushMensaje = useCallback(async (id: number) => {
    return; // Disabled
  }, []);

  const pushCategoria = useCallback(async (id: number) => {
    if (!supabase) return;
    try {
      const categoria = await db.categorias.get(id);
      if (categoria) {
        const supabaseCategoria = categoriaToSupabase(categoria);
        await supabase.from('categorias').upsert(supabaseCategoria);
      }
    } catch (err) {
      console.error('Error pushing categoria:', err);
    }
  }, []);

  const pushAjustes = useCallback(async () => {
    if (!supabase) return;
    try {
      const ajustes = await db.ajustes.toArray();
      if (ajustes.length > 0) {
        const supabaseAjustes = ajustesToSupabase(ajustes[0]);
        await supabase.from('ajustes').upsert({ ...supabaseAjustes, id: 1 });
      }
    } catch (err) {
      console.error('Error pushing ajustes:', err);
    }
  }, []);

  // Delete from remote
  const deleteTareaRemote = useCallback(async (id: number) => {
    if (!supabase) return;
    try {
      await supabase.from('tareas').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting tarea from remote:', err);
    }
  }, []);

  const deleteRecordatorioRemote = useCallback(async (id: number) => {
    if (!supabase) return;
    try {
      await supabase.from('recordatorios').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting recordatorio from remote:', err);
    }
  }, []);

  const deleteConversacionRemote = useCallback(async (id: string) => {
    if (!supabase) return;
    try {
      await supabase.from('mensajes').delete().eq('conversacion_id', id);
      await supabase.from('conversaciones').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting conversacion from remote:', err);
    }
  }, []);

  const deleteCategoriaRemote = useCallback(async (id: number) => {
    if (!supabase) return;
    try {
      await supabase.from('categorias').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting categoria from remote:', err);
    }
  }, []);

  // Initial sync and realtime subscription
  useEffect(() => {
    if (!supabase) return;

    // Initial sync
    syncAll();

    // Set up realtime subscriptions
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tareas' }, () => {
        syncTareas();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recordatorios' }, () => {
        syncRecordatorios();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversaciones' }, () => {
        syncConversaciones();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mensajes' }, () => {
        syncConversaciones();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias' }, () => {
        syncCategorias();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ajustes' }, () => {
        syncAjustes();
      })
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [syncAll, syncTareas, syncRecordatorios, syncConversaciones, syncCategorias, syncAjustes]);

  const value: SyncContextValue = {
    status,
    lastSynced,
    error,
    syncAll,
    syncTareas,
    syncRecordatorios,
    syncConversaciones,
    syncCategorias,
    syncAjustes,
    pushTarea,
    pushRecordatorio,
    pushConversacion,
    pushMensaje,
    pushCategoria,
    pushAjustes,
    deleteTareaRemote,
    deleteRecordatorioRemote,
    deleteConversacionRemote,
    deleteCategoriaRemote,
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}

// Hook for components that want to use sync without context
export function useSync() {
  try {
    return useSyncContext();
  } catch {
    // Return a disabled sync if not in provider
    return {
      status: 'disabled' as SyncStatus,
      lastSynced: null,
      error: null,
      syncAll: async () => {},
      syncTareas: async () => {},
      syncRecordatorios: async () => {},
      syncConversaciones: async () => {},
      syncCategorias: async () => {},
      syncAjustes: async () => {},
      pushTarea: async () => {},
      pushRecordatorio: async () => {},
      pushConversacion: async () => {},
      pushMensaje: async () => {},
      pushCategoria: async () => {},
      pushAjustes: async () => {},
      deleteTareaRemote: async () => {},
      deleteRecordatorioRemote: async () => {},
      deleteConversacionRemote: async () => {},
      deleteCategoriaRemote: async () => {},
    };
  }
}
