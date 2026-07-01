import { NextResponse } from "next/server";

import {
  cataloguePageSize,
  getCatalogueFiltersData,
  getEffectiveShopFilters,
  getProductPage,
} from "@/services/catalogue";

const maxPrice = 3000;

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const filters = {
    q: params.get("q") || "",
    parentCategory: params.getAll("parentCategory"),
    category: params.getAll("category"),
    collection: params.getAll("collection"),
    colour: params.getAll("colour"),
    material: params.getAll("material"),
    availability: params.get("availability") || "in-stock",
    priceMax: params.get("priceMax") || String(maxPrice),
    sort: params.get("sort") || "newest",
  };
  const offset = Number(params.get("offset")) || 0;
  const limit = Number(params.get("limit")) || cataloguePageSize;
  const { categories } = await getCatalogueFiltersData();
  const effectiveFilters = getEffectiveShopFilters(filters, categories);
  const productPage = await getProductPage(effectiveFilters, {
    offset,
    limit,
  });

  return NextResponse.json(productPage);
}
