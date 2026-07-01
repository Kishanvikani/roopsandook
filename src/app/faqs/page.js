import { FaqList } from "@/components/faq/faq-list";
import { PolicyHero } from "@/components/policy/policy-hero";
import { faqs } from "@/data/policies";

export const metadata = {
  title: "FAQs",
  description: "Frequently asked questions about Roop Sandook jewellery orders.",
  alternates: {
    canonical: "/faqs",
  },
};

export default function FaqsPage() {
  return (
    <>
      <PolicyHero
        eyebrow="FAQs"
        title="Questions before you order?"
        description="Quick answers for browsing, availability, WhatsApp checkout, payment, and order confirmation."
      />
      <FaqList faqs={faqs} />
    </>
  );
}
