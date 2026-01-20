'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/layout/header';
import TareaList from '@/components/tareas/tarea-list';
import TareaForm from '@/components/tareas/tarea-form';
import FAB from '@/components/shared/fab';
import Celebracion from '@/components/lucas/celebracion';
import type { Tarea } from '@/types';

export default function TareasPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTarea, setEditingTarea] = useState<Tarea | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCelebracion, setShowCelebracion] = useState(false);

  const handleEdit = (tarea: Tarea) => {
    setEditingTarea(tarea);
    setFormOpen(true);
  };

  const handleNewTarea = () => {
    setEditingTarea(null);
    setFormOpen(true);
  };

  const handleComplete = useCallback(() => {
    setShowCelebracion(true);
  }, []);

  return (
    <div className="min-h-screen">
      <Header
        title="Tareas"
        showSearch
        onSearch={setSearchQuery}
      />

      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        <TareaList
          onEdit={handleEdit}
          onComplete={handleComplete}
          searchQuery={searchQuery}
        />
      </div>

      <FAB onClick={handleNewTarea} />

      <TareaForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTarea(null);
        }}
        tarea={editingTarea}
      />

      <Celebracion
        show={showCelebracion}
        onComplete={() => setShowCelebracion(false)}
      />
    </div>
  );
}
