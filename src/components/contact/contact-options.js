import {
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import {
  contactDetails,
  formatIndianPhone,
  getInstagramUrl,
  getWhatsappUrl,
} from "@/lib/contact";

const contactOptions = [
  {
    icon: MessageCircle,
    title: "WhatsApp / Phone",
    value: formatIndianPhone(),
    text: "Chat with us for product questions, availability, and order help.",
    href: getWhatsappUrl(),
    external: true,
  },
  {
    icon: Mail,
    title: "Email",
    value: contactDetails.email,
    text: "For collaborations and general queries.",
    href: `mailto:${contactDetails.email}`,
  },
  {
    icon: Sparkles,
    title: "Instagram",
    value: `@${contactDetails.instagramHandle}`,
    text: "Follow new drops, styling ideas, and festive edits.",
    href: getInstagramUrl(),
    external: true,
  },
  {
    icon: MapPin,
    title: "Location",
    value: contactDetails.address,
    text: "Serving customers from Pune with WhatsApp-assisted ordering.",
  },
];

export function ContactOptions() {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {contactOptions.map((option) => (
          <ContactOption key={option.title} option={option} />
        ))}
      </div>
    </section>
  );
}

function ContactOption({ option }) {
  const content = (
    <>
      <option.icon className="text-brand-maroon" size={24} aria-hidden="true" />
      <h2 className="font-display mt-5 text-xl font-semibold text-foreground">
        {option.title}
      </h2>
      <p className="mt-2 text-sm font-semibold text-brand-maroon">
        {option.value}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {option.text}
      </p>
    </>
  );

  if (option.href) {
    return (
      <a
        href={option.href}
        target={option.external ? "_blank" : undefined}
        rel={option.external ? "noreferrer" : undefined}
        className="block cursor-pointer border border-border bg-background p-6 transition-colors hover:border-brand-maroon"
      >
        {content}
      </a>
    );
  }

  return (
    <article className="border border-border bg-background p-6">
      {content}
    </article>
  );
}
