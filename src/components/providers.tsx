'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { initializeDb } from '@/lib/db';
import { registerServiceWorker } from '@/lib/notifications';
import { useNotificationChecker } from '@/hooks/use-notification-checker';
import { SyncProvider } from '@/hooks/use-sync';
import LucasAvatar from '@/components/lucas/avatar';

function NotificationProvider({ children }: { children: React.ReactNode }) {
  useNotificationChecker();
  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative text-center"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <LucasAvatar size="xl" mood="sleeping" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <h2 className="text-xl font-semibold gradient-text">Lucas 🐱</h2>
          <p className="text-sm text-muted-foreground mt-1">Despertando para Esther... 🐾</p>
        </motion.div>

        <motion.div
          className="flex justify-center gap-1 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeDb();
      await registerServiceWorker();
      setIsDbReady(true);
    };

    init();
  }, []);

  if (!isDbReady) {
    return <LoadingScreen />;
  }

  return (
    <SyncProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </SyncProvider>
  );
}
