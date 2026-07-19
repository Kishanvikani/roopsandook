import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product/product-card";
import { ProductDetailClient } from "@/components/product/product-detail-client";
import { absoluteUrl, siteName } from "@/constants/site";
import { getProductImageAlt } from "@/lib/product-image-alt";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/services/catalogue";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  const primaryVariant = product.variants[0];

  return {
    title: product.seoTitle || product.name,
    description:
      product.seoDescription ||
      product.shortDescription ||
      product.description ||
      `Shop ${product.name} from Roop Sandook.`,
    alternates: {
      canonical: `/shop/${product.slug}`,
    },
    openGraph: {
      type: "website",
      url: `/shop/${product.slug}`,
      siteName,
      title: product.seoTitle || product.name,
      description:
        product.seoDescription ||
        product.shortDescription ||
        product.description ||
        `Shop ${product.name} from Roop Sandook.`,
      images: product.image?.url
        ? [
            {
              url: product.image.url,
              alt: getProductImageAlt({
                image: product.image,
                product,
                variant: primaryVariant,
              }),
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.seoTitle || product.name,
      description:
        product.seoDescription ||
        product.shortDescription ||
        product.description ||
        `Shop ${product.name} from Roop Sandook.`,
      images: product.image?.url ? [product.image.url] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product);
  const backHref = getBackHref(query?.from);
  const initialSku = getSku(query?.sku, product);
  const jsonLd = buildProductJsonLd(product, initialSku);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        backHref={backHref}
        initialSku={initialSku}
      />

      {relatedProducts.length ? (
        <section className="px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl border-t border-border pt-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                  You may also like
                </h2>
              </div>
              <Link
                href={backHref}
                className="shrink-0 text-sm font-semibold uppercase tracking-wide text-brand-maroon hover:text-brand-maroon/75"
              >
                View all
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
              {relatedProducts.slice(0, 5).map((relatedProduct, index) => (
                <ProductCard
                  key={relatedProduct.slug}
                  product={relatedProduct}
                  listingHref={backHref}
                  compact
                  visualType={index % 2 === 0 ? "earrings" : "necklace"}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function getBackHref(value) {
  const href = Array.isArray(value) ? value[0] : value;

  if (href?.startsWith("/shop")) {
    return href;
  }

  return "/shop";
}

function getSku(value, product) {
  const sku = Array.isArray(value) ? value[0] : value;

  if (product.variants.some((variant) => variant.sku === sku)) {
    return sku;
  }

  return "";
}

function buildProductJsonLd(product, sku) {
  const selectedVariant =
    product.variants.find((variant) => variant.sku === sku) ||
    product.variants[0];
  const price = selectedVariant?.price ?? product.price;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((image) => image.url),
    description:
      product.seoDescription ||
      product.shortDescription ||
      product.description ||
      `${product.name} from ${siteName}.`,
    sku: selectedVariant?.sku,
    brand: {
      "@type": "Brand",
      name: siteName,
    },
    category: product.category?.title || product.parentCategory?.title,
    offers:
      typeof price === "number"
        ? {
            "@type": "Offer",
            url: absoluteUrl(`/shop/${product.slug}`),
            priceCurrency: "INR",
            price,
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          }
        : undefined,
  };
}
