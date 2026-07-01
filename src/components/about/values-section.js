const values = ["Warm", "Traditional", "Elegant", "Trustworthy"];

export function ValuesSection() {
  return (
    <section className="bg-brand-maroon px-4 py-12 text-brand-ivory sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em]">
          Brand values
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div key={value} className="border border-brand-ivory/25 p-6">
              <p className="font-display text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
