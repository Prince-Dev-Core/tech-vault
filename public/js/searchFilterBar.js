/**
 * SearchFilterBar Class
 * Manages search and filtering functionality for content
 * 
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */
class SearchFilterBar {
    constructor(options = {}) {
        // Configuration
        this.searchInputSelector = options.searchInputSelector || '#searchInput';
        this.categoryFilterSelector = options.categoryFilterSelector || '#categoryFilter';
        this.filterContainerSelector = options.filterContainerSelector || '.search-filter-bar';
        this.contentLoader = options.contentLoader || null;
        this.navigationController = options.navigationController || null;
        
        // DOM elements
        this.searchInput = null;
        this.categoryFilter = null;
        this.filterContainer = null;
        
        // State
        this.currentFilters = {
            searchQuery: '',
            category: ''
        };
        this.isInitialized = false;
        this.filterDebounceTimer = null;
        this.debounceDelay = 300; // milliseconds
        
        // Event listeners
        this.eventListeners = new Map();
        
        // Initialize component
        this.initialize();
    }

    /**
     * Initialize the SearchFilterBar component
     * Sets up DOM elements and event listeners
     * Requirement 7.1, 7.2, 7.3
     */
    initialize() {
        try {
            // Get DOM elements
            this.searchInput = document.querySelector(this.searchInputSelector);
            this.categoryFilter = document.querySelector(this.categoryFilterSelector);
            this.filterContainer = document.querySelector(this.filterContainerSelector);

            // Validate required elements exist
            if (!this.searchInput || !this.categoryFilter || !this.filterContainer) {
                throw new Error('Required DOM elements not found for SearchFilterBar');
            }

            // Bind event listeners
            this.bindSearchInput();
            this.bindCategoryFilter();

            this.isInitialized = true;
            console.log('✅ SearchFilterBar initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize SearchFilterBar:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Bind search input event listener
     * Requirement 7.4 - Real-time filtering
     */
    bindSearchInput() {
        try {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            // Clear search on Escape key
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.clearSearch();
                }
            });

        } catch (error) {
            console.error('❌ Failed to bind search input:', error);
        }
    }

    /**
     * Bind category filter event listener
     * Requirement 7.5 - Filter application
     */
    bindCategoryFilter() {
        try {
            this.categoryFilter.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });

        } catch (error) {
            console.error('❌ Failed to bind category filter:', error);
        }
    }

    /**
     * Handle search input with debouncing
     * Requirement 7.4 - Real-time filtering
     * 
     * @param {string} query - Search query
     */
    handleSearchInput(query) {
        try {
            // Clear existing debounce timer
            if (this.filterDebounceTimer) {
                clearTimeout(this.filterDebounceTimer);
            }

            // Update current filters
            this.currentFilters.searchQuery = query.trim();

            // Debounce the filter application
            this.filterDebounceTimer = setTimeout(() => {
                this.applyFilters();
                this.displayActiveFilters();
            }, this.debounceDelay);

        } catch (error) {
            console.error('❌ Failed to handle search input:', error);
        }
    }

    /**
     * Handle category filter change
     * Requirement 7.5 - Filter application
     * 
     * @param {string} category - Selected category
     */
    handleCategoryFilter(category) {
        try {
            // Update current filters
            this.currentFilters.category = category;

            // Apply filters immediately (no debounce for dropdown)
            this.applyFilters();
            this.displayActiveFilters();

        } catch (error) {
            console.error('❌ Failed to handle category filter:', error);
        }
    }

    /**
     * Apply filters to content
     * Requirement 7.4, 7.5 - Filter application
     */
    applyFilters() {
        try {
            // Emit filter applied event
            this.emitEvent('filtersApplied', {
                filters: this.currentFilters
            });

            // If content loader is available, reload content with filters
            if (this.contentLoader) {
                this.contentLoader.loadContent(
                    this.contentLoader.currentContentType,
                    this.currentFilters
                );
            }

        } catch (error) {
            console.error('❌ Failed to apply filters:', error);
        }
    }

    /**
     * Display active filter indicators
     * Requirement 7.6 - Active filter indicators
     */
    displayActiveFilters() {
        try {
            // Remove existing filter indicators
            const existingIndicators = this.filterContainer.querySelectorAll('.filter-indicator');
            existingIndicators.forEach(indicator => indicator.remove());

            // Create filter indicators container if it doesn't exist
            let indicatorsContainer = this.filterContainer.querySelector('.active-filters');
            if (!indicatorsContainer && (this.currentFilters.searchQuery || this.currentFilters.category)) {
                indicatorsContainer = document.createElement('div');
                indicatorsContainer.className = 'active-filters';
                this.filterContainer.appendChild(indicatorsContainer);
            }

            if (!indicatorsContainer) {
                return;
            }

            // Clear existing indicators
            indicatorsContainer.innerHTML = '';

            // Add search query indicator
            if (this.currentFilters.searchQuery) {
                const searchIndicator = this.createFilterIndicator(
                    `Search: "${this.currentFilters.searchQuery}"`,
                    () => this.clearSearch()
                );
                indicatorsContainer.appendChild(searchIndicator);
            }

            // Add category indicator
            if (this.currentFilters.category) {
                const categoryLabel = this.getCategoryLabel(this.currentFilters.category);
                const categoryIndicator = this.createFilterIndicator(
                    `Category: ${categoryLabel}`,
                    () => this.clearCategory()
                );
                indicatorsContainer.appendChild(categoryIndicator);
            }

            // Add clear all button if there are active filters
            if (this.currentFilters.searchQuery || this.currentFilters.category) {
                const clearAllBtn = document.createElement('button');
                clearAllBtn.className = 'clear-all-btn';
                clearAllBtn.innerHTML = '<i class="fas fa-times"></i> Clear All';
                clearAllBtn.addEventListener('click', () => this.clearAllFilters());
                indicatorsContainer.appendChild(clearAllBtn);
            }

        } catch (error) {
            console.error('❌ Failed to display active filters:', error);
        }
    }

    /**
     * Create a filter indicator element
     * Requirement 7.6 - Active filter indicators
     * 
     * @param {string} label - Filter label
     * @param {Function} onRemove - Callback when filter is removed
     * @returns {HTMLElement} Filter indicator element
     */
    createFilterIndicator(label, onRemove) {
        try {
            const indicator = document.createElement('div');
            indicator.className = 'filter-indicator';
            
            const labelSpan = document.createElement('span');
            labelSpan.className = 'filter-label';
            labelSpan.textContent = label;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'filter-remove-btn';
            removeBtn.setAttribute('aria-label', 'Remove filter');
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';

            indicator.appendChild(labelSpan);
            indicator.appendChild(removeBtn);

            removeBtn.addEventListener('click', onRemove);

            return indicator;

        } catch (error) {
            console.error('❌ Failed to create filter indicator:', error);
            return document.createElement('div');
        }
    }

    /**
     * Get category label from category value
     * 
     * @param {string} category - Category value
     * @returns {string} Category label
     */
    getCategoryLabel(category) {
        const categoryMap = {
            'cybersecurity': 'Cybersecurity',
            'webdev': 'Web Development',
            'automation': 'Automation',
            'devops': 'DevOps',
            'hardware': 'Hardware'
        };
        return categoryMap[category] || category;
    }

    /**
     * Clear search filter
     * Requirement 7.6 - Filter removal
     */
    clearSearch() {
        try {
            this.currentFilters.searchQuery = '';
            this.searchInput.value = '';
            this.applyFilters();
            this.displayActiveFilters();

        } catch (error) {
            console.error('❌ Failed to clear search:', error);
        }
    }

    /**
     * Clear category filter
     * Requirement 7.6 - Filter removal
     */
    clearCategory() {
        try {
            this.currentFilters.category = '';
            this.categoryFilter.value = '';
            this.applyFilters();
            this.displayActiveFilters();

        } catch (error) {
            console.error('❌ Failed to clear category:', error);
        }
    }

    /**
     * Clear all filters
     * Requirement 7.6 - Clear all functionality
     */
    clearAllFilters() {
        try {
            this.currentFilters.searchQuery = '';
            this.currentFilters.category = '';
            this.searchInput.value = '';
            this.categoryFilter.value = '';
            this.applyFilters();
            this.displayActiveFilters();

            // Emit clear all event
            this.emitEvent('filtersCleared', {});

        } catch (error) {
            console.error('❌ Failed to clear all filters:', error);
        }
    }

    /**
     * Get current filters
     * 
     * @returns {Object} Current filter state
     */
    getFilters() {
        return { ...this.currentFilters };
    }

    /**
     * Set filters programmatically
     * 
     * @param {Object} filters - Filters to set
     */
    setFilters(filters) {
        try {
            if (filters.searchQuery !== undefined) {
                this.currentFilters.searchQuery = filters.searchQuery;
                this.searchInput.value = filters.searchQuery;
            }

            if (filters.category !== undefined) {
                this.currentFilters.category = filters.category;
                this.categoryFilter.value = filters.category;
            }

            this.applyFilters();
            this.displayActiveFilters();

        } catch (error) {
            console.error('❌ Failed to set filters:', error);
        }
    }

    /**
     * Reset filters to initial state
     */
    resetFilters() {
        try {
            this.currentFilters = {
                searchQuery: '',
                category: ''
            };
            this.searchInput.value = '';
            this.categoryFilter.value = '';
            this.displayActiveFilters();

        } catch (error) {
            console.error('❌ Failed to reset filters:', error);
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
        return text.replace(/[&<>"']/g, m => map[m]);
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
            // Clear debounce timer
            if (this.filterDebounceTimer) {
                clearTimeout(this.filterDebounceTimer);
            }

            // Clear event listeners
            this.eventListeners.clear();

            // Clear references
            this.searchInput = null;
            this.categoryFilter = null;
            this.filterContainer = null;
            this.contentLoader = null;
            this.navigationController = null;

            this.isInitialized = false;
            console.log('✅ SearchFilterBar destroyed successfully');

        } catch (error) {
            console.error('❌ Failed to destroy SearchFilterBar:', error);
        }
    }
}

// Export for global access
window.SearchFilterBar = SearchFilterBar;

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchFilterBar;
}

console.log('📦 SearchFilterBar module loaded successfully');
