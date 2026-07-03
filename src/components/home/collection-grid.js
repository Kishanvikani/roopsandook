import { SectionHeading } from "@/components/common/section-heading";
import { CollectionCard } from "@/components/product/collection-card";
import { getParentCategoriesWithProductCounts } from "@/services/catalogue";

export async function CollectionGrid() {
  const parentCategories = await getParentCategoriesWithProductCounts();

  if (!parentCategories.length) {
    return null;
  }

  return (
    <section className="bg-background px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          title="Shop by Categories"
          action={{ label: "View all", href: "/collections" }}
        />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {parentCategories.map((collection, index) => (
            <CollectionCard
              key={collection.slug}
              collection={collection}
              index={index}
              href={`/shop?parentCategory=${collection.slug}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
