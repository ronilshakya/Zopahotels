// src/lib/turnstileLoader.js
export function loadTurnstileScript() {
  return new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    // if script already added but not loaded, attach events
    const existing = Array.from(document.scripts).find(s => s.src && s.src.includes('challenges.cloudflare.com/turnstile'));
    if (existing) {
      existing.addEventListener('load', () => resolve(window.turnstile));
      existing.addEventListener('error', reject);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(window.turnstile);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
