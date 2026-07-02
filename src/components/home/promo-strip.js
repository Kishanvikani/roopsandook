const promos = [
  "5% discount on first purchase using code WELCOME5",
  "New festive jewellery drops now available",
  "WhatsApp checkout for quick order confirmation",
  "Wedding-ready and celebration-ready styles",
];

export function PromoStrip() {
  const tickerItems = [...promos, ...promos];

  return (
    <section className="overflow-hidden bg-brand-maroon py-3 text-brand-ivory">
      <div className="flex min-w-max animate-headline-ticker items-center gap-8 text-xs font-semibold tracking-[0.08em]">
        {tickerItems.map((promo, index) => (
          <span key={`${promo}-${index}`} className="whitespace-nowrap">
            {promo}
          </span>
        ))}
      </div>
    </section>
  );
}
