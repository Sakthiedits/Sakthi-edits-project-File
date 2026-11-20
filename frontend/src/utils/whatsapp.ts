/**
 * WhatsApp utility helpers for Sakthiedits.
 *
 * All messages are properly URL-encoded before being appended to the wa.me
 * link so they arrive correctly on both desktop and mobile WhatsApp clients.
 */

/** Normalised international phone number — no plus sign, no spaces. */
export const WHATSAPP_NUMBER = '917695978552';

/** Default opening message shown when no custom message is provided. */
export const DEFAULT_WA_MESSAGE =
  "Hi Sakthivel, I'm interested in your video editing services.";

/**
 * Returns a wa.me deep-link for the given message.
 *
 * @param message - Optional custom message. Falls back to DEFAULT_WA_MESSAGE.
 * @returns Fully-formed `https://wa.me/...` URL string.
 */
export function getWhatsAppUrl(message?: string): string {
  const text = (message ?? DEFAULT_WA_MESSAGE).trim();
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** Pre-built default WhatsApp link. */
export const WHATSAPP_URL = getWhatsAppUrl();

/**
 * Builds a WhatsApp URL pre-filled with a structured message derived from
 * the contact form fields.
 *
 * @param name    - Sender's full name.
 * @param email   - Sender's e-mail address.
 * @param service - The service they are interested in (e.g. "VSL", "Video Ad").
 * @param details - Any additional details or description from the form.
 * @returns Fully-formed `https://wa.me/...` URL string.
 */
export function getContactFormWhatsAppUrl(
  name: string,
  email: string,
  service: string,
  details: string,
): string {
  const lines: string[] = [
    `Hi Sakthivel! 👋`,
    ``,
    `I found your portfolio and I'd love to discuss a project.`,
    ``,
    `*Name:* ${name}`,
    `*Email:* ${email}`,
    `*Service Interested In:* ${service}`,
    `*Project Details:*`,
    details,
    ``,
    `Looking forward to hearing from you!`,
  ];

  const message = lines.join('\n');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
