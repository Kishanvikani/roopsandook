"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SectionHeading } from "@/components/common/section-heading";
import { ProductCard } from "@/components/product/product-card";
import { formatPrice } from "@/services/catalogue";

const maxPrice = 3000;

export function ShopCatalogue({
  filters,
  products,
  totalProducts,
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
  const [priceValue, setPriceValue] = useState(Number(filters.priceMax));
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
      availability: optimisticParams.get("availability") || "in-stock",
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
    setPriceValue(Number(uiFilters.priceMax));
  }, [uiFilters.priceMax]);

  useEffect(() => {
    if (String(priceValue) === String(uiFilters.priceMax)) {
      return;
    }

    const timeout = setTimeout(() => {
      setParam("priceMax", String(priceValue));
    }, 350);

    return () => clearTimeout(timeout);
  }, [priceValue, uiFilters.priceMax]);

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

    if (!value || (name === "availability" && value === "in-stock")) {
      next.delete(name);
    } else {
      next.set(name, value);
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
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="border border-border bg-background p-5 lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-sm font-semibold text-brand-maroon">Filters</h2>

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
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-brand-maroon/75">
                  <span>{formatPrice(0)}</span>
                  <span>{formatPrice(priceValue)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  step="50"
                  value={priceValue}
                  onChange={(event) => setPriceValue(Number(event.target.value))}
                  className="mt-4 w-full cursor-pointer accent-brand-maroon"
                />
              </div>
            </FilterAccordion>
            <FilterAccordion title="Availability">
              <select
                id="availability"
                value={uiFilters.availability}
                onChange={(event) => setParam("availability", event.target.value)}
                className="h-11 w-full cursor-pointer rounded-sm border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-brand-maroon"
              >
                <option value="all">All</option>
                <option value="in-stock">In stock</option>
                <option value="sold-out">Out of stock</option>
              </select>
            </FilterAccordion>
          </div>
        </aside>

        <div className="relative">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow={`${totalProducts} product${
                totalProducts === 1 ? "" : "s"
              }`}
              title="Traditional Jewellery"
              description="Browse products currently published in Sanity."
            />
            <div className="w-full sm:w-56">
              <label
                htmlFor="sort"
                className="text-sm font-semibold text-brand-maroon"
              >
                Sort
              </label>
              <select
                id="sort"
                value={uiFilters.sort}
                onChange={(event) => setParam("sort", event.target.value)}
                className="mt-3 h-11 w-full cursor-pointer rounded-sm border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-brand-maroon"
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
              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {loadedProducts.map((product, index) => (
                  <ProductCard
                    key={product.slug}
                    product={product}
                    listingHref={listingHref}
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

  if (filters.availability && filters.availability !== "in-stock") {
    chips.push({
      name: "availability",
      label: filters.availability === "all" ? "All stock" : "Out of stock",
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
