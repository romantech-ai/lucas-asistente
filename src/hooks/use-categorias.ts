'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Categoria } from '@/types';

export function useCategorias() {
  const categorias = useLiveQuery(async () => {
    return db.categorias.orderBy('orden').toArray();
  });

  return categorias || [];
}

export async function crearCategoria(
  categoria: Omit<Categoria, 'id' | 'esDefault' | 'orden'>
): Promise<number> {
  const count = await db.categorias.count();

  const id = await db.categorias.add({
    ...categoria,
    esDefault: false,
    orden: count,
  } as Categoria);

  return id as number;
}

export async function actualizarCategoria(
  id: number,
  cambios: Partial<Categoria>
): Promise<void> {
  await db.categorias.update(id, cambios);
}

export async function eliminarCategoria(id: number): Promise<void> {
  const categoria = await db.categorias.get(id);
  if (categoria?.esDefault) {
    throw new Error('No se pueden eliminar categorías predeterminadas');
  }
  await db.categorias.delete(id);
}

export function getCategoriaColor(categorias: Categoria[], nombre: string): string {
  const categoria = categorias.find(c => c.nombre === nombre);
  return categoria?.color || '#6B7280';
}
