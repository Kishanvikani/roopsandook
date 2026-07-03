export function PolicyContent({ sections, compactTop = false }) {
  return (
    <section
      className={`px-4 pb-14 sm:px-6 lg:px-8 ${compactTop ? "pt-0" : "pt-14"}`}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-5">
        {sections.map((section) => (
          <article
            key={section.title}
            className="border border-border bg-background p-6"
          >
            <h2 className="font-display text-2xl font-semibold text-brand-maroon">
              {section.title}
            </h2>
            <div className="mt-3 grid gap-3 text-sm leading-7 text-muted-foreground">
              {toParagraphs(section.text).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.items?.length ? (
                <ul className="list-disc space-y-2 pl-5">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {toParagraphs(section.afterText).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function toParagraphs(text) {
  if (Array.isArray(text)) {
    return text;
  }

  return text ? [text] : [];
}
