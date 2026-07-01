import Link from "next/link";
import Image from "next/image";

export function CollectionCard({ collection, href }) {
  const title = collection.title || collection.name;
  const description =
    collection.description || `Explore ${title} pieces from Roop Sandook.`;

  return (
    <Link
      href={href || `/shop?collection=${collection.slug}`}
      className="group block overflow-hidden border border-border bg-background"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-ivory">
        {collection.image ? (
          <Image
            src={collection.image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm font-semibold text-brand-maroon/60">
            {title}
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-maroon/65">
          {collection.count || 0} pieces
        </p>
        <h3 className="mt-2 text-xl font-semibold text-brand-maroon">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
}
