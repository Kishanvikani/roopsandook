import { BrandLogo } from "@/components/common/brand-logo";

export function BrandStory() {
  return (
    <section className="bg-background px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-center">
        <div className="min-h-80 bg-brand-maroon p-4">
          <div className="grid h-full min-h-72 place-items-center border border-brand-ivory/35 text-center text-brand-ivory">
            <div>
              <div className="flex justify-center">
                <BrandLogo variant="small" className="h-20 w-20" />
              </div>
              <p className="font-display mt-5 text-4xl font-semibold">
                Roop Sandook
              </p>
              <p className="mt-4 text-sm uppercase tracking-[0.22em]">
                A treasure box of tradition
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-maroon">
            Brand mood
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-foreground">
            Made for the Indian wardrobe.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
            The visual direction is warm, traditional, and occasion-led: deep
            maroon, soft ivory, antique gold hints, clean product grids, and a
            shopping flow that feels simple on mobile.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {["Weddings", "Festivals", "Gifting"].map((item) => (
              <div
                key={item}
                className="border border-border bg-brand-ivory px-4 py-5 text-center"
              >
                <p className="text-sm font-semibold text-brand-maroon">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
