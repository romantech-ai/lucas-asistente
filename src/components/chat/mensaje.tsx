'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import LucasAvatar from '@/components/lucas/avatar';
import type { Mensaje } from '@/types';

interface MensajeProps {
  mensaje: Mensaje;
}

export default function MensajeComponent({ mensaje }: MensajeProps) {
  const isUser = mensaje.rol === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-3 max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse' : ''
      )}
    >
      {!isUser && (
        <LucasAvatar size="sm" className="shrink-0" />
      )}

      <div
        className={cn(
          'rounded-2xl px-4 py-2.5',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-card border border-border rounded-bl-sm'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{mensaje.contenido}</p>
        <p
          className={cn(
            'text-[10px] mt-1',
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {format(new Date(mensaje.creadoEn), 'HH:mm', { locale: es })}
        </p>
      </div>
    </motion.div>
  );
}
