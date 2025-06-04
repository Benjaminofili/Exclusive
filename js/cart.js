// Cart page specific functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeCartPage()
})

function initializeCartPage() {
  loadCartItems()
  initializeQuantityControls()
  initializeRemoveButtons()
  initializeCouponForm()
  updateCartTotals()
}

function loadCartItems() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  const cartTableBody = document.querySelector(".cart-table")

  if (!cartTableBody) return

  // Clear existing items (except header)
  const existingItems = cartTableBody.querySelectorAll(".cart-item")
  existingItems.forEach((item) => item.remove())

  if (cartItems.length === 0) {
    showEmptyCart()
    return
  }

  cartItems.forEach((item, index) => {
    const cartItem = createCartItemElement(item, index)
    cartTableBody.appendChild(cartItem)
  })
}

function createCartItemElement(item, index) {
  const cartItem = document.createElement("div")
  cartItem.className = "cart-item"
  cartItem.dataset.index = index

  cartItem.innerHTML = `
        <div class="product-col">
            <div class="product-info">
                <button class="remove-btn" data-index="${index}">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="product-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="product-name">${item.title}</div>
            </div>
        </div>
        <div class="price-col">${item.price}</div>
        <div class="quantity-col">
            <div class="quantity-control">
                <input type="number" value="${item.quantity}" min="1" max="99" data-index="${index}">
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
        <div class="subtotal-col">${calculateSubtotal(item.price, item.quantity)}</div>
    `

  return cartItem
}

function calculateSubtotal(price, quantity) {
  const numericPrice = Number.parseFloat(price.replace("$", ""))
  const subtotal = numericPrice * quantity
  return `$${subtotal.toFixed(2)}`
}

function initializeQuantityControls() {
  document.addEventListener("click", (e) => {
    if (e.target.closest(".quantity-up")) {
      const index = e.target.closest(".quantity-up").dataset.index
      updateQuantity(index, 1)
    } else if (e.target.closest(".quantity-down")) {
      const index = e.target.closest(".quantity-down").dataset.index
      updateQuantity(index, -1)
    }
  })

  document.addEventListener("change", (e) => {
    if (e.target.matches(".quantity-control input")) {
      const index = e.target.dataset.index
      const newQuantity = Number.parseInt(e.target.value)
      setQuantity(index, newQuantity)
    }
  })
}

function updateQuantity(index, change) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  if (cartItems[index]) {
    cartItems[index].quantity = Math.max(1, cartItems[index].quantity + change)
    localStorage.setItem("cart", JSON.stringify(cartItems))
    loadCartItems()
    updateCartTotals()
    updateCartCount()
  }
}

function setQuantity(index, quantity) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  if (cartItems[index] && quantity >= 1) {
    cartItems[index].quantity = quantity
    localStorage.setItem("cart", JSON.stringify(cartItems))
    loadCartItems()
    updateCartTotals()
    updateCartCount()
  }
}

function initializeRemoveButtons() {
  document.addEventListener("click", (e) => {
    if (e.target.closest(".remove-btn")) {
      const index = e.target.closest(".remove-btn").dataset.index
      removeCartItem(index)
    }
  })
}

function removeCartItem(index) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  cartItems.splice(index, 1)
  localStorage.setItem("cart", JSON.stringify(cartItems))
  loadCartItems()
  updateCartTotals()
  updateCartCount()
  showNotification("Item removed from cart")
}

function updateCartTotals() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  let subtotal = 0

  cartItems.forEach((item) => {
    const price = Number.parseFloat(item.price.replace("$", ""))
    subtotal += price * item.quantity
  })

  const shipping = 0 // Free shipping
  const total = subtotal + shipping

  // Update totals in the UI
  const subtotalElement = document.querySelector(".totals-row:nth-child(1) span:last-child")
  const totalElement = document.querySelector(".totals-row.total span:last-child")

  if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`
  if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`
}

function initializeCouponForm() {
  const applyCouponBtn = document.querySelector(".apply-coupon-btn")
  const couponInput = document.querySelector(".coupon-section input")

  if (applyCouponBtn) {
    applyCouponBtn.addEventListener("click", () => {
      const couponCode = couponInput.value.trim()
      if (couponCode) {
        applyCoupon(couponCode)
      }
    })
  }
}

function applyCoupon(code) {
  // Simulate coupon validation
  const validCoupons = {
    SAVE10: 0.1,
    WELCOME20: 0.2,
    SUMMER15: 0.15,
  }

  if (validCoupons[code.toUpperCase()]) {
    const discount = validCoupons[code.toUpperCase()]
    showNotification(`Coupon applied! ${discount * 100}% discount`)
    // Apply discount logic here
    applyDiscount(discount)
  } else {
    showNotification("Invalid coupon code", "error")
  }
}

function applyDiscount(discountPercent) {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  let subtotal = 0

  cartItems.forEach((item) => {
    const price = Number.parseFloat(item.price.replace("$", ""))
    subtotal += price * item.quantity
  })

  const discount = subtotal * discountPercent
  const total = subtotal - discount

  // Update UI to show discount
  const totalsContainer = document.querySelector(".cart-totals")
  let discountRow = totalsContainer.querySelector(".discount-row")

  if (!discountRow) {
    discountRow = document.createElement("div")
    discountRow.className = "totals-row discount-row"
    totalsContainer.insertBefore(discountRow, totalsContainer.querySelector(".totals-row.total"))
  }

  discountRow.innerHTML = `
        <span>Discount:</span>
        <span>-$${discount.toFixed(2)}</span>
    `

  const totalElement = document.querySelector(".totals-row.total span:last-child")
  if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`
}

function showEmptyCart() {
  const cartTable = document.querySelector(".cart-table")
  const cartActions = document.querySelector(".cart-actions")
  const cartSummary = document.querySelector(".cart-summary-section")

  if (cartTable) {
    cartTable.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart to see them here.</p>
                <a href="index.html" class="continue-shopping-btn">Continue Shopping</a>
            </div>
        `
  }

  if (cartActions) cartActions.style.display = "none"
  if (cartSummary) cartSummary.style.display = "none"
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  const bgColor = type === "error" ? "#dc3545" : "#db4444"
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
    `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease"
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

// Update cart button functionality
const updateCartBtn = document.querySelector(".update-btn")
if (updateCartBtn) {
  updateCartBtn.addEventListener("click", () => {
    showNotification("Cart updated successfully")
  })
}

// Add empty cart styles
const style = document.createElement("style")
style.textContent = `
    .empty-cart {
        text-align: center;
        padding: 80px 20px;
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
`
document.head.appendChild(style)

function updateCartCount() {
  // This function should be defined elsewhere, likely in main.js or a similar file.
  // For now, we'll leave it as a placeholder.  If it's truly undefined, you'll need to
  // either define it here, import it, or remove the calls to it.
  console.warn("updateCartCount() is called but not defined.  Please define it or import it.")
}
