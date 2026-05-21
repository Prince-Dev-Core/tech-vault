// TechVault E-Commerce Platform - Main Application

/**
 * Main Application Class
 */
class TechVaultApp {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.isLoading = false;

        // Initialize app when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('🚀 TechVault App initializing...');
        
        try {
            // Check API health
            await this.checkAPIHealth();
            
            // Bind events
            this.bindEvents();
            
            // Load products
            await this.loadProducts();
            
            // Initialize UI components
            this.initializeUI();
            
            console.log('✅ TechVault App initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Check API health
     */
    async checkAPIHealth() {
        try {
            const isHealthy = await API.health.check();
            if (!isHealthy) {
                throw new Error('API health check failed');
            }
            console.log('✅ API is healthy');
        } catch (error) {
            console.warn('⚠️ API health check failed, continuing anyway:', error);
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Category filter buttons
        this.bindCategoryFilters();
        
        // Search functionality
        this.bindSearch();
        
        // Scroll effects
        this.bindScrollEffects();
        
        // Checkout modal
        this.bindCheckoutModal();
        
        // Product modal
        this.bindProductModal();
        
        console.log('📎 Event listeners bound');
    }

    /**
     * Bind category filter events
     */
    bindCategoryFilters() {
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            });
        });
    }

    /**
     * Bind search events
     */
    bindSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const debouncedSearch = debounce((query) => {
                this.searchProducts(query);
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value.trim());
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchProducts(e.target.value.trim());
                }
            });
        }
    }

    /**
     * Bind scroll effects
     */
    bindScrollEffects() {
        const header = document.getElementById('header');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header?.classList.add('scrolled');
            } else {
                header?.classList.remove('scrolled');
            }
        });

        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    /**
     * Bind checkout modal events
     */
    bindCheckoutModal() {
        // Listen for checkout event from cart
        document.addEventListener('openCheckout', (e) => {
            this.openCheckoutModal(e.detail);
        });
    }

    /**
     * Bind product modal events
     */
    bindProductModal() {
        // Will be implemented when product cards are clicked
    }

    /**
     * Initialize UI components
     */
    initializeUI() {
        // Add fade-in animation to elements
        const elements = document.querySelectorAll('.hero-content, .stats-bar, .main-content');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('fade-in');
            }, index * 200);
        });
    }

    /**
     * Load products from API
     */
    async loadProducts() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const productsGrid = document.getElementById('productsGrid');
        
        try {
            // Show loading state
            if (productsGrid) {
                LoadingManager.show(productsGrid, 'Loading products...');
            }

            // Fetch products from API
            this.products = await API.products.getAll();
            this.filteredProducts = [...this.products];
            
            console.log(`📦 Loaded ${this.products.length} products`);
            
            // Render products
            this.renderProducts();
            
        } catch (error) {
            console.error('Failed to load products:', error);
            this.showError('Failed to load products. Please try again.');
            
            // Show empty state
            if (productsGrid) {
                productsGrid.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Failed to load products</h3>
                        <p>Please check your connection and try again.</p>
                        <button class="btn btn-primary" onclick="app.loadProducts()">
                            <i class="fas fa-refresh"></i> Retry
                        </button>
                    </div>
                `;
            }
        } finally {
            this.isLoading = false;
            if (productsGrid) {
                LoadingManager.hide(productsGrid);
            }
        }
    }

    /**
     * Filter products by category
     * @param {string} category - Category to filter by
     */
    async filterByCategory(category) {
        if (this.isLoading) return;
        
        this.currentCategory = category;
        
        // Update active category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        try {
            this.isLoading = true;
            const productsGrid = document.getElementById('productsGrid');
            
            if (productsGrid) {
                LoadingManager.show(productsGrid, 'Filtering products...');
            }

            // Fetch filtered products from API
            const filters = category === 'all' ? {} : { category };
            this.filteredProducts = await API.products.getAll(filters);
            
            console.log(`🔍 Filtered to ${this.filteredProducts.length} products (category: ${category})`);
            
            // Render filtered products
            this.renderProducts();
            
        } catch (error) {
            console.error('Failed to filter products:', error);
            this.showError('Failed to filter products. Please try again.');
        } finally {
            this.isLoading = false;
            const productsGrid = document.getElementById('productsGrid');
            if (productsGrid) {
                LoadingManager.hide(productsGrid);
            }
        }
    }

    /**
     * Search products
     * @param {string} query - Search query
     */
    async searchProducts(query) {
        if (this.isLoading) return;
        
        this.searchQuery = query;
        
        try {
            this.isLoading = true;
            const productsGrid = document.getElementById('productsGrid');
            
            if (productsGrid) {
                LoadingManager.show(productsGrid, 'Searching products...');
            }

            if (query) {
                // Search via API
                const filters = this.currentCategory === 'all' ? {} : { category: this.currentCategory };
                this.filteredProducts = await API.products.search(query, filters);
                console.log(`🔍 Search "${query}" returned ${this.filteredProducts.length} products`);
            } else {
                // Reset to category filter
                await this.filterByCategory(this.currentCategory);
                return;
            }
            
            // Render search results
            this.renderProducts();
            
        } catch (error) {
            console.error('Failed to search products:', error);
            this.showError('Failed to search products. Please try again.');
        } finally {
            this.isLoading = false;
            const productsGrid = document.getElementById('productsGrid');
            if (productsGrid) {
                LoadingManager.hide(productsGrid);
            }
        }
    }

    /**
     * Render products grid
     */
    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        if (this.filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = this.filteredProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                ${this.getProductBadge(product)}
                <img src="${product.image_url || 'https://via.placeholder.com/300x250?text=No+Image'}" 
                     alt="${sanitizeHTML(product.name)}" 
                     class="product-image"
                     loading="lazy">
                <div class="product-info">
                    <div class="product-category">${sanitizeHTML(product.category)}</div>
                    <h3 class="product-name">${sanitizeHTML(product.name)}</h3>
                    <p class="product-description">${sanitizeHTML(product.description || '')}</p>
                    <div class="product-footer">
                        <div class="product-price">
                            <span class="price-current">${formatPrice(product.price)}</span>
                        </div>
                        <button class="add-to-cart" onclick="app.addToCart(${product.id})" title="Add to Cart">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click events for product cards
        this.bindProductCardEvents();
    }

    /**
     * Get product badge HTML
     * @param {Object} product - Product object
     * @returns {string} Badge HTML
     */
    getProductBadge(product) {
        // Add logic for different badges based on product properties
        if (product.stock < 10) {
            return '<div class="product-badge badge-hot">Low Stock</div>';
        }
        if (product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
            return '<div class="product-badge badge-new">New</div>';
        }
        return '';
    }

    /**
     * Bind product card events
     */
    bindProductCardEvents() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't open modal if clicking add to cart button
                if (e.target.closest('.add-to-cart')) return;
                
                const productId = parseInt(card.dataset.productId);
                this.openProductModal(productId);
            });
        });
    }

    /**
     * Add product to cart
     * @param {number} productId - Product ID to add
     */
    addToCart(productId) {
        const product = this.filteredProducts.find(p => p.id === productId);
        if (product && window.cart) {
            window.cart.addItem(product, 1);
            
            // Add visual feedback
            const button = document.querySelector(`[data-product-id="${productId}"] .add-to-cart`);
            if (button) {
                button.classList.add('added');
                button.innerHTML = '<i class="fas fa-check"></i>';
                
                setTimeout(() => {
                    button.classList.remove('added');
                    button.innerHTML = '<i class="fas fa-plus"></i>';
                }, 1000);
            }
        }
    }

    /**
     * Open product modal
     * @param {number} productId - Product ID
     */
    async openProductModal(productId) {
        try {
            const product = await API.products.getById(productId);
            if (!product) {
                showToast('Product not found', 'error');
                return;
            }

            this.renderProductModal(product);
        } catch (error) {
            console.error('Failed to load product details:', error);
            showToast('Failed to load product details', 'error');
        }
    }

    /**
     * Render product modal
     * @param {Object} product - Product object
     */
    renderProductModal(product) {
        // Remove existing modal
        const existingModal = document.querySelector('.product-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="modal-overlay product-modal active">
                <div class="modal-content">
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="modal-body">
                        <img src="${product.image_url || 'https://via.placeholder.com/400x400?text=No+Image'}" 
                             alt="${sanitizeHTML(product.name)}" 
                             class="modal-image">
                        <div class="modal-info">
                            <div class="modal-category">${sanitizeHTML(product.category)}</div>
                            <h2 class="modal-title">${sanitizeHTML(product.name)}</h2>
                            <div class="modal-rating">
                                <div class="stars">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                </div>
                                <span>(4.9)</span>
                            </div>
                            <div class="modal-price">${formatPrice(product.price)}</div>
                            <p class="modal-description">${sanitizeHTML(product.description || 'No description available.')}</p>
                            <div class="modal-features">
                                <h4>Features:</h4>
                                <ul>
                                    <li><i class="fas fa-check"></i> Premium Quality</li>
                                    <li><i class="fas fa-check"></i> Fast Shipping</li>
                                    <li><i class="fas fa-check"></i> 1 Year Warranty</li>
                                    <li><i class="fas fa-check"></i> 30-Day Returns</li>
                                </ul>
                            </div>
                            <button class="modal-add-cart" onclick="app.addToCart(${product.id}); app.closeProductModal();">
                                <i class="fas fa-shopping-cart"></i>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Bind close events
        const modal = document.querySelector('.product-modal');
        const closeBtn = modal.querySelector('.modal-close');
        
        closeBtn.addEventListener('click', () => this.closeProductModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeProductModal();
            }
        });

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close product modal
     */
    closeProductModal() {
        const modal = document.querySelector('.product-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    }

    /**
     * Open checkout modal
     * @param {Object} checkoutData - Checkout data from cart
     */
    openCheckoutModal(checkoutData) {
        // Remove existing modal
        const existingModal = document.querySelector('.checkout-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="modal-overlay checkout-modal active">
                <div class="modal-content">
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="modal-body">
                        <form class="checkout-form" id="checkoutForm">
                            <h2>Checkout</h2>
                            
                            <div class="form-group">
                                <label for="customerName">Full Name *</label>
                                <input type="text" id="customerName" name="customerName" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="customerEmail">Email Address *</label>
                                <input type="email" id="customerEmail" name="customerEmail" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="customerPhone">Phone Number</label>
                                <input type="tel" id="customerPhone" name="customerPhone">
                            </div>
                            
                            <div class="form-group">
                                <label for="shippingAddress">Shipping Address *</label>
                                <input type="text" id="shippingAddress" name="shippingAddress" required 
                                       placeholder="Street, City, State, ZIP Code">
                            </div>
                            
                            <div class="checkout-summary">
                                <div class="checkout-summary-row">
                                    <span>Subtotal:</span>
                                    <span>${formatPrice(checkoutData.total)}</span>
                                </div>
                                <div class="checkout-summary-row">
                                    <span>Shipping:</span>
                                    <span>Free</span>
                                </div>
                                <div class="checkout-summary-row total">
                                    <span>Total:</span>
                                    <span>${formatPrice(checkoutData.total)}</span>
                                </div>
                            </div>
                            
                            <button type="submit" class="place-order-btn">
                                <i class="fas fa-credit-card"></i>
                                Place Order
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Bind events
        this.bindCheckoutForm();

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Bind checkout form events
     */
    bindCheckoutForm() {
        const modal = document.querySelector('.checkout-modal');
        const closeBtn = modal.querySelector('.modal-close');
        const form = document.getElementById('checkoutForm');
        
        closeBtn.addEventListener('click', () => this.closeCheckoutModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeCheckoutModal();
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processOrder(new FormData(form));
        });
    }

    /**
     * Close checkout modal
     */
    closeCheckoutModal() {
        const modal = document.querySelector('.checkout-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    }

    /**
     * Process order
     * @param {FormData} formData - Form data
     */
    async processOrder(formData) {
        if (!window.cart || window.cart.isEmpty()) {
            showToast('Your cart is empty!', 'error');
            return;
        }

        const submitBtn = document.querySelector('.place-order-btn');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="spinner"></div> Processing...';

            // Prepare order data
            const orderData = {
                customer_name: formData.get('customerName'),
                customer_email: formData.get('customerEmail'),
                customer_phone: formData.get('customerPhone') || '',
                shipping_address: formData.get('shippingAddress'),
                items: window.cart.getCheckoutItems()
            };

            // Validate required fields
            if (!orderData.customer_name || !orderData.customer_email || !orderData.shipping_address) {
                throw new Error('Please fill in all required fields');
            }

            if (!isValidEmail(orderData.customer_email)) {
                throw new Error('Please enter a valid email address');
            }

            console.log('Processing order:', orderData);

            // Create order via API
            const orderResponse = await API.orders.create(orderData);
            
            if (!orderResponse) {
                throw new Error('Failed to create order');
            }

            console.log('Order created successfully:', orderResponse);

            // Clear cart
            window.cart.clear();

            // Close checkout modal
            this.closeCheckoutModal();

            // Show success modal
            this.showOrderSuccess(orderResponse);

            // Redirect to Stripe if payment URL is provided
            if (orderResponse.stripe_session_url) {
                setTimeout(() => {
                    window.location.href = orderResponse.stripe_session_url;
                }, 2000);
            }

        } catch (error) {
            console.error('Order processing failed:', error);
            showToast(error.message || 'Failed to process order. Please try again.', 'error');
        } finally {
            // Restore button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    /**
     * Show order success modal
     * @param {Object} orderData - Order response data
     */
    showOrderSuccess(orderData) {
        const modalHTML = `
            <div class="modal-overlay success-modal active">
                <div class="modal-content">
                    <div class="success-animation">
                        <div class="success-circle">
                            <i class="fas fa-check"></i>
                        </div>
                        <h2>Order Placed Successfully!</h2>
                        <p>Your order <strong>#${orderData.order_number}</strong> has been confirmed.</p>
                        <p>Total: <strong>${formatPrice(orderData.total)}</strong></p>
                        <p>You will receive a confirmation email shortly.</p>
                        <button class="btn btn-primary" onclick="app.closeSuccessModal()">
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Close success modal
     */
    closeSuccessModal() {
        const modal = document.querySelector('.success-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        showToast(message, 'error');
    }
}

// Initialize app
const app = new TechVaultApp();

// Export for global access
window.TechVaultApp = TechVaultApp;
window.app = app;

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TechVaultApp;
}