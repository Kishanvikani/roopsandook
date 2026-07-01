import { SectionHeading } from "@/components/common/section-heading";
import { CollectionCard } from "@/components/product/collection-card";
import { collections } from "@/data/placeholders";

export function CollectionGrid() {
  return (
    <section className="bg-background px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="Browse by tradition"
          title="Roop Sandook Collections"
          description="Explore placeholder collection tiles for traditional Indian jewellery categories."
          action={{ label: "View all", href: "/collections" }}
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, index) => (
            <CollectionCard
              key={collection.slug}
              collection={collection}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
