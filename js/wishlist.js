document.addEventListener("DOMContentLoaded", () => {
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

function renderWishlist() {
  console.log("wishlist.js: Rendering wishlist");
  const wishlistGrid = document.querySelector(".wishlist-grid");
  const wishlistCount = document.querySelector("#wishlist-count");
  let wishlistItems;
  
  try {
    wishlistItems = JSON.parse(localStorage.getItem("wishlist")) || [];
    // Remove duplicates based on id
    wishlistItems = [...new Map(wishlistItems.map(item => [item.id, item])).values()];
    localStorage.setItem("wishlist", JSON.stringify(wishlistItems)); // Save deduplicated list
    console.log("wishlist.js: Wishlist items loaded", wishlistItems);
  } catch (error) {
    console.error("wishlist.js: Error parsing wishlist from localStorage", error);
    wishlistItems = [];
  }

  // Update wishlist count
  if (wishlistCount) {
    wishlistCount.textContent = wishlistItems.length;
  }

  // Render wishlist items on wishlist page
  if (wishlistGrid) {
    wishlistGrid.innerHTML = wishlistItems.length === 0
      ? "<p>Your wishlist is empty.</p>"
      : wishlistItems.map(item => `
        <div class="product-card" data-product-id="${item.id}">
          <div class="product-actions">
            <button class="action-btn delete-btn" title="Remove from Wishlist">
              <i class="fa-solid fa-trash"></i>
            </button>
            <button class="action-btn wishlist-btn ${wishlistItems.some(i => i.id === item.id) ? "active" : ""}" title="Remove from Wishlist">
              <i class="fa-regular fa-heart"></i>
            </button>
          </div>
          <div class="product-image" onclick="goToProduct('${item.id}')">
            <img src="${item.image}" alt="${item.title}">
          </div>
          <div class="product-info">
            <h4 class="product-title">${item.title}</h4>
            <div class="product-price">
              <span class="current-price">${item.price}</span>
            </div>
          </div>
          <button class="add-to-cart-btn" title="Add to cart">
            <i class="fa-solid fa-cart-shopping"></i>
            Add to cart
          </button>
        </div>
      `).join("");

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
  let wishlistItems;
  try {
    wishlistItems = JSON.parse(localStorage.getItem("wishlist")) || [];
    // Remove duplicates
    wishlistItems = [...new Map(wishlistItems.map(item => [item.id, item])).values()];
    localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
  } catch (error) {
    console.error("wishlist.js: Error parsing wishlist for button update", error);
    wishlistItems = [];
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
    const isWishlisted = wishlistItems.some(item => item.id === productId);
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
  const productTitle = productCard.querySelector(".product-title")?.textContent || "Item";

  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  console.log("wishlist.js: Before removal", wishlist);
  wishlist = wishlist.filter(item => item.id !== productId);
  console.log("wishlist.js: After removal", wishlist);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));

  // Add fade out animation
  productCard.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  productCard.style.opacity = "0";
  productCard.style.transform = "scale(0.8)";

  setTimeout(() => {
    productCard.remove();
    updateWishlistCount();
    showNotification(`${productTitle} removed from wishlist`);
    updateWishlistHeader();
    renderWishlist();
  }, 300);
}

function addToCartFromWishlist(productId) {
  console.log("wishlist.js: Adding to cart from wishlist", productId);
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = wishlist.find(item => item.id === productId);
  if (!item) {
    console.error("wishlist.js: Item not found in wishlist", productId);
    return;
  }
  const existing = cart.find(c => c.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({...item, quantity: 1});
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  removeFromWishlistById(productId);
  updateCartCount();
  showNotification(`${item.title} added to cart`);
}

function removeFromWishlistById(productId) {
  console.log("wishlist.js: Removing from wishlist by ID", productId);
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  wishlist = wishlist.filter(item => item.id !== productId);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  renderWishlist();
}

function moveAllToBag() {
  console.log("wishlist.js: Moving all to bag");
  const wishlistItems = document.querySelectorAll(".wishlist-grid .product-card");
  let count = 0;
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  wishlistItems.forEach((item, index) => {
    setTimeout(() => {
      const productId = item.dataset.productId;
      const productTitle = item.querySelector(".product-title").textContent;
      const wishlistItem = wishlist.find(w => w.id === productId);
      if (wishlistItem) {
        const existing = cart.find(c => c.id === wishlistItem.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({...wishlistItem, quantity: 1});
        }
      }

      item.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      item.style.opacity = "0";
      item.style.transform = "scale(0.8)";

      setTimeout(() => {
        item.remove();
        count++;
        if (count === wishlistItems.length) {
          localStorage.setItem("cart", JSON.stringify(cart));
          localStorage.setItem("wishlist", JSON.stringify([]));
          updateWishlistCount();
          updateWishlistHeader();
          updateCartCount();
          showNotification("All items moved to cart");
          renderWishlist();
        }
      }, 300);
    }, index * 100);
  });
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
  const productTitle = productCard.querySelector(".product-title")?.textContent || "Item";
  const productPrice = productCard.querySelector(".current-price")?.textContent || "$0.00";
  const productImage = productCard.querySelector(".product-image img")?.src || "";
  let wishlist;
  
  try {
    wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    // Remove duplicates
    wishlist = [...new Map(wishlist.map(item => [item.id, item])).values()];
  } catch (error) {
    console.error("wishlist.js: Error parsing wishlist in toggleWishlist", error);
    wishlist = [];
  }

  const isWishlisted = wishlist.find(item => item.id === productId);

  if (isWishlisted) {
    wishlist = wishlist.filter(item => item.id !== productId);
    btn.classList.remove("active");
    btn.setAttribute("title", "Add to Wishlist");
    showNotification(`${productTitle} removed from wishlist`);
  } else {
    // Prevent duplicate items
    if (!wishlist.some(item => item.id === productId)) {
      wishlist.push({
        id: productId,
        title: productTitle,
        price: productPrice,
        image: productImage
      });
      btn.classList.add("active");
      btn.setAttribute("title", "Remove from Wishlist");
      showNotification(`${productTitle} added to wishlist`);
    } else {
      console.log("wishlist.js: Item already in wishlist", productId);
      showNotification(`${productTitle} is already in wishlist`);
      return;
    }
  }

  try {
    // Deduplicate again before saving
    wishlist = [...new Map(wishlist.map(item => [item.id, item])).values()];
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    console.log("wishlist.js: Wishlist updated in localStorage", wishlist);
  } catch (error) {
    console.error("wishlist.js: Error saving wishlist to localStorage", error);
  }

  updateWishlistCount();
  updateWishlistButtons();
  renderWishlist();
}

function updateWishlistCount() {
  console.log("wishlist.js: Updating wishlist count");
  let wishlistItems;
  try {
    wishlistItems = JSON.parse(localStorage.getItem("wishlist")) || [];
    wishlistItems = [...new Map(wishlistItems.map(item => [item.id, item])).values()];
    localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
  } catch (error) {
    console.error("wishlist.js: Error parsing wishlist for count update", error);
    wishlistItems = [];
  }

  const wishlistBadge = document.querySelector(".wishlist-btn .badge");
  if (wishlistBadge) {
    wishlistBadge.textContent = wishlistItems.length;
    wishlistBadge.style.display = wishlistItems.length > 0 ? "flex" : "none";
  }
}

function goToProduct(productSlug) {
  console.log("wishlist.js: Navigating to product", productSlug);
  const productRoutes = {
    "gucci-bag": "product.html?id=gucci-bag",
    "rgb-cooler": "product.html?id=rgb-cooler",
    gamepad: "product.html?id=gamepad",
    jacket: "product.html?id=jacket",
    laptop: "product.html?id=laptop",
    monitor: "product.html?id=monitor",
    "gamepad-havit": "product.html?id=gamepad-havit",
    keyboard: "product.html?id=keyboard",
  };

  const route = productRoutes[productSlug] || "product.html";
  window.location.href = route;
}

function addToCart(productCard) {
  console.log("wishlist.js: Adding to cart", productCard);
  const productId = productCard.dataset.productId;
  const productTitle = productCard.querySelector(".product-title")?.textContent;
  const productPrice = productCard.querySelector(".current-price")?.textContent;
  const productImage = productCard.querySelector(".product-image img")?.src;

  let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cartItems.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      id: productId,
      title: productTitle,
      price: productPrice,
      image: productImage,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cartItems));
  updateCartCount();
  showNotification(`${productTitle} added to cart`);
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