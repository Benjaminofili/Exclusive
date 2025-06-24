/**
 * Wishlist functionality for managing and rendering wishlist items
 * No longer fetches or uses products.json; only stores product IDs in localStorage
 */

function getSanitizedWishlist() {
  let wishlist = [];
  try {
    wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    wishlist = Array.from(new Set(wishlist.map(id => Number(id))));
    wishlist = wishlist.filter(id => !isNaN(id) && Number.isInteger(id));
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  } catch {
    wishlist = [];
  }
  return wishlist;
}

document.addEventListener("DOMContentLoaded", () => {
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
      // No longer supports adding to cart from wishlist
      showNotification("Add to cart is disabled in static mode", "error");
    }
  });
}

function renderWishlist() {
  console.log("wishlist.js: Rendering wishlist");
  const wishlistGrid = document.querySelector(".wishlist-grid");
  const wishlistIds = getSanitizedWishlist();

  if (wishlistGrid) {
    wishlistGrid.innerHTML = wishlistIds.length === 0
      ? "<p>Your wishlist is empty.</p>"
      : wishlistIds.map(id => {
          // Static rendering: just show the product ID
          return `
            <div class="product-card" data-product-id="${id}">
              <div class="product-actions">
                <button class="action-btn delete-btn" title="Remove from Wishlist">
                  <i class="fa-solid fa-trash"></i>
                </button>
                <button class="action-btn wishlist-btn active" title="Remove from Wishlist">
                  <i class="fa-solid fa-heart"></i>
                </button>
              </div>
              <div class="product-info">
                <h4 class="product-title">Product ID: ${id}</h4>
              </div>
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

function moveAllToBag() {
  console.log("wishlist.js: Moving all to bag");
  // No longer supports moving to cart in static mode
  showNotification("Move all to cart is disabled in static mode", "error");
  localStorage.setItem("wishlist", JSON.stringify([]));
  updateWishlistCount();
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
  // Cart logic is disabled in static mode
  const cartBadge = document.getElementById("cart-badge");
  if (cartBadge) {
    cartBadge.textContent = "0";
    cartBadge.style.display = "none";
  }
}

function goToProduct(productId) {
  console.log("wishlist.js: Navigating to product", productId);
  // No navigation in static mode
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