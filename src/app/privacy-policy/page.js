import { PolicyContent } from "@/components/policy/policy-content";
import { PolicyHero } from "@/components/policy/policy-hero";
import { privacySections } from "@/data/policies";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Read Roop Sandook privacy information for customer enquiries, orders, and website use.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PolicyHero
        title="How Roop Sandook protects your privacy."
        description="Last Updated: June 2026. Learn how we collect, use, store, and protect your information when you visit our website or make a purchase."
        plain
        compactBottom
      />
      <PolicyContent sections={privacySections} compactTop />
    </>
  );
}
