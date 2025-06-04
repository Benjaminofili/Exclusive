// Main JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all components
  initializeCountdown()
  initializeSlider()
  initializeMobileMenu()
  initializeSearch()
  initializeWishlist()
  initializeProductActions()
  initializeAccountDropdown()
  initializeCategorySlider() // Add this line
  addSectionButtons()
})

// Timer state
let timerInterval = null
let timerRunning = false
let targetTime = null

// Countdown Timer with Auto Start
function initializeCountdown() {
  const countdownElements = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds"),
  }

  // Check if countdown elements exist
  if (!countdownElements.days) return

  // Set initial target time (3 days, 23 hours, 19 minutes, 56 seconds from now)
  function setInitialTime() {
    const now = new Date().getTime()
    targetTime = now + 3 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000 + 19 * 60 * 1000 + 56 * 1000
  }

  function updateCountdown() {
    if (!targetTime) return

    const currentTime = new Date().getTime()
    const timeLeft = targetTime - currentTime

    if (timeLeft > 0) {
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

      countdownElements.days.textContent = days.toString().padStart(2, "0")
      countdownElements.hours.textContent = hours.toString().padStart(2, "0")
      countdownElements.minutes.textContent = minutes.toString().padStart(2, "0")
      countdownElements.seconds.textContent = seconds.toString().padStart(2, "0")
    } else {
      // Timer finished
      stopTimer()
      showNotification("Flash sale ended!")
    }
  }

  function startTimer() {
    if (!timerRunning) {
      if (!targetTime) setInitialTime()
      timerInterval = setInterval(updateCountdown, 1000)
      timerRunning = true
    }
  }

  function stopTimer() {
    clearInterval(timerInterval)
    timerRunning = false
  }

  // Initialize and start automatically
  setInitialTime()
  updateCountdown()
  startTimer()
}

// Account Dropdown
function initializeAccountDropdown() {
  const accountBtn = document.getElementById("accountBtn")
  const accountDropdown = document.getElementById("accountDropdown")

  if (!accountBtn || !accountDropdown) return

  accountBtn.addEventListener("click", (e) => {
    e.preventDefault()
    accountDropdown.classList.toggle("show")
  })

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!accountBtn.contains(e.target) && !accountDropdown.contains(e.target)) {
      accountDropdown.classList.remove("show")
    }
  })

  // Close dropdown when pressing escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      accountDropdown.classList.remove("show")
    }
  })
}

// Hero Slider
function initializeSlider() {
  const slides = document.querySelectorAll(".hero-slide")
  const dots = document.querySelectorAll(".dot")
  let currentSlide = 0

  if (!slides.length === 0) return

  function showSlide(index) {
    // Hide all slides
    slides.forEach((slide) => slide.classList.remove("active"))
    dots.forEach((dot) => dot.classList.remove("active"))

    // Show current slide
    slides[index].classList.add("active")
    if (dots[index]) dots[index].classList.add("active")
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length
    showSlide(currentSlide)
  }

  // Auto-advance slides every 5 seconds
  setInterval(nextSlide, 5000)

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentSlide = index
      showSlide(currentSlide)
    })
  })
}

// Mobile Menu
function initializeMobileMenu() {
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
  const mainNav = document.querySelector(".main-nav")

  if (!mobileMenuBtn) return

  mobileMenuBtn.addEventListener("click", () => {
    mainNav.classList.toggle("active")
    mobileMenuBtn.classList.toggle("active")
  })

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!mainNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      mainNav.classList.remove("active")
      mobileMenuBtn.classList.remove("active")
    }
  })
}

// Search Functionality
function initializeSearch() {
  const searchInput = document.querySelector(".search-bar input")
  const searchBtn = document.querySelector(".search-bar button")

  if (!searchInput) return

  function performSearch() {
    const query = searchInput.value.trim()
    if (query) {
      // In a real application, this would perform an actual search
      console.log("Searching for:", query)
      showNotification(`Searching for: ${query}`)
      // Redirect to search results page
      // window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
  }

  searchBtn.addEventListener("click", performSearch)
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performSearch()
    }
  })
}

// Wishlist Functionality
function initializeWishlist() {
  const wishlistBtns = document.querySelectorAll(".wishlist-btn")
  let wishlistItems = JSON.parse(localStorage.getItem("wishlist")) || []

  wishlistBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault()
      const productCard = btn.closest(".product-card")
      if (!productCard) return

      const productId = productCard.dataset.productId || Math.random().toString(36).substr(2, 9)
      const productTitle = productCard.querySelector(".product-title")?.textContent
      const productPrice = productCard.querySelector(".current-price")?.textContent
      const productImage = productCard.querySelector(".product-image img")?.src

      const isInWishlist = wishlistItems.some((item) => item.id === productId)

      if (isInWishlist) {
        // Remove from wishlist
        wishlistItems = wishlistItems.filter((item) => item.id !== productId)
        btn.classList.remove("active")
        showNotification("Removed from wishlist")
      } else {
        // Add to wishlist
        wishlistItems.push({
          id: productId,
          title: productTitle,
          price: productPrice,
          image: productImage,
        })
        btn.classList.add("active")
        showNotification("Added to wishlist")
      }

      localStorage.setItem("wishlist", JSON.stringify(wishlistItems))
      updateWishlistCount()
    })
  })

  // Update wishlist button states on page load
  updateWishlistButtons()
  updateWishlistCount()

  function updateWishlistButtons() {
    wishlistBtns.forEach((btn) => {
      const productCard = btn.closest(".product-card")
      if (!productCard) return

      const productId = productCard.dataset.productId
      if (productId && wishlistItems.some((item) => item.id === productId)) {
        btn.classList.add("active")
      }
    })
  }

  function updateWishlistCount() {
    const wishlistCount = document.querySelector(".wishlist-btn .badge")
    if (wishlistCount) {
      wishlistCount.textContent = wishlistItems.length
      wishlistCount.style.display = wishlistItems.length > 0 ? "flex" : "none"
    }
  }
}

// Product Actions
function initializeProductActions() {
  const quickViewBtns = document.querySelectorAll(".quick-view-btn")
  const addToCartBtns = document.querySelectorAll(".add-to-cart-btn")

  quickViewBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault()
      const productCard = btn.closest(".product-card")
      if (productCard) {
        openQuickView(productCard)
      }
    })
  })

  addToCartBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault()
      const productCard = btn.closest(".product-card")
      if (productCard) {
        addToCart(productCard)
      }
    })
  })
}

// Quick View Modal
function openQuickView(productCard) {
  const productTitle = productCard.querySelector(".product-title")?.textContent
  const productPrice = productCard.querySelector(".current-price")?.textContent
  const productImage = productCard.querySelector(".product-image img")?.src

  // Create modal (simplified version)
  const modal = document.createElement("div")
  modal.className = "quick-view-modal"
  modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal">&times;</button>
            <div class="modal-product">
                <img src="${productImage}" alt="${productTitle}">
                <div class="modal-info">
                    <h3>${productTitle}</h3>
                    <p class="price">${productPrice}</p>
                    <button class="add-to-cart-btn">Add to Cart</button>
                </div>
            </div>
        </div>
    `

  document.body.appendChild(modal)
  modal.style.display = "flex"

  // Close modal functionality
  const closeBtn = modal.querySelector(".close-modal")
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(modal)
  })

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal)
    }
  })
}

// Add to Cart
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

// Update Cart Count
function updateCartCount() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const cartBadge = document.querySelector(".cart-btn .badge")
  if (cartBadge) {
    cartBadge.textContent = totalItems
    cartBadge.style.display = totalItems > 0 ? "flex" : "none"
  }
}

// Show Notification
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

// Add CSS animations
const style = document.createElement("style")
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .quick-view-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .modal-content {
        background: white;
        border-radius: 8px;
        padding: 32px;
        max-width: 600px;
        width: 90%;
        position: relative;
    }
    
    .close-modal {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
    }
    
    .modal-product {
        display: flex;
        gap: 24px;
        align-items: center;
    }
    
    .modal-product img {
        width: 200px;
        height: 200px;
        object-fit: contain;
        background: #f5f5f5;
        border-radius: 4px;
    }
    
    .modal-info h3 {
        font-size: 24px;
        margin-bottom: 16px;
    }
    
    .modal-info .price {
        font-size: 20px;
        color: #db4444;
        font-weight: 600;
        margin-bottom: 24px;
    }
    
    .modal-info .add-to-cart-btn {
        background: #db4444;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    }
    
    .wishlist-btn.active i {
        color: #db4444;
    }
    
    @media (max-width: 768px) {
        .modal-product {
            flex-direction: column;
            text-align: center;
        }
        
        .modal-product img {
            width: 150px;
            height: 150px;
        }
    }
`
document.head.appendChild(style)

// Initialize cart count on page load
updateCartCount()

// Category Slider
function initializeCategorySlider() {
  const prevBtn = document.querySelector(".categories-section .control-btn.prev")
  const nextBtn = document.querySelector(".categories-section .control-btn.next")
  const categoriesGrid = document.querySelector(".categories-grid")

  if (!prevBtn || !nextBtn || !categoriesGrid) return

  let currentPosition = 0
  const totalCategories = categoriesGrid.children.length
  const visibleCategories = getVisibleCategoriesCount()
  const maxPosition = Math.max(0, totalCategories - visibleCategories)

  function getVisibleCategoriesCount() {
    // Determine how many categories to show based on screen width
    if (window.innerWidth >= 1200) return 6
    if (window.innerWidth >= 768) return 4
    if (window.innerWidth >= 480) return 3
    return 2
  }

  function updateCategorySlider() {
    // Update the transform to show the current position
    categoriesGrid.style.transform = `translateX(-${currentPosition * (100 / visibleCategories)}%)`

    // Update button states
    prevBtn.disabled = currentPosition === 0
    nextBtn.disabled = currentPosition >= maxPosition
  }

  function handlePrevClick() {
    if (currentPosition > 0) {
      currentPosition--
      updateCategorySlider()
    }
  }

  function handleNextClick() {
    if (currentPosition < maxPosition) {
      currentPosition++
      updateCategorySlider()
    }
  }

  // Add event listeners
  prevBtn.addEventListener("click", handlePrevClick)
  nextBtn.addEventListener("click", handleNextClick)

  // Initialize slider
  updateCategorySlider()

  // Update on window resize
  window.addEventListener("resize", () => {
    const newVisibleCount = getVisibleCategoriesCount()
    if (newVisibleCount !== visibleCategories) {
      // Recalculate visible categories and max position
      const visibleCategories = newVisibleCount
      const maxPosition = Math.max(0, totalCategories - visibleCategories)
      // Ensure current position is valid
      currentPosition = Math.min(currentPosition, maxPosition)
      updateCategorySlider()
    }
  })
}

function addSectionButtons() {
  const sections = document.querySelectorAll("main > section")

  sections.forEach((section) => {
    if (section.classList.contains("new-arrival-section")) return // Skip New Arrival section

    const viewAllLink = section.querySelector(".view-all-btn")
    if (!viewAllLink) {
      // Create a default button if there is no view-all-btn
      const button = document.createElement("a")
      button.href = "#" // Replace with a real link if available
      button.textContent = "View All"
      button.classList.add("view-all-btn")
      const container = document.createElement("div")
      container.classList.add("view-all-btn-container")
      container.appendChild(button)
      section.appendChild(container)
    }
  })
}

// Expose timer controls globally for debugging
window.timerControls = {
  getState: () => ({ running: timerRunning, targetTime }),
  restart: () => {
    stopTimer()
    setInitialTime()
    updateCountdown()
    startTimer()
  },
}
