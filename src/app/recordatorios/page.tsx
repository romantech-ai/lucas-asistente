'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import RecordatorioList from '@/components/recordatorios/recordatorio-list';
import RecordatorioForm from '@/components/recordatorios/recordatorio-form';
import FAB from '@/components/shared/fab';
import type { Recordatorio } from '@/types';

export default function RecordatoriosPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecordatorio, setEditingRecordatorio] = useState<Recordatorio | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleEdit = (recordatorio: Recordatorio) => {
    setEditingRecordatorio(recordatorio);
    setFormOpen(true);
  };

  const handleNewRecordatorio = () => {
    setEditingRecordatorio(null);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Recordatorios"
        showSearch
        onSearch={setSearchQuery}
      />

      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        <RecordatorioList
          onEdit={handleEdit}
          searchQuery={searchQuery}
        />
      </div>

      <FAB onClick={handleNewRecordatorio} />

      <RecordatorioForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingRecordatorio(null);
        }}
        recordatorio={editingRecordatorio}
      />
    </div>
  );
}
