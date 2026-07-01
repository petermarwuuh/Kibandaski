import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { toggleFavorite, isFavorite } from "./favorites-utils.js";
import { renderStars } from "./ratings-utils.js";
import { initAuthState } from "./auth-utils.js";

const CATEGORIES = [
  "All Menus", "Kuku", "Nyama", "Chapati", "Ugali", "Kahawa", "Samaki", "Healthy"
];

let allFoods = [];
let activeCategory = "All Menus";
let searchQuery = "";
let favoriteIds = new Set();

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

async function refreshFavorites() {
  const { getFavoriteIds } = await import("./favorites-utils.js");
  favoriteIds = new Set(await getFavoriteIds());
}

function createFoodCard(food) {
  const card = document.createElement("div");
  card.className = "detail-card";
  const favActive = favoriteIds.has(food.id) ? "active" : "";
  card.innerHTML = `
    <img class="detail-img" src="${escapeHtml(food.imageUrl)}" alt="${escapeHtml(food.name)}" loading="lazy" />
    <div class="detail-desc">
      <div class="detail-name">
        <h4>${escapeHtml(food.name)}</h4>
        <p class="rating">${renderStars(food.avgRating || 0)} <span class="rating-count">(${food.ratingCount || 0})</span></p>
        <p class="detail-sub">${escapeHtml(food.description)}</p>
        <p class="price">Ksh. ${food.price}</p>
        <p class="detail-sub">Sold by ${escapeHtml(food.restaurant || "Local Kibanda")}</p>
      </div>
      <button class="fav-btn ${favActive}" data-id="${food.id}" aria-label="Favourite">
        <ion-icon name="${favActive ? "heart" : "heart-outline"}"></ion-icon>
      </button>
    </div>
  `;

  card.querySelector(".detail-name").addEventListener("click", () => {
    window.location.href = `food-detail.html?id=${food.id}`;
  });
  card.querySelector(".detail-img").addEventListener("click", () => {
    window.location.href = `food-detail.html?id=${food.id}`;
  });

  card.querySelector(".fav-btn").addEventListener("click", async (e) => {
    e.stopPropagation();
    const added = await toggleFavorite(food);
    const btn = e.currentTarget;
    btn.classList.toggle("active", added);
    btn.querySelector("ion-icon").setAttribute("name", added ? "heart" : "heart-outline");
    if (added) favoriteIds.add(food.id);
    else favoriteIds.delete(food.id);
  });

  return card;
}

function createHighlightCard(food) {
  const card = document.createElement("div");
  card.className = "highlight-card";
  card.style.cursor = "pointer";
  card.innerHTML = `
    <img class="highlight-img" src="${escapeHtml(food.imageUrl)}" alt="${escapeHtml(food.name)}" loading="lazy" />
    <div>
      <h4>${escapeHtml(food.name)}</h4>
      <p class="rating">${renderStars(food.avgRating || 0)}</p>
      <p class="price">Ksh. ${food.price}</p>
      <p class="detail-sub">${escapeHtml(food.restaurant || "")}</p>
    </div>
  `;
  card.addEventListener("click", () => {
    window.location.href = `food-detail.html?id=${food.id}`;
  });
  return card;
}

function getFilteredFoods() {
  return allFoods.filter((food) => {
    const matchesCategory =
      activeCategory === "All Menus" ||
      (food.category && food.category === activeCategory);
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      food.name.toLowerCase().includes(query) ||
      food.description.toLowerCase().includes(query) ||
      (food.restaurant && food.restaurant.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });
}

function renderMenu() {
  const wrapper = document.getElementById("menu-wrapper");
  if (!wrapper) return;

  const filtered = getFilteredFoods();
  wrapper.innerHTML = "";

  if (filtered.length === 0) {
    wrapper.innerHTML = `<p style="grid-column: 1/-1; padding: 2rem; text-align: center;">
      Hakuna chakula kilichopatikana. Try a different search or category.
    </p>`;
    return;
  }

  filtered.forEach((food) => wrapper.appendChild(createFoodCard(food)));
}

function renderRecommendations() {
  const slider = document.getElementById("highlightSlider");
  if (!slider || allFoods.length === 0) return;

  slider.innerHTML = "";
  const picks = shuffle(allFoods).slice(0, Math.min(8, allFoods.length));
  picks.forEach((food) => slider.appendChild(createHighlightCard(food)));
}

function renderVendors() {
  const vendorSection = document.getElementById("vendor-section");
  if (!vendorSection) return;

  const vendors = [...new Set(allFoods.map((f) => f.restaurant).filter(Boolean))];
  vendorSection.innerHTML = vendors
    .map((name) =>
      `<a href="restaurant.html?name=${encodeURIComponent(name)}" class="vendor-chip">${escapeHtml(name)}</a>`
    )
    .join("");
}

function setupCategoryFilters() {
  const filterCards = document.querySelectorAll(".filter-card");
  filterCards.forEach((card, index) => {
    const label = card.querySelector("p");
    if (label && CATEGORIES[index]) label.textContent = CATEGORIES[index];
    card.dataset.category = CATEGORIES[index] || "All Menus";
    card.addEventListener("click", () => {
      filterCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      activeCategory = card.dataset.category;
      renderMenu();
    });
  });
  if (filterCards[0]) filterCards[0].classList.add("active");
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.querySelector(".search-btn");
  const runSearch = () => {
    if (searchInput) {
      searchQuery = searchInput.value.trim();
      renderMenu();
    }
  };
  searchInput?.addEventListener("input", runSearch);
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });
  searchBtn?.addEventListener("click", runSearch);
}

function setupSliders() {
  const highlightWrapper = document.querySelector(".highlight-wrapper");
  const filterWrapper = document.querySelector(".filter-wrapper");

  document.querySelector(".main-arrow .back")?.addEventListener("click", () => {
    highlightWrapper?.scrollBy({ left: -200, behavior: "smooth" });
  });
  document.querySelector(".main-arrow .next")?.addEventListener("click", () => {
    highlightWrapper?.scrollBy({ left: 200, behavior: "smooth" });
  });
  document.querySelector(".back-menus")?.addEventListener("click", () => {
    filterWrapper?.scrollBy({ left: -120, behavior: "smooth" });
  });
  document.querySelector(".next-menus")?.addEventListener("click", () => {
    filterWrapper?.scrollBy({ left: 120, behavior: "smooth" });
  });
}

function setupSidebar() {
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  if (!menuToggle || !sidebar) return;

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
      sidebar.classList.remove("active");
    }
  });

  sidebar.addEventListener("click", (e) => {
    if (e.target.tagName === "A") sidebar.classList.remove("active");
    else e.stopPropagation();
  });
}

function setupAdminNav(profile) {
  const adminLink = document.getElementById("admin-nav-link");
  if (!adminLink || !profile) return;
  if (profile.role === "admin" || profile.role === "vendor") {
    adminLink.href = "dashboard.html";
    adminLink.innerHTML = `<ion-icon name="shield-checkmark-outline"></ion-icon>${profile.role === "admin" ? "Admin" : "Vendor"}`;
    adminLink.style.display = "flex";
  }
}

async function loadFoods() {
  const menuWrapper = document.getElementById("menu-wrapper");
  if (!menuWrapper) return;

  menuWrapper.innerHTML = `<p style="grid-column: 1/-1; padding: 2rem; text-align: center;">Loading menu...</p>`;

  try {
    await refreshFavorites();
    const snapshot = await getDocs(collection(db, "foods"));
    allFoods = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    renderRecommendations();
    renderMenu();
    renderVendors();
  } catch (err) {
    menuWrapper.innerHTML = `<p style="grid-column: 1/-1; padding: 2rem; text-align: center; color: #c0392b;">
      Could not load menu. Please check your connection and try again.
    </p>`;
    console.error("Failed to load foods:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupSidebar();
  setupCategoryFilters();
  setupSearch();
  setupSliders();
  loadFoods();

  initAuthState((user, profile) => {
    setupAdminNav(profile);
  });
});
