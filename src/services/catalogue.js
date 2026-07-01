import { sanityClient } from "@/services/sanity/client";
import { hasSanityConfig } from "@/services/sanity/env";

export const cataloguePageSize = 24;

const productCardProjection = `{
  _id,
  _createdAt,
  name,
  "slug": slug.current,
  shortDescription,
  isFeatured,
  isNewArrival,
  seoTitle,
  seoDescription,
  "category": category->{
    title,
    "slug": slug.current,
    "parentCategory": parentCategory->{title, "slug": slug.current}
  },
  "collections": collections[]->{title, "slug": slug.current},
  "materials": materials[]->{title, "slug": slug.current},
  "images": images[]{
    "url": asset->url,
    "alt": coalesce(asset->altText, "Product image")
  },
  variants[]{
    sku,
    price,
    compareAtPrice,
    inventoryCount,
    inStock,
    "colour": colour->{title, "slug": slug.current, hexCode},
    "images": images[]{
      "url": asset->url,
      "alt": coalesce(asset->altText, "Product image")
    }
  }
}`;

const productProjection = `{
  _id,
  _createdAt,
  name,
  "slug": slug.current,
  shortDescription,
  description,
  careInstructions,
  shippingInfo,
  isFeatured,
  isNewArrival,
  seoTitle,
  seoDescription,
  "category": category->{
    title,
    "slug": slug.current,
    "parentCategory": parentCategory->{title, "slug": slug.current}
  },
  "collections": collections[]->{title, "slug": slug.current},
  "materials": materials[]->{title, "slug": slug.current},
  "images": images[]{
    "url": asset->url,
    "alt": coalesce(asset->altText, "Product image")
  },
  variants[]{
    sku,
    price,
    compareAtPrice,
    inventoryCount,
    inStock,
    "colour": colour->{title, "slug": slug.current, hexCode},
    "images": images[]{
      "url": asset->url,
      "alt": coalesce(asset->altText, "Product image")
    }
  }
}`;

export async function getCatalogueFiltersData() {
  if (!hasSanityConfig) {
    return {
      categories: [],
      collections: [],
      colours: [],
      materials: [],
    };
  }

  const [categories, collections, colours, materials] = await Promise.all([
    sanityClient.fetch(
      `*[_type == "category" && active != false] | order(displayOrder asc, title asc) {
          _id,
          title,
          "slug": slug.current,
          description,
          "parentCategory": parentCategory->{title, "slug": slug.current},
          "image": image.asset->url
        }`,
      {},
      { next: { revalidate: 60 } },
    ),
    sanityClient.fetch(
      `*[_type == "collection" && active != false] | order(title asc) {
          _id,
          title,
          "slug": slug.current,
          description,
          "image": coverImage.asset->url,
          "count": count(*[_type == "product" && references(^._id)])
        }`,
      {},
      { next: { revalidate: 60 } },
    ),
    sanityClient.fetch(
      `*[_type == "colour" && active != false] | order(title asc) {
          _id,
          title,
          "slug": slug.current,
          hexCode
        }`,
      {},
      { next: { revalidate: 60 } },
    ),
    sanityClient.fetch(
      `*[_type == "material" && active != false] | order(title asc) {
          _id,
          title,
          "slug": slug.current,
          description
        }`,
      {},
      { next: { revalidate: 60 } },
    ),
  ]);

  return {
    categories: normalizeCategories(categories),
    collections,
    colours,
    materials,
  };
}

export async function getCatalogueData() {
  if (!hasSanityConfig) {
    return {
      products: [],
      categories: [],
      collections: [],
      colours: [],
      materials: [],
    };
  }

  const [filtersData, products] = await Promise.all([
    getCatalogueFiltersData(),
    sanityClient.fetch(
      `*[_type == "product" && defined(slug.current)] | order(_createdAt desc) ${productCardProjection}`,
      {},
      { next: { revalidate: 60 } },
    ),
  ]);

  return {
    ...filtersData,
    products: products.map(normalizeProduct),
  };
}

export async function getProductPage(filters, options = {}) {
  const limit = clampPageSize(options.limit);
  const offset = Math.max(Number(options.offset) || 0, 0);

  if (!hasSanityConfig) {
    return {
      products: [],
      total: 0,
      offset,
      limit,
      hasMore: false,
    };
  }

  const queryParts = buildProductFilterQuery(filters);
  const params = {
    ...queryParts.params,
    offset,
    end: offset + limit,
  };
  const orderClause = getProductOrderClause(filters?.sort);
  const productQuery = `*[${queryParts.filter}] | ${orderClause} [$offset...$end] ${productCardProjection}`;
  const countQuery = `count(*[${queryParts.filter}])`;
  const [products, total] = await Promise.all([
    sanityClient.fetch(productQuery, params, { next: { revalidate: 60 } }),
    sanityClient.fetch(countQuery, params, { next: { revalidate: 60 } }),
  ]);
  const normalizedProducts = products.map(normalizeProduct);

  return {
    products: normalizedProducts.sort((a, b) =>
      sortProducts(a, b, filters?.sort),
    ),
    total,
    offset,
    limit,
    hasMore: offset + normalizedProducts.length < total,
  };
}

export async function getParentCategoriesWithProductCounts() {
  if (!hasSanityConfig) {
    return [];
  }

  const categories = await sanityClient.fetch(
    `*[_type == "category" && active != false && !defined(parentCategory)] | order(displayOrder asc, title asc) {
      _id,
      title,
      "slug": slug.current,
      description,
      "image": image.asset->url,
      "count": count(*[
        _type == "product" &&
        defined(slug.current) &&
        (
          category->slug.current == ^.slug.current ||
          category->parentCategory->slug.current == ^.slug.current
        )
      ])
    }`,
    {},
    { next: { revalidate: 60 } },
  );

  return categories;
}

export async function getProductSitemapEntries() {
  if (!hasSanityConfig) {
    return [];
  }

  return sanityClient.fetch(
    `*[_type == "product" && defined(slug.current)] | order(_updatedAt desc) {
      "slug": slug.current,
      _updatedAt
    }`,
    {},
    { next: { revalidate: 60 } },
  );
}

export async function getProductBySlug(slug) {
  if (!hasSanityConfig || !slug) {
    return null;
  }

  const product = await sanityClient.fetch(
    `*[_type == "product" && slug.current == $slug][0] ${productProjection}`,
    { slug },
    { next: { revalidate: 60 } },
  );

  return product ? normalizeProduct(product) : null;
}

export function getEffectiveShopFilters(filters, categories) {
  const selectedParentCategories = getSelectedParentCategories(
    filters,
    categories,
  );
  const childCategories =
    selectedParentCategories.length > 0
      ? categories.filter((category) =>
          selectedParentCategories.includes(category.parentCategory?.slug),
        )
      : categories.filter((category) => category.parentCategory);
  const selectedChildCategories = toArray(filters.category).filter((slug) =>
    childCategories.some((category) => category.slug === slug),
  );

  return {
    ...filters,
    parentCategory: selectedParentCategories,
    category: selectedChildCategories,
  };
}

export async function getRelatedProducts(product) {
  if (!hasSanityConfig || !product?.id) {
    return [];
  }

  const colourSlugs = product.colours.map((colour) => colour.slug).filter(Boolean);
  const related = await sanityClient.fetch(
    `*[
      _type == "product" &&
      _id != $id &&
      defined(slug.current) &&
      (
        category->slug.current == $category ||
        (
          $parentCategory != "" &&
          (
            category->slug.current == $parentCategory ||
            category->parentCategory->slug.current == $parentCategory
          )
        ) ||
        count((variants[].colour->slug.current)[@ in $colours]) > 0 ||
        count((collections[]->slug.current)[@ in $collections]) > 0
      )
    ][0...12] ${productProjection}`,
    {
      id: product.id,
      category: product.category?.slug || "",
      parentCategory: product.parentCategory?.slug || "",
      colours: colourSlugs,
      collections: product.collections.map((collection) => collection.slug),
    },
    { next: { revalidate: 60 } },
  );

  return related
    .map(normalizeProduct)
    .map((relatedProduct) => ({
      product: relatedProduct,
      score: getRelatedScore(product, relatedProduct),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.product);
}

export function filterProducts(products, filters) {
  const query = filters.q?.trim().toLowerCase();
  const parentCategories = toArray(filters.parentCategory);
  const categories = toArray(filters.category);
  const collections = toArray(filters.collection);
  const colours = toArray(filters.colour);
  const materials = toArray(filters.material);
  const availability = filters.availability || "in-stock";
  const priceMax = parsePriceFilter(filters.priceMax);

  return products
    .filter((product) => {
      if (query) {
        const haystack = [
          product.name,
          product.description,
          product.shortDescription,
          product.category?.title,
          product.parentCategory?.title,
          product.childCategory?.title,
          ...product.collections.map((item) => item.title),
          ...product.materials.map((item) => item.title),
          ...product.colours.map((item) => item.title),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(query)) {
          return false;
        }
      }

      if (
        parentCategories.length > 0 &&
        !parentCategories.includes(product.parentCategory?.slug)
      ) {
        return false;
      }

      if (
        categories.length > 0 &&
        !categories.some((category) => product.categoryPath.includes(category))
      ) {
        return false;
      }

      if (
        collections.length > 0 &&
        !product.collections.some((item) => collections.includes(item.slug))
      ) {
        return false;
      }

      if (
        colours.length > 0 &&
        !product.colours.some((item) => colours.includes(item.slug))
      ) {
        return false;
      }

      if (
        materials.length > 0 &&
        !product.materials.some((item) => materials.includes(item.slug))
      ) {
        return false;
      }

      if (availability === "in-stock" && !product.inStock) {
        return false;
      }

      if (availability === "sold-out" && product.inStock) {
        return false;
      }

      if (
        priceMax != null &&
        product.price != null &&
        product.price > priceMax
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => sortProducts(a, b, filters.sort));
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
}

function clampPageSize(value) {
  const size = Number(value) || cataloguePageSize;

  return Math.min(Math.max(size, 1), 48);
}

function getSelectedParentCategories(filters, categories) {
  const inferredParents = toArray(filters.category)
    .map((slug) => categories.find((category) => category.slug === slug))
    .map((category) => category?.parentCategory?.slug || category?.slug)
    .filter(Boolean);

  return Array.from(
    new Set([...toArray(filters.parentCategory), ...inferredParents]),
  );
}

function buildProductFilterQuery(filters = {}) {
  const query = filters.q?.trim() || "";
  const parentCategories = toArray(filters.parentCategory);
  const categories = toArray(filters.category);
  const collections = toArray(filters.collection);
  const colours = toArray(filters.colour);
  const materials = toArray(filters.material);
  const availability = filters.availability || "in-stock";
  const priceMax = parsePriceFilter(filters.priceMax);
  const conditions = [`_type == "product"`, `defined(slug.current)`];
  const params = {};

  if (query) {
    conditions.push(`(
      name match $query ||
      shortDescription match $query ||
      description match $query ||
      category->title match $query ||
      category->parentCategory->title match $query ||
      count((collections[]->title)[@ match $query]) > 0 ||
      count((materials[]->title)[@ match $query]) > 0 ||
      count((variants[].colour->title)[@ match $query]) > 0
    )`);
    params.query = `*${query}*`;
  }

  if (parentCategories.length) {
    conditions.push(`(
      category->slug.current in $parentCategories ||
      category->parentCategory->slug.current in $parentCategories
    )`);
    params.parentCategories = parentCategories;
  }

  if (categories.length) {
    conditions.push(`(
      category->slug.current in $categories ||
      category->parentCategory->slug.current in $categories
    )`);
    params.categories = categories;
  }

  if (collections.length) {
    conditions.push(`count((collections[]->slug.current)[@ in $collections]) > 0`);
    params.collections = collections;
  }

  if (colours.length) {
    conditions.push(`count((variants[].colour->slug.current)[@ in $colours]) > 0`);
    params.colours = colours;
  }

  if (materials.length) {
    conditions.push(`count((materials[]->slug.current)[@ in $materials]) > 0`);
    params.materials = materials;
  }

  if (availability === "in-stock") {
    conditions.push(`count(variants[inventoryCount > 0 && inStock != false]) > 0`);
  }

  if (availability === "sold-out") {
    conditions.push(`count(variants[inventoryCount > 0 && inStock != false]) == 0`);
  }

  if (priceMax != null) {
    conditions.push(`(
      count(variants[defined(price)]) == 0 ||
      count(variants[defined(price) && price <= $priceMax]) > 0
    )`);
    params.priceMax = priceMax;
  }

  return {
    filter: conditions.join(" && "),
    params,
  };
}

function getProductOrderClause(sort = "newest") {
  if (sort === "price-asc") {
    return "order(variants[defined(price)][0].price asc, _createdAt desc)";
  }

  if (sort === "price-desc") {
    return "order(variants[defined(price)][0].price desc, _createdAt desc)";
  }

  if (sort === "name-asc") {
    return "order(name asc)";
  }

  return "order(_createdAt desc)";
}

function parsePriceFilter(value) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatPrice(price) {
  if (typeof price !== "number") {
    return "Price on request";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function normalizeProduct(product) {
  const variants = product.variants || [];
  const prices = variants
    .map((variant) => variant.price)
    .filter((price) => typeof price === "number");
  const compareAtPrices = variants
    .map((variant) => variant.compareAtPrice)
    .filter((price) => typeof price === "number");
  const variantImages = variants.flatMap((variant) => variant.images || []);
  const images = [...(product.images || []), ...variantImages].filter(
    (image) => image?.url,
  );
  const colours = uniqueBySlug(
    variants.map((variant) => variant.colour).filter(Boolean),
  );
  const totalInventory = variants.reduce(
    (sum, variant) => sum + (variant.inventoryCount || 0),
    0,
  );
  const lowestPrice = prices.length ? Math.min(...prices) : null;
  const lowestCompareAtPrice = compareAtPrices.length
    ? Math.min(...compareAtPrices)
    : null;
  const category = product.category || null;
  const parentCategory = category?.parentCategory || category;
  const childCategory = category?.parentCategory ? category : null;
  const categoryPath = [parentCategory?.slug, childCategory?.slug].filter(
    Boolean,
  );
  const seoTitle = product.seoTitle || product.name;
  const seoDescription =
    product.seoDescription ||
    product.shortDescription ||
    product.description ||
    `${product.name} from Roop Sandook.`;

  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    careInstructions: product.careInstructions,
    shippingInfo: product.shippingInfo,
    category,
    parentCategory,
    childCategory,
    categoryPath,
    collections: product.collections || [],
    materials: product.materials || [],
    colours,
    variants,
    images,
    image: images[0] || null,
    price: lowestPrice,
    compareAtPrice: lowestCompareAtPrice,
    priceLabel: formatPrice(lowestPrice),
    compareAtPriceLabel: formatPrice(lowestCompareAtPrice),
    totalInventory,
    inStock:
      totalInventory > 0 &&
      variants.some((variant) => variant.inStock !== false),
    badge: product.isNewArrival
      ? "New"
      : product.isFeatured
        ? "Featured"
        : totalInventory <= 0
          ? "Sold out"
          : null,
    seoTitle,
    seoDescription,
  };
}

function normalizeCategories(categories) {
  return categories.map((category) => ({
    ...category,
    parentCategory: category.parentCategory || null,
  }));
}

function uniqueBySlug(items) {
  const seen = new Set();

  return items.filter((item) => {
    if (!item?.slug || seen.has(item.slug)) {
      return false;
    }

    seen.add(item.slug);
    return true;
  });
}

function sortProducts(a, b, sort = "newest") {
  if (sort === "price-asc") {
    return (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER);
  }

  if (sort === "price-desc") {
    return (b.price ?? 0) - (a.price ?? 0);
  }

  if (sort === "name-asc") {
    return a.name.localeCompare(b.name);
  }

  return 0;
}

function getRelatedScore(product, relatedProduct) {
  const productColours = new Set(product.colours.map((colour) => colour.slug));
  const sharedColours = relatedProduct.colours.filter((colour) =>
    productColours.has(colour.slug),
  ).length;
  const sameChildCategory =
    product.childCategory?.slug &&
    product.childCategory.slug === relatedProduct.childCategory?.slug;
  const sameParentCategory =
    product.parentCategory?.slug &&
    product.parentCategory.slug === relatedProduct.parentCategory?.slug;
  const sharedCollections = relatedProduct.collections.filter((collection) =>
    product.collections.some((item) => item.slug === collection.slug),
  ).length;

  return (
    sharedColours * 4 +
    (sameChildCategory ? 5 : 0) +
    (sameParentCategory ? 2 : 0) +
    sharedCollections
  );
}
