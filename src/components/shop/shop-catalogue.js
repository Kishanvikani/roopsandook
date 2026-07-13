"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, SlidersHorizontal, X } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import { getColorSwatchStyle } from "@/constants/colorMapper";
import { formatPrice } from "@/services/catalogue";

const maxPrice = 3000;
const minPrice = 0;
const defaultAvailability = ["in-stock", "sold-out"];
const shopRestorePrefix = "roop-sandook:shop-restore:";

function normalizeShopRestore(state) {
  if (!state) {
    return null;
  }

  const loadedCount = Math.max(
    Number(state.loadedCount) || state.products?.length || 0,
    0,
  );
  const scrollY = Math.max(Number(state.scrollY) || 0, 0);

  if (!loadedCount && !scrollY) {
    return null;
  }

  return {
    loadedCount,
    productSlug: state.productSlug || "",
    scrollY,
  };
}

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
  const [isRestoringListing, setIsRestoringListing] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [loadError, setLoadError] = useState("");
  const loadMoreRef = useRef(null);
  const loadedProductsRef = useRef(products);
  const canLoadMoreRef = useRef(hasMore);
  const isLoadingMoreRef = useRef(false);
  const isRestoringListingRef = useRef(false);
  const pendingRestoreRef = useRef(null);
  const hasRestoredScrollRef = useRef(false);
  const currentQuery = searchParams.toString();
  const currentQueryRef = useRef(currentQuery);
  const pageSizeRef = useRef(pageSize);
  const [optimisticQuery, setOptimisticQuery] = useState(currentQuery);
  const optimisticParams = useMemo(
    () => new URLSearchParams(optimisticQuery),
    [optimisticQuery],
  );
  const uiFilters = useMemo(
    () => ({
      ...filters,
      parentCategory: optimisticParams.getAll("parentCategory"),
      q: optimisticParams.get("q") || "",
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
  const listingHref = getListingHref(currentQuery);
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
    loadedProductsRef.current = loadedProducts;
    canLoadMoreRef.current = canLoadMore;
    isLoadingMoreRef.current = isLoadingMore;
    isRestoringListingRef.current = isRestoringListing;
    currentQueryRef.current = currentQuery;
    pageSizeRef.current = pageSize;
  }, [
    canLoadMore,
    currentQuery,
    isLoadingMore,
    isRestoringListing,
    loadedProducts,
    pageSize,
  ]);

  useEffect(() => {
    setOptimisticQuery(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const restoreState = normalizeShopRestore(readShopRestore(currentQuery));

    setLoadedProducts(products);
    setCanLoadMore(hasMore);
    loadedProductsRef.current = products;
    canLoadMoreRef.current = hasMore;

    if (restoreState) {
      pendingRestoreRef.current = restoreState;
      hasRestoredScrollRef.current = false;
    } else {
      pendingRestoreRef.current = null;
      hasRestoredScrollRef.current = false;
    }

    setIsRestoringListing(false);
    setLoadError("");
    isRestoringListingRef.current = false;
  }, [products, hasMore, currentQuery]);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    const restoreState = pendingRestoreRef.current;

    if (
      !restoreState ||
      hasRestoredScrollRef.current ||
      isRestoringListingRef.current ||
      loadedProducts.length >= restoreState.loadedCount
    ) {
      return;
    }

    let cancelled = false;

    async function restoreLoadedPages() {
      isRestoringListingRef.current = true;
      setIsRestoringListing(true);
      setLoadError("");

      try {
        let nextProducts = loadedProducts;
        let nextCanLoadMore = canLoadMore;

        while (
          !cancelled &&
          nextCanLoadMore &&
          nextProducts.length < restoreState.loadedCount
        ) {
          const productPage = await fetchProductPage(
            currentQuery,
            nextProducts.length,
            pageSize,
          );
          const existingSlugs = new Set(
            nextProducts.map((product) => product.slug),
          );
          const newProducts = productPage.products.filter(
            (product) => !existingSlugs.has(product.slug),
          );

          if (!newProducts.length) {
            nextCanLoadMore = false;
            break;
          }

          nextProducts = [...nextProducts, ...newProducts];
          nextCanLoadMore = productPage.hasMore;
        }

        if (cancelled) {
          return;
        }

        setLoadedProducts(nextProducts);
        setCanLoadMore(nextCanLoadMore);
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to restore product position.",
          );
        }
      } finally {
        if (!cancelled) {
          isRestoringListingRef.current = false;
          setIsRestoringListing(false);
        }
      }
    }

    restoreLoadedPages();

    return () => {
      cancelled = true;
    };
  }, [
    canLoadMore,
    currentQuery,
    loadedProducts,
    pageSize,
  ]);

  useEffect(() => {
    const restoreState = pendingRestoreRef.current;

    if (!restoreState || hasRestoredScrollRef.current || isRestoringListing) {
      return;
    }

    const productIsLoaded = loadedProducts.some(
      (product) => product.slug === restoreState.productSlug,
    );
    const loadedFarEnough = loadedProducts.length >= restoreState.loadedCount;

    if (!loadedFarEnough && !productIsLoaded) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.scrollTo(0, restoreState.scrollY);
        hasRestoredScrollRef.current = true;
        pendingRestoreRef.current = null;
        writeShopRestore(currentQuery, {
          loadedCount: loadedProducts.length,
          canLoadMore,
          scrollY: restoreState.scrollY,
        });
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [canLoadMore, currentQuery, isRestoringListing, loadedProducts]);

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

    if (
      !sentinel ||
      !canLoadMore ||
      isLoadingMore ||
      isPending ||
      isRestoringListing
    ) {
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
  }, [
    canLoadMore,
    isLoadingMore,
    isPending,
    isRestoringListing,
    currentQuery,
    loadedCount,
  ]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsFilterDrawerOpen(false);
      }
    }

    if (isFilterDrawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFilterDrawerOpen]);

  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 700);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function navigate(nextParams) {
    nextParams.delete("loaded");
    const query = nextParams.toString();
    removeShopRestore(currentQuery);
    removeShopRestore(query);
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

  function setSingleParam(name, value) {
    const next = new URLSearchParams(optimisticQuery);

    next.delete(name);

    if (value) {
      next.set(name, value);
    }

    if (name === "parentCategory") {
      next.delete("category");
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
    removeShopRestore(currentQuery);
    setOptimisticQuery("");
    startTransition(() => {
      router.replace("/shop", { scroll: false });
    });
  }

  function rememberProductPosition(product) {
    const restoreQuery = getListingQuery(currentQuery);
    const restoreState = {
      loadedCount: loadedProducts.length,
      canLoadMore,
      productSlug: product.slug,
      scrollY: window.scrollY,
    };

    writeShopRestore(currentQuery, restoreState);
    writeShopRestore(restoreQuery, restoreState);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loadNextPage() {
    if (
      isLoadingMoreRef.current ||
      isRestoringListingRef.current ||
      !canLoadMoreRef.current
    ) {
      return;
    }

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadError("");

    try {
      const productPage = await fetchProductPage(
        currentQueryRef.current,
        loadedProductsRef.current.length,
        pageSizeRef.current,
      );
      setLoadedProducts((currentProducts) => {
        const existingSlugs = new Set(
          currentProducts.map((product) => product.slug),
        );
        const newProducts = productPage.products.filter(
          (product) => !existingSlugs.has(product.slug),
        );
        const nextProducts = [...currentProducts, ...newProducts];

        loadedProductsRef.current = nextProducts;
        return nextProducts;
      });
      canLoadMoreRef.current = productPage.hasMore;
      setCanLoadMore(productPage.hasMore);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load more products.",
      );
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,4fr)]">
        <aside className="hidden border border-border bg-background p-5 lg:sticky lg:top-24 lg:block lg:self-start">
          <ShopFilters
            childCategories={childCategories}
            colours={colours}
            materials={materials}
            parentCategories={parentCategories}
            priceValues={priceValues}
            selectedParentCategories={selectedParentCategories}
            setPriceValues={setPriceValues}
            setSingleParam={setSingleParam}
            toggleAvailability={toggleAvailability}
            toggleParam={toggleParam}
            uiFilters={uiFilters}
            idPrefix="desktop"
          />
        </aside>

        <div className="relative">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display max-w-3xl text-4xl font-semibold leading-tight text-brand-maroon sm:text-5xl">
                Traditional Jewellery
              </h1>
              {uiFilters.q ? (
                <p className="mt-3 text-sm leading-6 text-brand-maroon/70">
                  Search results for{" "}
                  <span className="font-semibold text-brand-maroon">
                    {uiFilters.q}
                  </span>
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-sm border border-brand-maroon px-3 text-xs font-semibold uppercase tracking-wide text-brand-maroon transition-colors hover:bg-brand-maroon hover:text-brand-ivory lg:hidden"
              aria-label="Open filters and sorting"
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              Filter
            </button>
            <div className="hidden w-full items-center gap-3 sm:w-auto lg:flex">
              <label
                htmlFor="desktop-sort"
                className="shrink-0 text-sm font-semibold text-brand-maroon"
              >
                Sort By
              </label>
              <select
                id="desktop-sort"
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
            <ActiveChips
              activeChips={activeChips}
              className="mt-6 hidden lg:flex"
              onRemove={removeChip}
              onReset={resetFilters}
            />
          ) : null}

          <div className="relative">
            {isPending ? <ProductLoader /> : null}
            {loadedProducts.length ? (
              <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                {loadedProducts.map((product, index) => (
                  <div key={product.slug} data-product-slug={product.slug}>
                    <ProductCard
                      product={product}
                      listingHref={listingHref}
                      compact
                      onProductOpen={rememberProductPosition}
                      visualType={
                        index % 3 === 0
                          ? "bangle"
                          : index % 2 === 0
                            ? "necklace"
                            : "earrings"
                      }
                    />
                  </div>
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

      {isFilterDrawerOpen ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters and sorting"
        >
          <button
            type="button"
            className="absolute inset-0 bg-brand-maroon/45"
            aria-label="Close filters"
            onClick={() => setIsFilterDrawerOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[min(88vw,24rem)] flex-col bg-background shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <h2 className="text-xl font-semibold text-brand-maroon">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-sm text-brand-maroon transition-colors hover:bg-brand-maroon/10"
                aria-label="Close filters"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div>
                <label
                  htmlFor="mobile-sort"
                  className="text-sm font-semibold text-brand-maroon"
                >
                  Sort By
                </label>
                <select
                  id="mobile-sort"
                  value={uiFilters.sort}
                  onChange={(event) => setParam("sort", event.target.value)}
                  className="mt-2 h-10 w-full cursor-pointer rounded-sm border border-border bg-background px-3 pr-9 text-sm text-foreground outline-none transition-colors focus:border-brand-maroon"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>

              <ActiveChips
                activeChips={activeChips}
                className="mt-5 flex"
                hideReset
                onRemove={removeChip}
                onReset={resetFilters}
              />

              <div className="mt-5">
                <ShopFilters
                  childCategories={childCategories}
                  colours={colours}
                  materials={materials}
                  parentCategories={parentCategories}
                  priceValues={priceValues}
                  selectedParentCategories={selectedParentCategories}
                  setPriceValues={setPriceValues}
                  setSingleParam={setSingleParam}
                  toggleAvailability={toggleAvailability}
                  toggleParam={toggleParam}
                  uiFilters={uiFilters}
                  idPrefix="mobile"
                  hideTitle
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-border p-5">
              <button
                type="button"
                onClick={resetFilters}
                className="grid h-11 w-full cursor-pointer place-items-center rounded-sm border border-brand-maroon text-xs font-semibold uppercase tracking-wide text-brand-maroon transition-colors hover:bg-brand-maroon hover:text-brand-ivory"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="grid h-11 w-full cursor-pointer place-items-center rounded-sm bg-brand-maroon text-xs font-semibold uppercase tracking-wide text-brand-ivory transition-colors hover:bg-brand-maroon/90"
              >
                Show only
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {showBackToTop ? (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-24 right-5 z-40 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-brand-maroon bg-background px-4 text-xs font-semibold uppercase tracking-wide text-brand-maroon shadow-lg shadow-brand-maroon/15 transition-colors hover:bg-brand-maroon hover:text-brand-ivory"
          aria-label="Back to top"
        >
          <ArrowUp size={16} aria-hidden="true" />
        </button>
      ) : null}
    </section>
  );
}

function ShopFilters({
  childCategories,
  colours,
  idPrefix,
  hideTitle = false,
  materials,
  parentCategories,
  priceValues,
  selectedParentCategories,
  setPriceValues,
  setSingleParam,
  toggleAvailability,
  toggleParam,
  uiFilters,
}) {
  return (
    <>
      {hideTitle ? null : (
        <h2 className="text-xl font-semibold text-brand-maroon">Filters</h2>
      )}

      <div className={hideTitle ? "space-y-4" : "mt-5 space-y-4"}>
        <FilterAccordion title="Category" defaultOpen>
          <RadioGroup
            name="parentCategory"
            items={parentCategories}
            selected={selectedParentCategories[0] || ""}
            onSelect={setSingleParam}
            idPrefix={idPrefix}
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
              idPrefix={idPrefix}
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
            idPrefix={idPrefix}
          />
        </FilterAccordion>
        <FilterAccordion title="Materials">
          <CheckboxGroup
            name="material"
            items={materials}
            selected={uiFilters.material}
            onToggle={toggleParam}
            idPrefix={idPrefix}
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
              idPrefix={idPrefix}
            />
            <AvailabilityCheckbox
              value="sold-out"
              label="Out of stock"
              checked={uiFilters.availability.includes("sold-out")}
              onToggle={toggleAvailability}
              idPrefix={idPrefix}
            />
          </div>
        </FilterAccordion>
      </div>
    </>
  );
}

function ActiveChips({
  activeChips,
  className,
  hideReset = false,
  onRemove,
  onReset,
  showReset = false,
}) {
  if (!activeChips.length && !showReset) {
    return null;
  }

  return (
    <div className={`flex-wrap gap-2 ${className}`}>
      {activeChips.map((chip) => (
        <button
          key={`${chip.name}-${chip.value || chip.label}`}
          type="button"
          onClick={() => onRemove(chip)}
          className="cursor-pointer rounded-sm border border-border px-3 py-2 text-xs font-semibold text-brand-maroon transition-colors hover:border-brand-maroon"
        >
          {chip.label} x
        </button>
      ))}
      {hideReset ? null : (
        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer rounded-sm bg-brand-ivory px-3 py-2 text-xs font-semibold text-brand-maroon transition-colors hover:bg-brand-ivory/70"
        >
          Reset all
        </button>
      )}
    </div>
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

function RadioGroup({
  name,
  items,
  selected,
  onSelect,
  idPrefix,
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
          htmlFor={`${idPrefix}-${name}-${item.slug}`}
          className="flex cursor-pointer items-center gap-3 text-sm text-foreground"
        >
          <input
            id={`${idPrefix}-${name}-${item.slug}`}
            type="radio"
            name={`${idPrefix}-${name}`}
            value={item.slug}
            checked={selected === item.slug}
            onChange={() => onSelect(name, item.slug)}
            className="h-4 w-4 cursor-pointer border-border accent-brand-maroon"
          />
          <span>
            {item.title}
            {typeof item.count === "number" ? ` (${item.count})` : ""}
          </span>
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({
  name,
  items,
  selected,
  onToggle,
  colourSwatches = false,
  idPrefix,
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
          htmlFor={`${idPrefix}-${name}-${item.slug}`}
          className="flex cursor-pointer items-center gap-3 text-sm text-foreground"
        >
          <input
            id={`${idPrefix}-${name}-${item.slug}`}
            type="checkbox"
            value={item.slug}
            checked={selected.includes(item.slug)}
            onChange={(event) => onToggle(name, item.slug, event.target.checked)}
            className="h-4 w-4 cursor-pointer rounded-sm border-border accent-brand-maroon"
          />
          {colourSwatches ? (
            <span
              className="h-3 w-3 rounded-full border border-border"
              style={getColorSwatchStyle(item)}
              aria-hidden="true"
            />
          ) : null}
          <span>
            {item.title}
            {typeof item.count === "number" ? ` (${item.count})` : ""}
          </span>
        </label>
      ))}
    </div>
  );
}

function AvailabilityCheckbox({ value, label, checked, onToggle, idPrefix }) {
  return (
    <label
      htmlFor={`${idPrefix}-availability-${value}`}
      className="flex cursor-pointer items-center gap-3 text-sm text-foreground"
    >
      <input
        id={`${idPrefix}-availability-${value}`}
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

  if (filters.q) {
    chips.push({
      name: "q",
      value: filters.q,
      label: `Search: ${filters.q}`,
    });
  }

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

function getListingHref(query) {
  const listingQuery = getListingQuery(query);
  return listingQuery ? `/shop?${listingQuery}` : "/shop";
}

function getListingQuery(query) {
  const params = new URLSearchParams(query);
  params.delete("offset");
  params.delete("limit");
  params.delete("loaded");

  return params.toString();
}

async function fetchProductPage(query, offset, limit) {
  const nextParams = new URLSearchParams(query);
  nextParams.delete("loaded");
  nextParams.set("offset", String(offset));
  nextParams.set("limit", String(limit));
  const response = await fetch(`/api/catalogue?${nextParams.toString()}`);

  if (!response.ok) {
    throw new Error("Unable to load more products.");
  }

  return response.json();
}

function getShopRestoreKey(query) {
  const params = new URLSearchParams(query);
  params.delete("offset");
  params.delete("limit");
  params.delete("loaded");
  const entries = Array.from(params.entries()).sort(([nameA, valueA], [
    nameB,
    valueB,
  ]) => {
    if (nameA === nameB) {
      return valueA.localeCompare(valueB);
    }

    return nameA.localeCompare(nameB);
  });
  const normalizedQuery = new URLSearchParams(entries).toString();

  return `${shopRestorePrefix}${normalizedQuery || "all"}`;
}

function readShopRestore(query) {
  try {
    const stored = sessionStorage.getItem(getShopRestoreKey(query));
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function removeShopRestore(query) {
  try {
    sessionStorage.removeItem(getShopRestoreKey(query));
  } catch {
    // Best effort only; storage may be unavailable.
  }
}

function writeShopRestore(query, state) {
  try {
    sessionStorage.setItem(getShopRestoreKey(query), JSON.stringify(state));
  } catch {
    // Best effort only; storage may be unavailable or full.
  }
}
