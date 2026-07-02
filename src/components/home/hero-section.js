import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import heroImage from "@/assets/images/hero-image.jpg";

export function HeroSection() {
  return (
    <section className="bg-brand-ivory">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 md:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="max-w-xl">
          <h1 className="font-display mt-5 text-5xl font-semibold leading-tight text-brand-maroon sm:text-6xl">
            Treasures, Curated with Intention.
          </h1>
          <p className="mt-2 text-base leading-7 text-brand-maroon/75 sm:text-lg">
            Inspired by India's rich jewellery heritage, we thoughtfully curate imitation jewellery that celebrates timeless beauty.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-brand-maroon px-6 text-sm font-semibold uppercase tracking-wide text-brand-ivory transition-colors hover:bg-brand-maroon/90"
            >
              View Collection
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="flex min-h-[460px] items-center overflow-hidden rounded-sm bg-brand-maroon/5 shadow-2xl shadow-brand-maroon/10">
          <Image
            src={heroImage}
            alt="Roop Sandook traditional jewellery"
            priority
            sizes="(min-width: 768px) 52vw, 100vw"
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}
