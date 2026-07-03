import { absoluteUrl } from "@/constants/site";
import { getProductSitemapEntries } from "@/services/catalogue";

const staticRoutes = [
  "",
  "/collections",
  "/shop",
  "/about",
  "/contact",
  "/faqs",
  "/shipping-policy",
  "/return-policy",
  "/shipping-and-return",
  "/privacy-policy",
  "/terms-and-conditions",
];

export default async function sitemap() {
  const products = await getProductSitemapEntries();
  const staticEntries = staticRoutes.map((route) => ({
    url: absoluteUrl(route || "/"),
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/shop" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
  const productEntries = products.map((product) => ({
    url: absoluteUrl(`/shop/${product.slug}`),
    lastModified: product._updatedAt ? new Date(product._updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
