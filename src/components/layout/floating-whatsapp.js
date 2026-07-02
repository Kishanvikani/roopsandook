import { MessageCircle } from "lucide-react";

import { getWhatsappUrl } from "@/lib/contact";

export function FloatingWhatsapp() {
  return (
    <a
      href={getWhatsappUrl(
        "Hi Roop Sandook, I liked your collection. Want to explore more.",
      )}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Roop Sandook on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-xl shadow-brand-maroon/20 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-maroon focus:ring-offset-2"
    >
      <MessageCircle size={28} aria-hidden="true" />
    </a>
  );
}
