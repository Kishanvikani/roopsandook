export function PolicyHero({ eyebrow, title, description }) {
  return (
    <section className="bg-brand-ivory px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-maroon">
          {eyebrow}
        </p>
        <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold leading-tight text-brand-maroon sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-brand-maroon/75">
          {description}
        </p>
      </div>
    </section>
  );
}
