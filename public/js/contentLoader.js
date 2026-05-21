/**
 * ContentLoader Class
 * Manages dynamic content loading, state transitions, and error handling
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */
class ContentLoader {
    constructor(options = {}) {
        // Configuration
        this.contentAreaSelector = options.contentAreaSelector || '#mainContent';
        this.contentBodySelector = options.contentBodySelector || '.content-body';
        this.loadingIndicatorSelector = options.loadingIndicatorSelector || '.loading';
        this.navigationController = options.navigationController || null;
        
        // DOM elements
        this.contentArea = null;
        this.contentBody = null;
        
        // State
        this.currentContentType = null;
        this.currentFilters = null;
        this.isLoading = false;
        this.contentCache = new Map();
        this.isInitialized = false;
        
        // Content type handlers
        this.contentHandlers = {
            dashboard: this.loadDashboard.bind(this),
            tools: this.loadTools.bind(this),
            orders: this.loadOrders.bind(this),
            cybersecurity: this.loadCategoryTools.bind(this),
            webdev: this.loadCategoryTools.bind(this),
            automation: this.loadCategoryTools.bind(this),
            devops: this.loadCategoryTools.bind(this),
            profile: this.loadProfile.bind(this),
            settings: this.loadSettings.bind(this)
        };
        
        // Event listeners
        this.eventListeners = new Map();
        
        // Initialize component
        this.initialize();
    }

    /**
     * Initialize the ContentLoader component
     * Sets up DOM elements and event listeners
     */
    initialize() {
        try {
            // Get DOM elements
            this.contentArea = document.querySelector(this.contentAreaSelector);
            this.contentBody = document.querySelector(this.contentBodySelector);

            // Validate required elements exist
            if (!this.contentArea || !this.contentBody) {
                throw new Error('Required DOM elements not found for ContentLoader');
            }

            // Listen to navigation controller events
            if (this.navigationController) {
                this.navigationController.addEventListener('pageChange', (data) => {
                    this.handlePageChange(data);
                });
            }

            this.isInitialized = true;
            console.log('✅ ContentLoader initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize ContentLoader:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Handle page change from navigation controller
     * Requirement 6.1, 6.2
     * 
     * @param {Object} data - Page change event data
     */
    handlePageChange(data) {
        try {
            const { currentPage } = data;
            this.loadContent(currentPage);
        } catch (error) {
            console.error('❌ Failed to handle page change:', error);
            this.displayError('Failed to load page. Please try again.');
        }
    }

    /**
     * Load content for a specific content type
     * Requirement 6.1, 6.2, 6.3
     * 
     * @param {string} contentType - The type of content to load
     * @param {Object} filters - Optional filter options
     * @returns {Promise<void>}
     */
    async loadContent(contentType, filters = null) {
        try {
            // Prevent duplicate loading
            if (this.isLoading && this.currentContentType === contentType) {
                return;
            }

            // Check cache first
            const cacheKey = this.getCacheKey(contentType, filters);
            if (this.contentCache.has(cacheKey)) {
                this.displayContent(this.contentCache.get(cacheKey));
                return;
            }

            // Show loading state
            this.showLoadingState();
            this.isLoading = true;
            this.currentContentType = contentType;
            this.currentFilters = filters;

            // Get content handler
            const handler = this.contentHandlers[contentType];
            if (!handler) {
                throw new Error(`Unknown content type: ${contentType}`);
            }

            // Load content
            const content = await handler(filters);

            // Cache the content
            this.contentCache.set(cacheKey, content);

            // Display content
            this.displayContent(content);

            // Emit content loaded event
            this.emitEvent('contentLoaded', {
                contentType,
                filters,
                content
            });

        } catch (error) {
            console.error('❌ Failed to load content:', error);
            this.displayError(
                'Failed to load content. Please try again.',
                () => this.loadContent(contentType, filters)
            );
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Show loading state
     * Requirement 6.3
     */
    showLoadingState() {
        try {
            this.contentBody.innerHTML = `
                <div class="loading-container">
                    <div class="spinner"></div>
                    <span class="loading-text">Loading content...</span>
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
            const loadingContainer = this.contentBody.querySelector('.loading-container');
            if (loadingContainer) {
                loadingContainer.remove();
            }
        } catch (error) {
            console.error('❌ Failed to hide loading state:', error);
        }
    }

    /**
     * Display content in the content area
     * Requirement 6.1, 6.5
     * 
     * @param {string|HTMLElement} content - The content to display
     */
    displayContent(content) {
        try {
            // Reset scroll position
            this.resetScrollPosition();

            // Clear existing content
            this.contentBody.innerHTML = '';

            // Display new content
            if (typeof content === 'string') {
                this.contentBody.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                this.contentBody.appendChild(content);
            } else {
                throw new Error('Invalid content type');
            }

            // Hide loading state
            this.hideLoadingState();

        } catch (error) {
            console.error('❌ Failed to display content:', error);
            this.displayError('Failed to display content. Please try again.');
        }
    }

    /**
     * Display error message with retry option
     * Requirement 6.4
     * 
     * @param {string} message - Error message to display
     * @param {Function} retryCallback - Optional callback for retry button
     */
    displayError(message, retryCallback = null) {
        try {
            let errorHTML = `
                <div class="error-container">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h3 class="error-title">Oops! Something went wrong</h3>
                    <p class="error-message">${this.escapeHtml(message)}</p>
                    <div class="error-actions">
            `;

            if (retryCallback) {
                errorHTML += `
                    <button class="btn btn-primary retry-btn">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                `;
            }

            errorHTML += `
                    <button class="btn btn-secondary go-home-btn">
                        <i class="fas fa-home"></i> Go to Dashboard
                    </button>
                    </div>
                </div>
            `;

            this.contentBody.innerHTML = errorHTML;

            // Attach event listeners
            if (retryCallback) {
                const retryBtn = this.contentBody.querySelector('.retry-btn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', retryCallback);
                }
            }

            const goHomeBtn = this.contentBody.querySelector('.go-home-btn');
            if (goHomeBtn) {
                goHomeBtn.addEventListener('click', () => {
                    if (this.navigationController) {
                        this.navigationController.navigateToPage('dashboard');
                    }
                });
            }

        } catch (error) {
            console.error('❌ Failed to display error:', error);
            if (this.contentBody) {
                this.contentBody.innerHTML = '<p>An error occurred. Please refresh the page.</p>';
            }
        }
    }

    /**
     * Reset scroll position to top
     * Requirement 6.5
     */
    resetScrollPosition() {
        try {
            if (this.contentBody) {
                this.contentBody.scrollTop = 0;
            }
            if (this.contentArea) {
                this.contentArea.scrollTop = 0;
            }
        } catch (error) {
            console.error('❌ Failed to reset scroll position:', error);
        }
    }

    /**
     * Load dashboard content
     * 
     * @param {Object} filters - Optional filter options
     * @returns {Promise<string>}
     */
    async loadDashboard(filters = null) {
        try {
            // Simulate API call
            await this.delay(300);

            return `
                <div class="dashboard-content">
                    <div class="dashboard-header">
                        <h2>Welcome to TechVault</h2>
                        <p>Your one-stop shop for development and security tools</p>
                    </div>
                    <div class="dashboard-sections">
                        <div class="dashboard-section">
                            <h3>Featured Tools</h3>
                            <div class="featured-grid">
                                <div class="featured-item">
                                    <div class="item-icon">🔒</div>
                                    <h4>Security Scanner</h4>
                                    <p>Professional vulnerability scanning</p>
                                </div>
                                <div class="featured-item">
                                    <div class="item-icon">⚙️</div>
                                    <h4>DevOps Suite</h4>
                                    <p>Complete deployment automation</p>
                                </div>
                                <div class="featured-item">
                                    <div class="item-icon">💻</div>
                                    <h4>Web Framework</h4>
                                    <p>Modern web development tools</p>
                                </div>
                            </div>
                        </div>
                        <div class="dashboard-section">
                            <h3>Quick Stats</h3>
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <span class="stat-value">12</span>
                                    <span class="stat-label">Tools Owned</span>
                                </div>
                                <div class="stat-card">
                                    <span class="stat-value">5</span>
                                    <span class="stat-label">Active Orders</span>
                                </div>
                                <div class="stat-card">
                                    <span class="stat-value">3</span>
                                    <span class="stat-label">Days Left Trial</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('❌ Failed to load dashboard:', error);
            throw error;
        }
    }

    /**
     * Load tools content
     * 
     * @param {Object} filters - Optional filter options
     * @returns {Promise<string>}
     */
    async loadTools(filters = null) {
        try {
            // Simulate API call
            await this.delay(300);

            return `
                <div class="tools-content">
                    <div class="content-header">
                        <h2>All Tools</h2>
                        <p>Browse our complete collection of development and security tools</p>
                    </div>
                    <div class="tools-grid">
                        <div class="tool-card">
                            <div class="tool-header">
                                <h3>Security Scanner Pro</h3>
                                <span class="tool-badge">Premium</span>
                            </div>
                            <p class="tool-description">Professional vulnerability scanner for web applications</p>
                            <div class="tool-meta">
                                <span class="tool-category">Cybersecurity</span>
                                <span class="tool-rating">⭐ 4.8</span>
                            </div>
                            <div class="tool-price">$299.99</div>
                            <button class="btn btn-primary">Add to Cart</button>
                        </div>
                        <div class="tool-card">
                            <div class="tool-header">
                                <h3>DevOps Automation Suite</h3>
                                <span class="tool-badge">Enterprise</span>
                            </div>
                            <p class="tool-description">Complete CI/CD pipeline automation and deployment tools</p>
                            <div class="tool-meta">
                                <span class="tool-category">DevOps</span>
                                <span class="tool-rating">⭐ 4.9</span>
                            </div>
                            <div class="tool-price">$499.99</div>
                            <button class="btn btn-primary">Add to Cart</button>
                        </div>
                        <div class="tool-card">
                            <div class="tool-header">
                                <h3>Web Framework Toolkit</h3>
                                <span class="tool-badge">Standard</span>
                            </div>
                            <p class="tool-description">Modern web development framework with built-in components</p>
                            <div class="tool-meta">
                                <span class="tool-category">Web Development</span>
                                <span class="tool-rating">⭐ 4.7</span>
                            </div>
                            <div class="tool-price">$199.99</div>
                            <button class="btn btn-primary">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('❌ Failed to load tools:', error);
            throw error;
        }
    }

    /**
     * Load orders content
     * 
     * @param {Object} filters - Optional filter options
     * @returns {Promise<string>}
     */
    async loadOrders(filters = null) {
        try {
            // Simulate API call
            await this.delay(300);

            return `
                <div class="orders-content">
                    <div class="content-header">
                        <h2>My Orders</h2>
                        <p>View and manage your tool purchases</p>
                    </div>
                    <div class="orders-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Tool</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>#ORD-001</td>
                                    <td>Security Scanner Pro</td>
                                    <td>2024-01-15</td>
                                    <td>$299.99</td>
                                    <td><span class="status-badge completed">Completed</span></td>
                                </tr>
                                <tr>
                                    <td>#ORD-002</td>
                                    <td>DevOps Automation Suite</td>
                                    <td>2024-01-10</td>
                                    <td>$499.99</td>
                                    <td><span class="status-badge completed">Completed</span></td>
                                </tr>
                                <tr>
                                    <td>#ORD-003</td>
                                    <td>Web Framework Toolkit</td>
                                    <td>2024-01-05</td>
                                    <td>$199.99</td>
                                    <td><span class="status-badge completed">Completed</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('❌ Failed to load orders:', error);
            throw error;
        }
    }

    /**
     * Load category tools content
     * 
     * @param {Object} filters - Optional filter options
     * @returns {Promise<string>}
     */
    async loadCategoryTools(filters = null) {
        try {
            // Simulate API call
            await this.delay(300);

            const category = this.currentContentType;
            const categoryNames = {
                cybersecurity: 'Cybersecurity Tools',
                webdev: 'Web Development Tools',
                automation: 'Automation Tools',
                devops: 'DevOps Tools'
            };

            return `
                <div class="category-content">
                    <div class="content-header">
                        <h2>${categoryNames[category] || 'Tools'}</h2>
                        <p>Specialized tools for ${category} professionals</p>
                    </div>
                    <div class="category-grid">
                        <div class="category-item">
                            <h3>Tool 1</h3>
                            <p>Professional tool for ${category}</p>
                            <button class="btn btn-primary">View Details</button>
                        </div>
                        <div class="category-item">
                            <h3>Tool 2</h3>
                            <p>Advanced ${category} solution</p>
                            <button class="btn btn-primary">View Details</button>
                        </div>
                        <div class="category-item">
                            <h3>Tool 3</h3>
                            <p>Enterprise ${category} platform</p>
                            <button class="btn btn-primary">View Details</button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('❌ Failed to load category tools:', error);
            throw error;
        }
    }

    /**
     * Load profile content
     * 
     * @param {Object} filters - Optional filter options
     * @returns {Promise<string>}
     */
    async loadProfile(filters = null) {
        try {
            // Simulate API call
            await this.delay(300);

            return `
                <div class="profile-content">
                    <div class="content-header">
                        <h2>My Profile</h2>
                        <p>Manage your account information</p>
                    </div>
                    <div class="profile-form">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" value="John Doe" disabled>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" value="john@example.com" disabled>
                        </div>
                        <div class="form-group">
                            <label>Member Since</label>
                            <input type="text" value="January 2024" disabled>
                        </div>
                        <button class="btn btn-primary">Edit Profile</button>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('❌ Failed to load profile:', error);
            throw error;
        }
    }

    /**
     * Load settings content
     * 
     * @param {Object} filters - Optional filter options
     * @returns {Promise<string>}
     */
    async loadSettings(filters = null) {
        try {
            // Simulate API call
            await this.delay(300);

            return `
                <div class="settings-content">
                    <div class="content-header">
                        <h2>Settings</h2>
                        <p>Configure your application preferences</p>
                    </div>
                    <div class="settings-sections">
                        <div class="settings-section">
                            <h3>Theme</h3>
                            <div class="setting-option">
                                <label>
                                    <input type="radio" name="theme" value="light" checked>
                                    Light Mode
                                </label>
                            </div>
                            <div class="setting-option">
                                <label>
                                    <input type="radio" name="theme" value="dark">
                                    Dark Mode
                                </label>
                            </div>
                        </div>
                        <div class="settings-section">
                            <h3>Notifications</h3>
                            <div class="setting-option">
                                <label>
                                    <input type="checkbox" checked>
                                    Email Notifications
                                </label>
                            </div>
                            <div class="setting-option">
                                <label>
                                    <input type="checkbox" checked>
                                    Push Notifications
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('❌ Failed to load settings:', error);
            throw error;
        }
    }

    /**
     * Get cache key for content
     * 
     * @param {string} contentType - Content type
     * @param {Object} filters - Filter options
     * @returns {string} Cache key
     */
    getCacheKey(contentType, filters = null) {
        if (!filters) {
            return contentType;
        }
        return `${contentType}:${JSON.stringify(filters)}`;
    }

    /**
     * Clear content cache
     */
    clearCache() {
        this.contentCache.clear();
    }

    /**
     * Clear cache for specific content type
     * 
     * @param {string} contentType - Content type to clear
     */
    clearCacheForType(contentType) {
        const keysToDelete = [];
        for (const key of this.contentCache.keys()) {
            if (key.startsWith(contentType)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.contentCache.delete(key));
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
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Delay helper for simulating async operations
     * 
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
            // Clear cache
            this.contentCache.clear();

            // Clear event listeners
            this.eventListeners.clear();

            // Clear references
            this.contentArea = null;
            this.contentBody = null;
            this.navigationController = null;

            this.isInitialized = false;
            console.log('✅ ContentLoader destroyed successfully');

        } catch (error) {
            console.error('❌ Failed to destroy ContentLoader:', error);
        }
    }
}

// Export for global access
window.ContentLoader = ContentLoader;

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentLoader;
}

console.log('📦 ContentLoader module loaded successfully');
