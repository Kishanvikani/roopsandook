const genericAltText = new Set([
  "image",
  "product image",
  "product photo",
]);

export function getProductImageAlt({ image, product, variant }) {
  const existingAlt = image?.alt?.trim();

  if (existingAlt && !genericAltText.has(existingAlt.toLowerCase())) {
    return existingAlt;
  }

  const productName = product?.name?.trim() || "Roop Sandook jewellery";
  const colour = variant?.colour?.title?.trim();
  const size = (variant?.size || product?.size)?.trim();
  const colourDescription = colour ? ` in ${colour}` : "";
  const sizeDescription = size ? `, size ${size}` : "";

  return `${productName}${colourDescription}${sizeDescription}`;
}
