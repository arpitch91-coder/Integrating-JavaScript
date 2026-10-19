
const foods = [
  {
    id: 1,
    name: "Classic Burger",
    category: "Burger",
    price: 99,
    description: "Juicy patty, fresh veggies and special sauce.",
    image: "photo-1568901346375-23c9450c58cd"
  },
  {
    id: 2,
    name: "Cheese Burger",
    category: "Burger",
    price: 129,
    description: "A delicious burger loaded with melted cheese.",
    image: "photo-1553979459-d2229ba7433a"
  },
  {
    id: 3,
    name: "Margherita Pizza",
    category: "Pizza",
    price: 149,
    description: "Classic pizza with cheese and tomato sauce.",
    image: "photo-1574071318508-1cdbab80d002"
  },
  {
    id: 4,
    name: "Veggie Pizza",
    category: "Pizza",
    price: 179,
    description: "Fresh vegetables and cheese on a crispy base.",
    image: "photo-1513104890138-7c749659a591"
  },
  {
    id: 5,
    name: "French Fries",
    category: "Snacks",
    price: 69,
    description: "Golden, crispy and perfectly salted fries.",
    image: "photo-1573080496219-bb080dd4f877"
  },
  {
    id: 6,
    name: "Veg Momos",
    category: "Snacks",
    price: 79,
    description: "Steamed dumplings served with spicy chutney.",
    image: "photo-1563245372-f21724e3856d"
  },
  {
    id: 7,
    name: "Sandwich",
    category: "Snacks",
    price: 89,
    description: "Toasted sandwich with a tasty veggie filling.",
    image: "photo-1528735602780-2552fd46c7af"
  },
  {
    id: 8,
    name: "Cold Coffee",
    category: "Drinks",
    price: 79,
    description: "Chilled, creamy coffee for a refreshing break.",
    image: "photo-1461023058943-07fcbe16d735"
  },
  {
    id: 9,
    name: "Fresh Lemonade",
    category: "Drinks",
    price: 49,
    description: "A refreshing lemon drink served chilled.",
    image: "photo-1513558161293-cdaf765edfd7"
  }
];

const foodGrid = document.getElementById("foodGrid");
const searchInput = document.getElementById("searchInput");
const filters = document.getElementById("filters");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const toast = document.getElementById("toast");

let selectedCategory = "All";
const cart = new Map();
let toastTimer;

// Format prices in Indian Rupees.
function formatPrice(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

// Create an image URL for each menu item.
function getFoodImage(imageId) {
  return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=600&q=80`;
}

// Display temporary notifications.
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Render menu cards based on the search and category.
function renderFoods() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredFoods = foods.filter(food => {
    const matchesCategory =
      selectedCategory === "All" ||
      food.category === selectedCategory;

    const matchesSearch =
      food.name.toLowerCase().includes(searchTerm) ||
      food.category.toLowerCase().includes(searchTerm) ||
      food.description.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  if (filteredFoods.length === 0) {
    foodGrid.innerHTML = `
      <div class="no-results">
        <h3>No food items found 😕</h3>
        <p>Try another search or category.</p>
      </div>
    `;
    return;
  }

  foodGrid.innerHTML = filteredFoods.map(food => `
    <article class="food-card">
      <img
        src="${getFoodImage(food.image)}"
        alt="${food.name}"
        loading="lazy"
      >

      <div class="food-info">
        <span class="food-category">${food.category}</span>
        <h3>${food.name}</h3>
        <p>${food.description}</p>

        <div class="food-bottom">
          <span class="food-price">${formatPrice(food.price)}</span>
          <button class="add-btn" data-add="${food.id}">
            + Add
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

// Add one unit of a food item to the cart.
function addToCart(id) {
  const food = foods.find(item => item.id === id);

  if (!food) return;

  const currentQuantity = cart.get(id) || 0;
  cart.set(id, currentQuantity + 1);

  renderCart();
  showToast(`${food.name} added to cart!`);
}

// Change the quantity of a cart item.
function changeQuantity(id, change) {
  const currentQuantity = cart.get(id) || 0;
  const nextQuantity = currentQuantity + change;

  if (nextQuantity <= 0) {
    cart.delete(id);
  } else {
    cart.set(id, nextQuantity);
  }

  renderCart();
}

// Remove an item from the cart.
function removeFromCart(id) {
  cart.delete(id);
  renderCart();
  showToast("Item removed from cart.");
}

// Update the cart display and total.
function renderCart() {
  let totalQuantity = 0;
  let totalAmount = 0;

  for (const [id, quantity] of cart) {
    const food = foods.find(item => item.id === id);

    if (food) {
      totalQuantity += quantity;
      totalAmount += food.price * quantity;
    }
  }

  cartCount.textContent = totalQuantity;
  cartTotal.textContent = formatPrice(totalAmount);

  if (cart.size === 0) {
    cartItems.innerHTML = `
      <p class="empty-cart">
        Your cart is empty. Add something tasty!
      </p>
    `;
    return;
  }

  cartItems.innerHTML = [...cart.entries()].map(([id, quantity]) => {
    const food = foods.find(item => item.id === id);

    return `
      <div class="cart-item">
        <div>
          <h4>${food.name}</h4>
          <small>${formatPrice(food.price)} each</small>

          <div class="quantity-controls">
            <button
              data-action="decrease"
              data-id="${id}"
              aria-label="Decrease ${food.name} quantity"
            >−</button>

            <span>${quantity}</span>

            <button
              data-action="increase"
              data-id="${id}"
              aria-label="Increase ${food.name} quantity"
            >+</button>
          </div>
        </div>

        <div>
          <strong>${formatPrice(food.price * quantity)}</strong>
          <button
            class="remove-btn"
            data-action="remove"
            data-id="${id}"
            aria-label="Remove ${food.name}"
          >Remove</button>
        </div>
      </div>
    `;
  }).join("");
}

// Handle Add buttons using event delegation.
foodGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");

  if (!button) return;

  addToCart(Number(button.dataset.add));
});

// Handle quantity and remove buttons.
cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");

  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "increase") {
    changeQuantity(id, 1);
  } else if (action === "decrease") {
    changeQuantity(id, -1);
  } else if (action === "remove") {
    removeFromCart(id);
  }
});

// Search menu items.
searchInput.addEventListener("input", renderFoods);

// Filter food by category.
filters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");

  if (!button) return;

  selectedCategory = button.dataset.category;

  filters.querySelectorAll(".filter").forEach(filter => {
    const isActive = filter === button;
    filter.classList.toggle("active", isActive);
    filter.setAttribute("aria-pressed", String(isActive));
  });

  renderFoods();
});

// Mobile navigation.
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation" : "Toggle navigation"
  );

  menuToggle.textContent = isOpen ? "✕" : "☰";
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.textContent = "☰";
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Toggle navigation");
  });
});

// Demo checkout: no real payment or order submission occurs.
checkoutBtn.addEventListener("click", () => {
  if (cart.size === 0) {
    showToast("Please add some food to your cart first.");
    return;
  }

  const total = [...cart.entries()].reduce((sum, [id, quantity]) => {
    const food = foods.find(item => item.id === id);
    return sum + food.price * quantity;
  }, 0);

  const orderSummary = [...cart.entries()].map(([id, quantity]) => {
    const food = foods.find(item => item.id === id);
    return `${food.name} × ${quantity}`;
  }).join("\n");

  alert(
    "YOUR ORDER SUMMARY\n\n" +
    orderSummary +
    "\n\nTotal: " + formatPrice(total) +
    "\n\nThis is a demo website. No real order or payment was made."
  );
});

// Set the current year in the footer.
document.getElementById("year").textContent =
  new Date().getFullYear();

// Initial page rendering.
renderFoods();
renderCart();
