import { WishlistClient } from "@/components/wishlist/wishlist-client";
import { getCatalogueData } from "@/services/catalogue";

export const metadata = {
  title: "Wishlist",
  description: "Review saved Roop Sandook jewellery pieces.",
};

export default async function WishlistPage() {
  const { products } = await getCatalogueData();

  return <WishlistClient products={products} />;
}
