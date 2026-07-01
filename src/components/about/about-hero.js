import { BrandLogo } from "@/components/common/brand-logo";

export function AboutHero() {
  return (
    <section className="bg-brand-ivory px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-maroon">
            About Roop Sandook
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold leading-tight text-brand-maroon sm:text-5xl">
            A treasure box of Indian traditional jewellery.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-brand-maroon/75">
            Roop Sandook is being shaped as a warm, occasion-led jewellery
            brand for Indian wardrobes: festive styling, wedding moments,
            gifting, and graceful everyday pieces.
          </p>
        </div>

        <div className="bg-brand-maroon p-4">
          <div className="grid min-h-80 place-items-center border border-brand-ivory/35 px-6 text-center text-brand-ivory">
            <div>
              <div className="flex justify-center">
                <BrandLogo variant="small" className="h-20 w-20" />
              </div>
              <p className="font-display mt-5 text-6xl font-semibold">2026</p>
              <p className="mt-4 text-sm uppercase tracking-[0.22em]">
                Tradition in every detail
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
