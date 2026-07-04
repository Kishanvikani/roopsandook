import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import heroImage from "@/assets/images/hero-image.jpg";

export function HeroSection() {
  return (
    <section className="bg-brand-ivory">
      <div className="mx-auto grid w-full max-w-7xl sm:gap-8 sm:px-6 sm:py-10 md:min-h-[calc(100vh-4rem)] md:grid-cols-[0.95fr_1.05fr] md:items-center lg:px-8">
        <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-brand-maroon/5 shadow-2xl shadow-brand-maroon/10 sm:min-h-[460px] sm:rounded-sm md:order-2">
          <Image
            src={heroImage}
            alt="Roop Sandook traditional jewellery"
            fill
            priority
            sizes="(min-width: 768px) 52vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="max-w-xl px-4 py-10 sm:px-0 sm:py-0 md:order-1">
          <h1 className="font-display text-5xl font-semibold leading-tight text-brand-maroon sm:text-6xl">
            Treasures, Curated with Intention.
          </h1>
          <p className="mt-2 text-base leading-7 text-brand-maroon/75 sm:text-lg">
            Inspired by India's rich jewellery heritage, we thoughtfully curate imitation jewellery that celebrates timeless beauty.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-brand-maroon px-6 text-sm font-semibold uppercase tracking-wide text-brand-ivory transition-colors hover:bg-brand-maroon/90"
          >
            View Collection
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
