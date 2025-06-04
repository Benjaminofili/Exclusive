// Product page specific functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeProductPage()
})

function initializeProductPage() {
  initializeThumbnails()
  initializeQuantityControls()
  initializeColorSelection()
  initializeSizeSelection()
  initializeProductActions()
}

// Thumbnail image switching
function initializeThumbnails() {
  const thumbnails = document.querySelectorAll(".thumbnail")
  const mainImage = document.getElementById("mainProductImage")

  if (!mainImage) return

  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener("click", () => {
      // Remove active class from all thumbnails
      thumbnails.forEach((thumb) => thumb.classList.remove("active"))

      // Add active class to clicked thumbnail
      thumbnail.classList.add("active")

      // Update main image
      const thumbnailImg = thumbnail.querySelector("img")
      if (thumbnailImg) {
        mainImage.src = thumbnailImg.src
        mainImage.alt = thumbnailImg.alt
      }
    })
  })
}

// Quantity controls
function initializeQuantityControls() {
  const quantityInput = document.querySelector(".quantity-input")
  const minusBtn = document.querySelector(".quantity-btn.minus")
  const plusBtn = document.querySelector(".quantity-btn.plus")

  if (!quantityInput || !minusBtn || !plusBtn) return

  minusBtn.addEventListener("click", () => {
    const currentValue = Number.parseInt(quantityInput.value)
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1
    }
  })

  plusBtn.addEventListener("click", () => {
    const currentValue = Number.parseInt(quantityInput.value)
    const maxValue = Number.parseInt(quantityInput.max) || 99
    if (currentValue < maxValue) {
      quantityInput.value = currentValue + 1
    }
  })

  // Validate input
  quantityInput.addEventListener("change", () => {
    const value = Number.parseInt(quantityInput.value)
    const min = Number.parseInt(quantityInput.min) || 1
    const max = Number.parseInt(quantityInput.max) || 99

    if (value < min) {
      quantityInput.value = min
    } else if (value > max) {
      quantityInput.value = max
    }
  })
}

// Color selection
function initializeColorSelection() {
  const colorInputs = document.querySelectorAll('input[name="color"]')

  colorInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        console.log("Selected color:", input.value)
        // Here you could update the main image based on color selection
        // updateProductImage(input.value)
      }
    })
  })
}

// Size selection
function initializeSizeSelection() {
  const sizeInputs = document.querySelectorAll('input[name="size"]')

  sizeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        console.log("Selected size:", input.value)
        // Here you could update availability or pricing based on size
        // updateProductAvailability(input.value)
      }
    })
  })
}

// Product actions
function initializeProductActions() {
  const buyNowBtn = document.querySelector(".buy-now-btn")
  const wishlistBtn = document.querySelector(".product-actions .wishlist-btn")
  const addToCartBtns = document.querySelectorAll(".add-to-cart-overlay")

  // Buy Now button
  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", () => {
      const quantity = document.querySelector(".quantity-input").value
      const selectedColor = document.querySelector('input[name="color"]:checked')?.value
      const selectedSize = document.querySelector('input[name="size"]:checked')?.value

      console.log("Buy Now clicked:", { quantity, color: selectedColor, size: selectedSize })

      // Add to cart and redirect to checkout
      addToCartFromProduct()
      window.location.href = "checkout.html"
    })
  }

  // Wishlist button
  if (wishlistBtn) {
    wishlistBtn.addEventListener("click", () => {
      wishlistBtn.classList.toggle("active")

      if (wishlistBtn.classList.contains("active")) {
        wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i>'
        showNotification("Added to wishlist")
      } else {
        wishlistBtn.innerHTML = '<i class="fa-regular fa-heart"></i>'
        showNotification("Removed from wishlist")
      }
    })
  }

  // Add to Cart buttons (for related products)
  addToCartBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault()
      const productCard = btn.closest(".product-card")
      if (productCard) {
        addToCartFromCard(productCard)
      }
    })
  })
}

// Add current product to cart
function addToCartFromProduct() {
  const productTitle = document.querySelector(".product-info h1").textContent
  const productPrice = document.querySelector(".current-price").textContent
  const productImage = document.getElementById("mainProductImage").src
  const quantity = Number.parseInt(document.querySelector(".quantity-input").value)
  const selectedColor = document.querySelector('input[name="color"]:checked')?.value
  const selectedSize = document.querySelector('input[name="size"]:checked')?.value

  const cartItems = JSON.parse(localStorage.getItem("cart")) || []

  const productId = `product-${Date.now()}`

  cartItems.push({
    id: productId,
    title: productTitle,
    price: productPrice,
    image: productImage,
    quantity: quantity,
    color: selectedColor,
    size: selectedSize,
  })

  localStorage.setItem("cart", JSON.stringify(cartItems))
  updateCartCount()
  showNotification(`Added ${quantity} item(s) to cart`)
}

// Add product from card to cart
function addToCartFromCard(productCard) {
  const productTitle = productCard.querySelector(".product-title").textContent
  const productPrice = productCard.querySelector(".current-price").textContent
  const productImage = productCard.querySelector(".product-image img").src

  const cartItems = JSON.parse(localStorage.getItem("cart")) || []

  const productId = `product-${Date.now()}`

  const existingItem = cartItems.find((item) => item.title === productTitle && item.price === productPrice)

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

// Update cart count in header
function updateCartCount() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const cartBadge = document.querySelector(".cart-btn .badge")
  if (cartBadge) {
    cartBadge.textContent = totalItems
    cartBadge.style.display = totalItems > 0 ? "flex" : "none"
  }
}

// Show notification
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

// Initialize cart count on page load
updateCartCount()
