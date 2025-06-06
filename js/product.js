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
    wishlist = Array.from(new Set(wishlist.map(id => Number(id))));
    wishlist = wishlist.filter(id => !isNaN(id) && Number.isInteger(id));
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  } catch {
    wishlist = [];
  }
  return wishlist;
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchProducts();
  await loadProductDetails();
  await loadRelatedItems();
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
  const thumbnails = document.querySelectorAll(".thumbnail");
  const mainImage = document.getElementById("mainProductImage");

  if (!mainImage) return;

  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener("click", () => {
      thumbnails.forEach((thumb) => thumb.classList.remove("active"));
      thumbnail.classList.add("active");
      const thumbnailImg = thumbnail.querySelector("img");
      if (thumbnailImg) {
        mainImage.src = thumbnailImg.src;
        mainImage.alt = thumbnailImg.alt;
      }
    });
  });
}

function initializeQuantityControls() {
  const quantityInput = document.querySelector(".quantity-input");
  const minusBtn = document.querySelector(".quantity-btn.minus");
  const plusBtn = document.querySelector(".quantity-btn.plus");

  if (!quantityInput || !minusBtn || !plusBtn) return;

  minusBtn.addEventListener("click", () => {
    const currentValue = Number.parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });

  plusBtn.addEventListener("click", () => {
    const currentValue = Number.parseInt(quantityInput.value);
    const maxValue = Number.parseInt(quantityInput.max) || 99;
    if (currentValue < maxValue) {
      quantityInput.value = currentValue + 1;
    }
  });

  quantityInput.addEventListener("change", () => {
    const value = Number.parseInt(quantityInput.value);
    const min = Number.parseInt(quantityInput.min) || 1;
    const max = Number.parseInt(quantityInput.max) || 99;

    if (value < min) {
      quantityInput.value = min;
    } else if (value > max) {
      quantityInput.value = max;
    }
  });
}

function initializeColorSelection() {
  const colorInputs = document.querySelectorAll('input[name="color"]');

  colorInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        console.log("Selected color:", input.value);
      }
    });
  });
}

function initializeSizeSelection() {
  const sizeInputs = document.querySelectorAll('input[name="size"]');

  sizeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        console.log("Selected size:", input.value);
      }
    });
  });
}

function initializeProductActions() {
  const buyNowBtn = document.querySelector(".buy-now-btn");
  const wishlistBtn = document.querySelector(".product-actions .wishlist-btn");
  const addToCartBtns = document.querySelectorAll(".add-to-cart-overlay");

  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", () => {
      addToCartFromProduct();
      window.location.href = "checkout.html";
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
      const productCard = btn.closest(".product-card");
      if (productCard) {
        addToCartFromCard(productCard);
      }
    });
  });
}

async function loadProductDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = Number(urlParams.get("id"));
  const product = getProductById(productId);
  if (!product) {
    document.querySelector(".main-product-details").innerHTML = "<p>Product not found.</p>";
    return;
  }
  document.querySelector(".main-product-details").dataset.productId = product.id;
  document.querySelector(".product-info h1").textContent = product.name;
  document.querySelector(".current-price").textContent = `$${product.price.toFixed(2)}`;
  document.querySelector("#mainProductImage").src = product.image;
  document.querySelector(".product-info p").textContent = product.description;
  document.querySelector(".stock-status").textContent = product.inStock ? "In Stock" : "Out of Stock";
  document.querySelector(".product-reviews").textContent = `(${product.reviews} Reviews)`;
  document.querySelector(".quantity-input").max = product.stockQuantity;
}

async function loadRelatedItems() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = Number(urlParams.get("id"));
  const product = getProductById(productId);
  if (!product) return;
  const relatedItems = PRODUCTS_CACHE.filter(
    (p) => p.category === product.category && p.id !== productId
  ).slice(0, 4);
  const relatedGrid = document.querySelector(".related-items-grid");
  if (relatedGrid) {
    relatedGrid.innerHTML = relatedItems.map(item => `
      <div class="product-card" data-product-id="${item.id}">
        ${item.badge ? `<span class="badge">${item.badge}</span>` : ""}
        <div class="product-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <h4 class="product-title">${item.name}</h4>
        <div class="product-price">
          <span class="current-price">$${item.price.toFixed(2)}</span>
          ${item.originalPrice ? `<span class="old-price">$${item.originalPrice.toFixed(2)}</span>` : ""}
        </div>
        <button class="add-to-cart-btn">Add To Cart</button>
      </div>
    `).join("");
  }
}

async function addToCartFromProduct() {
  await fetchProducts();
  const urlParams = new URLSearchParams(window.location.search);
  const productId = Number(urlParams.get("id"));
  const product = getProductById(productId);
  const quantity = Number.parseInt(document.querySelector(".quantity-input").value);
  if (product.stockQuantity < quantity) {
    showNotification(`Only ${product.stockQuantity} item(s) available in stock`, "error");
    return;
  }
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(c => c.id === productId);
  if (existing) {
    const totalQuantity = existing.quantity + quantity;
    if (product.stockQuantity < totalQuantity) {
      showNotification(`Cannot add more; only ${product.stockQuantity} item(s) available`, "error");
      return;
    }
    existing.quantity = totalQuantity;
  } else {
    cart.push({ id: productId, quantity });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showNotification(`Added ${quantity} item(s) to cart`);
}

async function addToCartFromCard(productCard) {
  await fetchProducts();
  const productId = Number(productCard.dataset.productId);
  const product = getProductById(productId);
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(c => c.id === productId);
  if (existing) {
    const totalQuantity = existing.quantity + 1;
    if (product.stockQuantity < totalQuantity) {
      showNotification(`Cannot add more; only ${product.stockQuantity} item(s) available`, "error");
      return;
    }
    existing.quantity = totalQuantity;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showNotification("Added to cart");
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