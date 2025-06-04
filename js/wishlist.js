// Wishlist functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeWishlistPage()
})

function initializeWishlistPage() {
  // Initialize delete buttons
  const deleteBtns = document.querySelectorAll(".delete-btn")
  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation()
      removeFromWishlist(btn)
    })
  })

  // Initialize move all to bag button
  const moveAllBtn = document.querySelector(".move-all-btn")
  if (moveAllBtn) {
    moveAllBtn.addEventListener("click", moveAllToBag)
  }

  // Initialize add to cart buttons
  const addToCartBtns = document.querySelectorAll(".add-to-cart-btn, .add-to-cart-overlay")
  addToCartBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation()
      const productCard = btn.closest(".product-card")
      if (productCard) {
        addToCart(productCard)
      }
    })
  })

  // Initialize wishlist buttons in recommendations
  const wishlistBtns = document.querySelectorAll(".recommendations-section .wishlist-btn")
  wishlistBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation()
      toggleWishlist(btn)
    })
  })
}

function removeFromWishlist(deleteBtn) {
  const productCard = deleteBtn.closest(".product-card")
  const productTitle = productCard.querySelector(".product-title").textContent

  // Add fade out animation
  productCard.style.transition = "opacity 0.3s ease, transform 0.3s ease"
  productCard.style.opacity = "0"
  productCard.style.transform = "scale(0.8)"

  setTimeout(() => {
    productCard.remove()
    updateWishlistCount()
    showNotification(`${productTitle} removed from wishlist`)
    updateWishlistHeader()
  }, 300)
}

function moveAllToBag() {
  const wishlistItems = document.querySelectorAll(".wishlist-grid .product-card")
  let count = 0

  wishlistItems.forEach((item, index) => {
    setTimeout(() => {
      const productTitle = item.querySelector(".product-title").textContent
      addToCart(item)
      item.style.transition = "opacity 0.3s ease, transform 0.3s ease"
      item.style.opacity = "0"
      item.style.transform = "scale(0.8)"

      setTimeout(() => {
        item.remove()
        count++
        if (count === wishlistItems.length) {
          updateWishlistCount()
          updateWishlistHeader()
          showNotification("All items moved to cart")
        }
      }, 300)
    }, index * 100)
  })
}

function updateWishlistHeader() {
  const remainingItems = document.querySelectorAll(".wishlist-grid .product-card").length
  const header = document.querySelector(".wishlist-header h1")
  if (header) {
    header.textContent = `Wishlist (${remainingItems})`
  }
}

function toggleWishlist(btn) {
  const isActive = btn.classList.contains("active")
  const productCard = btn.closest(".product-card")
  const productTitle = productCard.querySelector(".product-title").textContent

  if (isActive) {
    btn.classList.remove("active")
    showNotification(`${productTitle} removed from wishlist`)
  } else {
    btn.classList.add("active")
    showNotification(`${productTitle} added to wishlist`)
  }

  updateWishlistCount()
}

function updateWishlistCount() {
  const wishlistItems = JSON.parse(localStorage.getItem("wishlist")) || []
  const wishlistBadge = document.querySelector(".wishlist-btn .badge")
  if (wishlistBadge) {
    wishlistBadge.textContent = wishlistItems.length
    wishlistBadge.style.display = wishlistItems.length > 0 ? "flex" : "none"
  }
}

// Product navigation function
function goToProduct(productSlug) {
  // Create a mapping of product slugs to their detail pages
  const productRoutes = {
    "gucci-bag": "product.html?id=gucci-bag",
    "rgb-cooler": "product.html?id=rgb-cooler",
    gamepad: "product.html?id=gamepad",
    jacket: "product.html?id=jacket",
    laptop: "product.html?id=laptop",
    monitor: "product.html?id=monitor",
    "gamepad-havit": "product.html?id=gamepad-havit",
    keyboard: "product.html?id=keyboard",
  }

  const route = productRoutes[productSlug] || "product.html"
  window.location.href = route
}

// Add to cart function (reuse from main.js)
function addToCart(productCard) {
  const productId = productCard.dataset.productId || Math.random().toString(36).substr(2, 9)
  const productTitle = productCard.querySelector(".product-title")?.textContent
  const productPrice = productCard.querySelector(".current-price")?.textContent
  const productImage = productCard.querySelector(".product-image img")?.src

  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  const existingItem = cartItems.find((item) => item.id === productId)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cartItems.push({
      id: productId,
      title: productTitle,
      price: productPrice,
      image: productImage,
      quantity: 1,
    })
  }

  localStorage.setItem("cart", JSON.stringify(cartItems))
  updateCartCount()
  showNotification("Added to cart")
}

// Update cart count function (reuse from main.js)
function updateCartCount() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const cartBadge = document.querySelector(".cart-btn .badge")
  if (cartBadge) {
    cartBadge.textContent = totalItems
    cartBadge.style.display = totalItems > 0 ? "flex" : "none"
  }
}

// Show notification function (reuse from main.js)
function showNotification(message) {
  const notification = document.createElement("div")
  notification.className = "notification"
  notification.textContent = message
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
