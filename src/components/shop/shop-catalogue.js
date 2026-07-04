"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ProductCard } from "@/components/product/product-card";
import { formatPrice } from "@/services/catalogue";

const maxPrice = 3000;
const minPrice = 0;
const defaultAvailability = ["in-stock", "sold-out"];

export function ShopCatalogue({
  filters,
  products,
  pageSize,
  hasMore,
  categories,
  collections,
  colours,
  materials,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [priceValues, setPriceValues] = useState({
    min: Number(filters.priceMin ?? minPrice),
    max: Number(filters.priceMax ?? maxPrice),
  });
  const [loadedProducts, setLoadedProducts] = useState(products);
  const [canLoadMore, setCanLoadMore] = useState(hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const loadMoreRef = useRef(null);
  const currentQuery = searchParams.toString();
  const [optimisticQuery, setOptimisticQuery] = useState(currentQuery);
  const optimisticParams = useMemo(
    () => new URLSearchParams(optimisticQuery),
    [optimisticQuery],
  );
  const uiFilters = useMemo(
    () => ({
      ...filters,
      parentCategory: optimisticParams.getAll("parentCategory"),
      category: optimisticParams.getAll("category"),
      collection: optimisticParams.getAll("collection"),
      colour: optimisticParams.getAll("colour"),
      material: optimisticParams.getAll("material"),
      availability: normalizeAvailability(optimisticParams.getAll("availability")),
      priceMin: optimisticParams.get("priceMin") || String(minPrice),
      priceMax: optimisticParams.get("priceMax") || String(maxPrice),
      sort: optimisticParams.get("sort") || "newest",
    }),
    [filters, optimisticParams],
  );
  const listingHref = currentQuery ? `/shop?${currentQuery}` : "/shop";
  const parentCategories = categories.filter(
    (category) => !category.parentCategory,
  );
  const selectedParentCategories = getSelectedParentCategories(
    uiFilters,
    categories,
  );
  const childCategories =
    selectedParentCategories.length > 0
      ? categories.filter((category) =>
          selectedParentCategories.includes(category.parentCategory?.slug),
        )
      : categories.filter((category) => category.parentCategory);
  const activeChips = useMemo(
    () =>
      buildActiveChips(uiFilters, {
        categories,
        collections,
        colours,
        materials,
      }),
    [uiFilters, categories, collections, colours, materials],
  );
  const loadedCount = loadedProducts.length;

  useEffect(() => {
    setOptimisticQuery(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    setLoadedProducts(products);
    setCanLoadMore(hasMore);
    setLoadError("");
  }, [products, hasMore, currentQuery]);

  useEffect(() => {
    setPriceValues({
      min: Number(uiFilters.priceMin),
      max: Number(uiFilters.priceMax),
    });
  }, [uiFilters.priceMin, uiFilters.priceMax]);

  useEffect(() => {
    if (
      String(priceValues.min) === String(uiFilters.priceMin) &&
      String(priceValues.max) === String(uiFilters.priceMax)
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      setPriceParams(priceValues);
    }, 350);

    return () => clearTimeout(timeout);
  }, [priceValues, uiFilters.priceMin, uiFilters.priceMax]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;

    if (!sentinel || !canLoadMore || isLoadingMore || isPending) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadNextPage();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [canLoadMore, isLoadingMore, isPending, currentQuery, loadedCount]);

  function navigate(nextParams) {
    const query = nextParams.toString();
    setOptimisticQuery(query);
    startTransition(() => {
      router.replace(query ? `/shop?${query}` : "/shop", { scroll: false });
    });
  }

  function setParam(name, value) {
    const next = new URLSearchParams(optimisticQuery);

    if (!value) {
      next.delete(name);
    } else {
      next.set(name, value);
    }

    navigate(next);
  }

  function setPriceParams(values) {
    const next = new URLSearchParams(optimisticQuery);
    const sanitizedMin = clampPrice(values.min, minPrice, maxPrice);
    const sanitizedMax = clampPrice(values.max, minPrice, maxPrice);
    const nextMin = Math.min(sanitizedMin, sanitizedMax);
    const nextMax = Math.max(sanitizedMin, sanitizedMax);

    if (nextMin === minPrice) {
      next.delete("priceMin");
    } else {
      next.set("priceMin", String(nextMin));
    }

    if (nextMax === maxPrice) {
      next.delete("priceMax");
    } else {
      next.set("priceMax", String(nextMax));
    }

    navigate(next);
  }

  function toggleParam(name, value, checked) {
    const next = new URLSearchParams(optimisticQuery);
    const values = next.getAll(name).filter((item) => item !== value);

    next.delete(name);
    if (checked) {
      values.push(value);
    }

    for (const item of values) {
      next.append(name, item);
    }

    if (name === "parentCategory" && !checked) {
      for (const child of categories.filter(
        (category) => category.parentCategory?.slug === value,
      )) {
        removeValue(next, "category", child.slug);
      }
    }

    navigate(next);
  }

  function toggleAvailability(value, checked) {
    const next = new URLSearchParams(optimisticQuery);
    const selected = new Set(uiFilters.availability);

    if (checked) {
      selected.add(value);
      selected.delete("none");
    } else {
      selected.delete(value);
    }

    const values = Array.from(selected).filter((item) =>
      defaultAvailability.includes(item),
    );

    next.delete("availability");
    if (values.length === 0) {
      next.append("availability", "none");
    } else if (values.length !== defaultAvailability.length) {
      for (const item of values) {
        next.append("availability", item);
      }
    }

    navigate(next);
  }

  function removeChip(chip) {
    const next = new URLSearchParams(optimisticQuery);

    if (chip.value) {
      removeValue(next, chip.name, chip.value);
    } else {
      next.delete(chip.name);
    }

    if (chip.name === "parentCategory") {
      for (const child of categories.filter(
        (category) => category.parentCategory?.slug === chip.value,
      )) {
        removeValue(next, "category", child.slug);
      }
    }

    navigate(next);
  }

  function resetFilters() {
    setOptimisticQuery("");
    startTransition(() => {
      router.replace("/shop", { scroll: false });
    });
  }

  async function loadNextPage() {
    if (isLoadingMore || !canLoadMore) {
      return;
    }

    setIsLoadingMore(true);
    setLoadError("");

    try {
      const nextParams = new URLSearchParams(currentQuery);
      nextParams.set("offset", String(loadedProducts.length));
      nextParams.set("limit", String(pageSize));
      const response = await fetch(`/api/catalogue?${nextParams.toString()}`);

      if (!response.ok) {
        throw new Error("Unable to load more products.");
      }

      const productPage = await response.json();
      setLoadedProducts((currentProducts) => [
        ...currentProducts,
        ...productPage.products,
      ]);
      setCanLoadMore(productPage.hasMore);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load more products.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,4fr)]">
        <aside className="border border-border bg-background p-5 lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-xl font-semibold text-brand-maroon">Filters</h2>

          <div className="mt-5 space-y-4">
            <FilterAccordion title="Category" defaultOpen>
              <CheckboxGroup
                name="parentCategory"
                items={parentCategories}
                selected={selectedParentCategories}
                onToggle={toggleParam}
              />
            </FilterAccordion>
            <FilterAccordion title="Sub-Category">
              {selectedParentCategories.length === 0 ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Select a category for sub-category to appear.
                </p>
              ) : childCategories.length ? (
                <CheckboxGroup
                  name="category"
                  items={childCategories}
                  selected={uiFilters.category}
                  onToggle={toggleParam}
                />
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  No sub-category for selected category.
                </p>
              )}
            </FilterAccordion>
            <FilterAccordion title="Colours">
              <CheckboxGroup
                name="colour"
                items={colours}
                selected={uiFilters.colour}
                onToggle={toggleParam}
                colourSwatches
              />
            </FilterAccordion>
            <FilterAccordion title="Materials">
              <CheckboxGroup
                name="material"
                items={materials}
                selected={uiFilters.material}
                onToggle={toggleParam}
              />
            </FilterAccordion>
            <FilterAccordion title="Price" defaultOpen>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-xs font-semibold text-brand-maroon/75">
                  Min
                  <input
                    type="number"
                    min={minPrice}
                    max={maxPrice}
                    step="50"
                    value={priceValues.min}
                    onChange={(event) =>
                      setPriceValues((current) => ({
                        ...current,
                        min: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm font-normal text-foreground outline-none transition-colors focus:border-brand-maroon"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-brand-maroon/75">
                  Max
                  <input
                    type="number"
                    min={minPrice}
                    max={maxPrice}
                    step="50"
                    value={priceValues.max}
                    onChange={(event) =>
                      setPriceValues((current) => ({
                        ...current,
                        max: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm font-normal text-foreground outline-none transition-colors focus:border-brand-maroon"
                  />
                </label>
              </div>
            </FilterAccordion>
            <FilterAccordion title="Availability">
              <div className="grid gap-3">
                <AvailabilityCheckbox
                  value="in-stock"
                  label="In stock"
                  checked={uiFilters.availability.includes("in-stock")}
                  onToggle={toggleAvailability}
                />
                <AvailabilityCheckbox
                  value="sold-out"
                  label="Out of stock"
                  checked={uiFilters.availability.includes("sold-out")}
                  onToggle={toggleAvailability}
                />
              </div>
            </FilterAccordion>
          </div>
        </aside>

        <div className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="font-display text-3xl font-semibold text-brand-maroon">
              Traditional Jewellery
            </h1>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <label
                htmlFor="sort"
                className="shrink-0 text-sm font-semibold text-brand-maroon"
              >
                Sort By
              </label>
              <select
                id="sort"
                value={uiFilters.sort}
                onChange={(event) => setParam("sort", event.target.value)}
                className="h-10 w-full cursor-pointer rounded-sm border border-border bg-background px-3 pr-9 text-sm text-foreground outline-none transition-colors focus:border-brand-maroon sm:w-44"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {activeChips.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <button
                  key={`${chip.name}-${chip.value || chip.label}`}
                  type="button"
                  onClick={() => removeChip(chip)}
                  className="cursor-pointer rounded-sm border border-border px-3 py-2 text-xs font-semibold text-brand-maroon transition-colors hover:border-brand-maroon"
                >
                  {chip.label} x
                </button>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="cursor-pointer rounded-sm bg-brand-ivory px-3 py-2 text-xs font-semibold text-brand-maroon transition-colors hover:bg-brand-ivory/70"
              >
                Reset all
              </button>
            </div>
          ) : null}

          <div className="relative">
            {isPending ? <ProductLoader /> : null}
            {loadedProducts.length ? (
              <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                {loadedProducts.map((product, index) => (
                  <ProductCard
                    key={product.slug}
                    product={product}
                    listingHref={listingHref}
                    compact
                    visualType={
                      index % 3 === 0
                        ? "bangle"
                        : index % 2 === 0
                          ? "necklace"
                          : "earrings"
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="mt-8 border border-border bg-brand-ivory p-6">
                <h2 className="font-display text-2xl font-semibold text-brand-maroon">
                  No matching products
                </h2>
                <p className="mt-3 text-sm leading-6 text-brand-maroon/75">
                  Try clearing filters or searching for a different product,
                  colour, collection, or material.
                </p>
              </div>
            )}
            {loadedProducts.length ? (
              <div
                ref={loadMoreRef}
                className="mt-8 min-h-12 text-center text-sm text-muted-foreground"
              >
                {isLoadingMore ? (
                  <span className="inline-flex items-center gap-3 font-semibold text-brand-maroon">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-maroon/30 border-t-brand-maroon" />
                    Loading more pieces
                  </span>
                ) : loadError ? (
                  <button
                    type="button"
                    onClick={loadNextPage}
                    className="cursor-pointer text-sm font-semibold text-brand-maroon hover:text-brand-maroon/75"
                  >
                    Try loading more again
                  </button>
                ) : canLoadMore ? (
                  <span>Loading more as you scroll</span>
                ) : (
                  <span>All matching pieces are shown</span>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterAccordion({ title, children, defaultOpen = false }) {
  return (
    <details
      className="border-t border-border py-4"
      open={defaultOpen ? true : undefined}
    >
      <summary className="cursor-pointer text-sm font-semibold text-brand-maroon">
        {title}
      </summary>
      <div className="mt-3 max-h-52 overflow-y-auto pr-1">{children}</div>
    </details>
  );
}

function CheckboxGroup({
  name,
  items,
  selected,
  onToggle,
  colourSwatches = false,
}) {
  if (!items.length) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        No options available.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <label
          key={item.slug}
          htmlFor={`${name}-${item.slug}`}
          className="flex cursor-pointer items-center gap-3 text-sm text-foreground"
        >
          <input
            id={`${name}-${item.slug}`}
            type="checkbox"
            value={item.slug}
            checked={selected.includes(item.slug)}
            onChange={(event) => onToggle(name, item.slug, event.target.checked)}
            className="h-4 w-4 cursor-pointer rounded-sm border-border accent-brand-maroon"
          />
          {colourSwatches ? (
            <span
              className="h-3 w-3 rounded-full border border-border"
              style={{ backgroundColor: colourFor(item) }}
              aria-hidden="true"
            />
          ) : null}
          <span>{item.title}</span>
        </label>
      ))}
    </div>
  );
}

function AvailabilityCheckbox({ value, label, checked, onToggle }) {
  return (
    <label
      htmlFor={`availability-${value}`}
      className="flex cursor-pointer items-center gap-3 text-sm text-foreground"
    >
      <input
        id={`availability-${value}`}
        type="checkbox"
        value={value}
        checked={checked}
        onChange={(event) => onToggle(value, event.target.checked)}
        className="h-4 w-4 cursor-pointer rounded-sm border-border accent-brand-maroon"
      />
      <span>{label}</span>
    </label>
  );
}

function ProductLoader() {
  return (
    <div className="absolute inset-x-0 top-6 z-10 grid min-h-52 place-items-center border border-border bg-background/90 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 text-sm font-semibold text-brand-maroon">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-maroon/30 border-t-brand-maroon" />
        Fetching handpicked pieces
      </div>
    </div>
  );
}

function buildActiveChips(filters, options) {
  const chips = [];

  addOptionChips(chips, "parentCategory", filters.parentCategory, options.categories);
  addOptionChips(chips, "category", filters.category, options.categories);
  addOptionChips(chips, "collection", filters.collection, options.collections);
  addOptionChips(chips, "colour", filters.colour, options.colours);
  addOptionChips(chips, "material", filters.material, options.materials);

  if (filters.availability.includes("none")) {
    chips.push({
      name: "availability",
      value: "none",
      label: "No stock selected",
    });
  } else if (filters.availability.length === 1) {
    chips.push({
      name: "availability",
      value: filters.availability[0],
      label:
        filters.availability[0] === "in-stock" ? "In stock" : "Out of stock",
    });
  }

  if (Number(filters.priceMin) > minPrice) {
    chips.push({
      name: "priceMin",
      label: `From ${formatPrice(Number(filters.priceMin))}`,
    });
  }

  if (Number(filters.priceMax) < maxPrice) {
    chips.push({
      name: "priceMax",
      label: `Under ${formatPrice(Number(filters.priceMax))}`,
    });
  }

  return chips;
}

function addOptionChips(chips, name, values, items) {
  for (const value of values) {
    const item = items.find((option) => option.slug === value);
    chips.push({
      name,
      value,
      label: item?.title || value,
    });
  }
}

function getSelectedParentCategories(filters, categories) {
  const inferredParents = filters.category
    .map((slug) => categories.find((category) => category.slug === slug))
    .map((category) => category?.parentCategory?.slug || category?.slug)
    .filter(Boolean);

  return unique([...filters.parentCategory, ...inferredParents]);
}

function removeValue(params, name, value) {
  const values = params.getAll(name).filter((item) => item !== value);
  params.delete(name);

  for (const item of values) {
    params.append(name, item);
  }
}

function normalizeAvailability(values) {
  if (values.includes("none")) {
    return ["none"];
  }

  const selected = values.filter((value) => defaultAvailability.includes(value));
  return selected.length ? selected : defaultAvailability;
}

function clampPrice(value, fallback, max) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, minPrice), max);
}

function unique(items) {
  return Array.from(new Set(items));
}

function colourFor(item) {
  if (item.hexCode) {
    return item.hexCode;
  }

  const slug = item.slug || item.title?.toLowerCase() || "";
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
