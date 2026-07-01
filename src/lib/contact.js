const fallbackWhatsappNumber = "919096350705";

export const contactDetails = {
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || fallbackWhatsappNumber,
  email: "roopsandook@gmail.com",
  instagramHandle: "roop_sandook",
  address: "Pune, Maharashtra",
};

export function formatIndianPhone(number = contactDetails.whatsappNumber) {
  const localNumber = number.replace(/^91/, "");

  if (localNumber.length !== 10) {
    return `+${number}`;
  }

  return `+91 ${localNumber.slice(0, 5)} ${localNumber.slice(5)}`;
}

export function getWhatsappUrl(message = "Hi Roop Sandook") {
  return `https://wa.me/${contactDetails.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function getInstagramUrl() {
  return `https://www.instagram.com/${contactDetails.instagramHandle}/`;
}
