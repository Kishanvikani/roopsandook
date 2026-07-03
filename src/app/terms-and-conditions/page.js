import { PolicyContent } from "@/components/policy/policy-content";
import { PolicyHero } from "@/components/policy/policy-hero";
import { termsSections } from "@/data/policies";

export const metadata = {
  title: "Terms and Conditions",
  description:
    "Read Roop Sandook terms and conditions for website use, product information, and orders.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <PolicyHero
        title="Terms for using Roop Sandook."
        description="Last Updated: June 2026. Please review these Terms & Conditions before using our website or placing an order."
        plain
        compactBottom
      />
      <PolicyContent sections={termsSections} compactTop />
    </>
  );
}
