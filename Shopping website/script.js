// ============ STATE (persisted) ============
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
};

let cart = store.get("eo_cart", []); // [{id, size, qty}]
let wishlist = store.get("eo_wishlist", []); // [id]
let selectedSize = {}; // per-product selected size for catalog cards, id -> size

function saveCart() { store.set("eo_cart", cart); }
function saveWishlist() { store.set("eo_wishlist", wishlist); }

function findProduct(id) { return PRODUCTS.find(p => p.id === id); }

// ============ HELPERS ============
function money(n) { return "₹" + Math.round(n).toLocaleString("en-IN"); }

function starString(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ============ CART LOGIC ============
function addToCart(id, size, qty = 1) {
  size = Number(size);
  const existing = cart.find(item => item.id === id && item.size === size);
  if (existing) existing.qty += qty;
  else cart.push({ id, size, qty });
  saveCart();
  renderCart();
  updateBadges();
  const p = findProduct(id);
  showToast(`Added ${p.name} (${size}ml) to bag`);
}

function removeFromCart(id, size) {
  cart = cart.filter(item => !(item.id === id && item.size === size));
  saveCart();
  renderCart();
  updateBadges();
}

function changeQty(id, size, delta) {
  const item = cart.find(item => item.id === id && item.size === size);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id, size);
    return;
  }
  saveCart();
  renderCart();
  updateBadges();
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const p = findProduct(item.id);
    if (!p) return sum;
    return sum + p.sizes[item.size] * item.qty;
  }, 0);
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function renderCart() {
  const wrap = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("cartSubtotal");
  if (!wrap) return;

  if (cart.length === 0) {
    wrap.innerHTML = `<div class="cart-empty"><span>🛍</span><div>Your bag is empty</div><div style="font-size:12px;">Add a fragrance to get started</div></div>`;
  } else {
    wrap.innerHTML = cart.map(item => {
      const p = findProduct(item.id);
      if (!p) return "";
      const lineTotal = p.sizes[item.size] * item.qty;
      return `
        <div class="cart-item">
          <img src="${p.image}" alt="${p.name}">
          <div class="cart-item-info">
            <div class="name">${p.name}</div>
            <div class="meta">${p.brand} · ${item.size}ml</div>
            <div class="cart-item-row">
              <div class="qty-control">
                <button data-act="dec" data-id="${p.id}" data-size="${item.size}">−</button>
                <span>${item.qty}</span>
                <button data-act="inc" data-id="${p.id}" data-size="${item.size}">+</button>
              </div>
              <div class="cart-item-price">${money(lineTotal)}</div>
            </div>
            <button class="remove-btn" data-act="remove" data-id="${p.id}" data-size="${item.size}">Remove</button>
          </div>
        </div>`;
    }).join("");
  }

  if (subtotalEl) subtotalEl.textContent = money(cartTotal());
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const size = Number(btn.dataset.size);
  const act = btn.dataset.act;
  if (act === "inc") changeQty(id, size, 1);
  if (act === "dec") changeQty(id, size, -1);
  if (act === "remove") removeFromCart(id, size);
});

// ============ WISHLIST ============
function toggleWishlist(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(w => w !== id);
  } else {
    wishlist.push(id);
  }
  saveWishlist();
  updateBadges();
  document.querySelectorAll(`.wishlist-btn[data-id="${id}"]`).forEach(btn => {
    btn.classList.toggle("active", wishlist.includes(id));
    btn.textContent = wishlist.includes(id) ? "♥" : "♡";
  });
}

// ============ BADGES ============
function updateBadges() {
  const cartBadge = document.getElementById("cartCount");
  const wishBadge = document.getElementById("wishlistCount");
  const c = cartCount();
  const w = wishlist.length;
  if (cartBadge) {
    cartBadge.textContent = c;
    cartBadge.style.display = c > 0 ? "flex" : "none";
  }
  if (wishBadge) {
    wishBadge.textContent = w;
    wishBadge.style.display = w > 0 ? "flex" : "none";
  }
}

// ============ CART DRAWER ============
function openCart() {
  document.getElementById("cartDrawer")?.classList.add("open");
  document.getElementById("cartOverlay")?.classList.add("open");
}
function closeCart() {
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.getElementById("cartOverlay")?.classList.remove("open");
}

document.getElementById("cartNavBtn")?.addEventListener("click", openCart);
document.getElementById("cartCloseBtn")?.addEventListener("click", closeCart);
document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
document.getElementById("wishlistNavBtn")?.addEventListener("click", () => {
  showToast(`${wishlist.length} item${wishlist.length === 1 ? "" : "s"} in your wishlist`);
});

// ============ CARD RENDERING ============
function productCardHTML(p, opts = {}) {
  const defaultSize = 50;
  const isWished = wishlist.includes(p.id);
  return `
    <article class="card" data-id="${p.id}">
      <div class="card-media">
        <span class="theme-chip">${FAMILY_LABEL[p.family]}</span>
        <button class="wishlist-btn ${isWished ? "active" : ""}" data-id="${p.id}" aria-label="Toggle wishlist">${isWished ? "♥" : "♡"}</button>
        <img src="${p.image}" alt="${p.name} by ${p.brand}, ${FAMILY_LABEL[p.family]} fragrance">
      </div>
      <div class="card-body">
        <div class="card-brand">${p.brand}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-notes">${p.notes}</div>
        <div class="card-rating">${starString(p.rating)} <span>${p.rating} (${p.reviewCount})</span></div>
        ${opts.withSizes ? `
        <div class="card-sizes" data-sizes-for="${p.id}">
          ${[30,50,100].map(sz => `<button class="size-btn ${sz===defaultSize?"active":""}" data-id="${p.id}" data-size="${sz}">${sz}ml</button>`).join("")}
        </div>` : ""}
        <div class="card-footer">
          <div class="card-price" data-price-for="${p.id}">${money(p.sizes[defaultSize])}</div>
        </div>
        <button class="btn btn-primary quickadd-btn" data-quickadd="${p.id}">Quick Add</button>
      </div>
    </article>`;
}

function wireCardEvents(container) {
  // wishlist toggle
  container.querySelectorAll(".wishlist-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleWishlist(Number(btn.dataset.id));
    });
  });
  // size selection
  container.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const size = Number(btn.dataset.size);
      selectedSize[id] = size;
      const group = container.querySelector(`[data-sizes-for="${id}"]`);
      group.querySelectorAll(".size-btn").forEach(b => b.classList.toggle("active", Number(b.dataset.size) === size));
      const priceEl = container.querySelector(`[data-price-for="${id}"]`);
      const p = findProduct(id);
      if (priceEl) priceEl.textContent = money(p.sizes[size]);
    });
  });
  // quick add
  container.querySelectorAll("[data-quickadd]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.quickadd);
      const size = selectedSize[id] || 50;
      addToCart(id, size, 1);
    });
  });
}

// ============ HOMEPAGE RENDER ============
function renderHomepage() {
  const bestsellerGrid = document.getElementById("bestsellerGrid");
  if (bestsellerGrid) {
    const bestsellers = PRODUCTS.filter(p => p.bestseller);
    bestsellerGrid.innerHTML = bestsellers.map(p => productCardHTML(p)).join("");
    wireCardEvents(bestsellerGrid);
  }
  const arrivalsStrip = document.getElementById("arrivalsStrip");
  if (arrivalsStrip) {
    const arrivals = PRODUCTS.filter(p => p.newArrival);
    arrivalsStrip.innerHTML = arrivals.map(p => productCardHTML(p)).join("");
    wireCardEvents(arrivalsStrip);
  }
}

// ============ QUIZ ============
function initQuiz() {
  const steps = document.querySelectorAll(".quiz-step");
  if (!steps.length) return;
  const progress = document.querySelectorAll("#quizProgress span");
  let current = 1;
  const answers = [];

  function showStep(n) {
    steps.forEach(s => s.classList.toggle("active", s.dataset.step == n));
    progress.forEach((p, i) => p.classList.toggle("done", i < n - 1));
  }

  document.querySelectorAll(".quiz-option").forEach(opt => {
    opt.addEventListener("click", () => {
      answers.push(opt.dataset.family);
      if (current < 3) {
        current++;
        showStep(current);
      } else {
        showResult(answers);
        progress.forEach(p => p.classList.add("done"));
      }
    });
  });

  function showResult(answers) {
    const tally = {};
    answers.forEach(f => tally[f] = (tally[f] || 0) + 1);
    const winner = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0];
    const p = QUIZ_MATCH[winner];
    document.querySelectorAll(".quiz-step").forEach(s => s.classList.remove("active"));
    document.getElementById("quizResultStep").classList.add("active");
    document.getElementById("quizResult").innerHTML = `
      <div class="quiz-result-media"><img src="${p.image}" alt="${p.name}"></div>
      <div class="quiz-result-copy">
        <div class="card-brand">Your family: ${FAMILY_LABEL[winner]}</div>
        <h3>${p.name}</h3>
        <p>${p.notes}. Start with the ${p.name}, our most-loved ${FAMILY_LABEL[winner].toLowerCase()} scent.</p>
        <a href="catalog.html" class="btn btn-primary btn-sm">Shop ${FAMILY_LABEL[winner]}</a>
      </div>`;
  }

  document.getElementById("quizRestart")?.addEventListener("click", () => {
    current = 1;
    answers.length = 0;
    showStep(1);
  });
}

// ============ CATALOG PAGE ============
let activeFilter = "all";
let activeSort = "featured";

function renderCatalog() {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  let list = [...PRODUCTS];
  if (activeFilter !== "all") {
    if (activeFilter === "new") list = list.filter(p => p.newArrival);
    else list = list.filter(p => p.family === activeFilter);
  }

  if (activeSort === "price-asc") list.sort((a, b) => a.sizes[50] - b.sizes[50]);
  if (activeSort === "price-desc") list.sort((a, b) => b.sizes[50] - a.sizes[50]);
  if (activeSort === "rating") list.sort((a, b) => b.rating - a.rating);

  grid.innerHTML = list.map(p => productCardHTML(p, { withSizes: true })).join("");
  wireCardEvents(grid);

  const countEl = document.getElementById("resultCount");
  if (countEl) countEl.textContent = `${list.length} FRAGRANCE${list.length === 1 ? "" : "S"}`;
}

function initCatalogControls() {
  const chips = document.querySelectorAll(".filter-chip");
  if (!chips.length) return;

  const params = new URLSearchParams(window.location.search);
  const urlFilter = params.get("filter");
  if (urlFilter) activeFilter = urlFilter;

  chips.forEach(chip => {
    if (chip.dataset.filter === activeFilter) chip.classList.add("active");
    else chip.classList.remove("active");
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter;
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      renderCatalog();
    });
  });

  document.getElementById("sortSelect")?.addEventListener("change", (e) => {
    activeSort = e.target.value;
    renderCatalog();
  });
}

// ============ INIT ============
document.addEventListener("DOMContentLoaded", () => {
  renderHomepage();
  initQuiz();
  initCatalogControls();
  renderCatalog();
  renderCart();
  updateBadges();
});