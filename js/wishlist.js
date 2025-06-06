let PRODUCTS_CACHE = [];

async function fetchProducts() {
  if (PRODUCTS_CACHE.length) return PRODUCTS_CACHE;
  const res = await fetch('products.json');
  PRODUCTS_CACHE = await res.json();
  return PRODUCTS_CACHE;
}

function getProductById(id) {
  return PRODUCTS_CACHE.find(p => p.id === id);
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchProducts();
  console.log("wishlist.js: Initializing wishlist functionality");
  initializeWishlist();
  renderWishlist();
  // Listen for localStorage changes from other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'wishlist') {
      console.log("wishlist.js: Detected wishlist change in another tab");
      renderWishlist();
      updateWishlistButtons();
      updateWishlistCount();
    }
  });
});

function initializeWishlist() {
  console.log("wishlist.js: Initializing wishlist buttons");
  
  // Initialize move all to bag button
  const moveAllBtn = document.querySelector(".move-all-btn");
  if (moveAllBtn) {
    moveAllBtn.addEventListener("click", () => {
      console.log("wishlist.js: Move all to bag clicked");
      moveAllToBag();
    });
  } else {
    console.log("wishlist.js: Move all to bag button not found");
  }

  // Initialize wishlist buttons with delegation to handle dynamic content
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest(".wishlist-btn");
    if (btn && !btn.hasAttribute("href")) { // Skip nav links with href
      e.preventDefault();
      e.stopPropagation();
      console.log("wishlist.js: Wishlist button clicked", btn);
      toggleWishlist(btn);
    }
  });
}

async function renderWishlist() {
  await fetchProducts();
  console.log("wishlist.js: Rendering wishlist");
  const wishlistGrid = document.querySelector(".wishlist-grid");
  const wishlistCount = document.querySelector("#wishlist-count");
  let wishlistIds;
  
  try {
    wishlistIds = JSON.parse(localStorage.getItem("wishlist")) || [];
    wishlistIds = Array.from(new Set(wishlistIds));
    localStorage.setItem("wishlist", JSON.stringify(wishlistIds));
    console.log("wishlist.js: Wishlist items loaded", wishlistIds);
  } catch (error) {
    console.error("wishlist.js: Error parsing wishlist from localStorage", error);
    wishlistIds = [];
  }

  // Update wishlist count
  if (wishlistCount) {
    wishlistCount.textContent = wishlistIds.length;
  }

  // Render wishlist items on wishlist page
  if (wishlistGrid) {
    wishlistGrid.innerHTML = wishlistIds.length === 0
      ? "<p>Your wishlist is empty.</p>"
      : wishlistIds.map(id => {
        const product = getProductById(id);
        if (!product) return '';
        return `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-actions">
            <button class="action-btn delete-btn" title="Remove from Wishlist">
              <i class="fa-solid fa-trash"></i>
            </button>
            <button class="action-btn wishlist-btn active" title="Remove from Wishlist">
              <i class="fa-regular fa-heart"></i>
            </button>
          </div>
          <div class="product-image" onclick="goToProduct('${product.id}')">
            <img src="${product.image}" alt="${product.name}">
          </div>
          <div class="product-info">
            <h4 class="product-title">${product.name}</h4>
            <div class="product-price">
              <span class="current-price">$${product.price}</span>
            </div>
          </div>
          <button class="add-to-cart-btn" title="Add to cart">
            <i class="fa-solid fa-cart-shopping"></i>
            Add to cart
          </button>
        </div>
        `;
      }).join("");

    // Attach event listeners for delete buttons after rendering
    wishlistGrid.querySelectorAll(".delete-btn").forEach((btn, index) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`wishlist.js: Delete button ${index} clicked`);
        removeFromWishlist(btn);
      });
    });

    // Attach event listeners for add to cart buttons after rendering
    wishlistGrid.querySelectorAll(".add-to-cart-btn").forEach((btn, index) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`wishlist.js: Add to cart button ${index + 1} clicked`);
        const productCard = btn.closest(".product-card");
        if (productCard) {
          const productId = productCard.dataset.productId;
          addToCartFromWishlist(productId);
        } else {
          console.error("wishlist.js: Product card not found for add to cart");
        }
      });
    });
  } else {
    console.log("wishlist.js: Wishlist grid not found, likely not on wishlist page");
  }

  updateWishlistButtons();
  updateWishlistHeader();
}

function updateWishlistButtons() {
  console.log("wishlist.js: Updating wishlist buttons");
  let wishlistIds;
  try {
    wishlistIds = JSON.parse(localStorage.getItem("wishlist")) || [];
    wishlistIds = Array.from(new Set(wishlistIds));
    localStorage.setItem("wishlist", JSON.stringify(wishlistIds));
  } catch {
    wishlistIds = [];
  }

  const wishlistBtns = document.querySelectorAll(".wishlist-btn:not([href])"); // Skip nav links
  wishlistBtns.forEach((btn) => {
    const productCard = btn.closest(".product-card, .main-product-details");
    if (!productCard) {
      console.log("wishlist.js: Skipping wishlist button not in product card", btn);
      return;
    }
    const productId = productCard.dataset.productId;
    if (!productId) {
      console.warn("wishlist.js: Product ID not found for wishlist button", btn);
      return;
    }
    const isWishlisted = wishlistIds.includes(productId);
    if (isWishlisted) {
      btn.classList.add("active");
      btn.setAttribute("title", "Remove from Wishlist");
    } else {
      btn.classList.remove("active");
      btn.setAttribute("title", "Add to Wishlist");
    }
  });
}

function removeFromWishlist(element) {
  console.log("wishlist.js: Removing from wishlist");
  const productCard = element.closest(".product-card");
  if (!productCard) {
    console.error("wishlist.js: Product card not found for remove from wishlist");
    return;
  }
  const productId = productCard.dataset.productId;
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  wishlist = wishlist.filter(id => id !== productId);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));

  // Add fade out animation
  productCard.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  productCard.style.opacity = "0";
  productCard.style.transform = "scale(0.8)";

  setTimeout(() => {
    productCard.remove();
    updateWishlistCount();
    showNotification(`Removed from wishlist`);
    updateWishlistHeader();
    renderWishlist();
  }, 300);
}

async function addToCartFromWishlist(productId) {
  console.log("wishlist.js: Adding to cart from wishlist", productId);
  await fetchProducts();
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const product = getProductById(productId);
  if (!product) return;
  const existing = cart.find(c => c.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({id: productId, quantity: 1});
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  removeFromWishlistById(productId);
  updateCartCount();
  showNotification(`${product.name} added to cart`);
}

function removeFromWishlistById(productId) {
  console.log("wishlist.js: Removing from wishlist by ID", productId);
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  wishlist = wishlist.filter(id => id !== productId);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  renderWishlist();
}

function moveAllToBag() {
  console.log("wishlist.js: Moving all to bag");
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  wishlist.forEach(productId => {
    const existing = cart.find(c => c.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({id: productId, quantity: 1});
    }
  });
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("wishlist", JSON.stringify([]));
  updateWishlistCount();
  updateWishlistHeader();
  updateCartCount();
  showNotification("All items moved to cart");
  renderWishlist();
}

function updateWishlistHeader() {
  console.log("wishlist.js: Updating wishlist header");
  const remainingItems = document.querySelectorAll(".wishlist-grid .product-card").length;
  const header = document.querySelector(".wishlist-header h1");
  if (header) {
    header.textContent = `Wishlist (${remainingItems})`;
  }
}

function toggleWishlist(btn) {
  console.log("wishlist.js: Toggling wishlist", btn);
  const productCard = btn.closest(".product-card, .main-product-details");
  if (!productCard) {
    console.error("wishlist.js: Product card not found for wishlist toggle");
    return;
  }

  const productId = productCard.dataset.productId;
  let wishlist;
  
  try {
    wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    wishlist = Array.from(new Set(wishlist));
  } catch {
    wishlist = [];
  }

  const isWishlisted = wishlist.includes(productId);

  if (isWishlisted) {
    wishlist = wishlist.filter(id => id !== productId);
    btn.classList.remove("active");
    btn.setAttribute("title", "Add to Wishlist");
    showNotification(`Removed from wishlist`);
  } else {
    wishlist.push(productId);
    btn.classList.add("active");
    btn.setAttribute("title", "Remove from Wishlist");
    showNotification(`Added to wishlist`);
  }
  wishlist = Array.from(new Set(wishlist));
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateWishlistCount();
  updateWishlistButtons();
  renderWishlist();
}

function updateWishlistCount() {
  console.log("wishlist.js: Updating wishlist count");
  let wishlistIds;
  try {
    wishlistIds = JSON.parse(localStorage.getItem("wishlist")) || [];
    wishlistIds = Array.from(new Set(wishlistIds));
    localStorage.setItem("wishlist", JSON.stringify(wishlistIds));
  } catch {
    wishlistIds = [];
  }

  const wishlistBadge = document.querySelector(".wishlist-btn .badge");
  if (wishlistBadge) {
    wishlistBadge.textContent = wishlistIds.length;
    wishlistBadge.style.display = wishlistIds.length > 0 ? "flex" : "none";
  }
}

function goToProduct(productId) {
  console.log("wishlist.js: Navigating to product", productId);
  window.location.href = `product.html?id=${productId}`;
}

async function addToCart(productCard) {
  console.log("wishlist.js: Adding to cart", productCard);
  await fetchProducts();
  const productId = productCard.dataset.productId;
  let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cartItems.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({id: productId, quantity: 1});
  }
  localStorage.setItem("cart", JSON.stringify(cartItems));
  updateCartCount();
  const product = getProductById(productId);
  showNotification(`${product ? product.name : "Product"} added to cart`);
}

function updateCartCount() {
  console.log("wishlist.js: Updating cart count");
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const cartBadge = document.querySelector(".cart-btn .badge");
  if (cartBadge) {
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? "flex" : "none";
  }
}

function showNotification(message) {
  console.log("wishlist.js: Showing notification", message);
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #db4444;
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

// Add styles
const wishlistStyle = document.createElement("style");
wishlistStyle.textContent = `
    .empty-cart {
        text-align: center;
        padding: 40px 0;
        color: #888;
        font-size: 18px;
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