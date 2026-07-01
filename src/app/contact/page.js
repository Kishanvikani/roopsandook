import { ContactHero } from "@/components/contact/contact-hero";
import { ContactOptions } from "@/components/contact/contact-options";

export const metadata = {
  title: "Contact",
  description:
    "Contact Roop Sandook for traditional jewellery enquiries, availability, styling help, and WhatsApp checkout support.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactOptions />
    </>
  );
}
