import { onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { auth } from "./firebase-config.js";
import { ensureUserProfile } from "./user-service.js";

export function initAuthState(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await ensureUserProfile(user);
      callback(user, profile);
    } else {
      callback(null, null);
    }
  });
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
