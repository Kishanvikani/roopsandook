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
    <>
      <section className="bg-brand-maroon px-4 py-12 text-brand-ivory sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em]">
            Collections
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Indian traditional jewellery, grouped by occasion and style.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-brand-ivory/75">
            Browse jewellery collections managed directly from Sanity.
          </p>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <SectionHeading
            eyebrow="Explore"
            title="Shop by Collection"
            description="Choose a jewellery category to see matching Roop Sandook products."
          />
          {parentCategories.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    </>
  );
}
