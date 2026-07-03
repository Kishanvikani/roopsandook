import { SectionHeading } from "@/components/common/section-heading";
import { ProductCard } from "@/components/product/product-card";
import { getCatalogueData } from "@/services/catalogue";

export async function ProductSection() {
  const { products } = await getCatalogueData();
  const featuredProducts = products
    .filter((product) => product.inStock)
    .slice(0, 4);

  if (!featuredProducts.length) {
    return null;
  }

  return (
    <section className="bg-brand-ivory px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="Handpicked for occasions"
          title="New Arrivals"
          description="Fresh pieces from the live catalogue, ready to add to your bag."
          action={{ label: "Shop all", href: "/shop" }}
        />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              visualType={index % 2 === 0 ? "necklace" : "earrings"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
