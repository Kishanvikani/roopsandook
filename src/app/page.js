import { BrandStory } from "@/components/home/brand-story";
import { CollectionGrid } from "@/components/home/collection-grid";
import { HeroSection } from "@/components/home/hero-section";
import { ProductSection } from "@/components/home/product-section";
import { PromoStrip } from "@/components/home/promo-strip";
import { ServiceHighlights } from "@/components/home/service-highlights";

export default function Home() {
  return (
    <>
      <HeroSection />
      <PromoStrip />
      <CollectionGrid />
      <ProductSection />
      <BrandStory />
      <ServiceHighlights />
    </>
  );
}
