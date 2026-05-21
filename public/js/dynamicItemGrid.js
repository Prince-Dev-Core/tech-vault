/**
 * DynamicItemGrid Class
 * Manages responsive grid layout for products and tools
 * 
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.6
 */
class DynamicItemGrid {
    constructor(options = {}) {
        // Configuration
        this.gridSelector = options.gridSelector || '#itemsGrid';
        this.itemsPerPage = options.itemsPerPage || 12;
        this.lazyLoadImages = options.lazyLoadImages !== false;
        this.contentLoader = options.contentLoader || null;
        this.navigationController = options.navigationController || null;
        this.cart = options.cart || null;
        
        // DOM elements
        this.gridContainer = null;
        
        // State
        this.items = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.isInitialized = false;
        this.isLoading = false;
        this.currentFilters = {};
        
        // Event listeners
        this.eventListeners = new Map();
        
        // Intersection Observer for lazy loading
        this.imageObserver = null;
        
        // Initialize component
        this.initialize();
    }

    /**
     * Initialize the DynamicItemGrid component
     * Sets up DOM elements and event listeners
     * Requirement 8.1, 8.2
     */
    initialize() {
        try {
            // Get DOM element
            this.gridContainer = document.querySelector(this.gridSelector);

            // Validate required element exists
            if (!this.gridContainer) {
                throw new Error(`Grid container not found: ${this.gridSelector}`);
            }

            // Setup Intersection Observer for lazy loading
            if (this.lazyLoadImages) {
                this.setupImageObserver();
            }

            this.isInitialized = true;
            console.log('✅ DynamicItemGrid initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize DynamicItemGrid:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Setup Intersection Observer for lazy loading images
     * Requirement 8.5 - Lazy loading for performance
     */
    setupImageObserver() {
        try {
            const options = {
                root: null,
                rootMargin: '50px',
                threshold: 0.01
            };

            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.src;
                        
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                            this.imageObserver.unobserve(img);
                        }
                    }
                });
            }, options);

        } catch (error) {
            console.error('❌ Failed to setup image observer:', error);
        }
    }

    /**
     * Render grid with items
     * Requirement 8.1, 8.2, 8.3, 8.4
     * 
     * @param {Array} items - Items to display
     * @param {Object} options - Rendering options
     */
    renderGrid(items = [], options = {}) {
        try {
            if (!this.gridContainer) {
                throw new Error('Grid container not found');
            }

            // Store items
            this.items = items;
            
            // Calculate pagination
            this.totalPages = Math.ceil(items.length / this.itemsPerPage);
            this.currentPage = options.page || 1;

            // Validate page number
            if (this.currentPage < 1) this.currentPage = 1;
            if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;

            // Get items for current page
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            const pageItems = items.slice(startIndex, endIndex);

            // Clear grid and remove existing pagination
            this.gridContainer.innerHTML = '';
            const existingPagination = this.gridContainer.parentElement?.querySelector('.pagination-container');
            if (existingPagination) {
                existingPagination.remove();
            }

            // Add items-grid class for styling
            this.gridContainer.classList.add('items-grid');

            // Handle empty state
            if (pageItems.length === 0) {
                this.renderEmptyState();
                return;
            }

            // Render item cards
            pageItems.forEach(item => {
                const card = this.createItemCard(item);
                this.gridContainer.appendChild(card);
            });

            // Render pagination if needed
            if (this.totalPages > 1) {
                this.renderPagination();
            }

            console.log(`✅ Grid rendered with ${pageItems.length} items (page ${this.currentPage}/${this.totalPages})`);

        } catch (error) {
            console.error('❌ Failed to render grid:', error);
            this.renderErrorState(error.message);
        }
    }

    /**
     * Create item card element
     * Requirement 8.3, 8.4
     * 
     * @param {Object} item - Item data
     * @returns {HTMLElement} Item card element
     */
    createItemCard(item) {
        try {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.setAttribute('data-item-id', item.id);

            // Validate required fields
            const name = this.escapeHtml(item.name || 'Unnamed Item');
            const description = this.escapeHtml(item.description || 'No description available');
            const price = this.formatPrice(item.price || 0);
            const imageUrl = item.image_url || item.image || 'https://via.placeholder.com/300x200?text=No+Image';
            const category = this.escapeHtml(item.category || 'General');

            // Build card HTML
            card.innerHTML = `
                <div class="item-image-container">
                    <img 
                        class="item-image" 
                        ${this.lazyLoadImages ? `data-src="${imageUrl}"` : `src="${imageUrl}"`}
                        alt="${name}"
                        loading="lazy"
                    >
                    <div class="item-overlay">
                        <button class="view-details-btn" data-item-id="${item.id}" aria-label="View details for ${name}">
                            <i class="fas fa-eye"></i>
                            View Details
                        </button>
                    </div>
                </div>

                <div class="item-content">
                    <div class="item-category">${category}</div>
                    <h3 class="item-name">${name}</h3>
                    <p class="item-description">${description}</p>
                    
                    <div class="item-footer">
                        <div class="item-price">${price}</div>
                        <button class="add-to-cart-btn" data-item-id="${item.id}" aria-label="Add ${name} to cart">
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;

            // Setup lazy loading for image
            if (this.lazyLoadImages) {
                const img = card.querySelector('.item-image');
                if (img && this.imageObserver) {
                    this.imageObserver.observe(img);
                }
            }

            // Attach event listeners
            this.attachCardEventListeners(card, item);

            return card;

        } catch (error) {
            console.error('❌ Failed to create item card:', error);
            return document.createElement('div');
        }
    }

    /**
     * Attach event listeners to item card
     * Requirement 8.4 - Action buttons
     * 
     * @param {HTMLElement} card - Item card element
     * @param {Object} item - Item data
     */
    attachCardEventListeners(card, item) {
        try {
            // View details button
            const viewDetailsBtn = card.querySelector('.view-details-btn');
            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleViewDetails(item);
                });
            }

            // Add to cart button
            const addToCartBtn = card.querySelector('.add-to-cart-btn');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleAddToCart(item, addToCartBtn);
                });
            }

            // Card click for view details
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on buttons
                if (!e.target.closest('button')) {
                    this.handleViewDetails(item);
                }
            });

        } catch (error) {
            console.error('❌ Failed to attach card event listeners:', error);
        }
    }

    /**
     * Handle view details action
     * Requirement 8.4
     * 
     * @param {Object} item - Item data
     */
    handleViewDetails(item) {
        try {
            console.log('View details for item:', item);

            // Emit custom event
            this.emitEvent('itemDetailsRequested', { item });

            // Navigate to product details page if navigation controller available
            if (this.navigationController) {
                this.navigationController.navigateToPage('product-details', { itemId: item.id });
            } else if (window.navigationController) {
                window.navigationController.navigateToPage('product-details', { itemId: item.id });
            }

        } catch (error) {
            console.error('❌ Failed to handle view details:', error);
        }
    }

    /**
     * Handle add to cart action
     * Requirement 8.4
     * 
     * @param {Object} item - Item data
     * @param {HTMLElement} button - Button element
     */
    handleAddToCart(item, button) {
        try {
            // Show loading state
            const originalContent = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

            // Add to cart
            if (this.cart) {
                this.cart.addItem(item, 1);
            } else if (window.cart) {
                window.cart.addItem(item, 1);
            } else {
                throw new Error('Shopping cart not available');
            }

            // Show success state
            button.innerHTML = '<i class="fas fa-check"></i> Added!';
            button.classList.add('success');

            // Reset button after delay
            setTimeout(() => {
                button.disabled = false;
                button.innerHTML = originalContent;
                button.classList.remove('success');
            }, 2000);

            // Emit custom event
            this.emitEvent('itemAddedToCart', { item });

        } catch (error) {
            console.error('❌ Failed to add item to cart:', error);
            
            // Show error state
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
            button.classList.add('error');

            // Reset button after delay
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
                button.classList.remove('error');
            }, 2000);
        }
    }

    /**
     * Render pagination controls
     * Requirement 8.5 - Pagination support
     */
    renderPagination() {
        try {
            // Create pagination container
            const paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-container';

            // Previous button
            const prevBtn = document.createElement('button');
            prevBtn.className = 'pagination-btn prev-btn';
            prevBtn.disabled = this.currentPage === 1;
            prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Previous';
            prevBtn.addEventListener('click', () => this.goToPreviousPage());

            // Page info
            const pageInfo = document.createElement('div');
            pageInfo.className = 'pagination-info';
            pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;

            // Next button
            const nextBtn = document.createElement('button');
            nextBtn.className = 'pagination-btn next-btn';
            nextBtn.disabled = this.currentPage === this.totalPages;
            nextBtn.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
            nextBtn.addEventListener('click', () => this.goToNextPage());

            // Append to container
            paginationContainer.appendChild(prevBtn);
            paginationContainer.appendChild(pageInfo);
            paginationContainer.appendChild(nextBtn);

            // Add to grid container
            this.gridContainer.parentElement.appendChild(paginationContainer);

        } catch (error) {
            console.error('❌ Failed to render pagination:', error);
        }
    }

    /**
     * Go to next page
     * Requirement 8.5
     */
    goToNextPage() {
        try {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.renderGrid(this.items, { page: this.currentPage });
                this.scrollToTop();
            }
        } catch (error) {
            console.error('❌ Failed to go to next page:', error);
        }
    }

    /**
     * Go to previous page
     * Requirement 8.5
     */
    goToPreviousPage() {
        try {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderGrid(this.items, { page: this.currentPage });
                this.scrollToTop();
            }
        } catch (error) {
            console.error('❌ Failed to go to previous page:', error);
        }
    }

    /**
     * Scroll to top of grid
     */
    scrollToTop() {
        try {
            if (this.gridContainer) {
                this.gridContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (error) {
            console.error('❌ Failed to scroll to top:', error);
        }
    }

    /**
     * Render empty state
     * Requirement 8.5 - Empty state handling
     */
    renderEmptyState() {
        try {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="empty-state-content">
                    <i class="fas fa-inbox"></i>
                    <h3>No items found</h3>
                    <p>Try adjusting your search or filters to find what you're looking for.</p>
                    <button class="empty-state-action" id="clearFiltersBtn">
                        <i class="fas fa-redo"></i>
                        Clear Filters
                    </button>
                </div>
            `;

            this.gridContainer.appendChild(emptyState);

            // Attach clear filters button
            const clearBtn = emptyState.querySelector('#clearFiltersBtn');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    this.emitEvent('clearFiltersRequested', {});
                });
            }

        } catch (error) {
            console.error('❌ Failed to render empty state:', error);
        }
    }

    /**
     * Render error state
     * Requirement 8.5 - Error handling
     * 
     * @param {string} message - Error message
     */
    renderErrorState(message = 'Failed to load items') {
        try {
            const errorState = document.createElement('div');
            errorState.className = 'error-state';
            errorState.innerHTML = `
                <div class="error-state-content">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error loading items</h3>
                    <p>${this.escapeHtml(message)}</p>
                    <button class="error-state-action" id="retryBtn">
                        <i class="fas fa-redo"></i>
                        Retry
                    </button>
                </div>
            `;

            this.gridContainer.appendChild(errorState);

            // Attach retry button
            const retryBtn = errorState.querySelector('#retryBtn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    this.emitEvent('retryRequested', {});
                });
            }

        } catch (error) {
            console.error('❌ Failed to render error state:', error);
        }
    }

    /**
     * Show loading state
     * Requirement 8.5 - Loading states
     */
    showLoadingState() {
        try {
            this.isLoading = true;
            this.gridContainer.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <span>Loading items...</span>
                </div>
            `;
        } catch (error) {
            console.error('❌ Failed to show loading state:', error);
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        try {
            this.isLoading = false;
        } catch (error) {
            console.error('❌ Failed to hide loading state:', error);
        }
    }

    /**
     * Format price for display
     * 
     * @param {number} price - Price value
     * @returns {string} Formatted price
     */
    formatPrice(price) {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(price);
        } catch (error) {
            console.error('❌ Failed to format price:', error);
            return `$${price.toFixed(2)}`;
        }
    }

    /**
     * Escape HTML special characters
     * 
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Update grid with new items
     * 
     * @param {Array} items - New items to display
     * @param {Object} options - Update options
     */
    updateItems(items = [], options = {}) {
        try {
            this.currentPage = 1;
            this.renderGrid(items, options);
        } catch (error) {
            console.error('❌ Failed to update items:', error);
        }
    }

    /**
     * Get current items
     * 
     * @returns {Array} Current items
     */
    getItems() {
        return [...this.items];
    }

    /**
     * Get current page
     * 
     * @returns {number} Current page number
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Get total pages
     * 
     * @returns {number} Total pages
     */
    getTotalPages() {
        return this.totalPages;
    }

    /**
     * Add event listener
     * 
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }

    /**
     * Remove event listener
     * 
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).delete(callback);
        }
    }

    /**
     * Emit event to registered listeners
     * 
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    emitEvent(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Check if component is initialized
     * 
     * @returns {boolean} True if initialized
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Destroy component and cleanup resources
     */
    destroy() {
        try {
            // Disconnect image observer
            if (this.imageObserver) {
                this.imageObserver.disconnect();
            }

            // Clear event listeners
            this.eventListeners.clear();

            // Clear references
            this.gridContainer = null;
            this.items = [];
            this.contentLoader = null;
            this.navigationController = null;
            this.cart = null;

            this.isInitialized = false;
            console.log('✅ DynamicItemGrid destroyed successfully');

        } catch (error) {
            console.error('❌ Failed to destroy DynamicItemGrid:', error);
        }
    }
}

// Export for global access
window.DynamicItemGrid = DynamicItemGrid;

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicItemGrid;
}

console.log('📦 DynamicItemGrid module loaded successfully');
