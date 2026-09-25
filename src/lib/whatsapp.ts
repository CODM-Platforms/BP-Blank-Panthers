/**
 * Builds a wa.me click-to-chat link: opens WhatsApp (web or app) with the
 * message pre-filled to that number. The admin still has to hit send -
 * no messages are sent automatically, no bot/session required.
 */
export function buildWhatsAppLink(phoneNumber: string, message: string): string {
  const digits = phoneNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
