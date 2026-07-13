import { ShopCatalogue } from "@/components/shop/shop-catalogue";
import {
  cataloguePageSize,
  getCatalogueFiltersData,
  getEffectiveShopFilters,
  getProductPage,
} from "@/services/catalogue";

const maxPrice = 3000;
const minPrice = 0;

export const metadata = {
  title: "Shop",
  description:
    "Shop Roop Sandook traditional Indian jewellery by category, colour, material, price, and availability.",
  alternates: {
    canonical: "/shop",
  },
};

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const filters = {
    q: getParam(params, "q"),
    parentCategory: getParams(params, "parentCategory"),
    category: getParams(params, "category"),
    collection: getParams(params, "collection"),
    colour: getParams(params, "colour"),
    material: getParams(params, "material"),
    availability: getParams(params, "availability"),
    priceMin: getParam(params, "priceMin") || String(minPrice),
    priceMax: getParam(params, "priceMax") || String(maxPrice),
    sort: getParam(params, "sort") || "newest",
  };
  const { categories, collections, colours, materials } =
    await getCatalogueFiltersData();
  const effectiveFilters = getEffectiveShopFilters(filters, categories);
  const productPage = await getProductPage(effectiveFilters, {
    limit: cataloguePageSize,
  });

  return (
    <ShopCatalogue
      filters={effectiveFilters}
      products={productPage.products}
      totalProducts={productPage.total}
      pageSize={cataloguePageSize}
      hasMore={productPage.hasMore}
      categories={categories}
      collections={collections}
      colours={colours}
      materials={materials}
    />
  );
}

function getParam(params, key) {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value || "";
}

function getParams(params, key) {
  const value = params?.[key];
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
}
