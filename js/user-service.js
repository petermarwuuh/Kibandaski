import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { resolveRole } from "./roles-config.js";

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) return { uid, ...snap.data() };
  return null;
}

export async function ensureUserProfile(user, displayName = "") {
  const existing = await getUserProfile(user.uid);
  if (existing) return existing;

  const { role, vendorRestaurant } = resolveRole(user.email || "");
  const profile = {
    email: user.email,
    displayName: displayName || user.displayName || "",
    role,
    vendorRestaurant: vendorRestaurant || null,
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, "users", user.uid), profile);
  return { uid: user.uid, ...profile };
}

export function isAdmin(profile) {
  return profile?.role === "admin";
}

export function isVendor(profile) {
  return profile?.role === "vendor";
}

export function canManageFoods(profile) {
  return profile?.role === "admin" || profile?.role === "vendor";
}

export function canManageOrders(profile) {
  return profile?.role === "admin" || profile?.role === "vendor";
}
