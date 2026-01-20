'use client';

import { Badge } from '@/components/ui/badge';
import { PRIORIDAD_CONFIG, type Prioridad } from '@/types';

interface PrioridadBadgeProps {
  prioridad: Prioridad;
  className?: string;
}

export default function PrioridadBadge({ prioridad, className }: PrioridadBadgeProps) {
  const config = PRIORIDAD_CONFIG[prioridad];

  return (
    <Badge
      variant="outline"
      className={className}
      style={{
        borderColor: config.color,
        color: config.color,
        backgroundColor: `${config.color}15`,
      }}
    >
      {config.label}
    </Badge>
  );
}
