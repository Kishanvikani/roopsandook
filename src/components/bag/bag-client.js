"use client";

import Image from "next/image";
import Link from "next/link";
import { City, State } from "country-state-city";
import { Heart, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useCommerce } from "@/components/commerce/commerce-provider";
import { JewelleryPlaceholder } from "@/components/product/jewellery-placeholder";
import { formatPrice } from "@/services/catalogue";

const freeShippingThreshold = 1299;
const shippingCharge = 99;
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "910000000000";
const countryCode = "IN";
const customCityValue = "__custom";

export function BagClient({ products }) {
  const {
    bagItems,
    removeFromBag,
    toggleWishlist,
    updateBagQuantity,
  } = useCommerce();
  const [customer, setCustomer] = useState({
    name: "",
    addressLine: "",
    pinCode: "",
    stateCode: "MH",
    city: "Mumbai",
    customCity: "",
    note: "",
  });
  const [hasOrdered, setHasOrdered] = useState(false);
  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const states = useMemo(() => State.getStatesOfCountry(countryCode), []);
  const cityOptions = useMemo(
    () =>
      City.getCitiesOfState(countryCode, customer.stateCode)
        .map((city) => city.name)
        .filter((city, index, cities) => cities.indexOf(city) === index)
        .sort((a, b) => a.localeCompare(b)),
    [customer.stateCode],
  );
  const selectedState = states.find(
    (state) => state.isoCode === customer.stateCode,
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
  const canCheckout =
    rows.length > 0 &&
    customer.name.trim() &&
    customer.addressLine.trim() &&
    isValidPinCode(customer.pinCode) &&
    selectedState &&
    getCity(customer).trim();

  function updateCustomer(field, value) {
    setCustomer((current) => {
      if (field === "pinCode") {
        return { ...current, pinCode: cleanPinCode(value) };
      }

      if (field === "stateCode") {
        const nextCities = City.getCitiesOfState(countryCode, value)
          .map((city) => city.name)
          .filter((city, index, cities) => cities.indexOf(city) === index)
          .sort((a, b) => a.localeCompare(b));

        return {
          ...current,
          stateCode: value,
          city: nextCities[0] || customCityValue,
          customCity: "",
        };
      }

      return { ...current, [field]: value };
    });
  }

  function moveToWishlist(row) {
    toggleWishlist({
      productId: row.product.id,
      slug: row.product.slug,
      sku: row.variant.sku,
    });
    removeFromBag(row.product.id, row.variant.sku);
  }

  function createWhatsAppHref() {
    const lines = [
      "*Hello Roop Sandook,*",
      "I would like to place this order:",
      "",
      "*Selected pieces*",
      ...rows.flatMap((row, index) => {
        const quantity = Math.min(row.item.quantity, getStockLimit(row));
        const price = row.variant.price || row.product.price || 0;

        return [
          `- *${index + 1}. ${row.product.name}*`,
          `  SKU: ${row.variant.sku}`,
          `  Colour: ${row.variant.colour?.title || "Default"}`,
          `  Qty: ${quantity}`,
          `  Line total: ${formatPrice(price * quantity)}`,
          `  Unit price: ${formatPrice(price)}`,
          "",
        ];
      }),
      "*Bill summary*",
      `- Subtotal: ${formatPrice(subtotal)}`,
      `- Shipping: ${shipping === 0 ? "Free" : formatPrice(shipping)}`,
      `- *Total: ${formatPrice(total)}*`,
      "",
      "*Shipping details*",
      `- Name: ${customer.name.trim()}`,
      `- Address: ${customer.addressLine.trim()}`,
      `- PIN code: ${customer.pinCode.trim()}`,
      `- State: ${selectedState?.name || customer.stateCode}`,
      `- City: ${getCity(customer).trim()}`,
      customer.note.trim() ? `- Note: ${customer.note.trim()}` : null,
      "",
      "Please confirm availability, payment details, and shipping timeline.",
    ];

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.filter(Boolean).join("\n"))}`;
  }

  if (hasOrdered) {
    return (
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl border border-border bg-brand-ivory p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-maroon">
            Order shared
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-brand-maroon">
            Thank you for shopping with us
          </h1>
          <p className="mt-4 text-sm leading-7 text-brand-maroon/75">
            We are excited to prepare your Roop Sandook pieces with care. Our
            team will review your WhatsApp order, confirm availability, and help
            you complete the next steps warmly and personally.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-grid h-11 place-items-center rounded-sm bg-brand-maroon px-5 text-xs font-semibold uppercase tracking-wide text-brand-ivory transition-colors hover:bg-brand-maroon/90"
          >
            Continue shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-maroon">
            Your bag
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-foreground">
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

          <div className="mt-8 grid gap-4 bg-brand-ivory p-5 text-sm leading-6 text-brand-maroon/75 sm:grid-cols-3">
            <InfoBlock title="Care" text="Keep jewellery away from water, perfume, and direct sprays. Store each piece separately in a dry pouch." />
            <InfoBlock title="Shipping" text="Most ready pieces ship after WhatsApp confirmation and payment details are completed." />
            <InfoBlock title="Free shipping" text="Orders above Rs. 1,299 ship free. Smaller orders include a Rs. 99 shipping charge." />
          </div>
        </div>

        <aside className="border border-border bg-background p-5 lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-sm font-semibold text-brand-maroon">
            Shipping Details
          </h2>
          <div className="mt-5 grid gap-4">
            <Field
              label="Name"
              value={customer.name}
              onChange={(value) => updateCustomer("name", value)}
              required
            />
            <Field
              label="Address"
              value={customer.addressLine}
              onChange={(value) => updateCustomer("addressLine", value)}
              multiline
              required
            />
            <Field
              label="PIN code"
              value={customer.pinCode}
              onChange={(value) => updateCustomer("pinCode", value)}
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              required
            />
            <SelectField
              label="State"
              value={customer.stateCode}
              onChange={(value) => updateCustomer("stateCode", value)}
              options={states.map((state) => ({
                label: state.name,
                value: state.isoCode,
              }))}
              required
            />
            <SelectField
              label="City"
              value={customer.city}
              onChange={(value) => updateCustomer("city", value)}
              options={[
                ...cityOptions.map((city) => ({ label: city, value: city })),
                { label: "Other city", value: customCityValue },
              ]}
              optionLabels={{ [customCityValue]: "Other city" }}
              required
            />
            {customer.city === customCityValue ? (
              <Field
                label="City name"
                value={customer.customCity}
                onChange={(value) => updateCustomer("customCity", value)}
                required
              />
            ) : null}
            <Field
              label="Order note"
              value={customer.note}
              onChange={(value) => updateCustomer("note", value)}
              multiline
              optional
            />
          </div>

          <div className="mt-6 border-y border-border py-5 text-sm">
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
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {shipping === 0
                ? `You saved ${formatPrice(shippingCharge)} on shipping.`
                : `Add items worth ${formatPrice(amountForFreeShipping)} more for free shipping.`}
            </p>
          ) : null}
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            We will confirm stock, final payment details, and shipping timeline
            on WhatsApp before dispatch.
          </p>

          <a
            href={canCheckout ? createWhatsAppHref() : undefined}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => {
              if (!canCheckout) {
                event.preventDefault();
                return;
              }
              setHasOrdered(true);
            }}
            className={`mt-5 grid h-12 place-items-center rounded-sm text-xs font-semibold uppercase tracking-wide transition-colors ${
              canCheckout
                ? "bg-brand-maroon text-brand-ivory hover:bg-brand-maroon/90"
                : "cursor-not-allowed bg-muted-foreground text-background"
            }`}
          >
            Order on WhatsApp
          </a>
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
    <article className="grid gap-4 border border-border bg-background p-4 sm:grid-cols-[96px_1fr_auto]">
      <Link href={productHref} className="block" aria-label={`View ${row.product.name}`}>
        {image?.url ? (
          <div className="relative aspect-square overflow-hidden bg-brand-ivory">
            <Image
              src={image.url}
              alt={image.alt || row.product.name}
              fill
              sizes="96px"
              className="object-cover transition-transform hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-square overflow-hidden">
            <JewelleryPlaceholder type="earrings" />
          </div>
        )}
      </Link>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-maroon/65">
          {row.product.category?.title || "Jewellery"}
        </p>
        <h2 className="mt-2 text-sm font-semibold text-foreground">
          <Link href={productHref} className="hover:text-brand-maroon">
            {row.product.name}
          </Link>
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">
          SKU: {row.variant.sku}
        </p>
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
        <p className="mt-1 text-xs text-muted-foreground">
          {stockLimit} in stock
        </p>
      </div>
    </article>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  optional = false,
  required = false,
  inputMode,
  maxLength,
  pattern,
}) {
  const className =
    "mt-2 w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-maroon";

  return (
    <label className="text-sm font-semibold text-brand-maroon">
      {label}
      {required ? <span className="text-brand-maroon"> *</span> : null}
      {optional ? (
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          Optional
        </span>
      ) : null}
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          rows={4}
          className={`${className} py-3`}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          inputMode={inputMode}
          maxLength={maxLength}
          pattern={pattern}
          className={`${className} h-11`}
        />
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <label className="text-sm font-semibold text-brand-maroon">
      {label}
      {required ? <span className="text-brand-maroon"> *</span> : null}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-2 h-11 w-full cursor-pointer rounded-sm border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-brand-maroon"
      >
        {options.map((option) => {
          const normalized =
            typeof option === "string" ? { label: option, value: option } : option;

          return (
          <option key={normalized.value} value={normalized.value}>
            {normalized.label}
          </option>
          );
        })}
      </select>
    </label>
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

function InfoBlock({ title, text }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-brand-maroon">{title}</h2>
      <p className="mt-2">{text}</p>
    </div>
  );
}

function getStockLimit(row) {
  return row.variant.inventoryCount || row.product.totalInventory || 1;
}

function getCity(customer) {
  return customer.city === customCityValue ? customer.customCity : customer.city;
}

function cleanPinCode(value) {
  return value.replace(/\D/g, "").slice(0, 6);
}

function isValidPinCode(value) {
  return /^\d{6}$/.test(value);
}
