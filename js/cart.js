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

document.addEventListener("DOMContentLoaded", async () => {
  await fetchProducts();
  initializeCartPage();
  updateCartCount();
});

async function initializeCartPage() {
  await loadCartItems();
  initializeQuantityControls();
  initializeRemoveButtons();
  initializeCouponForm();
  updateCartTotals();
}

async function loadCartItems() {
  await fetchProducts();
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const cartTableBody = document.querySelector(".cart-table");

  if (!cartTableBody) return;

  const existingItems = cartTableBody.querySelectorAll(".cart-item");
  existingItems.forEach((item) => item.remove());

  if (cartItems.length === 0) {
    showEmptyCart();
    return;
  }

  cartItems.forEach((item, index) => {
    const product = getProductById(item.id);
    if (!product) return;
    const cartItem = createCartItemElement(product, item.quantity, index);
    cartTableBody.appendChild(cartItem);
  });
}

function createCartItemElement(product, quantity, index) {
  const cartItem = document.createElement("div");
  cartItem.className = "cart-item";
  cartItem.dataset.index = index;

  cartItem.innerHTML = `
    <div class="product-col">
      <div class="product-info">
        <button class="remove-btn" data-index="${index}">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-name">${product.name}</div>
      </div>
    </div>
    <div class="price-col">$${product.price.toFixed(2)}</div>
    <div class="quantity-col">
      <div class="quantity-control">
        <input type="number" value="${quantity}" min="1" max="99" data-index="${index}">
        <div class="quantity-buttons">
          <button class="quantity-up" data-index="${index}">
            <i class="fa-solid fa-chevron-up"></i>
          </button>
          <button class="quantity-down" data-index="${index}">
            <i class="fa-solid fa-chevron-down"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="subtotal-col">${calculateSubtotal(product.price, quantity)}</div>
  `;

  return cartItem;
}

function calculateSubtotal(price, quantity) {
  const numericPrice = Number.parseFloat(price);
  const subtotal = numericPrice * quantity;
  return `$${subtotal.toFixed(2)}`;
}

function initializeQuantityControls() {
  document.addEventListener("click", (e) => {
    if (e.target.closest(".quantity-up")) {
      const index = e.target.closest(".quantity-up").dataset.index;
      updateQuantity(index, 1);
    } else if (e.target.closest(".quantity-down")) {
      const index = e.target.closest(".quantity-down").dataset.index;
      updateQuantity(index, -1);
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.matches(".quantity-control input")) {
      const index = e.target.dataset.index;
      const newQuantity = Number.parseInt(e.target.value);
      setQuantity(index, newQuantity);
    }
  });
}

function updateQuantity(index, change) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cartItems[index];
  const product = getProductById(item.id);
  const newQuantity = Math.max(1, item.quantity + change);
  if (newQuantity > product.stockQuantity) {
    showNotification(`Cannot add more; only ${product.stockQuantity} item(s) available`, "error");
    return;
  }
  item.quantity = newQuantity;
  localStorage.setItem("cart", JSON.stringify(cartItems));
  loadCartItems();
  updateCartTotals();
  updateCartCount();
}

function setQuantity(index, quantity) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  if (cartItems[index] && quantity >= 1) {
    const product = getProductById(cartItems[index].id);
    if (quantity > product.stockQuantity) {
      showNotification(`Cannot set quantity; only ${product.stockQuantity} item(s) available`, "error");
      return;
    }
    cartItems[index].quantity = quantity;
    localStorage.setItem("cart", JSON.stringify(cartItems));
    loadCartItems();
    updateCartTotals();
    updateCartCount();
  }
}

function initializeRemoveButtons() {
  document.addEventListener("click", (e) => {
    if (e.target.closest(".remove-btn")) {
      const index = e.target.closest(".remove-btn").dataset.index;
      removeCartItem(index);
    }
  });
}

function removeCartItem(index) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  cartItems.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cartItems));
  loadCartItems();
  updateCartTotals();
  updateCartCount();
  showNotification("Item removed from cart");
}

async function updateCartTotals() {
  await fetchProducts();
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  let subtotal = 0;

  cartItems.forEach((item) => {
    const product = getProductById(item.id);
    if (!product) return;
    subtotal += Number.parseFloat(product.price) * item.quantity;
  });

  const shipping = 0;
  const total = subtotal + shipping;

  const subtotalElement = document.querySelector(".totals-row:nth-child(1) span:last-child");
  const totalElement = document.querySelector(".totals-row.total span:last-child");

  if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

function initializeCouponForm() {
  const applyCouponBtn = document.querySelector(".apply-coupon-btn");
  const couponInput = document.querySelector(".coupon-section input");

  if (applyCouponBtn) {
    applyCouponBtn.addEventListener("click", () => {
      const couponCode = couponInput.value.trim();
      if (couponCode) {
        applyCoupon(couponCode);
      }
    });
  }
}

function applyCoupon(code) {
  const validCoupons = {
    SAVE10: 0.1,
    WELCOME20: 0.2,
    SUMMER15: 0.15,
  };

  if (validCoupons[code.toUpperCase()]) {
    const discount = validCoupons[code.toUpperCase()];
    showNotification(`Coupon applied! ${discount * 100}% discount`);
    applyDiscount(discount);
  } else {
    showNotification("Invalid coupon code", "error");
  }
}

async function applyDiscount(discountPercent) {
  await fetchProducts();
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  let subtotal = 0;

  cartItems.forEach((item) => {
    const product = getProductById(item.id);
    if (!product) return;
    subtotal += Number.parseFloat(product.price) * item.quantity;
  });

  const discount = subtotal * discountPercent;
  const total = subtotal - discount;

  const totalsContainer = document.querySelector(".cart-totals");
  let discountRow = totalsContainer.querySelector(".discount-row");

  if (!discountRow) {
    discountRow = document.createElement("div");
    discountRow.className = "totals-row discount-row";
    totalsContainer.insertBefore(discountRow, totalsContainer.querySelector(".totals-row.total"));
  }

  discountRow.innerHTML = `
    <span>Discount:</span>
    <span>-$${discount.toFixed(2)}</span>
  `;

  const totalElement = document.querySelector(".totals-row.total span:last-child");
  if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

function showEmptyCart() {
  const cartTable = document.querySelector(".cart-table");
  const cartActions = document.querySelector(".cart-actions");
  const cartSummary = document.querySelector(".cart-summary-section");

  if (cartTable) {
    cartTable.innerHTML = `
      <div class="empty-cart">
        <h3>Your cart is empty</h3>
        <p>Add some products to your cart to see them here.</p>
        <a href="index.html" class="continue-shopping-btn">Continue Shopping</a>
      </div>
    `;
  }

  if (cartActions) cartActions.style.display = "none";
  if (cartSummary) cartSummary.style.display = "none";
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  const bgColor = type === "error" ? "#dc3545" : "#db4444";
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
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

function updateCartCount() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.getElementById("cart-count");
  const cartBadge = document.getElementById("cart-badge");
  if (cartCount) {
    cartCount.textContent = totalItems;
  }
  if (cartBadge) {
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? "flex" : "none";
  }
}

const style = document.createElement("style");
style.textContent = `
  .empty-cart {
    text-align: center;
    padding: 40px 0;
    color: #888;
    font-size: 18px;
  }
  .empty-cart h3 {
    font-size: 24px;
    margin-bottom: 16px;
    color: #000;
  }
  .empty-cart p {
    font-size: 16px;
    color: #666;
    margin-bottom: 32px;
  }
  .continue-shopping-btn {
    background-color: #db4444;
    color: white;
    padding: 16px 32px;
    text-decoration: none;
    border-radius: 4px;
    font-size: 16px;
    display: inline-block;
    transition: background-color 0.3s;
  }
  .continue-shopping-btn:hover {
    background-color: #b73e3e;
  }
  .discount-row {
    color: #00aa00;
    font-weight: 500;
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
document.head.appendChild(style);

window.addEventListener("storage", (event) => {
  if (event.key === "cart") {
    loadCartItems();
    updateCartTotals();
    updateCartCount();
  }
});