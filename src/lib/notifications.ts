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
