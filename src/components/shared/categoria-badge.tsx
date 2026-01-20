'use client';

import { Badge } from '@/components/ui/badge';
import { useCategorias } from '@/hooks/use-categorias';

interface CategoriaBadgeProps {
  categoria: string;
  className?: string;
}

export default function CategoriaBadge({ categoria, className }: CategoriaBadgeProps) {
  const categorias = useCategorias();
  const cat = categorias.find(c => c.nombre === categoria);
  const color = cat?.color || '#6B7280';

  return (
    <Badge
      variant="outline"
      className={className}
      style={{
        borderColor: color,
        color: color,
        backgroundColor: `${color}15`,
      }}
    >
      {categoria}
    </Badge>
  );
}
