// TechVault E-Commerce Platform - Shopping Cart Management

/**
 * Shopping Cart Manager
 */
class ShoppingCart {
    constructor() {
        this.items = [];
        this.isOpen = false;
        this.storageKey = 'techvault_cart';
        
        // Initialize cart from localStorage
        this.loadFromStorage();
        
        // Bind events
        this.bindEvents();
        
        // Update UI
        this.updateCartCount();
    }

    /**
     * Load cart from localStorage
     */
    loadFromStorage() {
        const savedCart = Storage.get(this.storageKey, []);
        this.items = Array.isArray(savedCart) ? savedCart : [];
        console.log('Cart loaded from storage:', this.items);
    }

    /**
     * Save cart to localStorage
     */
    saveToStorage() {
        Storage.set(this.storageKey, this.items);
        console.log('Cart saved to storage:', this.items);
    }

    /**
     * Bind cart events
     */
    bindEvents() {
        // Cart button click
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.toggle());
        }

        // Cart close button
        document.addEventListener('click', (e) => {
            if (e.target.matches('.cart-close') || e.target.matches('.cart-overlay')) {
                this.close();
            }
        });

        // Escape key to close cart
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    /**
     * Add item to cart
     * @param {Object} product - Product to add
     * @param {number} quantity - Quantity to add
     */
    addItem(product, quantity = 1) {
        if (!product || !product.id) {
            console.error('Invalid product data');
            return false;
        }

        // Check if item already exists
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                category: product.category,
                quantity: quantity
            });
        }

        this.saveToStorage();
        this.updateCartCount();
        this.renderCartItems();
        
        // Show success toast
        showToast(`${product.name} added to cart!`, 'success');
        
        console.log('Item added to cart:', product);
        return true;
    }

    /**
     * Remove item from cart
     * @param {number} productId - Product ID to remove
     */
    removeItem(productId) {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.id !== productId);
        
        if (this.items.length < initialLength) {
            this.saveToStorage();
            this.updateCartCount();
            this.renderCartItems();
            showToast('Item removed from cart', 'info');
            console.log('Item removed from cart:', productId);
            return true;
        }
        
        return false;
    }

    /**
     * Update item quantity
     * @param {number} productId - Product ID
     * @param {number} quantity - New quantity
     */
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveToStorage();
                this.updateCartCount();
                this.renderCartItems();
                console.log('Item quantity updated:', productId, quantity);
            }
            return true;
        }
        
        return false;
    }

    /**
     * Clear all items from cart
     */
    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateCartCount();
        this.renderCartItems();
        console.log('Cart cleared');
    }

    /**
     * Get cart total
     * @returns {number} Total price
     */
    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    /**
     * Get cart item count
     * @returns {number} Total item count
     */
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    /**
     * Check if cart is empty
     * @returns {boolean} True if cart is empty
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Get cart items for checkout
     * @returns {Array} Cart items formatted for API
     */
    getCheckoutItems() {
        return this.items.map(item => ({
            product_id: item.id,
            quantity: item.quantity
        }));
    }

    /**
     * Update cart count in UI
     */
    updateCartCount() {
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            const count = this.getItemCount();
            cartCountElement.textContent = count;
            cartCountElement.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    /**
     * Toggle cart sidebar
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Open cart sidebar
     */
    open() {
        this.isOpen = true;
        this.renderCartSidebar();
        this.renderCartItems();
        
        // Add classes to show cart
        const overlay = document.querySelector('.cart-overlay');
        const sidebar = document.querySelector('.cart-sidebar');
        
        if (overlay) overlay.classList.add('active');
        if (sidebar) sidebar.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        console.log('Cart opened');
    }

    /**
     * Close cart sidebar
     */
    close() {
        this.isOpen = false;
        
        // Remove classes to hide cart
        const overlay = document.querySelector('.cart-overlay');
        const sidebar = document.querySelector('.cart-sidebar');
        
        if (overlay) overlay.classList.remove('active');
        if (sidebar) sidebar.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        console.log('Cart closed');
    }

    /**
     * Render cart sidebar HTML
     */
    renderCartSidebar() {
        // Check if cart sidebar already exists
        if (document.querySelector('.cart-overlay')) {
            return;
        }

        const cartHTML = `
            <div class="cart-overlay"></div>
            <div class="cart-sidebar">
                <div class="cart-header">
                    <h2>Shopping Cart</h2>
                    <button class="cart-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="cart-content">
                    <div class="cart-items" id="cartItems"></div>
                </div>
                <div class="cart-footer">
                    <div class="cart-subtotal">
                        <span>Subtotal:</span>
                        <span id="cartSubtotal">$0.00</span>
                    </div>
                    <div class="cart-total">
                        <span>Total:</span>
                        <span id="cartTotal">$0.00</span>
                    </div>
                    <button class="checkout-btn" id="checkoutBtn">
                        <i class="fas fa-credit-card"></i>
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', cartHTML);

        // Bind checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
        }
    }

    /**
     * Render cart items
     */
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;

        if (this.isEmpty()) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started!</p>
                </div>
            `;
        } else {
            cartItemsContainer.innerHTML = this.items.map(item => `
                <div class="cart-item" data-product-id="${item.id}">
                    <img src="${item.image_url || 'https://via.placeholder.com/80x80?text=No+Image'}" 
                         alt="${sanitizeHTML(item.name)}" 
                         class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${sanitizeHTML(item.name)}</div>
                        <div class="cart-item-price">${formatPrice(item.price)}</div>
                        <div class="cart-item-actions">
                            <button class="qty-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="cart-item-qty">${item.quantity}</span>
                            <button class="qty-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="remove-item" onclick="cart.removeItem(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Update totals
        this.updateCartTotals();
    }

    /**
     * Update cart totals in UI
     */
    updateCartTotals() {
        const subtotal = this.getTotal();
        const total = subtotal; // Add tax/shipping calculation here if needed

        const subtotalElement = document.getElementById('cartSubtotal');
        const totalElement = document.getElementById('cartTotal');

        if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
        if (totalElement) totalElement.textContent = formatPrice(total);

        // Enable/disable checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.isEmpty();
            checkoutBtn.style.opacity = this.isEmpty() ? '0.5' : '1';
        }
    }

    /**
     * Proceed to checkout
     */
    proceedToCheckout() {
        if (this.isEmpty()) {
            showToast('Your cart is empty!', 'error');
            return;
        }

        console.log('Proceeding to checkout with items:', this.items);
        
        // Close cart and open checkout modal
        this.close();
        
        // Trigger checkout modal (will be handled by app.js)
        const checkoutEvent = new CustomEvent('openCheckout', {
            detail: { items: this.items, total: this.getTotal() }
        });
        document.dispatchEvent(checkoutEvent);
    }
}

// Initialize cart when DOM is loaded
let cart;

document.addEventListener('DOMContentLoaded', () => {
    cart = new ShoppingCart();
    console.log('Shopping cart initialized');
});

// Export for global access
window.ShoppingCart = ShoppingCart;

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShoppingCart;
}