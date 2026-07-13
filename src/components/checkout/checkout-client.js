"use client";

import Link from "next/link";
import { City, State } from "country-state-city";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useCommerce } from "@/components/commerce/commerce-provider";
import { contactDetails } from "@/lib/contact";
import { formatPrice } from "@/services/catalogue";

const freeShippingThreshold = 1299;
const shippingCharge = 99;
const countryCode = "IN";
const customCityValue = "__custom";

export function CheckoutClient({ products }) {
  const { bagItems, removeFromBag, updateBagQuantity } = useCommerce();
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
          `  Size: ${getRowSize(row)}`,
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
      "Payment mode: Bank transfer or UPI after confirmation.",
      "Please confirm availability, payment details, and shipping timeline.",
    ];

    return `https://wa.me/${contactDetails.whatsappNumber}?text=${encodeURIComponent(lines.filter(Boolean).join("\n"))}`;
  }

  if (hasOrdered) {
    return (
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl border border-border bg-brand-ivory p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-maroon">
            Order shared
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold leading-tight text-brand-maroon sm:text-5xl">
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
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href="/bag"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-maroon hover:text-brand-maroon/75"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to bag
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <h1 className="font-display max-w-3xl text-4xl font-semibold leading-tight text-brand-maroon sm:text-5xl">
              Checkout
            </h1>
            {rows.length ? (
              <div className="mt-6 grid gap-4">
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
            ) : (
              <div className="mt-6 border border-border bg-brand-ivory p-6">
                <h2 className="font-display text-2xl font-semibold text-brand-maroon">
                  Your bag is empty
                </h2>
                <p className="mt-3 text-sm leading-6 text-brand-maroon/75">
                  Add a piece to your bag before checkout.
                </p>
                <Link
                  href="/shop"
                  className="mt-5 inline-grid h-10 place-items-center rounded-sm bg-brand-maroon px-4 text-xs font-semibold uppercase tracking-wide text-brand-ivory"
                >
                  Browse jewellery
                </Link>
              </div>
            )}
          </div>

          <aside className="border border-border bg-background p-5 lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-semibold text-brand-maroon">
              Order Summary
            </h2>
            <div className="mt-5 border-y border-border py-5 text-sm">
              <SummaryLine label="Subtotal" value={formatPrice(subtotal)} />
              <SummaryLine
                label="Shipping"
                value={shipping === 0 ? "Free" : formatPrice(shipping)}
              />
              <SummaryLine label="Total" value={formatPrice(total)} strong />
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Payment will be completed by bank transfer or UPI after WhatsApp
              confirmation.
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
      </div>
    </section>
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

function SelectField({ label, value, onChange, options, required = false }) {
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
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
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

function getStockLimit(row) {
  return row.variant.inventoryCount || row.product.totalInventory || 1;
}

function getRowSize(row) {
  return row.variant.size || row.product.size || "-";
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
