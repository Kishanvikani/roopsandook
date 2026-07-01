export function FaqList({ faqs }) {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-4xl gap-4">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group border border-border bg-background p-5 open:border-brand-maroon/35"
          >
            <summary className="cursor-pointer list-none text-base font-semibold text-brand-maroon">
              <span className="flex items-center justify-between gap-4">
                {faq.question}
                <span className="text-xl leading-none transition-transform group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
