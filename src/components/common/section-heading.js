import Link from "next/link";

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-maroon">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display mt-3 text-3xl font-semibold text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className="text-sm font-semibold uppercase tracking-wide text-brand-maroon hover:text-brand-maroon/75"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
