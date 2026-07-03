import Link from "next/link";
import Image from "next/image";

export function CollectionCard({ collection, href }) {
  const title = collection.title || collection.name;

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
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm font-semibold text-brand-maroon/60">
            {title}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate text-xl text-foreground">
          {title}
        </h3>
      </div>
    </Link>
  );
}
