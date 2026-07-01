import { ShopCatalogue } from "@/components/shop/shop-catalogue";
import {
  cataloguePageSize,
  getCatalogueFiltersData,
  getEffectiveShopFilters,
  getProductPage,
} from "@/services/catalogue";

const maxPrice = 3000;

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
    q: "",
    parentCategory: getParams(params, "parentCategory"),
    category: getParams(params, "category"),
    collection: getParams(params, "collection"),
    colour: getParams(params, "colour"),
    material: getParams(params, "material"),
    availability: getParam(params, "availability") || "in-stock",
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
    <>
      <section className="bg-brand-ivory px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-maroon">
            Shop Roop Sandook
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold leading-tight text-brand-maroon sm:text-5xl">
            Traditional jewellery, ready to browse by style, colour, and price.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-brand-maroon/75">
            Search the current catalogue and narrow products using Sanity-managed
            categories, materials, colours, price, and availability.
          </p>
        </div>
      </section>

      <ShopCatalogue
        filters={effectiveFilters}
        products={productPage.products}
        totalProducts={productPage.total}
        pageSize={productPage.limit}
        hasMore={productPage.hasMore}
        categories={categories}
        collections={collections}
        colours={colours}
        materials={materials}
      />
    </>
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
