export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://roopsandook.com"
).replace(/\/$/, "");

export const siteName = "Roop Sandook";

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${siteUrl}${normalizedPath}`;
}
