"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useCommerce } from "@/components/commerce/commerce-provider";
import { JewelleryPlaceholder } from "@/components/product/jewellery-placeholder";
import { getColorSwatchStyle } from "@/constants/colorMapper";
import { formatPrice } from "@/services/catalogue";

export function ProductDetailClient({ product, backHref, initialSku }) {
  const router = useRouter();
  const { addToBag, isWishlisted, toggleWishlist } = useCommerce();
  const variants = product.variants || [];
  const defaultVariant =
    variants.find((variant) => isVariantAvailable(variant)) || variants[0];
  const [selectedSku, setSelectedSku] = useState(
    initialSku || defaultVariant?.sku || "",
  );
  const [quantity, setQuantity] = useState(1);
  const selectedVariant =
    variants.find((variant) => variant.sku === selectedSku) || defaultVariant;
  const selectedVariantAvailable = selectedVariant
    ? isVariantAvailable(selectedVariant)
    : product.inStock !== false;
  const wishlisted = selectedVariant
    ? isWishlisted(product.id, selectedVariant.sku)
    : false;
  const stockLimit = selectedVariant
    ? getVariantStockLimit(selectedVariant)
    : product.totalInventory || 0;
  const galleryImages = useMemo(
    () => {
      const images = selectedVariant
        ? selectedVariant.images || []
        : product.images || [];

      return images.filter((image, index, imageList) =>
        image?.url &&
          imageList.findIndex((item) => item.url === image.url) === index,
      );
    },
    [product.images, selectedVariant],
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = galleryImages[activeImageIndex] || galleryImages[0];

  function selectVariant(sku) {
    setSelectedSku(sku);
    setActiveImageIndex(0);
    setQuantity(1);
  }

  function moveImage(direction) {
    if (!galleryImages.length) {
      return;
    }

    setActiveImageIndex((current) =>
      (current + direction + galleryImages.length) % galleryImages.length,
    );
  }

  function handleAddToBag() {
    if (!selectedVariant?.sku || !selectedVariantAvailable) {
      return;
    }

    addToBag({
      productId: product.id,
      slug: product.slug,
      sku: selectedVariant.sku,
      quantity: Math.min(quantity, stockLimit),
      stockLimit,
    }, { incrementExisting: true });
  }

  function handleWishlist() {
    if (!selectedVariant?.sku) {
      return;
    }

    toggleWishlist({
      productId: product.id,
      slug: product.slug,
      sku: selectedVariant.sku,
    });
  }

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(backHref);
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.78fr)]">
        <div>
          <div className="relative mx-auto max-w-xl">
            <button
              type="button"
              onClick={handleBack}
              className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-sm bg-background/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-maroon shadow-sm transition-colors hover:bg-brand-maroon hover:text-brand-ivory"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back
            </button>
            {activeImage ? (
              <div className="relative aspect-[4/5] overflow-hidden bg-brand-ivory">
                <Image
                  src={activeImage.url}
                  alt={activeImage.alt || product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <JewelleryPlaceholder type="necklace" label={product.badge} />
            )}

            {galleryImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => moveImage(-1)}
                  className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-background/90 text-brand-maroon shadow-sm transition-colors hover:bg-brand-maroon hover:text-brand-ivory"
                  aria-label="Previous product image"
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(1)}
                  className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-background/90 text-brand-maroon shadow-sm transition-colors hover:bg-brand-maroon hover:text-brand-ivory"
                  aria-label="Next product image"
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>

          {galleryImages.length > 1 ? (
            <div className="mx-auto mt-4 grid max-w-xl grid-cols-5 gap-3">
              {galleryImages.slice(0, 5).map((image, index) => (
                <button
                  key={image.url}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative aspect-square cursor-pointer overflow-hidden bg-brand-ivory ${
                    activeImageIndex === index
                      ? "ring-2 ring-brand-maroon ring-offset-2"
                      : ""
                  }`}
                  aria-label={`View product image ${index + 1}`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || product.name}
                    fill
                    sizes="20vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="font-display text-3xl font-semibold leading-tight text-foreground">
            {product.name}
          </h3>
          {selectedVariant?.sku ? (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-maroon/65">
              SKU: {selectedVariant.sku}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="text-xl font-semibold text-brand-maroon">
              {typeof selectedVariant?.price === "number"
                ? formatPrice(selectedVariant.price)
                : product.priceLabel}
            </p>
            {typeof selectedVariant?.compareAtPrice === "number" ||
            typeof product.compareAtPrice === "number" ? (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(
                  typeof selectedVariant?.compareAtPrice === "number"
                    ? selectedVariant.compareAtPrice
                    : product.compareAtPrice,
                )}
              </p>
            ) : null}
            {product.badge ? (
              <span className="rounded-sm bg-brand-ivory px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-maroon">
                {product.badge}
              </span>
            ) : null}
          </div>

          {variants.length ? (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-brand-maroon">
                Select colour
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <button
                    key={variant.sku}
                    type="button"
                    onClick={() => selectVariant(variant.sku)}
                    className={`flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 text-sm transition-colors ${
                      selectedVariant?.sku === variant.sku
                        ? "border-brand-maroon text-brand-maroon"
                        : "border-border text-muted-foreground hover:border-brand-maroon hover:text-brand-maroon"
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-border"
                      style={getColorSwatchStyle(variant.colour)}
                      aria-hidden="true"
                    />
                    {variant.colour?.title || "Default"}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {selectedVariantAvailable ? (
              <div className="inline-flex shrink-0 items-center border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="grid h-10 w-10 cursor-pointer place-items-center text-brand-maroon transition-colors hover:bg-brand-ivory"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} aria-hidden="true" />
                </button>
                <span className="grid h-10 min-w-10 place-items-center border-x border-border px-3 text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.min(stockLimit, current + 1))
                  }
                  disabled={quantity >= stockLimit}
                  className="grid h-10 w-10 cursor-pointer place-items-center text-brand-maroon transition-colors hover:bg-brand-ivory"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>
            ) : null}
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-1 sm:items-center sm:gap-3">
              <button
                type="button"
                disabled={!selectedVariant?.sku}
                onClick={handleWishlist}
                className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-sm border px-3 text-xs font-semibold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:border-muted-foreground disabled:text-muted-foreground sm:flex-1 ${
                  wishlisted
                    ? "border-brand-maroon bg-brand-ivory text-brand-maroon"
                    : "border-brand-maroon text-brand-maroon hover:bg-brand-maroon hover:text-brand-ivory"
                }`}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                title={wishlisted ? "Wishlisted" : "Wishlist"}
              >
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </button>
              <button
                type="button"
                disabled={!selectedVariantAvailable}
                onClick={handleAddToBag}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-sm bg-brand-maroon px-3 text-xs font-semibold uppercase tracking-wide text-brand-ivory transition-colors hover:bg-brand-maroon/90 disabled:cursor-not-allowed disabled:bg-muted-foreground sm:flex-1"
                aria-label={selectedVariantAvailable ? "Add to bag" : "Sold out"}
                title={selectedVariantAvailable ? "Add to bag" : "Sold out"}
              >
                {selectedVariantAvailable ? "Add to bag" : "Sold out"}
              </button>
            </div>
          </div>

          <div className="mt-8 border-y border-border">
            <DetailBlock
              label="Product Description"
              value={product.shortDescription || product.description}
              className="py-4"
            />
            <div className="grid gap-4 border-t border-border py-4 sm:grid-cols-2">
              <DetailBlock
                label="Materials"
                value={product.materials.map((item) => item.title).join(", ")}
              />
              <DetailBlock
                label="Availability"
                value={
                  selectedVariantAvailable
                    ? `${stockLimit} in stock`
                    : "Sold out"
                }
              />
              <DetailBlock
                label="Sub-Category"
                value={product.childCategory?.title}
              />
            </div>
            {product.careInstructions ? (
              <DetailBlock
                label="Care"
                value={product.careInstructions}
                className="border-t border-border py-4"
              />
            ) : null}
            {product.shippingInfo ? (
              <DetailBlock
                label="Shipping"
                value={product.shippingInfo}
                className="border-t border-border py-4"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailBlock({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-maroon/65">
        {label}
      </p>
      <p className="mt-2 text-sm text-foreground">{value || "Not specified"}</p>
    </div>
  );
}

function isVariantAvailable(variant) {
  return getVariantStockLimit(variant) > 0 && variant.inStock !== false;
}

function getVariantStockLimit(variant) {
  return Math.max(Number(variant?.inventoryCount) || 0, 0);
}

