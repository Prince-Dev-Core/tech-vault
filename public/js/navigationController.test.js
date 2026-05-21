/**
 * Unit Tests for NavigationController
 * Tests navigation state management, page transitions, and mobile navigation
 * 
 * Validates: Requirements 4.6, 6.2, 13.1
 */

// Import NavigationController
const NavigationController = require('./navigationController.js');

describe('NavigationController', () => {
    let navigationController;
    let mockDOM;

    beforeEach(() => {
        // Create mock DOM structure
        document.body.innerHTML = `
            <nav class="side-nav" id="sideNav">
                <div class="nav-header">
                    <div class="nav-brand">TechVault</div>
                    <button class="nav-toggle" id="navToggle">×</button>
                </div>
                <div class="nav-menu">
                    <div class="nav-section">
                        <a class="nav-item active" data-page="dashboard" href="#dashboard">
                            <i class="fas fa-home"></i>
                            <span>Dashboard</span>
                        </a>
                        <a class="nav-item" data-page="tools" href="#tools">
                            <i class="fas fa-tools"></i>
                            <span>Tools</span>
                        </a>
                        <a class="nav-item" data-page="orders" href="#orders">
                            <i class="fas fa-shopping-bag"></i>
                            <span>Orders</span>
                        </a>
                        <a class="nav-item" data-page="profile" href="#profile">
                            <i class="fas fa-user"></i>
                            <span>Profile</span>
                        </a>
                        <a class="nav-item" data-page="settings" href="#settings">
                            <i class="fas fa-cog"></i>
                            <span>Settings</span>
                        </a>
                    </div>
                </div>
                <div class="nav-footer">
                    <button class="logout-btn" id="logoutBtn">Log Out</button>
                </div>
            </nav>
            <main class="main-content" id="mainContent">
                <div class="top-bar">
                    <h1 class="page-title" id="pageTitle">Dashboard</h1>
                    <div class="top-actions">
                        <button class="mobile-nav-toggle" id="mobileNavToggle">
                            <i class="fas fa-bars"></i>
                        </button>
                    </div>
                </div>
                <div class="content-header">
                    <div class="search-filter-bar">
                        <div class="search-box">
                            <input type="text" class="search-input" id="searchInput" placeholder="Search...">
                        </div>
                        <select class="filter-dropdown" id="categoryFilter">
                            <option value="">All Categories</option>
                        </select>
                    </div>
                </div>
                <div class="content-body">
                    <div class="section-title">
                        <span id="sectionTitle">Featured Tools</span>
                    </div>
                    <div class="items-grid" id="itemsGrid">
                        <!-- Items will be loaded here -->
                    </div>
                </div>
            </main>
            <div class="nav-overlay" id="navOverlay"></div>
        `;

        // Create navigation controller instance
        navigationController = new NavigationController();
    });

    afterEach(() => {
        // Clean up
        if (navigationController) {
            navigationController.destroy();
        }
        document.body.innerHTML = '';
    });

    describe('Initialization', () => {
        test('should initialize successfully with valid DOM elements', () => {
            navigationController.initialize();
            expect(navigationController.isInitialized).toBe(true);
        });

        test('should cache DOM elements on initialization', () => {
            navigationController.initialize();
            expect(navigationController.elements.sideNav).toBeTruthy();
            expect(navigationController.elements.mainContent).toBeTruthy();
            expect(navigationController.elements.pageTitle).toBeTruthy();
        });

        test('should not initialize twice', () => {
            navigationController.initialize();
            const firstInit = navigationController.isInitialized;
            navigationController.initialize();
            expect(navigationController.isInitialized).toBe(firstInit);
        });

        test('should fail gracefully if required DOM elements are missing', () => {
            document.getElementById('sideNav').remove();
            navigationController.initialize();
            expect(navigationController.isInitialized).toBe(false);
        });
    });

    describe('Page Navigation', () => {
        beforeEach(() => {
            navigationController.initialize();
        });

        test('should navigate to a valid page', () => {
            navigationController.navigateToPage('tools');
            expect(navigationController.getCurrentPage()).toBe('tools');
        });

        test('should update active state when navigating', () => {
            navigationController.navigateToPage('tools');
            const activeItem = document.querySelector('[data-page="tools"]');
            expect(activeItem.classList.contains('active')).toBe(true);
        });

        test('should remove active state from previous page', () => {
            navigationController.navigateToPage('tools');
            navigationController.navigateToPage('orders');
            
            const toolsItem = document.querySelector('[data-page="tools"]');
            const ordersItem = document.querySelector('[data-page="orders"]');
            
            expect(toolsItem.classList.contains('active')).toBe(false);
            expect(ordersItem.classList.contains('active')).toBe(true);
        });

        test('should update page title on navigation', () => {
            navigationController.navigateToPage('tools');
            expect(document.getElementById('pageTitle').textContent).toBe('All Tools');
        });

        test('should not navigate to invalid page', () => {
            const currentPage = navigationController.getCurrentPage();
            navigationController.navigateToPage('invalid-page');
            expect(navigationController.getCurrentPage()).toBe(currentPage);
        });

        test('should prevent navigation to same page', () => {
            navigationController.navigateToPage('dashboard');
            const previousPage = navigationController.getPreviousPage();
            navigationController.navigateToPage('dashboard');
            expect(navigationController.getPreviousPage()).toBe(previousPage);
        });

        test('should track previous page', () => {
            navigationController.navigateToPage('tools');
            navigationController.navigateToPage('orders');
            expect(navigationController.getPreviousPage()).toBe('tools');
        });

        test('should update URL hash on navigation', () => {
            navigationController.navigateToPage('profile');
            expect(window.location.hash).toBe('#profile');
        });

        test('should reset scroll position on navigation', () => {
            const contentBody = document.querySelector('.content-body');
            contentBody.scrollTop = 100;
            navigationController.navigateToPage('tools');
            expect(contentBody.scrollTop).toBe(0);
        });

        test('should close mobile menu on navigation', () => {
            navigationController.openMobileMenu();
            expect(navigationController.isMobileMenuOpen()).toBe(true);
            navigationController.navigateToPage('tools');
            expect(navigationController.isMobileMenuOpen()).toBe(false);
        });
    });

    describe('Active State Management', () => {
        beforeEach(() => {
            navigationController.initialize();
        });

        test('should update active state for specified item', () => {
            navigationController.updateActiveState('tools');
            const activeItem = document.querySelector('[data-page="tools"]');
            expect(activeItem.classList.contains('active')).toBe(true);
        });

        test('should remove active state from all other items', () => {
            navigationController.updateActiveState('tools');
            const allItems = document.querySelectorAll('.nav-item');
            let activeCount = 0;
            allItems.forEach(item => {
                if (item.classList.contains('active')) {
                    activeCount++;
                }
            });
            expect(activeCount).toBe(1);
        });

        test('should handle active state for all page types', () => {
            const pages = ['dashboard', 'tools', 'orders', 'profile', 'settings'];
            pages.forEach(page => {
                navigationController.updateActiveState(page);
                const activeItem = document.querySelector(`[data-page="${page}"]`);
                expect(activeItem.classList.contains('active')).toBe(true);
            });
        });
    });

    describe('Mobile Navigation', () => {
        beforeEach(() => {
            navigationController.initialize();
        });

        test('should open mobile menu', () => {
            navigationController.openMobileMenu();
            expect(navigationController.isMobileMenuOpen()).toBe(true);
            expect(document.getElementById('sideNav').classList.contains('mobile-open')).toBe(true);
            expect(document.getElementById('navOverlay').classList.contains('active')).toBe(true);
        });

        test('should close mobile menu', () => {
            navigationController.openMobileMenu();
            navigationController.closeMobileMenu();
            expect(navigationController.isMobileMenuOpen()).toBe(false);
            expect(document.getElementById('sideNav').classList.contains('mobile-open')).toBe(false);
            expect(document.getElementById('navOverlay').classList.contains('active')).toBe(false);
        });

        test('should toggle mobile menu', () => {
            navigationController.toggleMobileMenu();
            expect(navigationController.isMobileMenuOpen()).toBe(true);
            navigationController.toggleMobileMenu();
            expect(navigationController.isMobileMenuOpen()).toBe(false);
        });

        test('should emit mobileMenuToggle event when opening', (done) => {
            navigationController.addEventListener('mobileMenuToggle', (data) => {
                expect(data.isOpen).toBe(true);
                done();
            });
            navigationController.openMobileMenu();
        });

        test('should emit mobileMenuToggle event when closing', (done) => {
            navigationController.openMobileMenu();
            navigationController.addEventListener('mobileMenuToggle', (data) => {
                expect(data.isOpen).toBe(false);
                done();
            });
            navigationController.closeMobileMenu();
        });
    });

    describe('Event Listeners', () => {
        beforeEach(() => {
            navigationController.initialize();
        });

        test('should emit pageChange event on navigation', (done) => {
            navigationController.addEventListener('pageChange', (data) => {
                expect(data.currentPage).toBe('tools');
                expect(data.previousPage).toBe('dashboard');
                done();
            });
            navigationController.navigateToPage('tools');
        });

        test('should emit navigationStateChange event on active state update', (done) => {
            navigationController.addEventListener('navigationStateChange', (data) => {
                expect(data.activePage).toBe('tools');
                done();
            });
            navigationController.updateActiveState('tools');
        });

        test('should support multiple event listeners', () => {
            let count = 0;
            navigationController.addEventListener('pageChange', () => count++);
            navigationController.addEventListener('pageChange', () => count++);
            navigationController.navigateToPage('tools');
            expect(count).toBe(2);
        });

        test('should remove event listener', () => {
            let count = 0;
            const callback = () => count++;
            navigationController.addEventListener('pageChange', callback);
            navigationController.removeEventListener('pageChange', callback);
            navigationController.navigateToPage('tools');
            expect(count).toBe(0);
        });

        test('should handle errors in event listeners gracefully', () => {
            navigationController.addEventListener('pageChange', () => {
                throw new Error('Test error');
            });
            navigationController.addEventListener('pageChange', () => {
                // This should still be called
            });
            expect(() => navigationController.navigateToPage('tools')).not.toThrow();
        });
    });

    describe('Navigation State', () => {
        beforeEach(() => {
            navigationController.initialize();
        });

        test('should return current navigation state', () => {
            navigationController.navigateToPage('tools');
            const state = navigationController.getNavigationState();
            expect(state.currentPage).toBe('tools');
            expect(state.previousPage).toBe('dashboard');
            expect(state.sidebarCollapsed).toBe(false);
            expect(state.mobileMenuOpen).toBe(false);
        });

        test('should get current page', () => {
            navigationController.navigateToPage('orders');
            expect(navigationController.getCurrentPage()).toBe('orders');
        });

        test('should get previous page', () => {
            navigationController.navigateToPage('tools');
            navigationController.navigateToPage('orders');
            expect(navigationController.getPreviousPage()).toBe('tools');
        });

        test('should get page configuration', () => {
            const config = navigationController.getPageConfig('tools');
            expect(config.title).toBe('All Tools');
            expect(config.icon).toBe('fa-tools');
        });

        test('should return null for invalid page configuration', () => {
            const config = navigationController.getPageConfig('invalid');
            expect(config).toBeNull();
        });
    });

    describe('Content Caching', () => {
        beforeEach(() => {
            navigationController.initialize();
        });

        test('should cache content for a page', () => {
            const content = '<div>Test Content</div>';
            navigationController.cacheContent('tools', content);
            expect(navigationController.getCachedContent('tools')).toBe(content);
        });

        test('should return null for uncached page', () => {
            expect(navigationController.getCachedContent('tools')).toBeNull();
        });

        test('should clear content cache', () => {
            navigationController.cacheContent('tools', '<div>Test</div>');
            navigationController.clearContentCache();
            expect(navigationController.getCachedContent('tools')).toBeNull();
        });

        test('should cache multiple pages', () => {
            navigationController.cacheContent('tools', '<div>Tools</div>');
            navigationController.cacheContent('orders', '<div>Orders</div>');
            expect(navigationController.getCachedContent('tools')).toBe('<div>Tools</div>');
            expect(navigationController.getCachedContent('orders')).toBe('<div>Orders</div>');
        });
    });

    describe('Sidebar Management', () => {
        beforeEach(() => {
            navigationController.initialize();
        });

        test('should toggle sidebar on desktop', () => {
            // Mock desktop viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1024
            });

            navigationController.toggleSidebar();
            expect(navigationController.isSidebarCollapsed()).toBe(true);
            expect(document.getElementById('sideNav').classList.contains('collapsed')).toBe(true);
        });

        test('should not toggle sidebar on mobile', () => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 500
            });

            navigationController.toggleSidebar();
            expect(navigationController.isSidebarCollapsed()).toBe(false);
        });

        test('should check if sidebar is collapsed', () => {
            expect(navigationController.isSidebarCollapsed()).toBe(false);
        });
    });

    describe('Cleanup', () => {
        beforeEach(() => {
            navigationController.initialize();
        });

        test('should destroy navigation controller', () => {
            navigationController.destroy();
            expect(navigationController.isInitialized).toBe(false);
        });

        test('should clear event listeners on destroy', () => {
            let count = 0;
            navigationController.addEventListener('pageChange', () => count++);
            navigationController.destroy();
            navigationController.navigateToPage('tools');
            expect(count).toBe(0);
        });

        test('should clear content cache on destroy', () => {
            navigationController.cacheContent('tools', '<div>Test</div>');
            navigationController.destroy();
            expect(navigationController.getCachedContent('tools')).toBeNull();
        });
    });

    describe('Page Configuration', () => {
        test('should have all required pages configured', () => {
            const requiredPages = [
                'dashboard', 'tools', 'orders', 'cybersecurity',
                'webdev', 'automation', 'devops', 'profile', 'settings'
            ];
            requiredPages.forEach(page => {
                expect(navigationController.pageConfig[page]).toBeDefined();
            });
        });

        test('should have correct page titles', () => {
            expect(navigationController.pageConfig.dashboard.title).toBe('Dashboard');
            expect(navigationController.pageConfig.tools.title).toBe('All Tools');
            expect(navigationController.pageConfig.profile.title).toBe('My Profile');
        });

        test('should have correct page icons', () => {
            expect(navigationController.pageConfig.dashboard.icon).toBe('fa-home');
            expect(navigationController.pageConfig.tools.icon).toBe('fa-tools');
            expect(navigationController.pageConfig.profile.icon).toBe('fa-user');
        });

        test('should have correct page sections', () => {
            expect(navigationController.pageConfig.dashboard.section).toBe('main');
            expect(navigationController.pageConfig.cybersecurity.section).toBe('categories');
            expect(navigationController.pageConfig.profile.section).toBe('account');
        });
    });

    describe('Loading States', () => {
        beforeEach(() => {
            navigationController.initialize();
        });

        test('should show loading state', () => {
            navigationController.showLoadingState();
            const loading = document.querySelector('.loading');
            expect(loading).toBeTruthy();
            expect(loading.textContent).toContain('Loading content');
        });

        test('should reset scroll position', () => {
            const contentBody = document.querySelector('.content-body');
            contentBody.scrollTop = 500;
            navigationController.resetScrollPosition();
            expect(contentBody.scrollTop).toBe(0);
        });
    });

    describe('Logout Functionality - Requirement 12.1, 12.2, 12.3, 12.4, 12.5', () => {
        beforeEach(() => {
            navigationController.initialize();
            navigationController.setupEventListeners();
            
            // Mock the authentication system
            window.AuthSystem = {
                logout: jest.fn().mockResolvedValue(undefined)
            };
            
            // Add logout confirmation dialog to DOM
            const dialog = document.createElement('dialog');
            dialog.id = 'logoutConfirmDialog';
            dialog.className = 'logout-confirm-dialog';
            dialog.innerHTML = `
                <div class="logout-confirm-content">
                    <div class="logout-confirm-header">
                        <i class="fas fa-sign-out-alt"></i>
                        <h2>Confirm Logout</h2>
                    </div>
                    <div class="logout-confirm-body">
                        <p>Are you sure you want to log out?</p>
                        <p class="logout-confirm-note">You will be redirected to the homepage and your session will be securely terminated.</p>
                    </div>
                    <div class="logout-confirm-actions">
                        <button class="cancel-logout-btn" aria-label="Cancel logout">
                            <i class="fas fa-times"></i>
                            <span>Cancel</span>
                        </button>
                        <button class="confirm-logout-btn" aria-label="Confirm logout">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            `;
            dialog.showModal = jest.fn();
            dialog.close = jest.fn();
            document.body.appendChild(dialog);
        });

        afterEach(() => {
            const dialog = document.getElementById('logoutConfirmDialog');
            if (dialog) {
                dialog.remove();
            }
            delete window.AuthSystem;
        });

        test('should show logout confirmation dialog when logout button is clicked', () => {
            const logoutBtn = document.getElementById('logoutBtn');
            const dialog = document.getElementById('logoutConfirmDialog');
            
            logoutBtn.click();
            
            expect(dialog.showModal).toHaveBeenCalled();
        });

        test('should position logout button at bottom of navigation', () => {
            const logoutBtn = document.getElementById('logoutBtn');
            const navFooter = document.querySelector('.nav-footer');
            
            expect(navFooter.contains(logoutBtn)).toBe(true);
        });

        test('should have proper styling for logout button', () => {
            const logoutBtn = document.getElementById('logoutBtn');
            
            expect(logoutBtn.classList.contains('logout-btn')).toBe(true);
        });

        test('should have handleLogout method', () => {
            expect(typeof navigationController.handleLogout).toBe('function');
        });

        test('should have confirmLogout method', () => {
            expect(typeof navigationController.confirmLogout).toBe('function');
        });

        test('should have fallbackLogout method', () => {
            expect(typeof navigationController.fallbackLogout).toBe('function');
        });

        test('should call handleLogout when logout button is clicked', () => {
            const handleLogoutSpy = jest.spyOn(navigationController, 'handleLogout');
            const logoutBtn = document.getElementById('logoutBtn');
            
            logoutBtn.click();
            
            expect(handleLogoutSpy).toHaveBeenCalled();
            handleLogoutSpy.mockRestore();
        });
    });
});
