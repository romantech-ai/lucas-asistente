'use client';

import { CheckCircle2, Clock, AlertTriangle, ListTodo } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTareasStats } from '@/hooks/use-tareas';
import { useRecordatoriosStats } from '@/hooks/use-recordatorios';

export default function StatsCards() {
  const tareasStats = useTareasStats();
  const recordatoriosStats = useRecordatoriosStats();

  const stats = [
    {
      label: 'Tareas hoy',
      value: tareasStats.hoy,
      icon: ListTodo,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Pendientes',
      value: tareasStats.pendientes,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Completadas',
      value: tareasStats.completadas,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Recordatorios',
      value: recordatoriosStats.hoy,
      icon: AlertTriangle,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      sublabel: 'para hoy',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
