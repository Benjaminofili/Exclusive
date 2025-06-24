document.addEventListener("DOMContentLoaded", () => {
  initializeCountdown();
  initializeSlider();
  initializeMobileMenu();
  initializeSearch();
  initializeProductActions();
  initializeAccountDropdown();
  initializeCategorySlider();

  updateCartBadge();
  updateWishlistBadge();
});

let timerInterval = null;
let timerRunning = false;
let targetTime = null;

function initializeCountdown() {
  const countdownElements = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds"),
  };

  if (!countdownElements.days) return;

  function setInitialTime() {
    const now = new Date().getTime();
    targetTime = now + 3 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000 + 19 * 60 * 1000 + 56 * 1000;
  }

  function updateCountdown() {
    if (!targetTime) return;

    const currentTime = new Date().getTime();
    const timeLeft = targetTime - currentTime;

    if (timeLeft > 0) {
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      countdownElements.days.textContent = days.toString().padStart(2, "0");
      countdownElements.hours.textContent = hours.toString().padStart(2, "0");
      countdownElements.minutes.textContent = minutes.toString().padStart(2, "0");
      countdownElements.seconds.textContent = seconds.toString().padStart(2, "0");
    } else {
      stopTimer();
      showNotification("Flash sale ended!");
    }
  }

  function startTimer() {
    if (!timerRunning) {
      if (!targetTime) setInitialTime();
      timerInterval = setInterval(updateCountdown, 1000);
      timerRunning = true;
    }
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
  }

  setInitialTime();
  updateCountdown();
  startTimer();
}

function initializeAccountDropdown() {
  const accountBtn = document.getElementById("accountBtn");
  const accountDropdown = document.getElementById("accountDropdown");

  if (!accountBtn || !accountDropdown) return;

  accountBtn.addEventListener("click", (e) => {
    e.preventDefault();
    accountDropdown.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!accountBtn.contains(e.target) && !accountDropdown.contains(e.target)) {
      accountDropdown.classList.remove("show");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      accountDropdown.classList.remove("show");
    }
  });
}

function initializeSlider() {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".dot");
  let currentSlide = 0;

  if (!slides.length) return;

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));
    slides[index].classList.add("active");
    if (dots[index]) dots[index].classList.add("active");
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  setInterval(nextSlide, 5000);

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentSlide = index;
      showSlide(currentSlide);
    });
  });
}

function initializeMobileMenu() {
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const mainNav = document.querySelector(".main-nav");

  if (!mobileMenuBtn) return;

  mobileMenuBtn.addEventListener("click", () => {
    mainNav.classList.toggle("active");
    mobileMenuBtn.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!mainNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      mainNav.classList.remove("active");
      mobileMenuBtn.classList.remove("active");
    }
  });
}

// --- Product List for Search (expand as needed) ---
const PRODUCT_LIST = [
  { id: "flash-gamepad-001", title: "HAVIT HV-G92 Gamepad" },
  { id: "flash-keyboard-002", title: "AK-900 Wired Keyboard" },
  { id: "flash-monitor-003", title: "IPS LCD Gaming Monitor" },
  { id: "flash-chair-004", title: "S-Series Comfort Chair" },
  { id: "dog-food-014", title: "Breed Dry Dog Food" },
  { id: "canon-camera-015", title: "CANON EOS DSLR Camera" },
  { id: "asus-laptop-009", title: "ASUS FHD Gaming Laptop" },
  { id: "curology-set-011", title: "Curology Product Set" },
  { id: "kids-car-012", title: "Kids Electric Car" },
  { id: "soccer-cleats-013", title: "Jr. Soccer Cleats" },
  { id: "gamepad-black-008", title: "GP11 Shooter USB Gamepad" },
  { id: "quilted-jacket-007", title: "Quilted Satin Jacket" },
  // ...add more products as needed...
];

// --- Search Results UI ---
function renderSearchResults(results, container) {
  let resultsBox = container.querySelector(".search-results");
  if (!resultsBox) {
    resultsBox = document.createElement("div");
    resultsBox.className = "search-results";
    container.appendChild(resultsBox);
  }
  if (!results.length) {
    resultsBox.innerHTML = "<div class='search-no-results'>No products found.</div>";
    resultsBox.style.display = "block";
    return;
  }
  resultsBox.innerHTML = results.map(
    p => `<div class="search-result-item" data-product-id="${p.id}">${p.title}</div>`
  ).join("");
  resultsBox.style.display = "block";
}

// --- Hide Search Results ---
function hideSearchResults(container) {
  const resultsBox = container.querySelector(".search-results");
  if (resultsBox) resultsBox.style.display = "none";
}

// --- Search Initialization ---
function initializeSearch() {
  const searchBars = document.querySelectorAll(".search-bar");
  searchBars.forEach((bar) => {
    let input = bar.querySelector("input");
    let button = bar.querySelector("button");
    if (!input) return;

    // Create results container if not present
    if (!bar.querySelector(".search-results")) {
      const resultsDiv = document.createElement("div");
      resultsDiv.className = "search-results";
      resultsDiv.style.display = "none";
      bar.appendChild(resultsDiv);
    }

    function performSearch() {
      const query = input.value.trim().toLowerCase();
      if (query) {
        // Main matches: title includes query
        const mainResults = PRODUCT_LIST.filter(p =>
          p.title.toLowerCase().includes(query)
        );
        // Related: any word in title starts with query, but not already in mainResults
        const relatedResults = PRODUCT_LIST.filter(p => {
          if (mainResults.includes(p)) return false;
          return p.title
            .toLowerCase()
            .split(/\s+/)
            .some(word => word.startsWith(query));
        });
        // Combine, with main results first, then related
        const results = mainResults.concat(relatedResults);
        renderSearchResults(results, bar);
      } else {
        hideSearchResults(bar);
      }
    }

    button && button.addEventListener("click", (e) => {
      e.preventDefault();
      performSearch();
    });
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch();
      }
    });
input.addEventListener("input", () => {
  performSearch();
});

    // Hide results when clicking outside
    document.addEventListener("click", (e) => {
      if (!bar.contains(e.target)) hideSearchResults(bar);
    });

    // Optional: click on result navigates to product page (if exists)
    bar.addEventListener("click", (e) => {
      const item = e.target.closest(".search-result-item");
      if (item) {
        // Example: go to product.html?id=...
        window.location.href = "product.html?id=" + encodeURIComponent(item.dataset.productId);
      }
    });
  });
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

function initializeProductActions() {
  const quickViewBtns = document.querySelectorAll(".quick-view-btn");
  const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");
  const productImages = document.querySelectorAll(".product-image");
  const wishlistBtns = document.querySelectorAll(".wishlist-btn:not([href])");

  productImages.forEach((image) => {
    image.addEventListener("click", (e) => {
      const productCard = image.closest(".product-card");
      if (productCard) {
        goToProduct(productCard.dataset.productId);
      }
    });
  });

  quickViewBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const productCard = btn.closest(".product-card");
      if (productCard) {
        openQuickView(productCard);
      }
    });
  });

  addToCartBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const productCard = btn.closest(".product-card");
      if (productCard) {
        addToCart(productCard);
      }
    });
  });

  wishlistBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const productCard = btn.closest(".product-card");
      if (productCard) {
        const productId = Number(productCard.dataset.productId);
        const wishlist = getSanitizedWishlist();
        if (wishlist.includes(productId)) {
          removeFromWishlist(productId);
          btn.classList.remove("active");
          btn.querySelector("i").classList.replace("fa-solid", "fa-regular");
        } else {
          addToWishlist(productId);
          btn.classList.add("active");
          btn.querySelector("i").classList.replace("fa-regular", "fa-solid");
        }
      }
    });
  });
}

function addToCart(productCard) {
  const productId = Number(productCard.dataset.productId);
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(c => c.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  showNotification(`Product ID ${productId} added to cart`);
}

function openQuickView(productCard) {
  const productId = Number(productCard.dataset.productId);

  const modal = document.createElement("div");
  modal.className = "quick-view-modal";
  modal.innerHTML = `
    <div class="modal-content">
      <button class="close-modal">×</button>
      <div class="modal-product">
        <span class="static-product-image"></span>
        <div class="modal-info">
          <h3>Product ID: ${productId}</h3>
          <p class="price">N/A</p>
          <button class="add-to-cart-btn">Add to Cart</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.style.display = "flex";

  const closeBtn = modal.querySelector(".close-modal");
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  const addToCartBtn = modal.querySelector(".add-to-cart-btn");
  addToCartBtn.addEventListener("click", () => {
    addToCart(productCard);
    document.body.removeChild(modal);
  });
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartBadge = document.getElementById("cart-badge");
  if (cartBadge) {
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? "flex" : "none";
  }
}

function updateWishlistBadge() {
  const wishlistIds = getSanitizedWishlist();
  const wishlistBadge = document.getElementById("wishlist-badge");
  if (wishlistBadge) {
    wishlistBadge.textContent = wishlistIds.length;
    wishlistBadge.style.display = wishlistIds.length > 0 ? "flex" : "none";
  }
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  notification.setAttribute("role", "alert");
  notification.setAttribute("aria-live", "assertive");
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

function goToProduct(productId) {
  // No navigation in static mode
}

function initializeCategorySlider() {
  const prevBtn = document.querySelector(".categories-section .control-btn.prev");
  const nextBtn = document.querySelector(".categories-section .control-btn.next");
  const categoriesGrid = document.querySelector(".categories-grid");

  if (!prevBtn || !nextBtn || !categoriesGrid) return;

  let currentPosition = 0;
  const totalCategories = categoriesGrid.children.length;
  const visibleCategories = getVisibleCategoriesCount();
  const maxPosition = Math.max(0, totalCategories - visibleCategories);

  function getVisibleCategoriesCount() {
    if (window.innerWidth >= 1200) return 6;
    if (window.innerWidth >= 768) return 4;
    if (window.innerWidth >= 480) return 3;
    return 2;
  }

  function updateCategorySlider() {
    categoriesGrid.style.transform = `translateX(-${currentPosition * (100 / visibleCategories)}%)`;
    prevBtn.disabled = currentPosition === 0;
    nextBtn.disabled = currentPosition >= maxPosition;
  }

  function handlePrevClick() {
    if (currentPosition > 0) {
      currentPosition--;
      updateCategorySlider();
    }
  }

  function handleNextClick() {
    if (currentPosition < maxPosition) {
      currentPosition++;
      updateCategorySlider();
    }
  }

  prevBtn.addEventListener("click", handlePrevClick);
  nextBtn.addEventListener("click", handleNextClick);
  updateCategorySlider();

  window.addEventListener("resize", () => {
    const newVisibleCount = getVisibleCategoriesCount();
    if (newVisibleCount !== visibleCategories) {
      const visibleCategories = newVisibleCount;
      const maxPosition = Math.max(0, totalCategories - visibleCategories);
      currentPosition = Math.min(currentPosition, maxPosition);
      updateCategorySlider();
    }
  });
}

window.timerControls = {
  getState: () => ({ running: timerRunning, targetTime }),
  restart: () => {
    stopTimer();
    setInitialTime();
    updateCountdown();
    startTimer();
  },
};

const mainStyle = document.createElement("style");
mainStyle.textContent = `
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
`;
document.head.appendChild(mainStyle);

// --- Search Results Styles ---
const searchResultsStyle = document.createElement("style");
searchResultsStyle.textContent = `
.search-bar {
  position: relative;
}
.search-results {
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  z-index: 1001;
  max-height: 260px;
  overflow-y: auto;
  font-size: 14px;
  display: none;
}
.search-result-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
}
.search-result-item:hover {
  background: #f5f5f5;
}
.search-no-results {
  padding: 10px 16px;
  color: #888;
}
`;
document.head.appendChild(searchResultsStyle);

window.addEventListener('storage', (event) => {
  if (event.key === 'cart') updateCartBadge();
  if (event.key === 'wishlist') updateWishlistBadge();
});