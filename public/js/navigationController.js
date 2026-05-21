/**
 * NavigationController Class
 * Manages page transitions, active state indicators, and mobile navigation
 * 
 * Validates: Requirements 4.6, 6.2, 13.1
 */
class NavigationController {
    constructor() {
        this.currentPage = 'dashboard';
        this.previousPage = null;
        this.sidebarCollapsed = false;
        this.mobileMenuOpen = false;
        this.contentCache = new Map();
        this.eventListeners = {
            pageChange: [],
            navigationStateChange: [],
            mobileMenuToggle: []
        };
        
        // Page configuration
        this.pageConfig = {
            dashboard: {
                title: 'Dashboard',
                icon: 'fa-home',
                section: 'main'
            },
            tools: {
                title: 'All Tools',
                icon: 'fa-tools',
                section: 'main'
            },
            orders: {
                title: 'My Orders',
                icon: 'fa-shopping-bag',
                section: 'main'
            },
            cybersecurity: {
                title: 'Cybersecurity Tools',
                icon: 'fa-shield-alt',
                section: 'categories'
            },
            webdev: {
                title: 'Web Development Tools',
                icon: 'fa-code',
                section: 'categories'
            },
            automation: {
                title: 'Automation Tools',
                icon: 'fa-robot',
                section: 'categories'
            },
            devops: {
                title: 'DevOps Tools',
                icon: 'fa-server',
                section: 'categories'
            },
            profile: {
                title: 'My Profile',
                icon: 'fa-user',
                section: 'account'
            },
            settings: {
                title: 'Settings',
                icon: 'fa-cog',
                section: 'account'
            }
        };
        
        this.isInitialized = false;
    }

    /**
     * Initialize the navigation controller
     * Sets up event listeners and DOM references
     */
    initialize() {
        if (this.isInitialized) {
            console.warn('NavigationController already initialized');
            return;
        }

        // Cache DOM elements
        this.elements = {
            sideNav: document.getElementById('sideNav'),
            mainContent: document.getElementById('mainContent'),
            pageTitle: document.getElementById('pageTitle'),
            sectionTitle: document.getElementById('sectionTitle'),
            navItems: document.querySelectorAll('.nav-item'),
            mobileNavToggle: document.getElementById('mobileNavToggle'),
            navToggle: document.getElementById('navToggle'),
            navOverlay: document.getElementById('navOverlay'),
            contentBody: document.querySelector('.content-body'),
            itemsGrid: document.getElementById('itemsGrid')
        };

        // Validate required elements exist
        if (!this.elements.sideNav || !this.elements.mainContent) {
            console.error('NavigationController: Required DOM elements not found');
            return;
        }

        this.setupEventListeners();
        this.isInitialized = true;
    }

    /**
     * Set up all event listeners for navigation
     */
    setupEventListeners() {
        // Navigation item clicks
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (page) {
                    this.navigateToPage(page);
                }
            });
        });

        // Mobile navigation toggle
        if (this.elements.mobileNavToggle) {
            this.elements.mobileNavToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Close mobile menu when nav toggle is clicked
        if (this.elements.navToggle) {
            this.elements.navToggle.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Close mobile menu when overlay is clicked
        if (this.elements.navOverlay) {
            this.elements.navOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Logout button handler
        // Requirement 12.1: THE "Log Out" button SHALL be prominently positioned at the bottom of the Side_Navigation_Tray
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Logout confirmation dialog handlers
        const logoutConfirmDialog = document.getElementById('logoutConfirmDialog');
        if (logoutConfirmDialog) {
            const confirmBtn = logoutConfirmDialog.querySelector('.confirm-logout-btn');
            const cancelBtn = logoutConfirmDialog.querySelector('.cancel-logout-btn');

            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    this.confirmLogout();
                });
            }

            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    logoutConfirmDialog.close();
                });
            }
        }

        // Handle window resize for responsive behavior
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        // Handle hash changes for browser back/forward
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash && this.pageConfig[hash]) {
                this.navigateToPage(hash);
            }
        });
    }

    /**
     * Navigate to a specific page
     * Requirement 4.6, 6.2, 13.1
     * 
     * @param {string} page - The page identifier to navigate to
     */
    navigateToPage(page) {
        // Validate page exists
        if (!this.pageConfig[page]) {
            console.warn(`NavigationController: Unknown page "${page}"`);
            return;
        }

        // Prevent navigation to same page
        if (this.currentPage === page) {
            return;
        }

        // Store previous page
        this.previousPage = this.currentPage;
        this.currentPage = page;

        // Update URL hash
        window.location.hash = page;

        // Update active state
        this.updateActiveState(page);

        // Update page title
        this.updatePageTitle(page);

        // Close mobile menu on navigation
        if (this.mobileMenuOpen) {
            this.closeMobileMenu();
        }

        // Emit page change event
        this.emitEvent('pageChange', {
            currentPage: this.currentPage,
            previousPage: this.previousPage,
            pageConfig: this.pageConfig[page]
        });

        // Reset scroll position
        this.resetScrollPosition();

        // Provide instant feedback
        this.showLoadingState();
    }

    /**
     * Update active state indicators
     * Requirement 4.6, 6.2
     * 
     * @param {string} activeItem - The page identifier to mark as active
     */
    updateActiveState(activeItem) {
        // Remove active class from all nav items
        this.elements.navItems.forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to the selected nav item
        const activeNavItem = document.querySelector(`[data-page="${activeItem}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Emit navigation state change event
        this.emitEvent('navigationStateChange', {
            activePage: activeItem,
            activeElement: activeNavItem
        });
    }

    /**
     * Update the page title based on current page
     * 
     * @param {string} page - The page identifier
     */
    updatePageTitle(page) {
        const config = this.pageConfig[page];
        if (config && this.elements.pageTitle) {
            this.elements.pageTitle.textContent = config.title;
        }
    }

    /**
     * Handle mobile navigation menu toggle
     * Requirement 13.1
     */
    toggleMobileMenu() {
        if (this.mobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Open mobile navigation menu
     */
    openMobileMenu() {
        this.mobileMenuOpen = true;
        this.elements.sideNav.classList.add('mobile-open');
        this.elements.navOverlay.classList.add('active');

        this.emitEvent('mobileMenuToggle', {
            isOpen: true
        });
    }

    /**
     * Close mobile navigation menu
     */
    closeMobileMenu() {
        this.mobileMenuOpen = false;
        this.elements.sideNav.classList.remove('mobile-open');
        this.elements.navOverlay.classList.remove('active');

        this.emitEvent('mobileMenuToggle', {
            isOpen: false
        });
    }

    /**
     * Toggle sidebar collapse state (desktop only)
     */
    toggleSidebar() {
        // Only allow on desktop
        if (window.innerWidth <= 768) {
            return;
        }

        this.sidebarCollapsed = !this.sidebarCollapsed;

        if (this.sidebarCollapsed) {
            this.elements.sideNav.classList.add('collapsed');
            this.elements.mainContent.classList.add('sidebar-collapsed');
        } else {
            this.elements.sideNav.classList.remove('collapsed');
            this.elements.mainContent.classList.remove('sidebar-collapsed');
        }

        this.emitEvent('navigationStateChange', {
            sidebarCollapsed: this.sidebarCollapsed
        });
    }

    /**
     * Handle window resize for responsive behavior
     */
    handleWindowResize() {
        const isMobile = window.innerWidth <= 768;

        // Close mobile menu if resizing to desktop
        if (!isMobile && this.mobileMenuOpen) {
            this.closeMobileMenu();
        }

        // Reset sidebar state on resize
        if (isMobile) {
            this.elements.mainContent.classList.add('sidebar-hidden');
            this.elements.mainContent.classList.remove('sidebar-collapsed');
        } else {
            this.elements.mainContent.classList.remove('sidebar-hidden');
        }
    }

    /**
     * Show loading state during page transition
     */
    showLoadingState() {
        if (this.elements.contentBody) {
            this.elements.contentBody.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <span>Loading content...</span>
                </div>
            `;
        }
    }

    /**
     * Reset scroll position to top
     * Requirement 6.2
     */
    resetScrollPosition() {
        if (this.elements.contentBody) {
            this.elements.contentBody.scrollTop = 0;
        }
    }

    /**
     * Get current page
     * 
     * @returns {string} The current page identifier
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Get previous page
     * 
     * @returns {string|null} The previous page identifier or null
     */
    getPreviousPage() {
        return this.previousPage;
    }

    /**
     * Get page configuration
     * 
     * @param {string} page - The page identifier
     * @returns {object|null} The page configuration or null
     */
    getPageConfig(page) {
        return this.pageConfig[page] || null;
    }

    /**
     * Check if sidebar is collapsed
     * 
     * @returns {boolean} True if sidebar is collapsed
     */
    isSidebarCollapsed() {
        return this.sidebarCollapsed;
    }

    /**
     * Check if mobile menu is open
     * 
     * @returns {boolean} True if mobile menu is open
     */
    isMobileMenuOpen() {
        return this.mobileMenuOpen;
    }

    /**
     * Get navigation state
     * 
     * @returns {object} Current navigation state
     */
    getNavigationState() {
        return {
            currentPage: this.currentPage,
            previousPage: this.previousPage,
            sidebarCollapsed: this.sidebarCollapsed,
            mobileMenuOpen: this.mobileMenuOpen
        };
    }

    /**
     * Cache content for a page
     * 
     * @param {string} page - The page identifier
     * @param {any} content - The content to cache
     */
    cacheContent(page, content) {
        this.contentCache.set(page, content);
    }

    /**
     * Get cached content for a page
     * 
     * @param {string} page - The page identifier
     * @returns {any|null} The cached content or null
     */
    getCachedContent(page) {
        return this.contentCache.get(page) || null;
    }

    /**
     * Clear content cache
     */
    clearContentCache() {
        this.contentCache.clear();
    }

    /**
     * Add event listener
     * 
     * @param {string} event - Event name (pageChange, navigationStateChange, mobileMenuToggle)
     * @param {function} callback - Callback function
     */
    addEventListener(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(callback);
        }
    }

    /**
     * Remove event listener
     * 
     * @param {string} event - Event name
     * @param {function} callback - Callback function to remove
     */
    removeEventListener(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(
                cb => cb !== callback
            );
        }
    }

    /**
     * Emit event to all listeners
     * 
     * @param {string} event - Event name
     * @param {object} data - Event data
     */
    emitEvent(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    /**
     * Handle logout button click
     * Requirement 12.1, 12.4: THE "Log Out" button SHALL be prominently positioned and show confirmation dialog
     * @private
     */
    handleLogout() {
        const logoutConfirmDialog = document.getElementById('logoutConfirmDialog');
        if (logoutConfirmDialog && logoutConfirmDialog.showModal) {
            logoutConfirmDialog.showModal();
        } else {
            // Fallback if dialog element doesn't exist
            console.warn('Logout confirmation dialog not found');
            this.confirmLogout();
        }
    }

    /**
     * Confirm logout and call authentication system
     * Requirement 12.2, 12.3, 12.5: Clear tokens, invalidate server session, redirect to homepage
     * @private
     */
    async confirmLogout() {
        try {
            // Close the dialog
            const logoutConfirmDialog = document.getElementById('logoutConfirmDialog');
            if (logoutConfirmDialog) {
                logoutConfirmDialog.close();
            }

            // Call the authentication system's logout method
            if (window.AuthSystem) {
                // Pass callbacks to handle the logout flow
                await window.AuthSystem.logout({
                    showConfirmation: false, // We already showed confirmation
                    onConfirm: () => {
                        console.log('Logout confirmed');
                    },
                    onCancel: () => {
                        console.log('Logout cancelled');
                    }
                });
            } else {
                console.error('Authentication system not available');
                // Fallback logout
                this.fallbackLogout();
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Still redirect on error
            this.fallbackLogout();
        }
    }

    /**
     * Fallback logout if authentication system is not available
     * @private
     */
    fallbackLogout() {
        try {
            // Clear session storage
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('userData');
            
            // Clear local storage auth data
            localStorage.removeItem('techvault_auth_token');
            localStorage.removeItem('techvault_user_data');
            localStorage.removeItem('techvault_token_expiry');
            
            // Redirect to homepage
            window.location.href = '/';
        } catch (error) {
            console.error('Fallback logout error:', error);
            // Force redirect anyway
            window.location.href = '/';
        }
    }

    /**
     * Destroy the navigation controller
     */
    destroy() {
        // Clear event listeners
        this.eventListeners = {
            pageChange: [],
            navigationStateChange: [],
            mobileMenuToggle: []
        };

        // Clear content cache
        this.contentCache.clear();

        // Reset state
        this.isInitialized = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationController;
}
