'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sparkles } from 'lucide-react';
import Header from '@/components/layout/header';
import StatsCards from '@/components/dashboard/stats-cards';
import TareasHoy from '@/components/dashboard/tareas-hoy';
import TareasPendientes from '@/components/dashboard/tareas-pendientes';
import VistaSemanal from '@/components/dashboard/vista-semanal';
import RecordatoriosProximos from '@/components/dashboard/recordatorios-proximos';
import Celebracion from '@/components/lucas/celebracion';
import LucasAvatar from '@/components/lucas/avatar';

function getGreeting(hour: number): string {
  if (hour < 6) return '¡Buenas noches, Esther! 😺';
  if (hour < 12) return '¡Buenos días, Esther! 🐱';
  if (hour < 19) return '¡Buenas tardes, Esther! 😸';
  return '¡Buenas noches, Esther! 😺';
}

function getLucasMood(hour: number): 'happy' | 'thinking' | 'sleeping' | 'excited' {
  if (hour < 6 || hour >= 23) return 'sleeping';
  if (hour >= 6 && hour < 9) return 'thinking';
  if (hour >= 9 && hour < 18) return 'happy';
  return 'happy';
}

export default function DashboardPage() {
  const [showCelebracion, setShowCelebracion] = useState(false);
  const today = new Date();
  const hour = today.getHours();

  const greeting = useMemo(() => getGreeting(hour), [hour]);
  const mood = useMemo(() => getLucasMood(hour), [hour]);

  const handleComplete = useCallback(() => {
    setShowCelebracion(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen">
      <Header title="Inicio" />

      <motion.div
        className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome section */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-border p-6"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex items-center gap-5">
            <LucasAvatar size="lg" animate mood={mood} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl lg:text-3xl font-bold gradient-text">
                  {greeting}
                </h1>
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-lg text-foreground/90">
                {format(today, "EEEE", { locale: es }).charAt(0).toUpperCase() +
                  format(today, "EEEE", { locale: es }).slice(1)},{' '}
                {format(today, "d 'de' MMMM", { locale: es })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {mood === 'sleeping'
                  ? 'Lucas está dormidito... 💤 pero siempre listo para ti, Esther 🐾'
                  : mood === 'thinking'
                  ? 'Lucas se está despertando para ti... ¡miau! 🐾'
                  : '¿En qué te puedo ayudar hoy? 🐾'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants}>
          <StatsCards />
        </motion.div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="space-y-6">
            <TareasHoy onComplete={handleComplete} />
            <RecordatoriosProximos />
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-6">
            <VistaSemanal />
            <TareasPendientes onComplete={handleComplete} />
          </motion.div>
        </div>
      </motion.div>

      <Celebracion
        show={showCelebracion}
        onComplete={() => setShowCelebracion(false)}
      />
    </div>
  );
}
