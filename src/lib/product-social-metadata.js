export const defaultSocialImage = {
  url: "/social-preview.jpg",
  width: 1200,
  height: 630,
  alt: "Roop Sandook traditional Indian jewellery",
};

export function getProductSocialDescription(product) {
  const productDescription =
    product.seoDescription ||
    product.shortDescription ||
    product.description ||
    `Shop ${product.name} from Roop Sandook.`;
  const pricePrefix = getPricePrefix(product);
  const availability = product.inStock ? "In stock" : "Currently sold out";

  return [pricePrefix, availability, productDescription]
    .filter(Boolean)
    .join(" · ");
}

function getPricePrefix(product) {
  if (typeof product.price !== "number") {
    return "";
  }

  const prices = new Set(
    product.variants
      .map((variant) => variant.price)
      .filter((price) => typeof price === "number"),
  );
  const prefix = prices.size > 1 ? "From " : "";

  return `${prefix}${formatSocialPrice(product.price)}`;
}

function formatSocialPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}
