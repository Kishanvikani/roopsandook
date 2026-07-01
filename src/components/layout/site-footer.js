import Link from "next/link";

import { BrandLogo } from "@/components/common/brand-logo";
import { footerNavigation, mainNavigation } from "@/constants/navigation";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-maroon/15 bg-brand-maroon text-brand-ivory">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <BrandLogo variant="expanded" className="h-14" />
          <p className="mt-3 max-w-sm text-sm leading-6 text-brand-ivory/75">
            Indian traditional jewellery for festive dressing, weddings,
            gifting, and everyday grace.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Explore</p>
          <div className="mt-3 grid gap-2">
            {mainNavigation.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-brand-ivory/75 hover:text-brand-ivory"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Support</p>
          <div className="mt-3 grid gap-2">
            {footerNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-brand-ivory/75 hover:text-brand-ivory"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
