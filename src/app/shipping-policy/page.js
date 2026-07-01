import { PolicyContent } from "@/components/policy/policy-content";
import { PolicyHero } from "@/components/policy/policy-hero";
import { shippingSections } from "@/data/policies";

export const metadata = {
  title: "Shipping Policy",
  description:
    "Read Roop Sandook shipping information for traditional jewellery orders, packaging, and delivery expectations.",
  alternates: {
    canonical: "/shipping-policy",
  },
};

export default function ShippingPolicyPage() {
  return (
    <>
      <PolicyHero
        eyebrow="Shipping Policy"
        title="Shipping details for Roop Sandook orders."
        description="Placeholder shipping information for UI review. Final courier, packaging, and delivery timelines can be updated later."
      />
      <PolicyContent sections={shippingSections} />
    </>
  );
}
