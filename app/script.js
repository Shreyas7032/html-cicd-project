// Theme management
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme")
  const newTheme = currentTheme === "dark" ? "light" : "dark"

  document.documentElement.setAttribute("data-theme", newTheme)
  localStorage.setItem("theme", newTheme)

  const themeIcon = document.getElementById("theme-icon")
  themeIcon.className = newTheme === "dark" ? "fas fa-sun" : "fas fa-moon"
}

// Initialize theme
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "light"
  document.documentElement.setAttribute("data-theme", savedTheme)

  const themeIcon = document.getElementById("theme-icon")
  if (themeIcon) {
    themeIcon.className = savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon"
  }
}

// Image handling functions
function handleImageUpload(inputId, previewId) {
  const input = document.getElementById(inputId)
  const preview = document.getElementById(previewId)
  const previewImg = preview.querySelector("img")

  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImg.src = e.target.result
      preview.style.display = "block"
    }
    reader.readAsDataURL(input.files[0])
  }
}

// Global variables
let currentUser = null
let currentUserType = "customer"
let cart = []

// Admin key for validation
const ADMIN_KEY = "KISANKART_ADMIN_2025"

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  setupEventListeners()
  checkAuthStatus()
})

// Initialize application
function initializeApp() {
  // Initialize localStorage if empty
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]))
  }
  if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify([]))
  }
  if (!localStorage.getItem("orders")) {
    localStorage.setItem("orders", JSON.stringify([]))
  }
  if (!localStorage.getItem("sales")) {
    localStorage.setItem("sales", JSON.stringify([]))
  }

  // Initialize theme
  initializeTheme()
  initializeContactStorage()
}

// Setup event listeners
function setupEventListeners() {
  // Navigation
  document.getElementById("hamburger").addEventListener("click", toggleMobileMenu)

  // User type selectors
  document.querySelectorAll(".user-type-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const type = this.dataset.type
      selectUserType(type, this.closest(".modal").id)
    })
  })

  // Forms
  document.getElementById("login-form").addEventListener("submit", handleLogin)
  document.getElementById("signup-form").addEventListener("submit", handleSignup)
  document.getElementById("add-product-form").addEventListener("submit", handleAddProduct)
  document.getElementById("payment-form").addEventListener("submit", handlePayment)
  document.getElementById("contact-form").addEventListener("submit", handleContactForm)

  // Search and filters
  const searchInput = document.getElementById("search-products")
  if (searchInput) {
    searchInput.addEventListener("input", filterProducts)
  }

  const categoryFilter = document.getElementById("filter-category")
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterProducts)
  }

  const sortProducts = document.getElementById("sort-products")
  if (sortProducts) {
    sortProducts.addEventListener("change", sortFarmerProducts)
  }

  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      event.target.style.display = "none"
    }
  })

  // Image upload handlers
  const productImageInput = document.getElementById("product-image")
  if (productImageInput) {
    productImageInput.addEventListener("change", () => {
      handleImageUpload("product-image", "image-preview")
    })
  }

  const editProductImageInput = document.getElementById("edit-product-image")
  if (editProductImageInput) {
    editProductImageInput.addEventListener("change", () => {
      handleImageUpload("edit-product-image", "edit-image-preview")
    })
  }

  // Edit product form
  document.getElementById("edit-product-form").addEventListener("submit", handleEditProduct)
}

// Check authentication status
function checkAuthStatus() {
  const savedUser = localStorage.getItem("currentUser")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    showDashboard(currentUser.type)
    updateNavigation()
  }
}

// Toggle mobile menu
function toggleMobileMenu() {
  const navMenu = document.getElementById("nav-menu")
  navMenu.classList.toggle("active")
}

// Show/hide modals
function showLoginModal() {
  document.getElementById("login-modal").style.display = "block"
}

function showSignupModal() {
  document.getElementById("signup-modal").style.display = "block"
}

function showAddProductModal() {
  document.getElementById("add-product-modal").style.display = "block"
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none"
}

// Select user type
function selectUserType(type, modalId) {
  currentUserType = type
  const modal = document.getElementById(modalId)
  const buttons = modal.querySelectorAll(".user-type-btn")

  buttons.forEach((btn) => btn.classList.remove("active"))
  modal.querySelector(`[data-type="${type}"]`).classList.add("active")

  // Show/hide admin key field
  const adminKeyGroup = modal.querySelector("#admin-key-group")
  if (adminKeyGroup) {
    adminKeyGroup.style.display = type === "admin" ? "block" : "none"
  }
}

// Handle login
function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value

  const users = JSON.parse(localStorage.getItem("users"))
  const user = users.find((u) => u.email === email && u.password === password && u.type === currentUserType)

  if (user) {
    currentUser = user
    localStorage.setItem("currentUser", JSON.stringify(user))
    closeModal("login-modal")
    showDashboard(user.type)
    updateNavigation()
    showNotification("Login successful!", "success")
  } else {
    showNotification("Invalid credentials!", "error")
  }
}

// Handle signup
function handleSignup(e) {
  e.preventDefault()

  const name = document.getElementById("signup-name").value
  const email = document.getElementById("signup-email").value
  const phone = document.getElementById("signup-phone").value
  const password = document.getElementById("signup-password").value
  const adminKey = document.getElementById("admin-key").value

  // Validate admin key for admin signup
  if (currentUserType === "admin" && adminKey !== ADMIN_KEY) {
    showNotification("Invalid admin key!", "error")
    return
  }

  const users = JSON.parse(localStorage.getItem("users"))

  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    showNotification("User already exists!", "error")
    return
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    password,
    type: currentUserType,
    status: "active",
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  localStorage.setItem("users", JSON.stringify(users))

  currentUser = newUser
  localStorage.setItem("currentUser", JSON.stringify(newUser))

  closeModal("signup-modal")
  showDashboard(newUser.type)
  updateNavigation()
  showNotification("Account created successfully!", "success")
}

// Update navigation
function updateNavigation() {
  const navAuth = document.getElementById("nav-auth")
  const navUser = document.getElementById("nav-user")
  const userName = document.getElementById("user-name")
  const publicNavLinks = document.getElementById("public-nav-links")

  if (currentUser) {
    navAuth.style.display = "none"
    navUser.style.display = "flex"
    publicNavLinks.style.display = "none"
    userName.textContent = currentUser.name
  } else {
    navAuth.style.display = "flex"
    navUser.style.display = "none"
    publicNavLinks.style.display = "flex"
  }
}

// Show dashboard based on user type
function showDashboard(userType) {
  // Hide all sections
  document.getElementById("home").style.display = "none"
  document.getElementById("about").style.display = "none"
  document.getElementById("contact").style.display = "none"
  document.getElementById("farmer-dashboard").style.display = "none"
  document.getElementById("customer-dashboard").style.display = "none"
  document.getElementById("admin-dashboard").style.display = "none"

  // Show appropriate dashboard
  document.getElementById(`${userType}-dashboard`).style.display = "block"

  // Load dashboard data
  switch (userType) {
    case "farmer":
      loadFarmerDashboard()
      break
    case "customer":
      loadCustomerDashboard()
      break
    case "admin":
      loadAdminDashboard()
      break
  }
}

// Load farmer dashboard
function loadFarmerDashboard() {
  loadFarmerStats()
  loadFarmerProducts()
  loadSalesData()
  setTimeout(addAnimations, 100)
}

// Load farmer statistics
function loadFarmerStats() {
  const products = JSON.parse(localStorage.getItem("products"))
  const sales = JSON.parse(localStorage.getItem("sales"))

  const farmerProducts = products.filter((p) => p.farmerId === currentUser.id)
  const farmerSales = sales.filter((s) => s.farmerId === currentUser.id)

  const totalRevenue = farmerSales.reduce((sum, sale) => sum + sale.total, 0)

  document.getElementById("total-products").textContent = farmerProducts.length
  document.getElementById("total-sales").textContent = farmerSales.length
  document.getElementById("total-revenue").textContent = `₹${totalRevenue.toFixed(2)}`
}

// Load farmer products
function loadFarmerProducts() {
  const products = JSON.parse(localStorage.getItem("products"))
  const farmerProducts = products.filter((p) => p.farmerId === currentUser.id)

  const container = document.getElementById("farmer-products")
  container.innerHTML = ""

  farmerProducts.forEach((product) => {
    const productCard = createFarmerProductCard(product)
    container.appendChild(productCard)
  })
}

// Create farmer product card
function createFarmerProductCard(product) {
  const card = document.createElement("div")
  card.className = "product-card"

  card.innerHTML = `
        <img src="${product.image || "/placeholder.svg?height=200&width=280"}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">₹${product.price}/kg</p>
            <p class="product-description">${product.description}</p>
            <p class="product-stock">Stock: ${product.stock} kg</p>
            <div class="product-actions">
                <button class="btn btn-outline" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-secondary" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `

  return card
}

// Handle add product
function handleAddProduct(e) {
  e.preventDefault()

  const name = document.getElementById("product-name").value
  const category = document.getElementById("product-category").value
  const price = Number.parseFloat(document.getElementById("product-price").value)
  const stock = Number.parseInt(document.getElementById("product-stock").value)
  const description = document.getElementById("product-description").value
  const imageFile = document.getElementById("product-image").files[0]

  let imageDataUrl = "/placeholder.svg?height=200&width=280"

  if (imageFile) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageDataUrl = e.target.result
      saveProduct()
    }
    reader.readAsDataURL(imageFile)
  } else {
    saveProduct()
  }

  function saveProduct() {
    const products = JSON.parse(localStorage.getItem("products"))

    const newProduct = {
      id: Date.now().toString(),
      name,
      category,
      price,
      stock,
      description,
      image: imageDataUrl,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      createdAt: new Date().toISOString(),
    }

    products.push(newProduct)
    localStorage.setItem("products", JSON.stringify(products))

    closeModal("add-product-modal")
    loadFarmerProducts()
    loadFarmerStats()
    showNotification("Product added successfully!", "success")

    // Reset form and preview
    document.getElementById("add-product-form").reset()
    document.getElementById("image-preview").style.display = "none"
  }
}

// Delete product
function deleteProduct(productId) {
  if (confirm("Are you sure you want to delete this product?")) {
    const products = JSON.parse(localStorage.getItem("products"))
    const updatedProducts = products.filter((p) => p.id !== productId)
    localStorage.setItem("products", JSON.stringify(updatedProducts))

    loadFarmerProducts()
    loadFarmerStats()
    showNotification("Product deleted successfully!", "success")
  }
}

// Sort farmer products
function sortFarmerProducts() {
  const sortBy = document.getElementById("sort-products").value
  const products = JSON.parse(localStorage.getItem("products"))
  const farmerProducts = products.filter((p) => p.farmerId === currentUser.id)

  farmerProducts.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "price":
        return a.price - b.price
      case "stock":
        return b.stock - a.stock
      default:
        return 0
    }
  })

  const container = document.getElementById("farmer-products")
  container.innerHTML = ""

  farmerProducts.forEach((product) => {
    const productCard = createFarmerProductCard(product)
    container.appendChild(productCard)
  })
}

// Load sales data
function loadSalesData() {
  const sales = JSON.parse(localStorage.getItem("sales"))
  const farmerSales = sales.filter((s) => s.farmerId === currentUser.id)

  const tbody = document.getElementById("sales-tbody")
  tbody.innerHTML = ""

  farmerSales.forEach((sale) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.productName}</td>
            <td>${sale.quantity} kg</td>
            <td>₹${sale.price}</td>
            <td>₹${sale.total.toFixed(2)}</td>
            <td>${sale.customerName}</td>
        `
    tbody.appendChild(row)
  })
}

// Generate farmer report
function generateFarmerReport() {
  const sales = JSON.parse(localStorage.getItem("sales"))
  const farmerSales = sales.filter((s) => s.farmerId === currentUser.id)

  let reportContent = `
        <h2>Sales Report - ${currentUser.name}</h2>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <hr>
        <h3>Summary</h3>
        <p>Total Sales: ${farmerSales.length}</p>
        <p>Total Revenue: ₹${farmerSales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}</p>
        <hr>
        <h3>Detailed Sales</h3>
        <table border="1" style="width: 100%; border-collapse: collapse;">
            <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                <th>Customer</th>
            </tr>
    `

  farmerSales.forEach((sale) => {
    reportContent += `
            <tr>
                <td>${new Date(sale.date).toLocaleDateString()}</td>
                <td>${sale.productName}</td>
                <td>${sale.quantity} kg</td>
                <td>₹${sale.price}</td>
                <td>₹${sale.total.toFixed(2)}</td>
                <td>${sale.customerName}</td>
            </tr>
        `
  })

  reportContent += "</table>"

  const printWindow = window.open("", "_blank")
  printWindow.document.write(`
        <html>
            <head>
                <title>Sales Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                    th { background-color: #f5f5f5; }
                </style>
            </head>
            <body>${reportContent}</body>
        </html>
    `)
  printWindow.document.close()
  printWindow.print()
}

// Load customer dashboard
function loadCustomerDashboard() {
  loadCustomerStats()
  loadAvailableProducts()
  loadCart()
  loadOrderHistory()
  setTimeout(addAnimations, 100)
}

// Load customer statistics
function loadCustomerStats() {
  const orders = JSON.parse(localStorage.getItem("orders"))
  const customerOrders = orders.filter((o) => o.customerId === currentUser.id)

  const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0)

  document.getElementById("cart-items").textContent = cart.length
  document.getElementById("total-orders").textContent = customerOrders.length
  document.getElementById("total-spent").textContent = `₹${totalSpent.toFixed(2)}`
}

// Load available products
function loadAvailableProducts() {
  const products = JSON.parse(localStorage.getItem("products"))
  const availableProducts = products.filter((p) => p.stock > 0)

  const container = document.getElementById("customer-products")
  container.innerHTML = ""

  availableProducts.forEach((product) => {
    const productCard = createCustomerProductCard(product)
    container.appendChild(productCard)
  })
}

// Create customer product card
function createCustomerProductCard(product) {
  const card = document.createElement("div")
  card.className = "product-card"

  card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">₹${product.price}/kg</p>
            <p class="product-description">${product.description}</p>
            <p class="product-stock">Available: ${product.stock} kg</p>
            <p style="color: #666; font-size: 0.9rem;">By: ${product.farmerName}</p>
            <div class="quantity-selector">
                <button class="quantity-btn" onclick="changeQuantity('${product.id}', -1)">-</button>
                <input type="number" class="quantity-input" id="qty-${product.id}" value="1" min="1" max="${product.stock}">
                <button class="quantity-btn" onclick="changeQuantity('${product.id}', 1)">+</button>
            </div>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="addToCart('${product.id}')">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `

  return card
}

// Change quantity
function changeQuantity(productId, change) {
  const input = document.getElementById(`qty-${productId}`)
  const currentValue = Number.parseInt(input.value)
  const newValue = currentValue + change
  const maxValue = Number.parseInt(input.max)

  if (newValue >= 1 && newValue <= maxValue) {
    input.value = newValue
  }
}

// Add to cart
function addToCart(productId) {
  const products = JSON.parse(localStorage.getItem("products"))
  const product = products.find((p) => p.id === productId)
  const quantity = Number.parseInt(document.getElementById(`qty-${productId}`).value)

  if (!product || quantity <= 0 || quantity > product.stock) {
    showNotification("Invalid quantity!", "error")
    return
  }

  const existingItem = cart.find((item) => item.productId === productId)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({
      productId: productId,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
    })
  }

  loadCart()
  loadCustomerStats()
  showNotification("Added to cart!", "success")
}

// Load cart
function loadCart() {
  const container = document.getElementById("cart-items-container")
  const checkoutBtn = document.getElementById("checkout-btn")

  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Your cart is empty</p>'
    checkoutBtn.disabled = true
    return
  }

  checkoutBtn.disabled = false

  let cartHTML = ""
  let total = 0

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity
    total += itemTotal

    cartHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price}/kg</div>
                    <div style="font-size: 0.9rem; color: #666;">By: ${item.farmerName}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                        <span style="padding: 0 10px;">${item.quantity} kg</span>
                        <button class="quantity-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                    </div>
                    <div style="font-weight: bold; margin-left: 15px;">₹${itemTotal.toFixed(2)}</div>
                    <button class="btn btn-outline" onclick="removeFromCart(${index})" style="margin-left: 15px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `
  })

  cartHTML += `
        <div class="cart-total">
            <h3>Total: ₹${total.toFixed(2)}</h3>
        </div>
    `

  container.innerHTML = cartHTML
}

// Update cart quantity
function updateCartQuantity(index, change) {
  const item = cart[index]
  const products = JSON.parse(localStorage.getItem("products"))
  const product = products.find((p) => p.id === item.productId)

  const newQuantity = item.quantity + change

  if (newQuantity <= 0) {
    removeFromCart(index)
    return
  }

  if (newQuantity > product.stock) {
    showNotification("Not enough stock available!", "error")
    return
  }

  item.quantity = newQuantity
  loadCart()
  loadCustomerStats()
}

// Remove from cart
function removeFromCart(index) {
  cart.splice(index, 1)
  loadCart()
  loadCustomerStats()
  showNotification("Item removed from cart!", "success")
}

// Filter products
function filterProducts() {
  const searchTerm = document.getElementById("search-products").value.toLowerCase()
  const category = document.getElementById("filter-category").value

  const products = JSON.parse(localStorage.getItem("products"))
  let filteredProducts = products.filter((p) => p.stock > 0)

  if (searchTerm) {
    filteredProducts = filteredProducts.filter(
      (p) => p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm),
    )
  }

  if (category) {
    filteredProducts = filteredProducts.filter((p) => p.category === category)
  }

  const container = document.getElementById("customer-products")
  container.innerHTML = ""

  filteredProducts.forEach((product) => {
    const productCard = createCustomerProductCard(product)
    container.appendChild(productCard)
  })
}

// Checkout
function checkout() {
  if (cart.length === 0) {
    showNotification("Your cart is empty!", "error")
    return
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const summaryHTML = `
        <h3>Order Summary</h3>
        <div style="margin: 20px 0;">
            ${cart
              .map(
                (item) => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>${item.name} (${item.quantity} kg)</span>
                    <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `,
              )
              .join("")}
            <hr>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2rem;">
                <span>Total</span>
                <span>₹${total.toFixed(2)}</span>
            </div>
        </div>
    `

  document.getElementById("payment-summary").innerHTML = summaryHTML
  document.getElementById("payment-modal").style.display = "block"
}

// Handle payment
function handlePayment(e) {
  e.preventDefault()

  const paymentMethodRadio = document.querySelector('input[name="payment-method"]:checked')
  const paymentMethod = paymentMethodRadio ? paymentMethodRadio.value : "cod"
  const deliveryAddress = document.getElementById("delivery-address").value

  if (!deliveryAddress.trim()) {
    showNotification("Please enter delivery address!", "error")
    return
  }

  const orderId = "ORD" + Date.now()
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Create order
  const order = {
    id: orderId,
    customerId: currentUser.id,
    customerName: currentUser.name,
    items: [...cart],
    total: total,
    paymentMethod: paymentMethod,
    deliveryAddress: deliveryAddress,
    status: "pending",
    date: new Date().toISOString(),
  }

  const orders = JSON.parse(localStorage.getItem("orders"))
  orders.push(order)
  localStorage.setItem("orders", JSON.stringify(orders))

  // Create sales records
  const sales = JSON.parse(localStorage.getItem("sales"))
  cart.forEach((item) => {
    sales.push({
      id: Date.now() + Math.random(),
      orderId: orderId,
      productId: item.productId,
      productName: item.name,
      farmerId: item.farmerId,
      farmerName: item.farmerName,
      customerId: currentUser.id,
      customerName: currentUser.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      date: new Date().toISOString(),
    })
  })
  localStorage.setItem("sales", JSON.stringify(sales))

  // Update product stock
  const products = JSON.parse(localStorage.getItem("products"))
  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (product) {
      product.stock -= item.quantity
    }
  })
  localStorage.setItem("products", JSON.stringify(products))

  // Generate payment slip
  generatePaymentSlip(order)

  // Clear cart
  cart = []
  loadCart()
  loadCustomerStats()
  loadAvailableProducts()
  loadOrderHistory()

  closeModal("payment-modal")
  showNotification("Order placed successfully!", "success")

  // Reset form
  document.getElementById("payment-form").reset()
}

// Generate payment slip
function generatePaymentSlip(order) {
  const slipContent = `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4CAF50; margin-bottom: 10px;">KisanKart</h1>
                <h2>Payment Slip</h2>
            </div>
            
            <div style="background: #f5f5f5; padding: 15px; margin-bottom: 20px;">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                <p><strong>Customer:</strong> ${order.customerName}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>Delivery Address</h3>
                <p>${order.deliveryAddress}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background: #4CAF50; color: white;">
                        <th style="padding: 10px; text-align: left;">Item</th>
                        <th style="padding: 10px; text-align: center;">Quantity</th>
                        <th style="padding: 10px; text-align: right;">Price</th>
                        <th style="padding: 10px; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items
                      .map(
                        (item) => `
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 10px;">${item.name}<br><small>By: ${item.farmerName}</small></td>
                            <td style="padding: 10px; text-align: center;">${item.quantity} kg</td>
                            <td style="padding: 10px; text-align: right;">₹${item.price}</td>
                            <td style="padding: 10px; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
                <tfoot>
                    <tr style="background: #f5f5f5; font-weight: bold;">
                        <td colspan="3" style="padding: 15px; text-align: right;">Total Amount:</td>
                        <td style="padding: 15px; text-align: right; font-size: 1.2rem;">₹${order.total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            
            <div style="text-align: center; margin-top: 30px; color: #666;">
                <p>Thank you for choosing KisanKart!</p>
                <p>Supporting local farmers, delivering fresh produce</p>
            </div>
        </div>
    `

  const printWindow = window.open("", "_blank")
  printWindow.document.write(`
        <html>
            <head>
                <title>Payment Slip - ${order.id}</title>
                <style>
                    body { margin: 0; padding: 20px; }
                    @media print {
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>${slipContent}</body>
        </html>
    `)
  printWindow.document.close()
  printWindow.print()
}

// Load order history
function loadOrderHistory() {
  const orders = JSON.parse(localStorage.getItem("orders"))
  const customerOrders = orders.filter((o) => o.customerId === currentUser.id)

  const tbody = document.getElementById("orders-tbody")
  tbody.innerHTML = ""

  customerOrders.forEach((order) => {
    const row = document.createElement("tr")
    row.innerHTML = `
    <td>${order.id}</td>
    <td>${new Date(order.date).toLocaleDateString()}</td>
    <td>${order.items.length} items</td>
    <td>₹${order.total.toFixed(2)}</td>
    <td><span class="status-badge status-${order.status}">${order.status}</span></td>
    <td>
        <button class="btn btn-outline" onclick="viewOrderDetails('${order.id}')">
            <i class="fas fa-eye"></i> View
        </button>
    </td>
`
    tbody.appendChild(row)
  })
}

// View order details
function viewOrderDetails(orderId) {
  const orders = JSON.parse(localStorage.getItem("orders"))
  const order = orders.find((o) => o.id === orderId)

  if (order) {
    generatePaymentSlip(order)
  }
}

// Load admin dashboard
function loadAdminDashboard() {
  loadAdminStats()
  loadPlatformOverview()
  loadUsersData()
  setTimeout(addAnimations, 100)
}

// Load admin orders data
function loadAdminOrdersData() {
  const orders = JSON.parse(localStorage.getItem("orders"))
  const tbody = document.getElementById("admin-orders-tbody")

  if (!tbody) return

  tbody.innerHTML = ""

  orders.forEach((order) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.customerName}</td>
      <td>${new Date(order.date).toLocaleDateString()}</td>
      <td>${order.items.length} items</td>
      <td>₹${order.total.toFixed(2)}</td>
      <td>${order.paymentMethod.toUpperCase()}</td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
          <option value="pending" ${order.status === "pending" ? "selected" : ""}>Pending</option>
          <option value="processing" ${order.status === "processing" ? "selected" : ""}>Processing</option>
          <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>Shipped</option>
          <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>Delivered</option>
          <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Cancelled</option>
        </select>
      </td>
      <td>
        <button class="btn btn-outline" onclick="viewOrderDetails('${order.id}')">
          <i class="fas fa-eye"></i> View
        </button>
      </td>
    `
    tbody.appendChild(row)
  })
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
  const orders = JSON.parse(localStorage.getItem("orders"))
  const orderIndex = orders.findIndex((o) => o.id === orderId)

  if (orderIndex !== -1) {
    orders[orderIndex].status = newStatus
    localStorage.setItem("orders", JSON.stringify(orders))

    showNotification(`Order ${orderId} status updated to ${newStatus}!`, "success")

    // Refresh admin dashboard if needed
    if (currentUser && currentUser.type === "admin") {
      loadAdminOrdersData()
      loadPlatformOverview()
    }
  }
}

// Load admin statistics
function loadAdminStats() {
  const users = JSON.parse(localStorage.getItem("users"))
  const sales = JSON.parse(localStorage.getItem("sales"))

  const farmers = users.filter((u) => u.type === "farmer")
  const customers = users.filter((u) => u.type === "customer")
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)

  document.getElementById("total-farmers").textContent = farmers.length
  document.getElementById("total-customers").textContent = customers.length
  document.getElementById("platform-revenue").textContent = `₹${totalRevenue.toFixed(2)}`
}

// Load platform overview
function loadPlatformOverview() {
  const sales = JSON.parse(localStorage.getItem("sales"))
  const products = JSON.parse(localStorage.getItem("products"))
  const orders = JSON.parse(localStorage.getItem("orders"))

  const today = new Date().toDateString()
  const todaySales = sales.filter((s) => new Date(s.date).toDateString() === today)
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0)

  const activeProducts = products.filter((p) => p.stock > 0)
  const pendingOrders = orders.filter((o) => o.status === "pending")

  document.getElementById("today-sales").textContent = `₹${todayRevenue.toFixed(2)}`
  document.getElementById("active-products").textContent = activeProducts.length
  document.getElementById("pending-orders").textContent = pendingOrders.length
}

// Load users data
function loadUsersData() {
  loadFarmersData()
  loadCustomersData()
  loadAdminOrdersData()
  loadContactMessages()
}

// Load farmers data
function loadFarmersData() {
  const users = JSON.parse(localStorage.getItem("users"))
  const products = JSON.parse(localStorage.getItem("products"))
  const sales = JSON.parse(localStorage.getItem("sales"))

  const farmers = users.filter((u) => u.type === "farmer")
  const tbody = document.getElementById("farmers-tbody")
  tbody.innerHTML = ""

  farmers.forEach((farmer) => {
    const farmerProducts = products.filter((p) => p.farmerId === farmer.id)
    const farmerSales = sales.filter((s) => s.farmerId === farmer.id)
    const revenue = farmerSales.reduce((sum, sale) => sum + sale.total, 0)

    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${farmer.name}</td>
            <td>${farmer.email}</td>
            <td>${farmer.phone}</td>
            <td>${farmerProducts.length}</td>
            <td>₹${revenue.toFixed(2)}</td>
            <td><span class="status-badge status-${farmer.status}">${farmer.status}</span></td>
            <td>
                <button class="btn btn-outline" onclick="toggleUserStatus('${farmer.id}', '${farmer.status}')">
                    ${farmer.status === "active" ? "Deactivate" : "Activate"}
                </button>
            </td>
        `
    tbody.appendChild(row)
  })
}

// Load customers data
function loadCustomersData() {
  const users = JSON.parse(localStorage.getItem("users"))
  const orders = JSON.parse(localStorage.getItem("orders"))

  const customers = users.filter((u) => u.type === "customer")
  const tbody = document.getElementById("customers-tbody")
  tbody.innerHTML = ""

  customers.forEach((customer) => {
    const customerOrders = orders.filter((o) => o.customerId === customer.id)
    const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0)

    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customerOrders.length}</td>
            <td>₹${totalSpent.toFixed(2)}</td>
            <td><span class="status-badge status-${customer.status}">${customer.status}</span></td>
            <td>
                <button class="btn btn-outline" onclick="toggleUserStatus('${customer.id}', '${customer.status}')">
                    ${customer.status === "active" ? "Deactivate" : "Activate"}
                </button>
            </td>
        `
    tbody.appendChild(row)
  })
}

// Toggle user status
function toggleUserStatus(userId, currentStatus) {
  const users = JSON.parse(localStorage.getItem("users"))
  const user = users.find((u) => u.id === userId)

  if (user) {
    user.status = currentStatus === "active" ? "inactive" : "active"
    localStorage.setItem("users", JSON.stringify(users))
    loadUsersData()
    showNotification(`User ${user.status === "active" ? "activated" : "deactivated"} successfully!`, "success")
  }
}

// Show tabs
function showTab(tabId) {
  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active")
  })

  // Remove active class from all tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  // Show selected tab
  document.getElementById(tabId).classList.add("active")

  // Add active class to clicked button
  event.target.classList.add("active")
}

// Generate admin report
function generateAdminReport() {
  const users = JSON.parse(localStorage.getItem("users"))
  const products = JSON.parse(localStorage.getItem("products"))
  const sales = JSON.parse(localStorage.getItem("sales"))
  const orders = JSON.parse(localStorage.getItem("orders"))

  const farmers = users.filter((u) => u.type === "farmer")
  const customers = users.filter((u) => u.type === "customer")
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)

  let reportContent = `
        <h2>KisanKart Platform Report</h2>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <hr>
        
        <h3>Platform Overview</h3>
        <p>Total Farmers: ${farmers.length}</p>
        <p>Total Customers: ${customers.length}</p>
        <p>Total Products: ${products.length}</p>
        <p>Total Orders: ${orders.length}</p>
        <p>Total Revenue: ₹${totalRevenue.toFixed(2)}</p>
        
        <hr>
        <h3>Top Performing Farmers</h3>
        <table border="1" style="width: 100%; border-collapse: collapse;">
            <tr>
                <th>Farmer Name</th>
                <th>Products</th>
                <th>Total Sales</th>
                <th>Revenue</th>
            </tr>
    `

  farmers.forEach((farmer) => {
    const farmerProducts = products.filter((p) => p.farmerId === farmer.id)
    const farmerSales = sales.filter((s) => s.farmerId === farmer.id)
    const revenue = farmerSales.reduce((sum, sale) => sum + sale.total, 0)

    reportContent += `
            <tr>
                <td>${farmer.name}</td>
                <td>${farmerProducts.length}</td>
                <td>${farmerSales.length}</td>
                <td>₹${revenue.toFixed(2)}</td>
            </tr>
        `
  })

  reportContent += `
        </table>
        
        <hr>
        <h3>Recent Orders</h3>
        <table border="1" style="width: 100%; border-collapse: collapse;">
            <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
            </tr>
    `

  orders.slice(-10).forEach((order) => {
    reportContent += `
            <tr>
                <td>${order.id}</td>
                <td>${order.customerName}</td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>₹${order.total.toFixed(2)}</td>
                <td>${order.status}</td>
            </tr>
        `
  })

  reportContent += "</table>"

  const printWindow = window.open("", "_blank")
  printWindow.document.write(`
        <html>
            <head>
                <title>Platform Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                    th { background-color: #f5f5f5; }
                </style>
            </head>
            <body>${reportContent}</body>
        </html>
    `)
  printWindow.document.close()
  printWindow.print()
}

// Logout
function logout() {
  currentUser = null
  cart = []
  localStorage.removeItem("currentUser")

  // Hide all dashboards
  document.getElementById("farmer-dashboard").style.display = "none"
  document.getElementById("customer-dashboard").style.display = "none"
  document.getElementById("admin-dashboard").style.display = "none"

  // Show public pages
  document.getElementById("home").style.display = "block"
  document.getElementById("about").style.display = "block"
  document.getElementById("contact").style.display = "block"

  updateNavigation()
  showNotification("Logged out successfully!", "success")
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Add CSS for notifications
const style = document.createElement("style")
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`
document.head.appendChild(style)

// Initialize sample data for demo
function initializeSampleData() {
  const users = JSON.parse(localStorage.getItem("users"))

  if (users.length === 0) {
    const sampleUsers = [
      {
        id: "1",
        name: "Ramesh Kumar",
        email: "ramesh@farmer.com",
        phone: "9876543210",
        password: "password123",
        type: "farmer",
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Priya Sharma",
        email: "priya@customer.com",
        phone: "9876543211",
        password: "password123",
        type: "customer",
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ]

    localStorage.setItem("users", JSON.stringify(sampleUsers))

    const sampleProducts = [
      {
        id: "1",
        name: "Fresh Tomatoes",
        category: "fruit",
        price: 40,
        stock: 50,
        description: "Fresh red tomatoes directly from farm",
        image: "/placeholder.svg?height=200&width=280",
        farmerId: "1",
        farmerName: "Ramesh Kumar",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Organic Spinach",
        category: "leafy",
        price: 30,
        stock: 25,
        description: "Organic spinach leaves, rich in iron",
        image: "/placeholder.svg?height=200&width=280",
        farmerId: "1",
        farmerName: "Ramesh Kumar",
        createdAt: new Date().toISOString(),
      },
    ]

    localStorage.setItem("products", JSON.stringify(sampleProducts))
  }
}

// Initialize sample data on first load
initializeSampleData()

// Edit product function
function editProduct(productId) {
  const products = JSON.parse(localStorage.getItem("products"))
  const product = products.find((p) => p.id === productId)

  if (!product) return

  // Populate edit form
  document.getElementById("edit-product-id").value = product.id
  document.getElementById("edit-product-name").value = product.name
  document.getElementById("edit-product-category").value = product.category
  document.getElementById("edit-product-price").value = product.price
  document.getElementById("edit-product-stock").value = product.stock
  document.getElementById("edit-product-description").value = product.description

  // Show current image
  const editPreview = document.getElementById("edit-image-preview")
  const editPreviewImg = document.getElementById("edit-preview-img")
  editPreviewImg.src = product.image
  editPreview.style.display = "block"

  // Show modal
  document.getElementById("edit-product-modal").style.display = "block"
}

// Handle edit product form submission
function handleEditProduct(e) {
  e.preventDefault()

  const productId = document.getElementById("edit-product-id").value
  const name = document.getElementById("edit-product-name").value
  const category = document.getElementById("edit-product-category").value
  const price = Number.parseFloat(document.getElementById("edit-product-price").value)
  const stock = Number.parseInt(document.getElementById("edit-product-stock").value)
  const description = document.getElementById("edit-product-description").value
  const imageFile = document.getElementById("edit-product-image").files[0]

  const products = JSON.parse(localStorage.getItem("products"))
  const productIndex = products.findIndex((p) => p.id === productId)

  if (productIndex === -1) return

  const product = products[productIndex]

  if (imageFile) {
    const reader = new FileReader()
    reader.onload = (e) => {
      updateProduct(e.target.result)
    }
    reader.readAsDataURL(imageFile)
  } else {
    updateProduct(product.image)
  }

  function updateProduct(imageDataUrl) {
    products[productIndex] = {
      ...product,
      name,
      category,
      price,
      stock,
      description,
      image: imageDataUrl,
    }

    localStorage.setItem("products", JSON.stringify(products))

    closeModal("edit-product-modal")
    loadFarmerProducts()
    loadFarmerStats()
    showNotification("Product updated successfully!", "success")
  }
}

// Add animations to dashboard elements
function addAnimations() {
  // Animate stat cards
  document.querySelectorAll(".stat-card").forEach((card, index) => {
    setTimeout(() => {
      card.classList.add("animate-fade-in")
    }, index * 100)
  })

  // Animate product cards
  document.querySelectorAll(".product-card").forEach((card, index) => {
    setTimeout(() => {
      card.classList.add("animate-slide-in")
    }, index * 150)
  })

  // Animate hero elements
  const heroTitle = document.querySelector(".hero-title")
  const heroSubtitle = document.querySelector(".hero-subtitle")
  const heroButtons = document.querySelector(".hero-buttons")
  const heroImage = document.querySelector(".hero-image")

  if (heroTitle) {
    setTimeout(() => heroTitle.classList.add("animate-fade-in"), 200)
    setTimeout(() => heroSubtitle.classList.add("animate-fade-in"), 400)
    setTimeout(() => heroButtons.classList.add("animate-fade-in"), 600)
    setTimeout(() => heroImage.classList.add("animate-float"), 800)
  }
}

// Handle contact form submission
function handleContactForm(e) {
  e.preventDefault()

  const name = document.getElementById("contact-name").value
  const email = document.getElementById("contact-email").value
  const phone = document.getElementById("contact-phone").value
  const subject = document.getElementById("contact-subject").value
  const message = document.getElementById("contact-message").value

  const contactMessage = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    subject,
    message,
    status: "new",
    date: new Date().toISOString(),
  }

  // Get existing contact messages
  const contacts = JSON.parse(localStorage.getItem("contacts") || "[]")
  contacts.push(contactMessage)
  localStorage.setItem("contacts", JSON.stringify(contacts))

  // Reset form
  document.getElementById("contact-form").reset()

  showNotification("Thank you for your message! We'll get back to you soon.", "success")
}

// Load contact messages for admin
function loadContactMessages() {
  const contacts = JSON.parse(localStorage.getItem("contacts") || "[]")
  const tbody = document.getElementById("contacts-tbody")

  if (!tbody) return

  tbody.innerHTML = ""

  // Sort contacts by date (newest first)
  contacts.sort((a, b) => new Date(b.date) - new Date(a.date))

  contacts.forEach((contact) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${new Date(contact.date).toLocaleDateString()}</td>
      <td>${contact.name}</td>
      <td>${contact.email}</td>
      <td>${contact.phone}</td>
      <td>${contact.subject}</td>
      <td>
        <span class="status-badge status-${contact.status}">${contact.status}</span>
      </td>
      <td>
        <button class="btn btn-outline" onclick="viewContactMessage('${contact.id}')">
          <i class="fas fa-eye"></i> View
        </button>
        <button class="btn btn-outline" onclick="updateContactStatus('${contact.id}', 'read')" ${contact.status === "read" ? "disabled" : ""}>
          <i class="fas fa-check"></i> Mark Read
        </button>
        <button class="btn btn-secondary" onclick="deleteContactMessage('${contact.id}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    `
    tbody.appendChild(row)
  })
}

// Update contact message status
function updateContactStatus(contactId, newStatus) {
  const contacts = JSON.parse(localStorage.getItem("contacts") || "[]")
  const contactIndex = contacts.findIndex((c) => c.id === contactId)

  if (contactIndex !== -1) {
    contacts[contactIndex].status = newStatus
    localStorage.setItem("contacts", JSON.stringify(contacts))
    showNotification(`Contact message status updated to ${newStatus}!`, "success")
  }
}

// View contact message details
function viewContactMessage(contactId) {
  const contacts = JSON.parse(localStorage.getItem("contacts") || "[]")
  const contact = contacts.find((c) => c.id === contactId)

  if (contact) {
    const messageContent = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4CAF50; margin-bottom: 10px;">KisanKart</h1>
          <h2>Contact Message Details</h2>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
          <h3>Contact Information</h3>
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <p><strong>Phone:</strong> ${contact.phone}</p>
          <p><strong>Subject:</strong> ${contact.subject}</p>
          <p><strong>Date:</strong> ${new Date(contact.date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${contact.status.toUpperCase()}</p>
        </div>
        
        <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3>Message</h3>
          <p style="line-height: 1.6; white-space: pre-wrap;">${contact.message}</p>
        </div>
      </div>
    `

    const printWindow = window.open("", "_blank")
    printWindow.document.write(`
      <html>
        <head>
          <title>Contact Message - ${contact.name}</title>
          <style>
            body { margin: 0; padding: 20px; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>${messageContent}</body>
      </html>
    `)
    printWindow.document.close()
  }
}

// Delete contact message
function deleteContactMessage(contactId) {
  if (confirm("Are you sure you want to delete this contact message?")) {
    const contacts = JSON.parse(localStorage.getItem("contacts") || "[]")
    const updatedContacts = contacts.filter((c) => c.id !== contactId)
    localStorage.setItem("contacts", JSON.stringify(updatedContacts))

    loadContactMessages()
    showNotification("Contact message deleted successfully!", "success")
  }
}

// Initialize contact storage
function initializeContactStorage() {
  if (!localStorage.getItem("contacts")) {
    localStorage.setItem("contacts", JSON.stringify([]))
  }
}
