"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useMemo, useState } from "react";

import { useCommerce } from "@/components/commerce/commerce-provider";
import { JewelleryPlaceholder } from "@/components/product/jewellery-placeholder";

export function ProductCard({
  product,
  visualType = "necklace",
  listingHref = "/shop",
  initialSku,
}) {
  const { addToBag, isWishlisted, toggleWishlist } = useCommerce();
  const variants = product.variants || [];
  const defaultVariant =
    variants.find((variant) => isVariantAvailable(variant)) || variants[0];
  const [selectedSku, setSelectedSku] = useState(
    initialSku || defaultVariant?.sku || "",
  );
  const [heartPulse, setHeartPulse] = useState(false);
  const selectedVariant =
    variants.find((variant) => variant.sku === selectedSku) || defaultVariant;
  const selectedVariantAvailable = selectedVariant
    ? isVariantAvailable(selectedVariant)
    : product.inStock !== false;
  const selectedImage = selectedVariant?.images?.[0] || product.image;
  const selectedPrice = selectedVariant?.price ?? product.price;
  const selectedCompareAtPrice =
    selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const selectedColour = selectedVariant?.colour?.title || "Default";
  const stockLimit = selectedVariant?.inventoryCount || product.totalInventory || 1;
  const wishlisted = selectedVariant
    ? isWishlisted(product.id, selectedVariant.sku)
    : false;
  const productHref = `/shop/${product.slug}?sku=${encodeURIComponent(
    selectedVariant?.sku || "",
  )}&from=${encodeURIComponent(listingHref)}`;
  const variantDots = useMemo(() => variants.filter((variant) => variant.sku), [
    variants,
  ]);

  function handleWishlist() {
    if (!selectedVariant?.sku) {
      return;
    }

    setHeartPulse(true);
    setTimeout(() => setHeartPulse(false), 450);
    toggleWishlist({
      productId: product.id,
      slug: product.slug,
      sku: selectedVariant.sku,
    });
  }

  function handleAddToBag() {
    if (!selectedVariant?.sku || !selectedVariantAvailable) {
      return;
    }

    addToBag({
      productId: product.id,
      slug: product.slug,
      sku: selectedVariant.sku,
      stockLimit,
    });
  }

  return (
    <article className="group bg-background">
      <div className="relative">
        <Link href={productHref} aria-label={product.name}>
          {selectedImage?.url ? (
            <div className="relative aspect-[4/5] overflow-hidden bg-brand-ivory">
              <Image
                src={selectedImage.url}
                alt={selectedImage.alt || product.name}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {product.badge ? (
                <span className="absolute left-4 top-4 rounded-sm bg-brand-maroon px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-ivory">
                  {product.badge}
                </span>
              ) : null}
            </div>
          ) : (
            <JewelleryPlaceholder type={visualType} label={product.badge} />
          )}
        </Link>
        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute right-4 top-4 grid h-10 w-10 cursor-pointer place-items-center rounded-full shadow-sm transition-colors ${
            wishlisted
              ? "bg-brand-maroon text-brand-ivory"
              : "bg-background/90 text-brand-maroon hover:bg-brand-maroon hover:text-brand-ivory"
          } ${heartPulse ? "animate-pulse" : ""}`}
          aria-label={`${wishlisted ? "Remove" : "Add"} ${product.name} ${selectedColour} ${wishlisted ? "from" : "to"} wishlist`}
        >
          <Heart
            size={18}
            fill={wishlisted ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </button>
      </div>
      <div className="p-4">
        {/* <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-maroon/65">
          {product.category?.title || product.collections?.[0]?.title || "Jewellery"}
        </p> */}
        <h3 className="text-md truncate font-semibold leading-6 text-foreground">
          <Link href={productHref}>{product.name}</Link>
        </h3>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-maroon">
              {formatCardPrice(selectedPrice, product.priceLabel)}
            </p>
            {selectedCompareAtPrice ? (
              <p className="text-xs text-muted-foreground line-through">
                {formatCardPrice(selectedCompareAtPrice)}
              </p>
            ) : null}
          </div>
          <p className="text-right text-xs text-muted-foreground">
            {product.materials?.[0]?.title || product.material || "Ready to style"}
          </p>
        </div>
        {variantDots.length ? (
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {selectedColour}
            </span>
            <div className="flex items-center gap-1.5">
              {variantDots.slice(0, 5).map((variant) => (
                <button
                  key={variant.sku}
                  type="button"
                  onClick={() => setSelectedSku(variant.sku)}
                  className={`h-4 w-4 cursor-pointer rounded-full border transition-transform ${
                    selectedVariant?.sku === variant.sku
                      ? "scale-110 border-brand-maroon ring-2 ring-brand-maroon/25"
                      : "border-border"
                  }`}
                  style={{ backgroundColor: colourFor(variant.colour) }}
                  title={variant.colour?.title || variant.sku}
                  aria-label={`Select ${variant.colour?.title || variant.sku}`}
                />
              ))}
              {variantDots.length > 5 ? (
                <span className="text-xs text-muted-foreground">
                  +{variantDots.length - 5}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
        <button
          type="button"
          disabled={!selectedVariantAvailable}
          onClick={handleAddToBag}
          className="mt-4 h-10 w-full cursor-pointer rounded-sm border border-brand-maroon text-xs font-semibold uppercase tracking-wide text-brand-maroon transition-colors hover:bg-brand-maroon hover:text-brand-ivory disabled:cursor-not-allowed disabled:border-muted-foreground disabled:text-muted-foreground disabled:hover:bg-transparent"
        >
          {selectedVariantAvailable ? "Add to bag" : "Sold out"}
        </button>
      </div>
    </article>
  );
}

function isVariantAvailable(variant) {
  return (variant.inventoryCount || 0) > 0 && variant.inStock !== false;
}

function colourFor(item) {
  if (item?.hexCode) {
    return item.hexCode;
  }

  const slug = item?.slug || item?.title?.toLowerCase() || "";
  const fallback = {
    gold: "#c7952d",
    pearl: "#f3ead8",
    ruby: "#9f1239",
    maroon: "#7f1d1d",
    green: "#166534",
    emerald: "#047857",
    silver: "#cbd5e1",
    black: "#111827",
    white: "#f8fafc",
    red: "#dc2626",
    blue: "#2563eb",
    pink: "#db2777",
  };

  return fallback[slug] || "#d6c3a2";
}

function formatCardPrice(price, fallback = "Price on request") {
  if (typeof price !== "number") {
    return fallback;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}
