import { AboutHero } from "@/components/about/about-hero";

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
    </>
  );
}
