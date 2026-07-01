const storyPoints = [
  {
    title: "Curated for occasions",
    text: "Pieces are organized around the way Indian jewellery is worn: weddings, festivals, celebrations, and gifting.",
  },
  {
    title: "Traditional mood",
    text: "The catalogue leans into kundan, pearls, antique finishes, temple motifs, bangles, jhumkas, and festive accents.",
  },
  {
    title: "Simple ordering",
    text: "Customers can browse calmly, add products to their bag, and send order details through WhatsApp.",
  },
];

export function StorySection() {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-maroon">
            Our approach
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-foreground">
            Jewellery that feels familiar, festive, and easy to choose.
          </h2>
        </div>

        <div className="grid gap-4">
          {storyPoints.map((point) => (
            <article key={point.title} className="border border-border p-6">
              <h3 className="font-display text-xl font-semibold text-brand-maroon">
                {point.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {point.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
