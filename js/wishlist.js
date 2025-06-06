/**
 * Wishlist functionality for managing and rendering wishlist items
 * Integrates with products.json and localStorage, using numeric product IDs
 */

let PRODUCTS_CACHE = [];

async function fetchProducts() {
  if (PRODUCTS_CACHE.length) return PRODUCTS_CACHE;
  if (localStorage.getItem("products")) {
    PRODUCTS_CACHE = JSON.parse(localStorage.getItem("products"));
    return PRODUCTS_CACHE;
  }
  try {
    const res = await fetch("products.json");
    if (!res.ok) throw new Error("Failed to fetch products.json");
    PRODUCTS_CACHE = await res.json();
    localStorage.setItem("products", JSON.stringify(PRODUCTS_CACHE));
    return PRODUCTS_CACHE;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

function getProductById(id) {
  return PRODUCTS_CACHE.find((p) => p.id === Number(id));
}

function getSanitizedWishlist() {
  let wishlist = [];
  try {
    wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    // Convert all IDs to numbers and ensure uniqueness
    wishlist = Array.from(new Set(wishlist.map(id => Number(id))));
    // Filter out invalid numbers (e.g., NaN)
    wishlist = wishlist.filter(id => !isNaN(id) && Number.isInteger(id));
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  } catch {
    wishlist = [];
  }
  return wishlist;
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchProducts();
  console.log("wishlist.js: Initializing wishlist functionality");
  initializeWishlistActions();
  renderWishlist();
  updateWishlistCount();
  updateCartCount();

  window.addEventListener("storage", (event) => {
    if (event.key === "wishlist") {
      console.log("wishlist.js: Detected wishlist change in another tab");
      renderWishlist();
      updateWishlistButtons();
      updateWishlistCount();
    }
    if (event.key === "cart") {
      updateCartCount();
    }
  });
});

function initializeWishlistActions() {
  console.log("wishlist.js: Initializing wishlist buttons");
  const moveAllBtn = document.querySelector(".move-all-btn");
  if (moveAllBtn) {
    moveAllBtn.addEventListener("click", () => {
      console.log("wishlist.js: Move all to bag clicked");
      moveAllToBag();
    });
  } else {
    console.log("wishlist.js: Move all to bag button not found");
  }

  document.body.addEventListener("click", (e) => {
    const wishlistBtn = e.target.closest(".wishlist-btn:not([href])");
    const deleteBtn = e.target.closest(".delete-btn");
    const addToCartBtn = e.target.closest(".add-to-cart-btn");
    if (wishlistBtn) {
      e.preventDefault();
      e.stopPropagation();
      console.log("wishlist.js: Wishlist button clicked", wishlistBtn);
      toggleWishlist(wishlistBtn);
    } else if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      console.log("wishlist.js: Delete button clicked");
      removeFromWishlist(deleteBtn);
    } else if (addToCartBtn) {
      e.preventDefault();
      e.stopPropagation();
      console.log("wishlist.js: Add to cart button clicked");
      const productCard = addToCartBtn.closest(".product-card");
      if (productCard) {
        addToCartFromWishlist(Number(productCard.dataset.productId));
      }
    }
  });
}

async function renderWishlist() {
  await fetchProducts();
  console.log("wishlist.js: Rendering wishlist");
  const wishlistGrid = document.querySelector(".wishlist-grid");
  const wishlistIds = getSanitizedWishlist();

  if (wishlistGrid) {
    wishlistGrid.innerHTML = wishlistIds.length === 0
      ? "<p>Your wishlist is empty.</p>"
      : wishlistIds.map(id => {
          const product = getProductById(id);
          if (!product) return "";
          return `
            <div class="product-card" data-product-id="${product.id}">
              <div class="product-actions">
                <button class="action-btn delete-btn" title="Remove from Wishlist">
                  <i class="fa-solid fa-trash"></i>
                </button>
                <button class="action-btn wishlist-btn ${wishlistIds.includes(Number(product.id)) ? 'active' : ''}" title="${wishlistIds.includes(Number(product.id)) ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                  <i class="fa-${wishlistIds.includes(Number(product.id)) ? 'solid' : 'regular'} fa-heart"></i>
                </button>
              </div>
              <div class="product-image" onclick="goToProduct(${product.id})">
                <img src="${product.image}" alt="${product.name}">
              </div>
              <div class="product-info">
                <h4 class="product-title">${product.name}</h4>
                <div class="product-price">
                  <span class="current-price">$${product.price.toFixed(2)}</span>
                  ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ""}
                </div>
              </div>
              <button class="add-to-cart-btn" title="Add to cart">
                <i class="fa-solid fa-cart-shopping"></i> Add to Cart
              </button>
            </div>
          `;
        }).join("");
  }

  updateWishlistHeader();
  updateWishlistButtons();
}

function updateWishlistButtons() {
  console.log("wishlist.js: Updating wishlist buttons");
  const wishlistIds = getSanitizedWishlist();
  const wishlistBtns = document.querySelectorAll(".wishlist-btn:not([href])");
  wishlistBtns.forEach((btn) => {
    const productCard = btn.closest(".product-card, .main-product-details");
    if (!productCard) {
      console.log("wishlist.js: Skipping wishlist button not in product card", btn);
      return;
    }
    const productId = Number(productCard.dataset.productId);
    if (!productId) {
      console.warn("wishlist.js: Product ID not found for wishlist button", btn);
      return;
    }
    const isWishlisted = wishlistIds.includes(productId);
    btn.classList.toggle("active", isWishlisted);
    btn.setAttribute("title", isWishlisted ? "Remove from Wishlist" : "Add to Wishlist");
    const icon = btn.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-solid", isWishlisted);
      icon.classList.toggle("fa-regular", !isWishlisted);
    }
  });
}

function toggleWishlist(btn) {
  console.log("wishlist.js: Toggling wishlist", btn);
  const productCard = btn.closest(".product-card, .main-product-details");
  if (!productCard) {
    console.error("wishlist.js: Product card not found for wishlist toggle");
    return;
  }
  const productId = Number(productCard.dataset.productId);
  const wishlist = getSanitizedWishlist();
  const isWishlisted = wishlist.includes(productId);
  if (isWishlisted) {
    removeFromWishlist(btn);
  } else {
    wishlist.push(productId);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    btn.classList.add("active");
    btn.setAttribute("title", "Remove from Wishlist");
    showNotification("Added to wishlist");
  }
  updateWishlistCount();
  updateWishlistButtons();
  renderWishlist();
}

function removeFromWishlist(element) {
  console.log("wishlist.js: Removing from wishlist");
  const productCard = element.closest(".product-card");
  if (!productCard) {
    console.error("wishlist.js: Product card not found for remove from wishlist");
    return;
  }
  const productId = Number(productCard.dataset.productId);
  const wishlist = getSanitizedWishlist();
  const updatedWishlist = wishlist.filter(id => id !== productId);
  localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));

  productCard.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  productCard.style.opacity = "0";
  productCard.style.transform = "scale(0.8)";

  setTimeout(() => {
    productCard.remove();
    updateWishlistCount();
    showNotification("Removed from wishlist");
    updateWishlistHeader();
    renderWishlist();
  }, 300);
}

async function addToCartFromWishlist(productId) {
  console.log("wishlist.js: Adding to cart from wishlist", productId);
  await fetchProducts();
  const numericId = Number(productId);
  const product = getProductById(numericId);
  if (!product) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(c => c.id === numericId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: numericId, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  const wishlist = getSanitizedWishlist();
  const updatedWishlist = wishlist.filter(id => id !== numericId);
  localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  updateCartCount();
  showNotification(`${product.name} added to cart`);
  renderWishlist();
}

async function moveAllToBag() {
  console.log("wishlist.js: Moving all to bag");
  await fetchProducts();
  const wishlist = getSanitizedWishlist();
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  wishlist.forEach(productId => {
    const numericId = Number(productId);
    const existing = cart.find(c => c.id === numericId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: numericId, quantity: 1 });
    }
  });
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("wishlist", JSON.stringify([]));
  updateWishlistCount();
  updateCartCount();
  showNotification("All items moved to cart");
  renderWishlist();
}

function updateWishlistHeader() {
  console.log("wishlist.js: Updating wishlist header");
  const wishlistIds = getSanitizedWishlist();
  const header = document.querySelector(".wishlist-header h1");
  if (header) {
    header.textContent = `Wishlist (${wishlistIds.length})`;
  }
}

function updateWishlistCount() {
  console.log("wishlist.js: Updating wishlist count");
  const wishlistIds = getSanitizedWishlist();
  const wishlistBadge = document.getElementById("wishlist-badge");
  const wishlistCount = document.getElementById("wishlist-count");
  if (wishlistBadge) {
    wishlistBadge.textContent = wishlistIds.length;
    wishlistBadge.style.display = wishlistIds.length > 0 ? "flex" : "none";
  }
  if (wishlistCount) {
    wishlistCount.textContent = wishlistIds.length;
  }
}

function updateCartCount() {
  console.log("wishlist.js: Updating cart count");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartBadge = document.getElementById("cart-badge");
  if (cartBadge) {
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? "flex" : "none";
  }
}

function goToProduct(productId) {
  console.log("wishlist.js: Navigating to product", productId);
  window.location.href = `product.html?id=${productId}`;
}

function showNotification(message, type = "success") {
  console.log("wishlist.js: Showing notification", message);
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#db4444" : "#444"};
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

const wishlistStyle = document.createElement("style");
wishlistStyle.textContent = `
  .notification {
    font-size: 14px;
  }
  .wishlist-grid .product-card {
    position: relative;
    background: #fff;
    border-radius: 4px;
    overflow: hidden;
  }
  .wishlist-grid p {
    text-align: center;
    font-size: 16px;
    color: #666;
    padding: 40px 0;
  }
  .add-to-cart-btn {
    background: #db4444;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0;
    transition: background-color 0.3s;
  }
  .add-to-cart-btn:hover {
    background: #b73e3e;
  }
  .wishlist-btn.active i {
    color: #db4444;
  }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(wishlistStyle);