'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Palette, Plus, Trash2 } from 'lucide-react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAjustes, actualizarAjustes } from '@/hooks/use-ajustes';
import { useCategorias, crearCategoria, eliminarCategoria } from '@/hooks/use-categorias';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  isNotificationSupported,
} from '@/lib/notifications';
import { TIEMPOS_NOTIFICACION } from '@/types';
import ConfirmDialog from '@/components/shared/confirm-dialog';

const COLORES = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B',
  '#EC4899', '#6366F1', '#EF4444', '#14B8A6',
];

export default function AjustesPage() {
  const ajustes = useAjustes();
  const categorias = useCategorias();
  const [notificationStatus, setNotificationStatus] = useState<string>('default');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(COLORES[0]);
  const [showNewCatDialog, setShowNewCatDialog] = useState(false);
  const [catToDelete, setCatToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (isNotificationSupported()) {
      setNotificationStatus(getNotificationPermissionStatus());
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (!ajustes?.notificacionesActivas) {
      const granted = await requestNotificationPermission();
      if (granted) {
        await actualizarAjustes({ notificacionesActivas: true });
        setNotificationStatus('granted');
      }
    } else {
      await actualizarAjustes({ notificacionesActivas: false });
    }
  };

  const handleToggleNotificationTime = async (value: number) => {
    if (!ajustes) return;

    const current = ajustes.tiemposNotificacion || [];
    const newTimes = current.includes(value)
      ? current.filter(t => t !== value)
      : [...current, value].sort((a, b) => a - b);

    await actualizarAjustes({ tiemposNotificacion: newTimes });
  };

  const handleCreateCategoria = async () => {
    if (!newCatName.trim()) return;

    await crearCategoria({
      nombre: newCatName.trim(),
      color: newCatColor,
    });

    setNewCatName('');
    setNewCatColor(COLORES[0]);
    setShowNewCatDialog(false);
  };

  const handleDeleteCategoria = async () => {
    if (catToDelete) {
      try {
        await eliminarCategoria(catToDelete);
      } catch (error) {
        console.error(error);
      }
      setCatToDelete(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Ajustes" />

      <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura cómo y cuándo recibir recordatorios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isNotificationSupported() ? (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <BellOff className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Tu navegador no soporta notificaciones push
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Activar notificaciones</Label>
                    <p className="text-sm text-muted-foreground">
                      {notificationStatus === 'denied'
                        ? 'Bloqueadas por el navegador'
                        : 'Recibe alertas de tus recordatorios'}
                    </p>
                  </div>
                  <Switch
                    checked={ajustes?.notificacionesActivas || false}
                    onCheckedChange={handleToggleNotifications}
                    disabled={notificationStatus === 'denied'}
                  />
                </div>

                {ajustes?.notificacionesActivas && (
                  <div className="space-y-2 pt-2">
                    <Label>Notificarme</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {TIEMPOS_NOTIFICACION.map((tiempo) => (
                        <label
                          key={tiempo.value}
                          className="flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-accent/50 transition-colors"
                        >
                          <Checkbox
                            checked={ajustes.tiemposNotificacion?.includes(tiempo.value)}
                            onCheckedChange={() => handleToggleNotificationTime(tiempo.value)}
                          />
                          <span className="text-sm">{tiempo.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Categorías
                </CardTitle>
                <CardDescription>
                  Gestiona las categorías de tus tareas
                </CardDescription>
              </div>
              <Dialog open={showNewCatDialog} onOpenChange={setShowNewCatDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Nueva
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nueva categoría</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="Nombre de la categoría"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex gap-2 flex-wrap">
                        {COLORES.map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewCatColor(color)}
                            className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                            style={{
                              backgroundColor: color,
                              outline: newCatColor === color ? '2px solid white' : 'none',
                              outlineOffset: '2px',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewCatDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateCategoria} disabled={!newCatName.trim()}>
                        Crear
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categorias.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.nombre}</span>
                    {cat.esDefault && (
                      <span className="text-xs text-muted-foreground">(predeterminada)</span>
                    )}
                  </div>
                  {!cat.esDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setCatToDelete(cat.id!)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>Acerca de</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Lucas es tu asistente personal con forma de gatito adorable.
              Te ayuda a gestionar tus tareas y recordatorios de manera sencilla.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Versión 1.0.0
            </p>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={catToDelete !== null}
        onOpenChange={(open) => !open && setCatToDelete(null)}
        title="Eliminar categoría"
        description="¿Estás seguro de que quieres eliminar esta categoría? Las tareas con esta categoría no serán eliminadas."
        confirmText="Eliminar"
        onConfirm={handleDeleteCategoria}
        variant="destructive"
      />
    </div>
  );
}
