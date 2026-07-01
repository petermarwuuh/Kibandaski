import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

export function getOrCreateCartId() {
  let cartId = localStorage.getItem("cartId");
  if (!cartId) {
    cartId = "cart_" + Math.random().toString(36).substring(2, 11);
    localStorage.setItem("cartId", cartId);
  }
  return cartId;
}

export function calculateDeliveryFee(subtotal) {
  if (subtotal <= 100) return 15;
  const extra = subtotal - 100;
  const steps = Math.floor(extra / 10);
  return 15 + steps * 2;
}

export async function addItemToCart(cartId, food) {
  const cartRef = doc(db, "carts", cartId);
  const cartSnap = await getDoc(cartRef);
  const item = {
    id: food.id,
    name: food.name,
    description: food.description,
    price: food.price,
    imageUrl: food.imageUrl,
    restaurant: food.restaurant,
    quantity: 1
  };

  if (cartSnap.exists()) {
    const items = cartSnap.data().items || [];
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      items.push(item);
    }
    await updateDoc(cartRef, { items });
  } else {
    await setDoc(cartRef, { items: [item] });
  }
}
