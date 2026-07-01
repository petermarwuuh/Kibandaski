import { ORDER_STATUSES } from "./roles-config.js";

export function getStatusIndex(status) {
  const idx = ORDER_STATUSES.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export function isStatusDenied(status) {
  return status === "Denied";
}

export function renderTrackingStepper(status) {
  const steps = ORDER_STATUSES.filter((s) => s !== "Denied");
  const denied = isStatusDenied(status);
  const currentIdx = denied ? -1 : getStatusIndex(status);

  const stepsHtml = steps
    .map((step, i) => {
      let cls = "track-step";
      if (denied) cls += " denied";
      else if (i < currentIdx) cls += " done";
      else if (i === currentIdx) cls += " active";
      return `<div class="${cls}"><span class="track-dot"></span><span class="track-label">${step}</span></div>`;
    })
    .join("");

  const deniedBanner = denied
    ? `<p class="track-denied">This order was denied or cancelled.</p>`
    : "";

  return `<div class="track-stepper">${stepsHtml}</div>${deniedBanner}`;
}

export function orderContainsVendorItems(order, restaurant) {
  if (!restaurant || !order.items) return false;
  return order.items.some((item) => item.restaurant === restaurant);
}

export function formatOrderDate(createdAt) {
  if (!createdAt) return "";
  const date = createdAt.seconds
    ? new Date(createdAt.seconds * 1000)
    : createdAt instanceof Date
      ? createdAt
      : new Date(createdAt);
  return date.toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}
