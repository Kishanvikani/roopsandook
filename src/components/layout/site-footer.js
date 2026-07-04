import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

import { BrandLogo } from "@/components/common/brand-logo";
import {
  contactDetails,
  formatIndianPhone,
  getInstagramUrl,
  getWhatsappUrl,
} from "@/lib/contact";
import { getParentCategoriesWithProductCounts } from "@/services/catalogue";

const quickLinks = [
  { label: "About us", href: "/about" },
  { label: "Contact Info", href: "/contact" },
  { label: "Shipping And Return", href: "/shipping-and-return" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms and Conditions", href: "/terms-and-conditions" },
];

export async function SiteFooter() {
  const parentCategories = await getParentCategoriesWithProductCounts();
  const categoryLinks = parentCategories.map((category) => ({
    label: category.title,
    href: `/shop?parentCategory=${category.slug}`,
  }));

  return (
    <footer className="border-t border-brand-maroon/15 bg-brand-maroon text-brand-ivory">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_2fr_1fr] lg:px-8">
        <div>
          <BrandLogo variant="footer" />
          <p className="mt-3 max-w-sm text-sm leading-6 text-brand-ivory/75">
            Treasures, Curated with Intention.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-semibold">Categories</p>
            <div className="mt-3 grid gap-2">
              {categoryLinks.map((item) => (
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
            <p className="text-sm font-semibold">Quick Links</p>
            <div className="mt-3 grid gap-2">
              {quickLinks.map((item) => (
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

        <div>
          <p className="text-sm font-semibold">Stay Connected ©</p>
          <div className="mt-3 grid gap-2">
            <Link
              href={getInstagramUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-brand-ivory/75 hover:text-brand-ivory"
              aria-label={`Open @${contactDetails.instagramHandle} on Instagram`}
            >
              <InstagramIcon />
              <span>@{contactDetails.instagramHandle}</span>
            </Link>
            <Link
              href={getWhatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-brand-ivory/75 hover:text-brand-ivory"
              aria-label="Chat with Roop Sandook on WhatsApp"
            >
              <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
              <span>{formatIndianPhone()}</span>
            </Link>
            <Link
              href={`mailto:${contactDetails.email}`}
              className="inline-flex items-center gap-2 text-sm text-brand-ivory/75 hover:text-brand-ivory"
              aria-label={`Email ${contactDetails.email}`}
            >
              <Mail className="h-[18px] w-[18px]" aria-hidden="true" />
              <span>{contactDetails.email}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <rect
        width="18"
        height="18"
        x="3"
        y="3"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}
