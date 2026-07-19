import { createImageUrlBuilder } from "@sanity/image-url";

import { sanityClient } from "@/services/sanity/client";

const builder = createImageUrlBuilder(sanityClient);

export function urlForImage(source) {
  return source ? builder.image(source) : null;
}

export function getSocialImageUrl(source) {
  if (!source) {
    return null;
  }

  return builder
    .image(source)
    .ignoreImageParams()
    .width(1200)
    .height(630)
    .fit("fillmax")
    .bg("f8f2e8")
    .format("jpg")
    .quality(85)
    .url();
}
