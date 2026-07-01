export function PolicyContent({ sections }) {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5">
        {sections.map((section) => (
          <article key={section.title} className="border border-border bg-background p-6">
            <h2 className="font-display text-2xl font-semibold text-brand-maroon">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {section.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
