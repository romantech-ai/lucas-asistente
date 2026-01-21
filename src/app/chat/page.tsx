'use client';

import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import Header from '@/components/layout/header';
import ChatInterface from '@/components/chat/chat-interface';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useConversaciones, crearConversacion, eliminarConversacion } from '@/hooks/use-chat';
import ConfirmDialog from '@/components/shared/confirm-dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ChatPage() {
  const conversaciones = useConversaciones();
  const [activeConversacion, setActiveConversacion] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [conversacionToDelete, setConversacionToDelete] = useState<string | null>(null);

  // Select first conversation if none selected (but don't create new ones)
  useEffect(() => {
    if (conversaciones === undefined) return;

    // If we have conversations but none selected, select the first one
    if (conversaciones.length > 0 && !activeConversacion) {
      setActiveConversacion(conversaciones[0].id!);
    }

    // If active conversation was deleted, select another or clear
    if (activeConversacion && conversaciones.length > 0) {
      const exists = conversaciones.some(c => c.id === activeConversacion);
      if (!exists) {
        setActiveConversacion(conversaciones[0].id!);
      }
    }
  }, [conversaciones, activeConversacion]);

  const handleNewConversation = async () => {
    const id = await crearConversacion();
    setActiveConversacion(id);
  };

  const handleDeleteConversation = async () => {
    if (!conversacionToDelete) return;

    await eliminarConversacion(conversacionToDelete);

    if (activeConversacion === conversacionToDelete) {
      const remaining = (conversaciones || []).filter(c => c.id !== conversacionToDelete);
      if (remaining.length > 0) {
        setActiveConversacion(remaining[0].id!);
      } else {
        setActiveConversacion(null);
      }
    }

    setShowDeleteDialog(false);
    setConversacionToDelete(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Chat con Lucas" />

      <div className="flex-1 flex">
        {/* Sidebar for desktop */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/50">
          <div className="p-3 border-b border-border">
            <Button onClick={handleNewConversation} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Nueva conversación
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {(conversaciones || []).map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    'group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                    activeConversacion === conv.id
                      ? 'bg-accent'
                      : 'hover:bg-accent/50'
                  )}
                  onClick={() => setActiveConversacion(conv.id!)}
                >
                  <MessageSquare className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{conv.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(conv.actualizadaEn), 'd MMM', { locale: es })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConversacionToDelete(conv.id!);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Mobile conversation selector */}
        <div className="lg:hidden fixed top-14 left-0 right-0 z-30 bg-background border-b border-border p-2 flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                Conversaciones
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>Conversaciones</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-2">
                <Button onClick={handleNewConversation} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva
                </Button>
                {(conversaciones || []).map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg cursor-pointer',
                      activeConversacion === conv.id
                        ? 'bg-accent'
                        : 'hover:bg-accent/50'
                    )}
                    onClick={() => setActiveConversacion(conv.id!)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm truncate flex-1">{conv.titulo}</span>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Chat interface */}
        <div className="flex-1 pt-12 lg:pt-0">
          {activeConversacion ? (
            <ChatInterface conversacionId={activeConversacion} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay conversaciones</h3>
              <p className="text-muted-foreground mb-4">
                Empieza una nueva conversación con Lucas
              </p>
              <Button onClick={handleNewConversation}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva conversación
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar conversación"
        description="¿Estás seguro de que quieres eliminar esta conversación? Se perderán todos los mensajes."
        confirmText="Eliminar"
        onConfirm={handleDeleteConversation}
        variant="destructive"
      />
    </div>
  );
}
