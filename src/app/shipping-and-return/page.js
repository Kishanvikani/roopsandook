import { PolicyContent } from "@/components/policy/policy-content";
import { PolicyHero } from "@/components/policy/policy-hero";
import { shippingReturnSections } from "@/data/policies";

export const metadata = {
  title: "Shipping And Return",
  description:
    "Read Roop Sandook shipping, return, and exchange information for traditional jewellery orders.",
  alternates: {
    canonical: "/shipping-and-return",
  },
};

export default function ShippingAndReturnPage() {
  return (
    <>
      <PolicyHero
        title="Shipping, Returns & Refund Policy"
        description="Last Updated: June 2026. Review delivery charges, order timelines, return eligibility, replacement requirements, and refund support."
        plain
        compactBottom
      />
      <PolicyContent sections={shippingReturnSections} compactTop />
    </>
  );
}
