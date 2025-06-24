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

document.addEventListener("DOMContentLoaded", async () => {
  // No product details to load in static mode
  initializeProductPage();
});

function initializeProductPage() {
  initializeThumbnails();
  initializeQuantityControls();
  initializeColorSelection();
  initializeSizeSelection();
  initializeProductActions();
}

function initializeThumbnails() {
  // No-op in static mode
}

function initializeQuantityControls() {
  // No-op in static mode
}

function initializeColorSelection() {
  // No-op in static mode
}

function initializeSizeSelection() {
  // No-op in static mode
}

function initializeProductActions() {
  const buyNowBtn = document.querySelector(".buy-now-btn");
  const wishlistBtn = document.querySelector(".product-actions .wishlist-btn");
  const addToCartBtns = document.querySelectorAll(".add-to-cart-overlay");

  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", () => {
      showNotification("Buy now is disabled in static mode", "error");
    });
  }

  if (wishlistBtn) {
    const productId = Number(document.querySelector(".main-product-details").dataset.productId);
    const wishlist = getSanitizedWishlist();
    if (wishlist.includes(productId)) {
      wishlistBtn.classList.add("active");
      wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
    }
    wishlistBtn.addEventListener("click", () => {
      if (wishlistBtn.classList.contains("active")) {
        removeFromWishlist(productId);
        wishlistBtn.classList.remove("active");
        wishlistBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      } else {
        addToWishlist(productId);
        wishlistBtn.classList.add("active");
        wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
      }
    });
  }

  addToCartBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showNotification("Add to cart is disabled in static mode", "error");
    });
  });
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartBadge = document.querySelector(".cart-btn .badge");
  if (cartBadge) {
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? "flex" : "none";
  }
}

function showNotification(message, type = "success") {
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

window.addEventListener("storage", (event) => {
  if (event.key === "cart") updateCartCount();
});

updateCartCount();