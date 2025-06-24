document.addEventListener("DOMContentLoaded", () => {
  renderStaticCart();
  updateStaticCartCount();
});

function renderStaticCart() {
  const cartTableBody = document.querySelector(".cart-table");
  if (!cartTableBody) return;
  // Hardcoded static cart items
  const staticCart = [
    {
      id: "flash-gamepad-001",
      title: "HAVIT HV-G92 Gamepad",
      quantity: 1
    }
  ];
  cartTableBody.innerHTML = staticCart.map((item, index) => `
    <div class="cart-item" data-index="${index}">
      <div class="product-col">
        <div class="product-info">
          <button class="remove-btn" disabled>
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div class="product-image">
            <span class="static-product-image"></span>
          </div>
          <div class="product-name">${item.title}</div>
        </div>
      </div>
      <div class="price-col">N/A</div>
      <div class="quantity-col">
        <div class="quantity-control">
          <input type="number" value="${item.quantity}" min="1" max="99" disabled>
        </div>
      </div>
      <div class="subtotal-col">N/A</div>
    </div>
  `).join("");
  updateStaticCartTotals();
}

function updateStaticCartTotals() {
  const subtotalElement = document.querySelector(".totals-row:nth-child(1) span:last-child");
  const totalElement = document.querySelector(".totals-row.total span:last-child");
  if (subtotalElement) subtotalElement.textContent = "N/A";
  if (totalElement) totalElement.textContent = "N/A";
}

function updateStaticCartCount() {
  const count = 1; // matches staticCart.length above
  const cartCount = document.getElementById("cart-count");
  const cartBadge = document.getElementById("cart-badge");
  if (cartCount) {
    cartCount.textContent = count;
  }
  if (cartBadge) {
    cartBadge.textContent = count;
    cartBadge.style.display = count > 0 ? "flex" : "none";
  }
}

// Remove all dynamic cart event listeners and functions

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
`;
document.head.appendChild(style);