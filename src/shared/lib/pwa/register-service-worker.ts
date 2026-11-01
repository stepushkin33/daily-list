export const registerServiceWorker = (isProduction = import.meta.env.PROD): void => {
  if (!isProduction || !('serviceWorker' in navigator)) {
    return
  }

  void navigator.serviceWorker.register('/sw.js').catch(() => undefined)
}
