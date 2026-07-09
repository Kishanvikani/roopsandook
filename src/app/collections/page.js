import Link from "next/link";

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
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display max-w-3xl text-4xl font-semibold leading-tight text-brand-maroon sm:text-5xl">
                Shop by Collection
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-brand-maroon/75">
                Choose a jewellery category to see matching Roop Sandook products.
              </p>
            </div>
            <Link
              href="/shop"
              className="shrink-0 text-sm font-semibold uppercase tracking-wide text-brand-maroon hover:text-brand-maroon/75"
            >
              View all
            </Link>
          </div>
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
