'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useSync, type SyncStatus } from '@/hooks/use-sync';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const statusConfig: Record<SyncStatus, {
  icon: React.ReactNode;
  label: string;
  color: string;
}> = {
  idle: {
    icon: <Cloud className="w-4 h-4" />,
    label: 'Listo para sincronizar',
    color: 'text-muted-foreground',
  },
  syncing: {
    icon: <RefreshCw className="w-4 h-4 animate-spin" />,
    label: 'Sincronizando...',
    color: 'text-blue-500',
  },
  synced: {
    icon: <Check className="w-4 h-4" />,
    label: 'Sincronizado',
    color: 'text-green-500',
  },
  error: {
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'Error de sincronización',
    color: 'text-red-500',
  },
  disabled: {
    icon: <CloudOff className="w-4 h-4" />,
    label: 'Sincronización deshabilitada',
    color: 'text-muted-foreground/50',
  },
};

interface SyncStatusProps {
  showLabel?: boolean;
  className?: string;
}

export function SyncStatusIndicator({ showLabel = false, className }: SyncStatusProps) {
  const { status, lastSynced, error, syncAll } = useSync();
  const [isHovered, setIsHovered] = useState(false);

  const config = statusConfig[status];

  const handleClick = () => {
    if (status !== 'disabled' && status !== 'syncing') {
      syncAll();
    }
  };

  const formatLastSynced = () => {
    if (!lastSynced) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - lastSynced.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;

    return lastSynced.toLocaleDateString('es-ES');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={status === 'disabled' || status === 'syncing'}
            className={cn(
              'gap-2 px-2 h-8',
              config.color,
              className
            )}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={status}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                {config.icon}
              </motion.span>
            </AnimatePresence>
            {showLabel && (
              <span className="text-xs hidden sm:inline">
                {status === 'synced' ? formatLastSynced() : config.label}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{config.label}</p>
            {status === 'synced' && lastSynced && (
              <p className="text-xs text-muted-foreground">
                Última sincronización: {formatLastSynced()}
              </p>
            )}
            {status === 'error' && error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
            {status === 'disabled' && (
              <p className="text-xs text-muted-foreground">
                Configura Supabase en .env.local para habilitar
              </p>
            )}
            {status !== 'disabled' && status !== 'syncing' && (
              <p className="text-xs text-muted-foreground">
                Click para sincronizar manualmente
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function SyncStatusBadge() {
  const { status } = useSync();
  const config = statusConfig[status];

  if (status === 'disabled') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'fixed top-2 right-2 z-50 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
        'bg-background/80 backdrop-blur-sm border shadow-sm',
        config.color
      )}
    >
      {config.icon}
      <span className="hidden sm:inline">{status === 'synced' ? 'Sincronizado' : config.label}</span>
    </motion.div>
  );
}
