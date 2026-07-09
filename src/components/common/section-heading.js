import Link from "next/link";

export function SectionHeading({ title, action }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className="font-display text-2xl font-semibold text-brand-maroon sm:text-3xl">
          {title}
        </h2>
      </div>
      {action ? (
        <Link
          href={action.href}
          className="shrink-0 text-sm font-semibold uppercase tracking-wide text-brand-maroon hover:text-brand-maroon/75"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
