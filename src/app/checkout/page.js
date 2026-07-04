import { CheckoutClient } from "@/components/checkout/checkout-client";
import { getCatalogueData } from "@/services/catalogue";

export const metadata = {
  title: "Checkout",
  description: "Share your Roop Sandook order details on WhatsApp.",
  alternates: {
    canonical: "/checkout",
  },
};

export default async function CheckoutPage() {
  const { products } = await getCatalogueData();

  return <CheckoutClient products={products} />;
}
