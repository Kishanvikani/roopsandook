import { SectionHeading } from "@/components/common/section-heading";
import { CollectionCard } from "@/components/product/collection-card";
import { getParentCategoriesWithProductCounts } from "@/services/catalogue";

export const metadata = {
  title: "Collections",
  description:
    "Browse Roop Sandook jewellery collections by traditional category and occasion.",
  alternates: {
    canonical: "/collections",
  },
};

export default async function CollectionsPage() {
  const parentCategories = await getParentCategoriesWithProductCounts();

  return (
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <SectionHeading
            eyebrow="Explore"
            title="Shop by Collection"
            description="Choose a jewellery category to see matching Roop Sandook products."
            action={{ label: "View all", href: "/shop" }}
          />
          {parentCategories.length ? (
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
          ) : (
            <p className="mt-8 border border-border bg-brand-ivory p-5 text-sm text-brand-maroon">
              No parent categories are published in Sanity yet.
            </p>
          )}
        </div>
      </section>
  );
}
