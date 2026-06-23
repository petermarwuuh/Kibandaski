import { onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { auth } from "./firebase-config.js";

export function initAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function logout() {
  await signOut(auth);
  localStorage.removeItem("userName");
  window.location.href = "index.html";
}

export async function setUserDisplayName(user, name) {
  if (name && user) {
    await updateProfile(user, { displayName: name });
    localStorage.setItem("userName", name);
  }
}
