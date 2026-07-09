import Image from "next/image";

import aboutImage from "@/assets/images/about-us.png";

export function AboutHero() {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl items-stretch gap-8 md:grid-cols-[0.95fr_1.05fr]">
        <div className="relative min-h-80 overflow-hidden bg-brand-ivory">
          <Image
            src={aboutImage}
            alt="Roop Sandook jewellery collection"
            fill
            priority
            sizes="(min-width: 768px) 46vw, 100vw"
            className="object-cover object-center"
          />
        </div>

        <div>
          <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold leading-tight text-brand-maroon sm:text-5xl">
            About Us
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-brand-maroon/75">
            Roop Sandook began with a simple love for Indian jewellery, the
            intricate craftsmanship, timeless silhouettes, and the stories every
            piece seems to carry. Growing up, a sandook was more than just a
            wooden chest. It was where treasured heirlooms, festive memories,
            and little keepsakes were carefully preserved. That feeling became
            the inspiration behind Roop Sandook. We thoughtfully curate
            imitation jewellery inspired by India's rich heritage, choosing
            pieces that celebrate tradition while fitting effortlessly into
            modern wardrobes. Every design is selected with intention for its
            beauty, craftsmanship, and timeless appeal. We believe discovering
            jewellery should feel like opening a sandook, finding something
            unexpected, meaningful, and worth cherishing. Love Roop Sandook
          </p>
          <p className="mt-5 text-sm font-semibold leading-7 text-brand-maroon">
            With Love,
            <br />
            Team Roop Sandook
          </p>
        </div>
      </div>
    </section>
  );
}
