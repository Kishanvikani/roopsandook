import Image from "next/image";

const logoMap = {
  small: {
    src: "/smallLogo.svg",
    width: 100,
    height: 100,
    className: "h-10 w-10",
  },
  expanded: {
    src: "/extendedLogo.svg",
    width: 171,
    height: 100,
    className: "h-12 w-auto",
  },
};

export function BrandLogo({ variant = "expanded", className = "", priority = false }) {
  const logo = logoMap[variant];

  return (
    <Image
      src={logo.src}
      alt="Roop Sandook"
      width={logo.width}
      height={logo.height}
      priority={priority}
      className={`${logo.className} ${className}`.trim()}
    />
  );
}
