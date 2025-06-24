document.addEventListener("DOMContentLoaded", () => {
  initializeCartPage();
  updateCartCount();
});

function initializeCartPage() {
  loadCartItems();
  initializeQuantityControls();
  initializeRemoveButtons();
  initializeCouponForm();
  updateCartTotals();
}

function loadCartItems() {
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
    const cartItem = createCartItemElement(item.id, item.quantity, index);
    cartTableBody.appendChild(cartItem);
  });
}

function createCartItemElement(productId, quantity, index) {
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
          <span class="static-product-image"></span>
        </div>
        <div class="product-name">Product ID: ${productId}</div>
      </div>
    </div>
    <div class="price-col">N/A</div>
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
    <div class="subtotal-col">N/A</div>
  `;

  return cartItem;
}

function calculateSubtotal(price, quantity) {
  return "N/A";
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
  if (!item) return;
  const newQuantity = Math.max(1, item.quantity + change);
  item.quantity = newQuantity;
  localStorage.setItem("cart", JSON.stringify(cartItems));
  loadCartItems();
  updateCartTotals();
  updateCartCount();
}

function setQuantity(index, quantity) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  if (cartItems[index] && quantity >= 1) {
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

function updateCartTotals() {
  const subtotalElement = document.querySelector(".totals-row:nth-child(1) span:last-child");
  const totalElement = document.querySelector(".totals-row.total span:last-child");
  if (subtotalElement) subtotalElement.textContent = "N/A";
  if (totalElement) totalElement.textContent = "N/A";
}

function initializeCouponForm() {
  const applyCouponBtn = document.querySelector(".apply-coupon-btn");
  const couponInput = document.querySelector(".coupon-section input");

  if (applyCouponBtn) {
    applyCouponBtn.addEventListener("click", () => {
      showNotification("Coupons are disabled in static mode", "error");
    });
  }
}

function applyCoupon(code) {
  showNotification("Coupons are disabled in static mode", "error");
}

function applyDiscount(discountPercent) {
  // No-op in static mode
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