# PWA & Notifications Implementation

## Features Added

### 1. Progressive Web App (PWA)
- **Installable**: Users can install nerdsphere as an app on their device
- **No offline support**: App requires internet connection (by design)
- **Service worker**: Minimal SW for installability only
- **Manifest**: Defines app metadata, icons, and theme colors
- **Install prompt**: Shows after 3 seconds if browser supports PWA install

### 2. Push Notifications
- **Smart notifications**: Only one notification per inactive session
- **Anti-spam logic**: 
  - User leaves tab/closes app → gets notified on next new message
  - Multiple messages while away → still just ONE notification
  - User returns → notification flag resets
- **No tracking**: Everything is client-side using Page Visibility API
- **Permission prompt**: Shows after 5 seconds on first visit

## Files Created

### Core Logic
- `lib/notifications.ts` - Notification management and permission handling
- `lib/pwa.ts` - PWA installation utilities and service worker registration
- `public/sw.js` - Minimal service worker (no caching)
- `public/manifest.json` - PWA manifest with app metadata

### Assets
- `public/icon-192.svg` - App icon (192x192)
- `public/icon-512.svg` - App icon (512x512)
- `scripts/generate-icons.js` - Icon generation script

## How It Works

### Notification Flow
1. User grants notification permission (optional prompt)
2. App tracks if user is active using `document.visibilityState`
3. When user becomes inactive (tab hidden/closed):
   - Flag `notification_sent = false` in localStorage
4. Polling detects new messages while user is inactive:
   - Sends ONE notification
   - Sets `notification_sent = true`
5. User returns to app:
   - Resets flag to `false`
   - Can receive notification again next time they leave

### PWA Installation
1. Service worker registers on page load
2. Browser's `beforeinstallprompt` event is captured
3. Custom install prompt shows after 3 seconds (if available)
4. User clicks "Install" → native browser prompt appears
5. App installs to home screen/app drawer

## Testing

### Test Notifications
1. Open the app in one tab
2. Grant notification permission when prompted
3. Switch to another tab or minimize browser
4. Send a message from another device/browser
5. You should receive ONE notification
6. Send more messages → no additional notifications
7. Return to the app → notification flag resets

### Test PWA Install
1. Open app in Chrome/Edge (desktop or mobile)
2. Wait 3 seconds for install prompt
3. Click "Install"
4. App should install and open in standalone window
5. Check home screen/app drawer for icon

## Browser Support

### Notifications
- ✅ Chrome/Edge (desktop & mobile)
- ✅ Firefox (desktop & mobile)
- ✅ Safari (desktop & mobile, iOS 16.4+)
- ❌ Older browsers

### PWA Install
- ✅ Chrome/Edge (desktop & mobile)
- ✅ Safari (iOS/iPadOS)
- ⚠️ Firefox (limited support)

## Notes

- Icons are currently SVG placeholders
- For production, convert to PNG using: https://cloudconvert.com/svg-to-png
- Notification permission is persistent per domain
- PWA install prompt only shows once per browser session
- Service worker has no caching - app won't work offline
