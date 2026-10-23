interface WhatsAppLinkProps {
  /** The text WhatsApp pre-fills in the chat box. */
  message: string;
  className?: string;
}

/**
 * A plain link to a WhatsApp chat: no API route, no JavaScript. NEXT_PUBLIC_ values are fixed at build time, so the
 * server and the browser always render the same thing (no hydration mismatch).
 */
export default function WhatsAppLink({ message, className = "" }: WhatsAppLinkProps) {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  if (!number) return null;
  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-cta"
      className={`inline-flex items-center rounded-md border border-green-700 px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-700/30 ${className}`}
    >
      Chat for stock and price
      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  );
}