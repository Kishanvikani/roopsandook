import { MessageCircle, PackageCheck, ShieldCheck } from "lucide-react";

const highlights = [
  {
    icon: MessageCircle,
    title: "WhatsApp ordering",
    text: "Customers review their bag and send order details directly on WhatsApp.",
  },
  {
    icon: PackageCheck,
    title: "Occasion-ready packaging",
    text: "Placeholder copy for jewellery pouch, gifting, and dispatch details.",
  },
  {
    icon: ShieldCheck,
    title: "Manual confirmation",
    text: "The business confirms availability and payment details before dispatch.",
  },
];

export function ServiceHighlights() {
  return (
    <section className="bg-brand-maroon px-4 py-12 text-brand-ivory sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5 md:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.title} className="border border-brand-ivory/25 p-6">
            <item.icon size={24} aria-hidden="true" />
            <h2 className="mt-5 text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-brand-ivory/75">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
