import Link from "next/link";

export function SectionHeading({ title, action }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="max-w-2xl">
        <h2 className="font-display mt-3 text-3xl font-semibold text-brand-maroon">
          {title}
        </h2>
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
