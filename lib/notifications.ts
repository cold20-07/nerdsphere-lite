/**
 * Notification management for nerdsphere chat
 * Handles permission requests and sending notifications
 */

const NOTIFICATION_SENT_KEY = 'nerdsphere_notification_sent';

/**
 * Check if notifications are supported in this browser
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Check if a notification has already been sent while user was away
 */
export function hasNotificationBeenSent(): boolean {
  return localStorage.getItem(NOTIFICATION_SENT_KEY) === 'true';
}

/**
 * Mark that a notification has been sent
 */
export function markNotificationSent(): void {
  localStorage.setItem(NOTIFICATION_SENT_KEY, 'true');
}

/**
 * Reset notification flag (call when user returns to app)
 */
export function resetNotificationFlag(): void {
  localStorage.removeItem(NOTIFICATION_SENT_KEY);
}

/**
 * Send a notification about new messages
 * Only sends if permission granted and notification hasn't been sent yet
 */
export function sendNewMessageNotification(): void {
  if (!isNotificationSupported()) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  if (hasNotificationBeenSent()) {
    return;
  }

  try {
    new Notification('nerdsphere chat', {
      body: 'new messages in nerdsphere',
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      tag: 'nerdsphere-new-messages',
      requireInteraction: false,
      silent: false,
    });

    markNotificationSent();
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Check if user is currently active (tab visible)
 */
export function isUserActive(): boolean {
  return document.visibilityState === 'visible';
}
