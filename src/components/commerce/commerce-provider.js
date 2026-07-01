"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const wishlistStorageKey = "roop-sandook:wishlist";
const bagStorageKey = "roop-sandook:bag";
const CommerceContext = createContext(null);

export function CommerceProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [bagItems, setBagItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setWishlistItems(readStoredItems(wishlistStorageKey));
    setBagItems(readStoredItems(bagStorageKey));
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlistItems));
    }
  }, [hasHydrated, wishlistItems]);

  useEffect(() => {
    if (hasHydrated) {
      localStorage.setItem(bagStorageKey, JSON.stringify(bagItems));
    }
  }, [bagItems, hasHydrated]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timeout);
  }, [toast]);

  const notify = useCallback((message) => {
    setToast({ id: Date.now(), message });
  }, []);

  const isWishlisted = useCallback(
    (productId, sku) =>
      wishlistItems.some(
        (item) => item.productId === productId && item.sku === sku,
      ),
    [wishlistItems],
  );

  const toggleWishlist = useCallback((entry) => {
    const exists = wishlistItems.some(
      (item) => item.productId === entry.productId && item.sku === entry.sku,
    );

    setWishlistItems((current) => {
      if (exists) {
        return current.filter(
          (item) =>
            !(item.productId === entry.productId && item.sku === entry.sku),
        );
      }

      return [
        ...current,
        {
          productId: entry.productId,
          slug: entry.slug,
          sku: entry.sku,
          addedAt: new Date().toISOString(),
        },
      ];
    });

    notify(exists ? "Removed from wishlist" : "Added to wishlist");
  }, [notify, wishlistItems]);

  const removeWishlist = useCallback((productId, sku) => {
    setWishlistItems((current) =>
      current.filter(
        (item) => !(item.productId === productId && item.sku === sku),
      ),
    );
    notify("Removed from wishlist");
  }, [notify]);

  const addToBag = useCallback((entry, options = {}) => {
    const stockLimit = normalizeQuantity(entry.stockLimit, Number.MAX_SAFE_INTEGER);
    const entryQuantity = clampQuantity(entry.quantity || 1, stockLimit);
    const existing = bagItems.find(
      (item) => item.productId === entry.productId && item.sku === entry.sku,
    );

    if (existing) {
      if (options.incrementExisting) {
        setBagItems((current) =>
          current.map((item) =>
            item.productId === entry.productId && item.sku === entry.sku
              ? {
                  ...item,
                  quantity: clampQuantity(item.quantity + entryQuantity, stockLimit),
                  stockLimit,
                }
              : item,
          ),
        );
        notify("Updated bag quantity");
      } else {
        notify("Already in bag");
      }
    } else {
      setBagItems((current) => [
        ...current,
        {
          productId: entry.productId,
          slug: entry.slug,
          sku: entry.sku,
          quantity: entryQuantity,
          stockLimit,
          addedAt: new Date().toISOString(),
        },
      ]);
      notify("Added to bag");
    }

    setWishlistItems((current) =>
      current.filter(
        (item) =>
          !(item.productId === entry.productId && item.sku === entry.sku),
      ),
    );
  }, [bagItems, notify]);

  const removeFromBag = useCallback((productId, sku) => {
    setBagItems((current) =>
      current.filter(
        (item) => !(item.productId === productId && item.sku === sku),
      ),
    );
    notify("Removed from bag");
  }, [notify]);

  const updateBagQuantity = useCallback((productId, sku, quantity, stockLimit) => {
    const limit = normalizeQuantity(stockLimit, Number.MAX_SAFE_INTEGER);
    const nextQuantity = clampQuantity(quantity, limit);

    setBagItems((current) =>
      current.map((item) =>
        item.productId === productId && item.sku === sku
          ? { ...item, quantity: nextQuantity, stockLimit: limit }
          : item,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      wishlistItems,
      bagItems,
      wishlistCount: wishlistItems.length,
      bagCount: bagItems.reduce(
        (sum, item) => sum + normalizeQuantity(item.quantity, 0),
        0,
      ),
      toggleWishlist,
      removeWishlist,
      addToBag,
      removeFromBag,
      updateBagQuantity,
      isWishlisted,
    }),
    [
      addToBag,
      bagItems,
      isWishlisted,
      removeFromBag,
      removeWishlist,
      toggleWishlist,
      updateBagQuantity,
      wishlistItems,
    ],
  );

  return (
    <CommerceContext.Provider value={value}>
      {children}
      {toast ? <CommerceToast key={toast.id} message={toast.message} /> : null}
    </CommerceContext.Provider>
  );
}

export function useCommerce() {
  const context = useContext(CommerceContext);

  if (!context) {
    throw new Error("useCommerce must be used inside CommerceProvider.");
  }

  return context;
}

function readStoredItems(key) {
  try {
    const stored = localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item?.productId && item?.sku)
      .map((item) => ({
        ...item,
        quantity: normalizeQuantity(item.quantity, 1),
        stockLimit: normalizeQuantity(item.stockLimit, Number.MAX_SAFE_INTEGER),
      }));
  } catch {
    return [];
  }
}

function clampQuantity(quantity, stockLimit = Number.MAX_SAFE_INTEGER) {
  const limit = normalizeQuantity(stockLimit, Number.MAX_SAFE_INTEGER);
  return Math.min(normalizeQuantity(quantity, 1), limit);
}

function normalizeQuantity(quantity, fallback) {
  const parsed = Number(quantity);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function CommerceToast({ message }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-xs border border-brand-maroon/20 bg-background px-4 py-3 text-sm font-semibold text-brand-maroon shadow-lg animate-in fade-in slide-in-from-bottom-2">
      {message}
    </div>
  );
}
