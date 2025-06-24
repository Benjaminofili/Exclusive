/**
 * Static Wishlist: renders a fixed list of wishlist items, no dynamic add/remove.
 */

document.addEventListener("DOMContentLoaded", () => {
  updateStaticWishlistCount();
  updateStaticCartCount();
});



function updateStaticWishlistHeader(count) {
  const header = document.querySelector(".wishlist-header h1");
  if (header) {
    header.textContent = `Wishlist (${count})`;
  }
}

function updateStaticWishlistCount() {
  const count = 2; // matches staticWishlist.length
  const wishlistBadge = document.getElementById("wishlist-badge");
  const wishlistCount = document.getElementById("wishlist-count");
  if (wishlistBadge) {
    wishlistBadge.textContent = count;
    wishlistBadge.style.display = count > 0 ? "flex" : "none";
  }
  if (wishlistCount) {
    wishlistCount.textContent = count;
  }
}

function updateStaticCartCount() {
  const count = 1; // matches staticCart.length below
  const cartBadge = document.getElementById("cart-badge");
  if (cartBadge) {
    cartBadge.textContent = count;
    cartBadge.style.display = count > 0 ? "flex" : "none";
  }
}

// Remove all dynamic wishlist/cart event listeners and functions

// Notification and style (optional, for consistency)
const wishlistStyle = document.createElement("style");
wishlistStyle.textContent = `
  .wishlist-grid .product-card {
    position: relative;
    background: #fff;
    border-radius: 4px;
    overflow: hidden;
  }
  .wishlist-grid p {
    text-align: center;
    font-size: 16px;
    color: #666;
    padding: 40px 0;
  }
  .wishlist-btn.active i {
    color: #db4444;
  }
`;
document.head.appendChild(wishlistStyle);