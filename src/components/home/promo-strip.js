const promos = [
  "Traditional Indian jewellery",
  "Free shipping above ₹1299",
  "Festive and wedding-ready styles",
  "WhatsApp checkout available",
];

export function PromoStrip() {
  return (
    <section className="overflow-hidden bg-brand-maroon py-3 text-brand-ivory">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap justify-center gap-x-8 gap-y-2 px-4 text-center text-xs font-semibold uppercase tracking-[0.18em] sm:px-6 lg:px-8">
        {promos.map((promo) => (
          <span key={promo}>{promo}</span>
        ))}
      </div>
    </section>
  );
}
