"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo } from "react";

import { useCommerce } from "@/components/commerce/commerce-provider";
import { JewelleryPlaceholder } from "@/components/product/jewellery-placeholder";
import { formatPrice } from "@/services/catalogue";

const freeShippingThreshold = 1299;
const shippingCharge = 99;

export function BagClient({ products }) {
  const {
    bagItems,
    removeFromBag,
    toggleWishlist,
    updateBagQuantity,
  } = useCommerce();
  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const rows = useMemo(
    () =>
      bagItems
        .map((item) => {
          const product = productMap.get(item.productId);
          const variant = product?.variants?.find(
            (productVariant) => productVariant.sku === item.sku,
          );

          return product && variant ? { item, product, variant } : null;
        })
        .filter(Boolean),
    [bagItems, productMap],
  );
  const invalidItems = useMemo(
    () =>
      bagItems.filter((item) => {
        const product = productMap.get(item.productId);
        return (
          !product ||
          !product.variants?.some((variant) => variant.sku === item.sku)
        );
      }),
    [bagItems, productMap],
  );

  useEffect(() => {
    for (const item of invalidItems) {
      removeFromBag(item.productId, item.sku);
    }
  }, [invalidItems, removeFromBag]);

  useEffect(() => {
    for (const row of rows) {
      const stockLimit = getStockLimit(row);
      if (row.item.quantity > stockLimit) {
        updateBagQuantity(row.product.id, row.variant.sku, stockLimit, stockLimit);
      }
    }
  }, [rows, updateBagQuantity]);

  const subtotal = rows.reduce((sum, row) => {
    const quantity = Math.min(row.item.quantity, getStockLimit(row));
    return sum + (row.variant.price || row.product.price || 0) * quantity;
  }, 0);
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : shippingCharge;
  const total = subtotal + shipping;
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  function moveToWishlist(row) {
    toggleWishlist({
      productId: row.product.id,
      slug: row.product.slug,
      sku: row.variant.sku,
    });
    removeFromBag(row.product.id, row.variant.sku);
  }

  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <h1 className="font-display text-4xl font-semibold text-foreground">
            Review Your Pieces
          </h1>

          {rows.length ? (
            <div className="mt-8 grid gap-4">
              {rows.map((row) => (
                <BagRow
                  key={`${row.product.id}-${row.variant.sku}`}
                  row={row}
                  onRemove={() => removeFromBag(row.product.id, row.variant.sku)}
                  onMoveToWishlist={() => moveToWishlist(row)}
                  onQuantityChange={(quantity) =>
                    updateBagQuantity(
                      row.product.id,
                      row.variant.sku,
                      quantity,
                      getStockLimit(row),
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 border border-border bg-brand-ivory p-6">
              <h2 className="font-display text-2xl font-semibold text-brand-maroon">
                Your bag is empty
              </h2>
              <p className="mt-3 text-sm leading-6 text-brand-maroon/75">
                Add a piece to your bag and checkout through WhatsApp.
              </p>
              <Link
                href="/shop"
                className="mt-5 inline-grid h-10 place-items-center rounded-sm bg-brand-maroon px-4 text-xs font-semibold uppercase tracking-wide text-brand-ivory"
              >
                Browse jewellery
              </Link>
            </div>
          )}

          <div className="mt-8 grid gap-4 bg-brand-ivory p-5 text-sm leading-6 text-brand-maroon/75">
            <InfoBlock
              title="Care"
              text="A Little Care Goes a Long Way ✨ Keep your jewellery away from water and perfume, and store it in a plastic pouch after use. With a little love and care, your jewellery will stay beautiful and can be worn for a long time."
            />
            <InfoBlock
              title="Shipping"
              text="Most ready pieces ship after WhatsApp confirmation and payment details are completed. Once placed, your order will be delivered within 7-10 days."
            />
            <InfoBlock
              title="Free Shipping"
              text="Orders above Rs. 1,299 ship free. Smaller orders include a Rs. 99 shipping charge."
            />
            <InfoBlock
              title="Exchange & Return"
              text="Please read the exchange and return section before placing your order."
              href="/shipping-and-return"
            />
            <InfoBlock
              title="Payment"
              text="Payment will be completed by bank transfer or GPay after WhatsApp confirmation."
            />
          </div>
        </div>

        <aside className="border border-border bg-background p-5 lg:sticky lg:top-24 lg:mt-[4.5rem] lg:self-start">
          <h2 className="text-sm font-semibold text-brand-maroon">
            Order Summary
          </h2>
          <div className="mt-5 border-y border-border py-5 text-sm">
            <SummaryLine label="Subtotal" value={formatPrice(subtotal)} />
            <SummaryLine
              label="Shipping"
              value={shipping === 0 ? "Free" : formatPrice(shipping)}
            />
            <SummaryLine
              label="Total"
              value={formatPrice(total)}
              strong
            />
          </div>
          {subtotal > 0 ? (
            <p className="mt-4 border border-brand-maroon/20 bg-brand-ivory px-4 py-3 text-sm font-semibold leading-6 text-brand-maroon">
              {shipping === 0
                ? `✨ You saved ${formatPrice(shippingCharge)} on shipping.`
                : `✨ Add items worth ${formatPrice(amountForFreeShipping)} more for free shipping.`}
            </p>
          ) : null}
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            We will confirm stock, final payment details, and shipping timeline
            on WhatsApp before dispatch.
          </p>

          <Link
            href={rows.length ? "/checkout" : "/shop"}
            className="mt-5 grid h-12 place-items-center rounded-sm bg-brand-maroon text-xs font-semibold uppercase tracking-wide text-brand-ivory transition-colors hover:bg-brand-maroon/90"
          >
            {rows.length ? "Proceed to checkout" : "Browse jewellery"}
          </Link>
        </aside>
      </div>
    </section>
  );
}

function BagRow({ row, onMoveToWishlist, onQuantityChange, onRemove }) {
  const image = row.variant.images?.[0] || row.product.image;
  const price = row.variant.price || row.product.price;
  const stockLimit = getStockLimit(row);
  const quantity = Math.min(row.item.quantity, stockLimit);
  const lineTotal = price * quantity;
  const productHref = `/shop/${row.product.slug}?sku=${encodeURIComponent(row.variant.sku)}&from=/bag`;

  return (
    <article className="grid gap-4 border border-border bg-background p-4 sm:grid-cols-[120px_1fr_auto] sm:items-stretch">
      <Link
        href={productHref}
        className="block h-full min-h-32"
        aria-label={`View ${row.product.name}`}
      >
        {image?.url ? (
          <div className="relative h-full min-h-32 overflow-hidden bg-brand-ivory">
            <Image
              src={image.url}
              alt={image.alt || row.product.name}
              fill
              sizes="120px"
              className="object-contain transition-transform hover:scale-105"
            />
          </div>
        ) : (
          <div className="h-full min-h-32 overflow-hidden">
            <JewelleryPlaceholder type="earrings" />
          </div>
        )}
      </Link>
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          <Link href={productHref} className="hover:text-brand-maroon">
            {row.product.name}
          </Link>
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Colour: {row.variant.colour?.title || "Default"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onMoveToWishlist}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-sm border border-border px-3 text-xs font-semibold text-brand-maroon transition-colors hover:border-brand-maroon"
          >
            <Heart size={14} aria-hidden="true" />
            Move to wishlist
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-sm border border-border px-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-brand-maroon hover:text-brand-maroon"
          >
            <Trash2 size={14} aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>
      <div className="text-sm font-semibold text-brand-maroon sm:text-right">
        <p>{formatPrice(lineTotal)}</p>
        <div className="mt-3 inline-flex items-center border border-border">
          <button
            type="button"
            onClick={() => onQuantityChange(quantity - 1)}
            className="grid h-8 w-8 cursor-pointer place-items-center text-brand-maroon transition-colors hover:bg-brand-ivory"
            aria-label={`Decrease quantity of ${row.product.name}`}
          >
            <Minus size={14} aria-hidden="true" />
          </button>
          <span className="grid h-8 min-w-9 place-items-center border-x border-border px-2 text-xs text-foreground">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            disabled={quantity >= stockLimit}
            className="grid h-8 w-8 cursor-pointer place-items-center text-brand-maroon transition-colors hover:bg-brand-ivory"
            aria-label={`Increase quantity of ${row.product.name}`}
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Unit price {formatPrice(price)}
        </p>
      </div>
    </article>
  );
}

function SummaryLine({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className={strong ? "font-semibold text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={strong ? "font-semibold text-brand-maroon" : "text-foreground"}>
        {value}
      </span>
    </div>
  );
}

function InfoBlock({ title, text, href }) {
  return (
    <div className="border-b border-brand-maroon/10 pb-4 last:border-b-0 last:pb-0">
      <h2 className="text-sm font-semibold text-brand-maroon">{title}</h2>
      <p className="mt-2">{text}</p>
      {href ? (
        <Link
          href={href}
          className="mt-2 inline-flex text-xs font-semibold uppercase tracking-wide text-brand-maroon hover:text-brand-maroon/75"
        >
          Read policy
        </Link>
      ) : null}
    </div>
  );
}

function getStockLimit(row) {
  return row.variant.inventoryCount || row.product.totalInventory || 1;
}
