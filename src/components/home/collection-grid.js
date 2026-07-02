import { SectionHeading } from "@/components/common/section-heading";
import { CollectionCard } from "@/components/product/collection-card";
import { collections } from "@/data/placeholders";

export function CollectionGrid() {
  return (
    <section className="bg-background px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          title="Shop by Collections"
          action={{ label: "View all", href: "/collections" }}
        />

        <div className="mt-8 grid gap-6 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
