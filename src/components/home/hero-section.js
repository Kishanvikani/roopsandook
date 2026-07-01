import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="bg-brand-ivory">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 md:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-maroon">
            Roop Sandook
          </p>
          <h1 className="font-display mt-5 text-5xl font-semibold leading-tight text-brand-maroon sm:text-6xl">
            Indian traditional jewellery for every celebration.
          </h1>
          <p className="mt-6 text-base leading-7 text-brand-maroon/75 sm:text-lg">
            Discover graceful pieces inspired by Indian festive wear, wedding
            styling, and timeless heirloom details. Browse the catalogue and
            place your order directly on WhatsApp.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-brand-maroon px-6 text-sm font-semibold uppercase tracking-wide text-brand-ivory transition-colors hover:bg-brand-maroon/90"
            >
              Shop Roop Sandook
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              href="/collections"
              className="inline-flex h-11 items-center justify-center rounded-sm border border-brand-maroon px-6 text-sm font-semibold uppercase tracking-wide text-brand-maroon transition-colors hover:bg-brand-maroon hover:text-brand-ivory"
            >
              View collections
            </Link>
          </div>
        </div>

        <div className="relative min-h-[460px] overflow-hidden rounded-sm bg-brand-maroon p-4 shadow-2xl shadow-brand-maroon/10">
          <div className="absolute inset-4 border border-brand-ivory/35" />
          <div className="relative grid h-full min-h-[428px] place-items-center bg-[radial-gradient(circle_at_50%_35%,rgba(245,245,221,0.22),transparent_34%),linear-gradient(145deg,rgba(128,0,0,0.96),rgba(80,0,0,1))] px-8 text-center text-brand-ivory">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em]">
                Roop Sandook
              </p>
              <p className="mt-5 text-7xl font-semibold leading-none">5%</p>
              <p className="mt-4 text-lg font-medium">off with code</p>
              <p className="mt-3 inline-flex border border-brand-ivory/50 px-5 py-2 text-sm font-semibold tracking-[0.25em]">
                WELCOME5
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
