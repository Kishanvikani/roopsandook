"use client";

import Link from "next/link";
import { Heart, Menu, ShoppingBag, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/common/brand-logo";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { mainNavigation } from "@/constants/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { bagCount, wishlistCount } = useCommerce();

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brand-maroon/15 bg-brand-ivory/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center justify-start">
            <button
              className="grid h-10 w-10 place-items-center rounded-sm text-brand-maroon transition-colors hover:bg-brand-maroon/10 md:hidden"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              {isMenuOpen ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Menu size={20} aria-hidden="true" />
              )}
            </button>

            <Link
              href="/"
              className="hidden items-center md:inline-flex"
              aria-label="Roop Sandook home"
              onClick={() => setIsMenuOpen(false)}
            >
              <BrandLogo variant="expanded" priority className="h-11" />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <Link
              href="/"
              className="inline-flex items-center md:hidden"
              aria-label="Roop Sandook home"
              onClick={() => setIsMenuOpen(false)}
            >
              <BrandLogo variant="expanded" priority className="h-11" />
            </Link>

            <nav
              className="hidden items-center justify-center gap-7 md:flex"
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

          <div className="flex flex-1 items-center justify-end gap-2">
            <Link
              href="/wishlist"
              className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-sm text-brand-maroon transition-colors hover:bg-brand-maroon/10"
              aria-label="Open wishlist"
            >
              <Heart size={20} aria-hidden="true" />
              {wishlistCount > 0 ? <HeaderCount value={wishlistCount} /> : null}
            </Link>
            <Link
              href="/bag"
              className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-sm text-brand-maroon transition-colors hover:bg-brand-maroon/10"
              aria-label="Open shopping bag"
            >
              <ShoppingBag size={20} aria-hidden="true" />
              {bagCount > 0 ? <HeaderCount value={bagCount} /> : null}
            </Link>
          </div>
        </div>
      </header>

      {isMenuOpen ? (
        <div
          className="fixed inset-0 z-50 md:hidden"
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

function isActivePath(pathname, href) {
  if (href === "/") {
    return pathname === "/";
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
