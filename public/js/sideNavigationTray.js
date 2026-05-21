/**
 * SideNavigationTray Class
 * Manages the side navigation tray with organized sections, feature links, and mobile responsiveness
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5
 */
class SideNavigationTray {
    constructor(options = {}) {
        // Configuration
        this.containerSelector = options.containerSelector || '#sideNav';
        this.navigationController = options.navigationController || null;
        this.userProfileSummary = options.userProfileSummary || null;
        
        // DOM elements
        this.container = null;
        this.navMenu = null;
        this.navFooter = null;
        this.logoutBtn = null;
        this.navToggle = null;
        this.navItems = null;
        this.mainContent = null;
        
        // State
        this.isCollapsed = false;
        this.isMobileOpen = false;
        this.currentActivePage = 'dashboard';
        this.isInitialized = false;
        
        // Navigation sections configuration
        this.navigationSections = {
            main: {
                title: 'Main',
                items: [
                    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home', page: 'dashboard' },
                    { id: 'tools', label: 'Tools', icon: 'fas fa-tools', page: 'tools' },
                    { id: 'orders', label: 'Orders', icon: 'fas fa-shopping-bag', page: 'orders' }
                ]
            },
            categories: {
                title: 'Categories',
                items: [
                    { id: 'cybersecurity', label: 'Cybersecurity', icon: 'fas fa-shield-alt', page: 'cybersecurity' },
                    { id: 'webdev', label: 'Web Development', icon: 'fas fa-code', page: 'webdev' },
                    { id: 'automation', label: 'Automation', icon: 'fas fa-robot', page: 'automation' },
                    { id: 'devops', label: 'DevOps', icon: 'fas fa-server', page: 'devops' }
                ]
            },
            account: {
                title: 'Account',
                items: [
                    { id: 'profile', label: 'Profile', icon: 'fas fa-user', page: 'profile' },
                    { id: 'settings', label: 'Settings', icon: 'fas fa-cog', page: 'settings' }
                ]
            }
        };
        
        // Event listeners
        this.eventListeners = new Map();
        
        // Initialize component
        this.initialize();
    }

    /**
     * Initialize the SideNavigationTray component
     * Sets up DOM elements, event listeners, and initial state
     * Requirement 4.1, 4.2, 4.3, 4.4, 4.5
     */
    initialize() {
        try {
            // Get DOM elements
            this.container = document.querySelector(this.containerSelector);
            this.navMenu = this.container?.querySelector('.nav-menu');
            this.navFooter = this.container?.querySelector('.nav-footer');
            this.logoutBtn = this.container?.querySelector('.logout-btn');
            this.navToggle = this.container?.querySelector('.nav-toggle');
            this.navItems = this.container?.querySelectorAll('.nav-item');
            this.mainContent = document.getElementById('mainContent');

            // Validate required elements exist
            if (!this.container || !this.navMenu || !this.navFooter || !this.logoutBtn) {
                throw new Error('Required DOM elements not found for SideNavigationTray');
            }

            // Setup event listeners
            this.setupEventListeners();

            // Initialize responsive behavior
            this.initializeResponsiveBehavior();

            // Set initial active state
            this.updateActiveState(this.currentActivePage);

            this.isInitialized = true;
            console.log('✅ SideNavigationTray initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize SideNavigationTray:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Setup event listeners for navigation interactions
     * Requirement 4.1, 4.2, 4.3, 4.4, 4.5
     */
    setupEventListeners() {
        try {
            // Navigation item clicks
            this.navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = item.getAttribute('data-page');
                    if (page) {
                        this.handleNavItemClick(page, item);
                    }
                });

                // Keyboard support for accessibility
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const page = item.getAttribute('data-page');
                        if (page) {
                            this.handleNavItemClick(page, item);
                        }
                    }
                });
            });

            // Logout button click
            this.logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });

            // Navigation toggle (mobile close button)
            if (this.navToggle) {
                this.navToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.closeMobileMenu();
                });
            }

            // Listen for navigation controller page changes
            if (this.navigationController) {
                this.navigationController.addEventListener('pageChange', (data) => {
                    this.updateActiveState(data.currentPage);
                });

                this.navigationController.addEventListener('navigationStateChange', (data) => {
                    if (data.activePage) {
                        this.updateActiveState(data.activePage);
                    }
                });
            }

            // Handle window resize for responsive behavior
            window.addEventListener('resize', () => {
                this.handleWindowResize();
            });

        } catch (error) {
            console.error('❌ Failed to setup event listeners:', error);
        }
    }

    /**
     * Initialize responsive behavior for mobile and desktop
     * Requirement 4.5, 13.1, 13.2
     */
    initializeResponsiveBehavior() {
        try {
            // Check initial screen size
            this.handleWindowResize();

            // Add touch support for mobile
            if (this.container) {
                this.container.addEventListener('touchstart', (e) => {
                    // Handle touch interactions
                }, { passive: true });
            }

        } catch (error) {
            console.error('❌ Failed to initialize responsive behavior:', error);
        }
    }

    /**
     * Handle navigation item click
     * Requirement 4.1, 4.2, 4.3, 4.4
     * 
     * @param {string} page - Page identifier
     * @param {HTMLElement} item - Navigation item element
     */
    handleNavItemClick(page, item) {
        try {
            // Update active state
            this.updateActiveState(page);

            // Navigate using navigation controller
            if (this.navigationController) {
                this.navigationController.navigateToPage(page);
            } else {
                // Fallback: navigate directly
                window.location.hash = page;
            }

            // Close mobile menu on navigation
            if (this.isMobileOpen && window.innerWidth <= 768) {
                this.closeMobileMenu();
            }

            // Emit custom event
            this.emitEvent('navigationItemClicked', { page, item });

        } catch (error) {
            console.error('❌ Failed to handle navigation item click:', error);
        }
    }

    /**
     * Update active state indicators
     * Requirement 4.4, 4.5
     * 
     * @param {string} activePage - Page identifier to mark as active
     */
    updateActiveState(activePage) {
        try {
            this.currentActivePage = activePage;

            // Remove active class from all nav items
            this.navItems.forEach(item => {
                item.classList.remove('active');
                item.setAttribute('aria-current', 'false');
            });

            // Add active class to the selected nav item
            const activeNavItem = this.container.querySelector(`[data-page="${activePage}"]`);
            if (activeNavItem) {
                activeNavItem.classList.add('active');
                activeNavItem.setAttribute('aria-current', 'page');
                
                // Scroll active item into view if needed
                this.scrollActiveItemIntoView(activeNavItem);
            }

            // Emit custom event
            this.emitEvent('activeStateUpdated', { activePage, activeElement: activeNavItem });

        } catch (error) {
            console.error('❌ Failed to update active state:', error);
        }
    }

    /**
     * Scroll active navigation item into view
     * 
     * @param {HTMLElement} item - Navigation item element
     */
    scrollActiveItemIntoView(item) {
        try {
            if (this.navMenu && item) {
                // Check if item is visible in nav menu
                const itemRect = item.getBoundingClientRect();
                const menuRect = this.navMenu.getBoundingClientRect();

                if (itemRect.top < menuRect.top || itemRect.bottom > menuRect.bottom) {
                    // Item is not fully visible, scroll it into view
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        } catch (error) {
            console.error('❌ Failed to scroll active item into view:', error);
        }
    }

    /**
     * Handle logout button click
     * Requirement 4.3, 12.1, 12.2, 12.3, 12.4, 12.5
     */
    async handleLogout() {
        try {
            // Emit logout requested event
            this.emitEvent('logoutRequested', {});

            // Call authentication system logout with confirmation
            if (window.authSystem) {
                await window.authSystem.logout({
                    showConfirmation: true,
                    onConfirm: () => {
                        console.log('✅ User confirmed logout');
                    },
                    onCancel: () => {
                        console.log('🚫 User cancelled logout');
                    }
                });
            } else {
                // Fallback if auth system not available
                console.warn('⚠️ Authentication system not available, using fallback logout');
                this.performFallbackLogout();
            }

        } catch (error) {
            console.error('❌ Failed to handle logout:', error);
            // Force redirect on error
            window.location.href = '/';
        }
    }

    /**
     * Perform fallback logout if auth system is not available
     * @private
     */
    performFallbackLogout() {
        try {
            // Show confirmation dialog
            const confirmed = confirm('Are you sure you want to log out? You will be redirected to the homepage.');
            
            if (!confirmed) {
                return;
            }

            // Clear session data
            if (window.sessionManager) {
                sessionManager.clearAuthData();
            }

            // Clear authentication token
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('userData');

            // Redirect to homepage
            window.location.href = '/';

        } catch (error) {
            console.error('❌ Failed to perform fallback logout:', error);
            // Force redirect on error
            window.location.href = '/';
        }
    }

    /**
     * Handle window resize for responsive behavior
     * Requirement 4.5, 13.1, 13.2
     */
    handleWindowResize() {
        try {
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                // Mobile layout
                if (this.isMobileOpen) {
                    this.container.classList.add('mobile-open');
                } else {
                    this.container.classList.remove('mobile-open');
                }
                this.container.classList.remove('collapsed');
            } else {
                // Desktop layout
                this.container.classList.remove('mobile-open');
                
                // Restore collapsed state if it was set
                if (this.isCollapsed) {
                    this.container.classList.add('collapsed');
                }
            }

            // Update main content margin
            this.updateMainContentMargin();

        } catch (error) {
            console.error('❌ Failed to handle window resize:', error);
        }
    }

    /**
     * Update main content area margin based on sidebar state
     * Requirement 3.4
     */
    updateMainContentMargin() {
        try {
            if (!this.mainContent) {
                return;
            }

            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                this.mainContent.classList.add('sidebar-hidden');
                this.mainContent.classList.remove('sidebar-collapsed');
            } else if (this.isCollapsed) {
                this.mainContent.classList.add('sidebar-collapsed');
                this.mainContent.classList.remove('sidebar-hidden');
            } else {
                this.mainContent.classList.remove('sidebar-collapsed');
                this.mainContent.classList.remove('sidebar-hidden');
            }

        } catch (error) {
            console.error('❌ Failed to update main content margin:', error);
        }
    }

    /**
     * Toggle sidebar collapse state (desktop only)
     * Requirement 4.5
     */
    toggleSidebar() {
        try {
            // Only allow on desktop
            if (window.innerWidth <= 768) {
                return;
            }

            this.isCollapsed = !this.isCollapsed;

            if (this.isCollapsed) {
                this.container.classList.add('collapsed');
            } else {
                this.container.classList.remove('collapsed');
            }

            this.updateMainContentMargin();

            // Emit custom event
            this.emitEvent('sidebarToggled', { isCollapsed: this.isCollapsed });

        } catch (error) {
            console.error('❌ Failed to toggle sidebar:', error);
        }
    }

    /**
     * Open mobile navigation menu
     * Requirement 4.5, 13.1
     */
    openMobileMenu() {
        try {
            if (window.innerWidth > 768) {
                return;
            }

            this.isMobileOpen = true;
            this.container.classList.add('mobile-open');

            // Show overlay
            const overlay = document.getElementById('navOverlay');
            if (overlay) {
                overlay.classList.add('active');
            }

            // Emit custom event
            this.emitEvent('mobileMenuOpened', {});

        } catch (error) {
            console.error('❌ Failed to open mobile menu:', error);
        }
    }

    /**
     * Close mobile navigation menu
     * Requirement 4.5, 13.1
     */
    closeMobileMenu() {
        try {
            this.isMobileOpen = false;
            this.container.classList.remove('mobile-open');

            // Hide overlay
            const overlay = document.getElementById('navOverlay');
            if (overlay) {
                overlay.classList.remove('active');
            }

            // Emit custom event
            this.emitEvent('mobileMenuClosed', {});

        } catch (error) {
            console.error('❌ Failed to close mobile menu:', error);
        }
    }

    /**
     * Toggle mobile navigation menu
     * Requirement 4.5, 13.1
     */
    toggleMobileMenu() {
        try {
            if (this.isMobileOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        } catch (error) {
            console.error('❌ Failed to toggle mobile menu:', error);
        }
    }

    /**
     * Get navigation section configuration
     * 
     * @param {string} sectionName - Section name (main, categories, account)
     * @returns {Object|null} Section configuration or null
     */
    getNavigationSection(sectionName) {
        return this.navigationSections[sectionName] || null;
    }

    /**
     * Get all navigation sections
     * 
     * @returns {Object} All navigation sections
     */
    getAllNavigationSections() {
        return this.navigationSections;
    }

    /**
     * Get navigation item by page identifier
     * 
     * @param {string} page - Page identifier
     * @returns {Object|null} Navigation item or null
     */
    getNavigationItem(page) {
        for (const section of Object.values(this.navigationSections)) {
            const item = section.items.find(item => item.page === page);
            if (item) {
                return item;
            }
        }
        return null;
    }

    /**
     * Get current active page
     * 
     * @returns {string} Current active page identifier
     */
    getCurrentActivePage() {
        return this.currentActivePage;
    }

    /**
     * Check if sidebar is collapsed
     * 
     * @returns {boolean} True if sidebar is collapsed
     */
    isSidebarCollapsed() {
        return this.isCollapsed;
    }

    /**
     * Check if mobile menu is open
     * 
     * @returns {boolean} True if mobile menu is open
     */
    isMobileMenuOpen() {
        return this.isMobileOpen;
    }

    /**
     * Get navigation state
     * 
     * @returns {Object} Current navigation state
     */
    getNavigationState() {
        return {
            currentActivePage: this.currentActivePage,
            isCollapsed: this.isCollapsed,
            isMobileOpen: this.isMobileOpen,
            isInitialized: this.isInitialized
        };
    }

    /**
     * Add event listener for navigation events
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
     * Emit custom event to registered listeners
     * 
     * @private
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
     * Update navigation sections (for dynamic content)
     * 
     * @param {Object} sections - New navigation sections
     */
    updateNavigationSections(sections) {
        try {
            if (!sections || typeof sections !== 'object') {
                throw new Error('Invalid sections object');
            }

            this.navigationSections = sections;
            this.emitEvent('navigationSectionsUpdated', { sections });

            console.log('✅ Navigation sections updated');

        } catch (error) {
            console.error('❌ Failed to update navigation sections:', error);
        }
    }

    /**
     * Add navigation item to a section
     * 
     * @param {string} sectionName - Section name
     * @param {Object} item - Navigation item to add
     */
    addNavigationItem(sectionName, item) {
        try {
            if (!this.navigationSections[sectionName]) {
                throw new Error(`Section "${sectionName}" not found`);
            }

            if (!item || !item.id || !item.label || !item.page) {
                throw new Error('Invalid navigation item');
            }

            this.navigationSections[sectionName].items.push(item);
            this.emitEvent('navigationItemAdded', { sectionName, item });

            console.log(`✅ Navigation item added to ${sectionName}`);

        } catch (error) {
            console.error('❌ Failed to add navigation item:', error);
        }
    }

    /**
     * Remove navigation item from a section
     * 
     * @param {string} sectionName - Section name
     * @param {string} itemId - Item identifier
     */
    removeNavigationItem(sectionName, itemId) {
        try {
            if (!this.navigationSections[sectionName]) {
                throw new Error(`Section "${sectionName}" not found`);
            }

            const index = this.navigationSections[sectionName].items.findIndex(
                item => item.id === itemId
            );

            if (index === -1) {
                throw new Error(`Item "${itemId}" not found in section`);
            }

            const removedItem = this.navigationSections[sectionName].items.splice(index, 1)[0];
            this.emitEvent('navigationItemRemoved', { sectionName, itemId, removedItem });

            console.log(`✅ Navigation item removed from ${sectionName}`);

        } catch (error) {
            console.error('❌ Failed to remove navigation item:', error);
        }
    }

    /**
     * Check if component is initialized
     * 
     * @returns {boolean} True if initialized successfully
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Destroy component and cleanup resources
     */
    destroy() {
        try {
            // Remove event listeners
            if (this.navItems) {
                this.navItems.forEach(item => {
                    item.removeEventListener('click', this.handleNavItemClick);
                    item.removeEventListener('keydown', this.handleNavItemClick);
                });
            }

            if (this.logoutBtn) {
                this.logoutBtn.removeEventListener('click', this.handleLogout);
            }

            if (this.navToggle) {
                this.navToggle.removeEventListener('click', this.closeMobileMenu);
            }

            window.removeEventListener('resize', this.handleWindowResize);

            // Clear event listeners map
            this.eventListeners.clear();

            // Clear references
            this.container = null;
            this.navMenu = null;
            this.navFooter = null;
            this.logoutBtn = null;
            this.navToggle = null;
            this.navItems = null;
            this.mainContent = null;
            this.navigationController = null;
            this.userProfileSummary = null;

            this.isInitialized = false;
            console.log('✅ SideNavigationTray destroyed successfully');

        } catch (error) {
            console.error('❌ Failed to destroy SideNavigationTray:', error);
        }
    }
}

// Export for global access
window.SideNavigationTray = SideNavigationTray;

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SideNavigationTray;
}

console.log('🧭 SideNavigationTray module loaded successfully');
