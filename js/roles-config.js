/** Emails with full platform admin access */
export const ADMIN_EMAILS = [
  "admin@kibandaski.com",
  "admin@kibandaski.co.ke"
];

/** Vendor email → restaurant name mapping */
export const VENDOR_MAP = {
  "mamashamim@kibandaski.com": "Mama shamim",
  "zamzam@kibandaski.com": "Zamzam",
  "oguna@kibandaski.com": "Oguna",
  "erick@kibandaski.com": "Erick",
  "oxygen@kibandaski.com": "Oxygen",
  "rehoboth@kibandaski.com": "Rehoboth",
  "mums@kibandaski.com": "Mums"
};

export const RESTAURANTS = [
  "Erick",
  "Mama shamim",
  "Oxygen",
  "Zamzam",
  "Oguna",
  "Rehoboth",
  "Mums"
];

export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "On the way",
  "Delivered",
  "Denied"
];

export function resolveRole(email) {
  const normalized = email.toLowerCase().trim();
  if (ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(normalized)) {
    return { role: "admin", vendorRestaurant: null };
  }
  if (VENDOR_MAP[normalized]) {
    return { role: "vendor", vendorRestaurant: VENDOR_MAP[normalized] };
  }
  return { role: "customer", vendorRestaurant: null };
}
