import { PolicyContent } from "@/components/policy/policy-content";
import { PolicyHero } from "@/components/policy/policy-hero";
import { returnSections } from "@/data/policies";

export const metadata = {
  title: "Return Policy",
  description:
    "Read Roop Sandook return and exchange information for traditional jewellery orders.",
  alternates: {
    canonical: "/return-policy",
  },
};

export default function ReturnPolicyPage() {
  return (
    <>
      <PolicyHero
        eyebrow="Return Policy"
        title="Returns and exchanges, explained clearly."
        description="Placeholder return information for UI review. Final rules should be confirmed before launch."
      />
      <PolicyContent sections={returnSections} />
    </>
  );
}
