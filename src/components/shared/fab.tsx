'use client';

import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FABProps {
  onClick: () => void;
  className?: string;
}

export default function FAB({ onClick, className }: FABProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40',
        className
      )}
    >
      <Button
        onClick={onClick}
        size="lg"
        className="w-14 h-14 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </motion.div>
  );
}
