import { BagClient } from "@/components/bag/bag-client";
import { getCatalogueData } from "@/services/catalogue";

export const metadata = {
  title: "Bag",
  description: "Review your Roop Sandook bag and checkout on WhatsApp.",
};

export default async function BagPage() {
  const { products } = await getCatalogueData();

  return <BagClient products={products} />;
}
