import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { db, auth } from "./firebase-config.js";

const LS_KEY = "kibandaski_favorites";

function getLocalFavorites() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function setLocalFavorites(ids) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

export async function getFavoriteIds() {
  const user = auth.currentUser;
  if (!user) return getLocalFavorites();

  const snap = await getDocs(collection(db, "users", user.uid, "favorites"));
  return snap.docs.map((d) => d.id);
}

export async function isFavorite(foodId) {
  const ids = await getFavoriteIds();
  return ids.includes(foodId);
}

export async function toggleFavorite(food) {
  const user = auth.currentUser;
  const foodId = food.id;

  if (!user) {
    const ids = getLocalFavorites();
    const index = ids.indexOf(foodId);
    if (index >= 0) {
      ids.splice(index, 1);
      setLocalFavorites(ids);
      return false;
    }
    ids.push(foodId);
    setLocalFavorites(ids);
    return true;
  }

  const favRef = doc(db, "users", user.uid, "favorites", foodId);
  const snap = await getDoc(favRef);
  if (snap.exists()) {
    await deleteDoc(favRef);
    return false;
  }
  await setDoc(favRef, {
    foodId,
    name: food.name,
    price: food.price,
    imageUrl: food.imageUrl,
    restaurant: food.restaurant || "",
    savedAt: new Date()
  });
  return true;
}

export async function getFavoriteFoods() {
  const user = auth.currentUser;
  if (!user) {
    const ids = getLocalFavorites();
    if (!ids.length) return [];
    const foods = [];
    for (const id of ids) {
      const snap = await getDoc(doc(db, "foods", id));
      if (snap.exists()) foods.push({ id: snap.id, ...snap.data() });
    }
    return foods;
  }

  const snap = await getDocs(collection(db, "users", user.uid, "favorites"));
  const foods = [];
  for (const favDoc of snap.docs) {
    const data = favDoc.data();
    const foodSnap = await getDoc(doc(db, "foods", favDoc.id));
    if (foodSnap.exists()) {
      foods.push({ id: foodSnap.id, ...foodSnap.data() });
    } else {
      foods.push({ id: favDoc.id, ...data });
    }
  }
  return foods;
}
