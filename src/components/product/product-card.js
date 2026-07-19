"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useCommerce } from "@/components/commerce/commerce-provider";
import { JewelleryPlaceholder } from "@/components/product/jewellery-placeholder";
import { getColorSwatchStyle } from "@/constants/colorMapper";
import { getProductImageAlt } from "@/lib/product-image-alt";

export function ProductCard({
  product,
  visualType = "necklace",
  listingHref = "/shop",
  initialSku,
  compact = false,
  onProductOpen,
}) {
  const {
    addToBag,
    bagItems,
    isWishlisted,
    removeFromBag,
    toggleWishlist,
    updateBagQuantity,
  } = useCommerce();
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
  const selectedImage = selectedVariant
    ? selectedVariant.images?.[0] || null
    : product.image;
  const selectedPrice = selectedVariant?.price ?? product.price;
  const selectedCompareAtPrice =
    selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const selectedColour = selectedVariant?.colour?.title || "Default";
  const materialLabel =
    product.materials?.map((material) => material.title).filter(Boolean).join(", ") ||
    product.material ||
    "Ready to style";
  const stockLimit = selectedVariant
    ? getVariantStockLimit(selectedVariant)
    : product.totalInventory || 0;
  const wishlisted = selectedVariant
    ? isWishlisted(product.id, selectedVariant.sku)
    : false;
  const bagItem = selectedVariant
    ? bagItems.find(
        (item) =>
          item.productId === product.id && item.sku === selectedVariant.sku,
      )
    : null;
  const productHref = `/shop/${product.slug}?sku=${encodeURIComponent(
    selectedVariant?.sku || "",
  )}&from=${encodeURIComponent(listingHref)}`;
  const variantDots = useMemo(() => getUniqueColourVariants(variants), [
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

  function selectColour(variant) {
    const colourKey = getVariantColourKey(variant);
    const colourVariants = variants.filter(
      (item) => getVariantColourKey(item) === colourKey,
    );
    const preferredVariant =
      colourVariants.find(
        (item) =>
          item.size &&
          item.size === selectedVariant?.size &&
          isVariantAvailable(item),
      ) ||
      colourVariants.find(isVariantAvailable) ||
      colourVariants[0];

    if (preferredVariant?.sku) {
      setSelectedSku(preferredVariant.sku);
    }
  }

  function decreaseBagQuantity() {
    if (!bagItem || !selectedVariant?.sku) {
      return;
    }

    if (bagItem.quantity <= 1) {
      removeFromBag(product.id, selectedVariant.sku);
      return;
    }

    updateBagQuantity(
      product.id,
      selectedVariant.sku,
      bagItem.quantity - 1,
      stockLimit,
    );
  }

  function increaseBagQuantity() {
    if (!bagItem || !selectedVariant?.sku) {
      return;
    }

    updateBagQuantity(
      product.id,
      selectedVariant.sku,
      bagItem.quantity + 1,
      stockLimit,
    );
  }

  function handleProductOpen() {
    onProductOpen?.(product);
  }

  return (
    <article className="group bg-background">
      <div className="relative">
        <Link href={productHref} aria-label={product.name} onClick={handleProductOpen}>
          {selectedImage?.url ? (
            <div className="relative aspect-[4/5] overflow-hidden bg-brand-ivory">
              <Image
                src={selectedImage.url}
                alt={getProductImageAlt({
                  image: selectedImage,
                  product,
                  variant: selectedVariant,
                })}
                fill
                sizes={
                  compact
                    ? "(min-width: 1024px) 18vw, (min-width: 768px) 28vw, 50vw"
                    : "(min-width: 1024px) 25vw, 50vw"
                }
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {product.badge ? (
                <span
                  className={`absolute rounded-sm bg-brand-maroon font-semibold uppercase tracking-wide text-brand-ivory ${
                    compact
                      ? "left-2 top-2 px-2 py-1 text-[10px]"
                      : "left-4 top-4 px-3 py-1 text-xs"
                  }`}
                >
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
          className={`absolute grid cursor-pointer place-items-center rounded-full shadow-sm transition-colors ${
            wishlisted
              ? "bg-brand-maroon text-brand-ivory"
              : "bg-background/90 text-brand-maroon hover:bg-brand-maroon hover:text-brand-ivory"
          } ${compact ? "right-2 top-2 h-8 w-8" : "right-4 top-4 h-10 w-10"} ${
            heartPulse ? "animate-pulse" : ""
          }`}
          aria-label={`${wishlisted ? "Remove" : "Add"} ${product.name} ${selectedColour} ${wishlisted ? "from" : "to"} wishlist`}
        >
          <Heart
            size={18}
            fill={wishlisted ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </button>
      </div>
      <div className={compact ? "p-3" : "p-4"}>
        {/* <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-maroon/65">
          {product.category?.title || product.collections?.[0]?.title || "Jewellery"}
        </p> */}
        <h3
          className={`truncate font-semibold text-foreground ${
            compact ? "text-sm leading-5" : "text-md leading-6"
          }`}
        >
          <Link href={productHref} onClick={handleProductOpen}>
            {product.name}
          </Link>
        </h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div>
            <p
              className={`font-semibold text-brand-maroon ${
                compact ? "text-xs" : "text-sm"
              }`}
            >
              {formatCardPrice(selectedPrice, product.priceLabel)}
            </p>
            {selectedCompareAtPrice ? (
              <p className="text-xs text-muted-foreground line-through">
                {formatCardPrice(selectedCompareAtPrice)}
              </p>
            ) : null}
          </div>
          <p
            className="min-w-0 truncate text-right text-xs text-muted-foreground"
            title={materialLabel}
          >
            {materialLabel}
          </p>
        </div>
        {variantDots.length ? (
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {selectedColour}
            </span>
            <div className="flex items-center gap-1.5">
              {variantDots.slice(0, 5).map((variant) => (
                <button
                  key={getVariantColourKey(variant)}
                  type="button"
                  onClick={() => selectColour(variant)}
                  className={`h-4 w-4 cursor-pointer rounded-full border transition-transform ${
                    getVariantColourKey(selectedVariant) ===
                    getVariantColourKey(variant)
                      ? "scale-110 border-brand-maroon ring-2 ring-brand-maroon/25"
                      : "border-border"
                  }`}
                  style={getColorSwatchStyle(variant.colour)}
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
        {selectedVariantAvailable && bagItem ? (
          <div
            className={`mt-4 grid w-full grid-cols-[auto_1fr_auto] border border-brand-maroon text-brand-maroon ${
              compact ? "h-9" : "h-10"
            }`}
          >
            <button
              type="button"
              onClick={decreaseBagQuantity}
              className="grid h-full w-10 cursor-pointer place-items-center transition-colors hover:bg-brand-ivory"
              aria-label={`Decrease ${product.name} quantity`}
            >
              <Minus size={14} aria-hidden="true" />
            </button>
            <span className="grid h-full place-items-center border-x border-brand-maroon/25 text-xs font-semibold">
              {bagItem.quantity}
            </span>
            <button
              type="button"
              onClick={increaseBagQuantity}
              disabled={bagItem.quantity >= stockLimit}
              className="grid h-full w-10 cursor-pointer place-items-center transition-colors hover:bg-brand-ivory disabled:cursor-not-allowed disabled:text-muted-foreground"
              aria-label={`Increase ${product.name} quantity`}
            >
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!selectedVariantAvailable}
            onClick={handleAddToBag}
            className={`mt-4 w-full cursor-pointer rounded-sm border border-brand-maroon text-xs font-semibold uppercase tracking-wide text-brand-maroon transition-colors hover:bg-brand-maroon hover:text-brand-ivory disabled:cursor-not-allowed disabled:border-muted-foreground disabled:text-muted-foreground disabled:hover:bg-transparent ${
              compact ? "h-9" : "h-10"
            }`}
          >
            {selectedVariantAvailable ? "Add to bag" : "Sold out"}
          </button>
        )}
      </div>
    </article>
  );
}

function isVariantAvailable(variant) {
  return getVariantStockLimit(variant) > 0 && variant.inStock !== false;
}

function getVariantStockLimit(variant) {
  return Math.max(Number(variant?.inventoryCount) || 0, 0);
}

function getUniqueColourVariants(variants) {
  const colourMap = new Map();

  for (const variant of variants) {
    const colourKey = getVariantColourKey(variant);

    if (!variant.sku || colourMap.has(colourKey)) {
      continue;
    }

    colourMap.set(colourKey, variant);
  }

  return Array.from(colourMap.values());
}

function getVariantColourKey(variant) {
  return (
    variant?.colour?.slug ||
    variant?.colour?.title ||
    variant?.colour?._id ||
    "default"
  );
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
