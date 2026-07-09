"use client";

import Link from "next/link";

import { useCommerce } from "@/components/commerce/commerce-provider";
import { ProductCard } from "@/components/product/product-card";

export function WishlistClient({ products }) {
  const { removeWishlist, wishlistItems } = useCommerce();
  const productMap = new Map(products.map((product) => [product.id, product]));
  const liveItems = [];
  const staleItems = [];

  for (const item of wishlistItems) {
    const product = productMap.get(item.productId);
    const variant = product?.variants?.find(
      (productVariant) => productVariant.sku === item.sku,
    );

    if (product && variant) {
      liveItems.push({ item, product, variant });
    } else {
      staleItems.push(item);
    }
  }

  if (!wishlistItems.length) {
    return (
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl border border-border bg-brand-ivory p-8 text-center">
          <h1 className="font-display text-4xl font-semibold leading-tight text-brand-maroon sm:text-5xl">
            Your wishlist is empty
          </h1>
          <p className="mt-3 text-sm leading-6 text-brand-maroon/75">
            Save pieces you love and come back to compare colours before adding
            them to your bag.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-grid h-11 place-items-center rounded-sm bg-brand-maroon px-5 text-xs font-semibold uppercase tracking-wide text-brand-ivory transition-colors hover:bg-brand-maroon/90"
          >
            Browse jewellery
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display max-w-3xl text-4xl font-semibold leading-tight text-brand-maroon sm:text-5xl">
              Saved Pieces
            </h1>
          </div>
          <Link
            href="/shop"
            className="text-sm font-semibold uppercase tracking-wide text-brand-maroon hover:text-brand-maroon/75"
          >
            Continue shopping
          </Link>
        </div>

        {staleItems.length ? (
          <div className="mt-8 grid gap-3 border border-border bg-brand-ivory p-5">
            <h2 className="text-sm font-semibold text-brand-maroon">
              Unavailable saved items
            </h2>
            {staleItems.map((item) => (
              <div
                key={`${item.productId}-${item.sku}`}
                className="flex flex-col gap-3 text-sm text-brand-maroon/75 sm:flex-row sm:items-center sm:justify-between"
              >
                <span>
                  A saved item with SKU {item.sku} is no longer available.
                </span>
                <button
                  type="button"
                  onClick={() => removeWishlist(item.productId, item.sku)}
                  className="h-9 cursor-pointer rounded-sm border border-brand-maroon px-3 text-xs font-semibold uppercase tracking-wide text-brand-maroon transition-colors hover:bg-brand-maroon hover:text-brand-ivory"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {liveItems.length ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
            {liveItems.map(({ item, product }) => (
              <ProductCard
                key={`${item.productId}-${item.sku}`}
                product={product}
                initialSku={item.sku}
                listingHref="/wishlist"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
