"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/common/brand-logo";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { mainNavigation } from "@/constants/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { bagCount, wishlistCount } = useCommerce();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsDesktopSearchOpen(false);
        setIsMobileSearchOpen(false);
      }
    }

    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    }

    if (isMenuOpen || isDesktopSearchOpen || isMobileSearchOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, isDesktopSearchOpen, isMobileSearchOpen]);

  function handleSearchSubmit(event) {
    event.preventDefault();

    const query = searchQuery.trim();
    const nextParams =
      pathname === "/shop"
        ? new URLSearchParams(searchParams.toString())
        : new URLSearchParams();

    nextParams.delete("offset");
    nextParams.delete("limit");
    nextParams.delete("loaded");

    if (query) {
      nextParams.set("q", query);
    } else {
      nextParams.delete("q");
    }

    const nextQuery = nextParams.toString();
    setIsMenuOpen(false);
    router.push(nextQuery ? `/shop?${nextQuery}` : "/shop");
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brand-maroon/15 bg-brand-ivory/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="flex w-1/2 items-center justify-start gap-1 sm:flex-1 sm:gap-0">
            <button
              className="grid h-9 w-9 place-items-center rounded-sm text-brand-maroon transition-colors hover:bg-brand-maroon/10 lg:hidden"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => {
                setIsMenuOpen((current) => !current);
                setIsMobileSearchOpen(false);
              }}
            >
              {isMenuOpen ? (
                <X size={18} aria-hidden="true" />
              ) : (
                <Menu size={18} aria-hidden="true" />
              )}
            </button>

            <Link
              href="/"
              className="inline-flex min-w-0 items-center sm:hidden"
              aria-label="Roop Sandook home"
              onClick={() => setIsMenuOpen(false)}
            >
              <BrandLogo variant="expanded" priority className="h-9 w-auto" />
            </Link>

            <Link
              href="/"
              className="hidden items-center lg:inline-flex"
              aria-label="Roop Sandook home"
              onClick={() => setIsMenuOpen(false)}
            >
              <BrandLogo variant="expanded" priority className="h-11" />
            </Link>
          </div>

          <div className="hidden flex-1 items-center justify-center sm:flex">
            <Link
              href="/"
              className="inline-flex items-center lg:hidden"
              aria-label="Roop Sandook home"
              onClick={() => setIsMenuOpen(false)}
            >
              <BrandLogo variant="expanded" priority className="h-11" />
            </Link>

            <nav
              className="hidden items-center justify-center gap-7 lg:flex"
              aria-label="Main"
            >
              {mainNavigation.map((item) => {
                const isActive = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`border-b-2 py-1 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-brand-maroon text-brand-maroon"
                        : "border-transparent text-brand-maroon/75 hover:text-brand-maroon"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex w-1/2 items-center justify-end gap-1 sm:flex-1 lg:gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              {isDesktopSearchOpen ? (
                <>
                  <SearchForm
                    id="desktop-global-search"
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSubmit={handleSearchSubmit}
                    className="flex"
                    autoFocus
                    hideLeadingIcon
                    hideSubmit
                  />
                  <button
                    type="button"
                    onClick={() => setIsDesktopSearchOpen(false)}
                    className="grid h-10 w-10 cursor-pointer place-items-center rounded-sm text-brand-maroon transition-colors hover:bg-brand-maroon/10"
                    aria-label="Close search"
                  >
                    <X size={20} aria-hidden="true" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsDesktopSearchOpen(true)}
                  className="grid h-10 w-10 cursor-pointer place-items-center rounded-sm text-brand-maroon transition-colors hover:bg-brand-maroon/10"
                  aria-label="Open search"
                  aria-expanded={isDesktopSearchOpen}
                  aria-controls="desktop-global-search"
                >
                  <Search size={20} aria-hidden="true" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsMobileSearchOpen((current) => !current);
                setIsMenuOpen(false);
              }}
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-sm text-brand-maroon transition-colors hover:bg-brand-maroon/10 lg:hidden"
              aria-label={isMobileSearchOpen ? "Close search" : "Open search"}
              aria-expanded={isMobileSearchOpen}
              aria-controls="mobile-global-search"
            >
              {isMobileSearchOpen ? (
                <X size={18} aria-hidden="true" />
              ) : (
                <Search size={18} aria-hidden="true" />
              )}
            </button>
            <Link
              href="/wishlist"
              className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-sm text-brand-maroon transition-colors hover:bg-brand-maroon/10 lg:h-10 lg:w-10"
              aria-label="Open wishlist"
            >
              <Heart className="h-[18px] w-[18px] lg:h-5 lg:w-5" aria-hidden="true" />
              {hasMounted && wishlistCount > 0 ? (
                <HeaderCount value={wishlistCount} />
              ) : null}
            </Link>
            <Link
              href="/bag"
              className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-sm text-brand-maroon transition-colors hover:bg-brand-maroon/10 lg:h-10 lg:w-10"
              aria-label="Open shopping bag"
            >
              <ShoppingBag className="h-[18px] w-[18px] lg:h-5 lg:w-5" aria-hidden="true" />
              {hasMounted && bagCount > 0 ? (
                <HeaderCount value={bagCount} />
              ) : null}
            </Link>
          </div>
        </div>
        {isMobileSearchOpen ? (
          <div
            id="mobile-global-search"
            className="border-t border-brand-maroon/15 px-4 py-3 lg:hidden"
          >
            <SearchForm
              id="mobile-global-search-input"
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              className="flex"
              autoFocus
            />
          </div>
        ) : null}
      </header>

      {isMenuOpen ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-brand-maroon/45"
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside
            id="mobile-navigation"
            className="absolute left-0 top-0 flex h-full w-[min(84vw,22rem)] flex-col bg-brand-ivory shadow-2xl"
          >
            <div className="flex h-16 items-center justify-between border-b border-brand-maroon/15 px-4">
              <BrandLogo variant="small" className="h-11 w-11" />
              <button
                className="grid h-10 w-10 place-items-center rounded-sm text-brand-maroon transition-colors hover:bg-brand-maroon/10"
                aria-label="Close menu"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <nav className="grid gap-1 px-4 py-5" aria-label="Mobile">
              {mainNavigation.map((item) => {
                const isActive = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-sm px-3 py-4 text-base font-medium text-brand-maroon transition-colors hover:bg-brand-maroon/10 ${
                      isActive ? "bg-brand-maroon/10" : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function SearchForm({
  id,
  value,
  onChange,
  onSubmit,
  className,
  autoFocus = false,
  hideLeadingIcon = false,
  hideSubmit = false,
}) {
  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={`min-w-0 items-center gap-2 ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <div className="flex h-10 min-w-0 flex-1 items-center border border-brand-maroon/25 bg-background">
        {hideLeadingIcon ? null : (
          <Search
            size={16}
            className="ml-3 shrink-0 text-brand-maroon/65"
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search jewellery"
          autoFocus={autoFocus}
          enterKeyHint="search"
          className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-brand-maroon/50 lg:w-52"
        />
      </div>
      {hideSubmit ? null : (
        <button
          type="submit"
          className="grid h-10 shrink-0 cursor-pointer place-items-center rounded-sm bg-brand-maroon px-3 text-xs font-semibold uppercase tracking-wide text-brand-ivory transition-colors hover:bg-brand-maroon/90"
        >
          Search
        </button>
      )}
    </form>
  );
}

function isActivePath(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/collections") {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      pathname === "/shop" ||
      pathname.startsWith("/shop/")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function HeaderCount({ value }) {
  return (
    <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-maroon px-1 text-[10px] font-semibold leading-none text-brand-ivory">
      {value}
    </span>
  );
}
