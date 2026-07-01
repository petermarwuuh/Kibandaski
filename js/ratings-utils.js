import {
  collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { db, auth } from "./firebase-config.js";

export async function getFoodRating(foodId) {
  const foodSnap = await getDoc(doc(db, "foods", foodId));
  if (!foodSnap.exists()) return { avgRating: 0, ratingCount: 0 };
  const data = foodSnap.data();
  return {
    avgRating: data.avgRating || 0,
    ratingCount: data.ratingCount || 0
  };
}

export async function getUserRating(foodId) {
  const user = auth.currentUser;
  if (!user) return null;

  const q = query(
    collection(db, "ratings"),
    where("foodId", "==", foodId),
    where("userId", "==", user.uid)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data().rating;
}

export async function submitRating(foodId, rating, comment = "") {
  const user = auth.currentUser;
  if (!user) throw new Error("Please log in to rate food.");

  const q = query(
    collection(db, "ratings"),
    where("foodId", "==", foodId),
    where("userId", "==", user.uid)
  );
  const existing = await getDocs(q);

  if (!existing.empty) {
    await updateDoc(existing.docs[0].ref, { rating, comment, updatedAt: new Date() });
  } else {
    await addDoc(collection(db, "ratings"), {
      foodId,
      userId: user.uid,
      userEmail: user.email,
      rating,
      comment,
      createdAt: new Date()
    });
  }

  const allQ = query(collection(db, "ratings"), where("foodId", "==", foodId));
  const allSnap = await getDocs(allQ);
  let total = 0;
  allSnap.forEach((d) => { total += d.data().rating; });
  const count = allSnap.size;
  const avg = count ? Math.round((total / count) * 10) / 10 : 0;

  await updateDoc(doc(db, "foods", foodId), { avgRating: avg, ratingCount: count });
  return { avgRating: avg, ratingCount: count };
}

export function renderStars(rating, max = 5) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let html = "";
  for (let i = 1; i <= max; i++) {
    if (i <= full) html += "★";
    else if (i === full + 1 && half) html += "½";
    else html += "☆";
  }
  return html;
}
