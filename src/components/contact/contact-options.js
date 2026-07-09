import Image from "next/image";
import {
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import contactImage from "@/assets/images/contect-us.jpeg";
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
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-3xl">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Get in Touch
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            For product inquiries, order updates, shipping assistance, or
            general support, we're here to help. Reach out anytime, and we'll
            respond within 24 business hours.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 grid w-full max-w-7xl items-stretch gap-8 lg:grid-cols-[1fr_1.05fr]">
        <div className="relative min-h-80 overflow-hidden bg-brand-ivory">
          <Image
            src={contactImage}
            alt="Roop Sandook jewellery styling"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="grid gap-4">
          {contactOptions.map((option) => (
            <ContactOption key={option.title} option={option} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactOption({ option }) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <option.icon className="text-brand-maroon" size={24} aria-hidden="true" />
        <h2 className="font-display text-xl font-semibold text-foreground">
          {option.title}
        </h2>
      </div>
      <p className="mt-3 text-sm font-semibold text-brand-maroon">
        {option.value}
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
