import Image from "next/image";

import footerLogo from "@/assets/svg/footer-logo.svg";
import headerLogo from "@/assets/svg/header-logo.svg";

const logoMap = {
  small: {
    src: "/smallLogo.svg",
    width: 100,
    height: 100,
    className: "h-10 w-10",
  },
  expanded: {
    src: headerLogo,
    width: 240,
    height: 80,
    className: "h-12 w-auto",
  },
  footer: {
    src: footerLogo,
    width: 240,
    height: 80,
    className: "h-14 w-auto",
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
