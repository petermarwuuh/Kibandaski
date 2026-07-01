import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { auth } from "./firebase-config.js";
import { ensureUserProfile } from "./user-service.js";

export function requireAuth({ roles = [], redirectTo = "auth.html" } = {}) {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      if (!user) {
        const returnUrl = encodeURIComponent(window.location.pathname.split("/").pop());
        window.location.href = `${redirectTo}?redirect=${returnUrl}`;
        reject(new Error("Not authenticated"));
        return;
      }

      const profile = await ensureUserProfile(user);

      if (roles.length > 0 && !roles.includes(profile.role)) {
        document.body.innerHTML = `
          <div style="padding:3rem;text-align:center;font-family:sans-serif;">
            <h1>Access Denied</h1>
            <p>You don't have permission to view this page.</p>
            <p><a href="index.html">Go to home</a> · <a href="auth.html">Login with another account</a></p>
          </div>`;
        reject(new Error("Access denied"));
        return;
      }

      resolve({ user, profile });
    });
  });
}
