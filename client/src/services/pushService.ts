import authService from './authService';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const buildApiUrl = (path: string): string => `${API_BASE_URL}${path}`;

interface PushPublicKeyResponse {
  publicKey: string;
}

export type NotificationType = 'new_place' | 'route_opening' | 'event' | 'discount' | 'general';

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

const toArrayBuffer = (uint8Array: Uint8Array): ArrayBuffer => {
  return uint8Array.buffer.slice(
    uint8Array.byteOffset,
    uint8Array.byteOffset + uint8Array.byteLength,
  ) as ArrayBuffer;
};

class PushService {
  private ensurePushEnvironment(): void {
    if (typeof window === 'undefined') {
      throw new Error('Push-уведомления доступны только в браузере');
    }

    if (!window.isSecureContext) {
      throw new Error('Push требует HTTPS или localhost. Откройте сайт через http://localhost');
    }

    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker не поддерживается этим браузером');
    }

    if (!('PushManager' in window)) {
      throw new Error('Push API не поддерживается этим браузером');
    }
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    this.ensurePushEnvironment();

    return navigator.serviceWorker.register('/sw.js');
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Уведомления не поддерживаются этим браузером');
    }

    return Notification.requestPermission();
  }

  async getPublicKey(): Promise<string> {
    const response = await fetch(buildApiUrl('/api/push/public-key'));
    if (!response.ok) {
      throw new Error('Не удалось получить публичный ключ push');
    }

    const data = (await response.json()) as PushPublicKeyResponse;
    return data.publicKey;
  }

  async subscribe(): Promise<void> {
    this.ensurePushEnvironment();
    const registration = await this.registerServiceWorker();
    const permission = await this.requestPermission();

    if (permission !== 'granted') {
      throw new Error('Доступ к уведомлениям не выдан');
    }

    const publicKey = await this.getPublicKey();
    if (!publicKey) {
      throw new Error('Публичный ключ push не настроен на сервере');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: toArrayBuffer(urlBase64ToUint8Array(publicKey)),
    });

    const response = await authService.authFetch('/api/push/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error || 'Не удалось сохранить push-подписку');
    }
  }

  async unsubscribe(): Promise<void> {
    this.ensurePushEnvironment();
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    const subscription = await registration?.pushManager.getSubscription();

    if (!subscription) {
      return;
    }

    await authService.authFetch('/api/push/subscriptions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    await subscription.unsubscribe();
  }

  async sendTestNotification(params: {
    type: NotificationType;
    title: string;
    body: string;
    url: string;
  }): Promise<void> {
    const response = await authService.authFetch('/api/push/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error || 'Не удалось отправить push-уведомление');
    }
  }
}

export default new PushService();
