export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

export async function showNotification(
  title: string,
  body: string,
  options?: {
    tag?: string;
    data?: Record<string, unknown>;
  }
): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.log('Notification permission not granted');
    return;
  }

  // Try using the service worker first
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;

    if (registration.active) {
      registration.active.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        tag: options?.tag,
        data: options?.data,
      });
      return;
    }
  }

  // Fallback to regular notification API
  new Notification(title, {
    body,
    icon: '/icons/icon-192.png',
    tag: options?.tag,
  });
}

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

// Detectar si la app está instalada como PWA
export function isPWAInstalled(): boolean {
  // Check display-mode media query (works on most platforms)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // iOS Safari specific check
  if ('standalone' in window.navigator) {
    return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  }

  return false;
}

// Detectar si es iOS
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) ||
    (userAgent.includes('mac') && 'ontouchend' in document);
}

// Obtener versión de iOS (retorna null si no es iOS)
export function getIOSVersion(): number | null {
  if (!isIOS()) return null;

  const userAgent = window.navigator.userAgent;
  const match = userAgent.match(/OS (\d+)_/);

  if (match && match[1]) {
    return parseInt(match[1], 10);
  }

  return null;
}

// Tipo para los detalles de soporte de notificaciones
export type NotificationSupportReason =
  | 'supported'
  | 'unsupported'
  | 'ios-not-installed'
  | 'ios-old-version'
  | 'denied';

export interface NotificationSupportDetails {
  supported: boolean;
  reason: NotificationSupportReason;
  message: string;
}

// Obtener información detallada del soporte de notificaciones
export function getNotificationSupportDetails(): NotificationSupportDetails {
  // Check if it's iOS
  if (isIOS()) {
    const iosVersion = getIOSVersion();

    // iOS 16.4+ is required for Web Push
    if (iosVersion !== null && iosVersion < 16) {
      return {
        supported: false,
        reason: 'ios-old-version',
        message: 'Actualiza a iOS 16.4 o superior para recibir notificaciones',
      };
    }

    // iOS requires PWA to be installed for push notifications
    if (!isPWAInstalled()) {
      return {
        supported: false,
        reason: 'ios-not-installed',
        message: 'Instala Lucas en tu pantalla de inicio para recibir notificaciones',
      };
    }
  }

  // General notification support check
  if (!('Notification' in window)) {
    return {
      supported: false,
      reason: 'unsupported',
      message: 'Tu navegador no soporta notificaciones push',
    };
  }

  // Check if permission was denied
  if (Notification.permission === 'denied') {
    return {
      supported: false,
      reason: 'denied',
      message: 'Las notificaciones están bloqueadas. Actívalas en los ajustes de tu navegador.',
    };
  }

  return {
    supported: true,
    reason: 'supported',
    message: 'Las notificaciones están disponibles',
  };
}
