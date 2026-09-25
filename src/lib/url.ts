import { headers } from 'next/headers';

/**
 * Absolute base URL of the current deployment, derived from the real
 * incoming request (Host header) rather than NEXT_PUBLIC_APP_URL - that env
 * var can be unset/stale and silently produces relative links (e.g. a
 * WhatsApp message with "/confirm/..." instead of "https://.../confirm/...")
 * with no error anywhere. Server-side only (headers() is a server API).
 */
export function getBaseUrl(): string {
  const h = headers();
  const host = h.get('host');
  if (host) {
    const proto = h.get('x-forwarded-proto') ?? 'https';
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? '';
}
