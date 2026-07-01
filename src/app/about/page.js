import { AboutHero } from "@/components/about/about-hero";
import { StorySection } from "@/components/about/story-section";
import { ValuesSection } from "@/components/about/values-section";
import { ContactOptions } from "@/components/contact/contact-options";

export const metadata = {
  title: "About",
  description:
    "Learn about Roop Sandook, an Indian traditional jewellery brand curated for weddings, festive styling, and everyday occasion wear.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <StorySection />
      <ValuesSection />
      <ContactOptions />
    </>
  );
}
