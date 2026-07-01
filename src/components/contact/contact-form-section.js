export function ContactFormSection() {
  return (
    <section className="bg-brand-ivory px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-maroon">
            Send enquiry
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-brand-maroon">
            Tell us what you are looking for.
          </h2>
          <p className="mt-4 text-sm leading-7 text-brand-maroon/75">
            This is a visual placeholder form. We can later connect it to
            WhatsApp, email, or a simple form handler.
          </p>
        </div>

        <form className="grid gap-4 bg-background p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" placeholder="Your name" />
            <Field label="Phone" placeholder="Your phone number" />
          </div>
          <Field label="Email" placeholder="you@example.com" />
          <label className="grid gap-2 text-sm font-semibold text-brand-maroon">
            Message
            <textarea
              rows={5}
              placeholder="Ask about product, colour, availability, or custom styling."
              className="resize-none rounded-sm border border-border bg-background px-3 py-3 text-sm font-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-maroon"
            />
          </label>
          <button
            type="button"
            className="h-11 rounded-sm bg-brand-maroon px-6 text-sm font-semibold uppercase tracking-wide text-brand-ivory transition-colors hover:bg-brand-maroon/90"
          >
            Send enquiry
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, placeholder }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-brand-maroon">
      {label}
      <input
        placeholder={placeholder}
        className="h-11 rounded-sm border border-border bg-background px-3 text-sm font-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-maroon"
      />
    </label>
  );
}
