'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/use-chat';
import MensajeComponent from './mensaje';
import ChatInput from './chat-input';
import LucasAvatar from '@/components/lucas/avatar';

interface ChatInterfaceProps {
  conversacionId: string;
}

export default function ChatInterface({ conversacionId }: ChatInterfaceProps) {
  const { mensajes, sendMessage, isLoading, error } = useChat(conversacionId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes]);

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150" />
              <LucasAvatar size="xl" animate mood="excited" />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <h2 className="text-2xl font-bold gradient-text mb-2">¡Hola Esther! Soy Lucas 🐱</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Tu gatito asistente personal 🐾 Estoy aquí para ayudarte a gestionar
                tus tareas y recordatorios. ¡Miau! ¡Pregúntame lo que necesites!
              </p>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap justify-center gap-3"
            >
              {[
                { text: '¿Qué tengo para hoy?', icon: '📋' },
                { text: 'Crear una tarea', icon: '✨' },
                { text: 'Recordarme algo', icon: '🔔' },
              ].map((suggestion, i) => (
                <motion.button
                  key={suggestion.text}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  onClick={() => handleSend(suggestion.text)}
                  className="px-4 py-2 text-sm bg-card/50 border border-border rounded-xl hover:bg-accent hover:border-primary/30 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <span>{suggestion.icon}</span>
                  <span>{suggestion.text}</span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {mensajes.map((mensaje) => (
                <MensajeComponent key={mensaje.id} mensaje={mensaje} />
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <LucasAvatar size="sm" mood="thinking" />
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <motion.div
                      className="flex gap-1"
                      initial="start"
                      animate="end"
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{
                            y: [0, -6, 0],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </motion.div>
                    <span className="text-sm ml-1">Pensando... 🐾</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-center"
          >
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}
      </ScrollArea>

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
