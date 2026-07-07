export const colorHexMap = {
  black: "#000000",
  "black-and-ruby": ["#000000", "#9B111E"],

  "blue-and-turquoise": ["#1E3A8A", "#40E0D0"],

  gold: "#D4AF37",
  golden: "#FFD700",

  green: "#228B22",
  "green-and-red": ["#228B22", "#C41E3A"],
  "green-and-ruby": ["#228B22", "#9B111E"],

  "light-green-and-pink": ["#90EE90", "#FFC0CB"],
  "light-green-and-ruby": ["#90EE90", "#9B111E"],

  "light-pink": "#FFB6C1",

  mint: "#98FF98",
  "mint-ruby": ["#98FF98", "#9B111E"],

  peach: "#FFDAB9",

  "peacock-blue": "#005F73",

  pink: "#FF69B4",
  "pink-and-green": ["#FF69B4", "#228B22"],
  "pink-and-turquoise": ["#FF69B4", "#40E0D0"],

  purple: "#800080",
  "purple-and-pink": ["#800080", "#FF69B4"],

  "rani-pink": "#E91E63",

  red: "#C41E3A",
  "red-and-green": ["#C41E3A", "#228B22"],
  "red-and-yellow": ["#C41E3A", "#FFD700"],
  "red-green-ruby": ["#C41E3A", "#228B22", "#9B111E"],

  "rodo-green": "#3CB371",

  ruby: "#9B111E",
  "ruby-and-green": ["#9B111E", "#228B22"],
  "ruby-green": ["#9B111E", "#228B22"],
  "ruby-moti": ["#9B111E", "#F8F8FF"],

  silver: "#C0C0C0",

  turquoise: "#40E0D0",

  "two-tone": ["#D4AF37", "#C0C0C0"],

  white: "#FFFFFF",

  yellow: "#FFD700",
  "yellow-and-green": ["#FFD700", "#228B22"],
  "yellow-and-ruby": ["#FFD700", "#9B111E"],
};

const fallbackColor = "#d6c3a2";

export function getColorSwatchStyle(item) {
  const colours = getColorSegments(item).slice(0, 3);

  if (colours.length === 1) {
    return { backgroundColor: colours[0] };
  }

  if (colours.length === 2) {
    return {
      background: `conic-gradient(${colours[0]} 0deg 180deg, ${colours[1]} 180deg 360deg)`,
    };
  }

  return {
    background: `conic-gradient(${colours[0]} 0deg 120deg, ${colours[1]} 120deg 240deg, ${colours[2]} 240deg 360deg)`,
  };
}

export function getColorSegments(item) {
  const hexCode = item?.hexCode;

  if (hexCode) {
    return [hexCode];
  }

  const keys = getColorKeys(item);
  const mappedValue = keys.map((key) => colorHexMap[key]).find(Boolean);

  if (mappedValue) {
    return Array.isArray(mappedValue) ? mappedValue : [mappedValue];
  }

  const parts = splitColorName(item?.title || item?.slug || "");
  const mappedParts = parts
    .map((part) => colorHexMap[normalizeColorKey(part)])
    .filter(Boolean)
    .flatMap((value) => (Array.isArray(value) ? value : [value]));

  return mappedParts.length ? mappedParts.slice(0, 3) : [fallbackColor];
}

function getColorKeys(item) {
  const values = [item?.slug, item?.title].filter(Boolean);
  const keys = values.map((value) => normalizeColorKey(value));

  return Array.from(new Set(keys));
}

function splitColorName(value) {
  return String(value)
    .split(/\s*(?:&|\band\b|\/|\+|,)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeColorKey(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/\+/g, " and ")
    .replace(/\//g, " and ")
    .replace(/,/g, " and ")
    .replace(/\s*\band\b\s*/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
