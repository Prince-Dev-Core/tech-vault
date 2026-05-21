/**
 * Unit Tests for SideNavigationTray Class
 * Tests navigation sections, feature links, mobile responsiveness, and active state management
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5
 */

// Import the SideNavigationTray class
const SideNavigationTray = require('./sideNavigationTray');

describe('SideNavigationTray', () => {
    let sideNavigationTray;
    let mockNavigationController;
    let mockUserProfileSummary;
    let container;

    beforeEach(() => {
        // Create mock DOM structure
        document.body.innerHTML = `
            <nav class="side-nav" id="sideNav">
                <div class="nav-header">
                    <div class="nav-brand">TechVault</div>
                    <button class="nav-toggle">×</button>
                </div>
                <div class="user-profile" id="userProfile">
                    <div class="profile-info">
                        <div class="profile-avatar" id="profileAvatar">U</div>
                        <div class="profile-details">
                            <h3 id="profileName">User Name</h3>
                            <p id="profileEmail">user@email.com</p>
                        </div>
                    </div>
                </div>
                <div class="nav-menu">
                    <div class="nav-section">
                        <div class="nav-section-title">Main</div>
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
                    </div>
                    <div class="nav-section">
                        <div class="nav-section-title">Categories</div>
                        <a class="nav-item" data-page="cybersecurity" href="#cybersecurity">
                            <i class="fas fa-shield-alt"></i>
                            <span>Cybersecurity</span>
                        </a>
                        <a class="nav-item" data-page="webdev" href="#webdev">
                            <i class="fas fa-code"></i>
                            <span>Web Development</span>
                        </a>
                        <a class="nav-item" data-page="automation" href="#automation">
                            <i class="fas fa-robot"></i>
                            <span>Automation</span>
                        </a>
                        <a class="nav-item" data-page="devops" href="#devops">
                            <i class="fas fa-server"></i>
                            <span>DevOps</span>
                        </a>
                    </div>
                    <div class="nav-section">
                        <div class="nav-section-title">Account</div>
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
                    <button class="logout-btn" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Log Out</span>
                    </button>
                </div>
            </nav>
            <div class="nav-overlay" id="navOverlay"></div>
            <main class="main-content" id="mainContent"></main>
        `;

        // Create mock navigation controller
        mockNavigationController = {
            navigateToPage: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            emitEvent: jest.fn()
        };

        // Create mock user profile summary
        mockUserProfileSummary = {
            getUserData: jest.fn(() => ({
                username: 'testuser',
                email: 'test@example.com'
            }))
        };

        // Initialize SideNavigationTray
        sideNavigationTray = new SideNavigationTray({
            navigationController: mockNavigationController,
            userProfileSummary: mockUserProfileSummary
        });

        container = document.getElementById('sideNav');
    });

    afterEach(() => {
        if (sideNavigationTray) {
            sideNavigationTray.destroy();
        }
        document.body.innerHTML = '';
    });

    describe('Initialization', () => {
        test('should initialize successfully with required DOM elements', () => {
            expect(sideNavigationTray.isReady()).toBe(true);
            expect(sideNavigationTray.isInitialized).toBe(true);
        });

        test('should cache all required DOM elements', () => {
            expect(sideNavigationTray.container).toBeTruthy();
            expect(sideNavigationTray.navMenu).toBeTruthy();
            expect(sideNavigationTray.navFooter).toBeTruthy();
            expect(sideNavigationTray.logoutBtn).toBeTruthy();
        });

        test('should set initial active page to dashboard', () => {
            expect(sideNavigationTray.getCurrentActivePage()).toBe('dashboard');
        });

        test('should fail gracefully if required elements are missing', () => {
            document.body.innerHTML = '';
            const invalidTray = new SideNavigationTray();
            expect(invalidTray.isReady()).toBe(false);
        });
    });

    describe('Navigation Sections - Requirement 4.1, 4.2', () => {
        test('should have organized navigation sections', () => {
            const sections = sideNavigationTray.getAllNavigationSections();
            expect(sections).toHaveProperty('main');
            expect(sections).toHaveProperty('categories');
            expect(sections).toHaveProperty('account');
        });

        test('should have correct items in Main section', () => {
            const mainSection = sideNavigationTray.getNavigationSection('main');
            expect(mainSection.items).toHaveLength(3);
            expect(mainSection.items[0].page).toBe('dashboard');
            expect(mainSection.items[1].page).toBe('tools');
            expect(mainSection.items[2].page).toBe('orders');
        });

        test('should have correct items in Categories section', () => {
            const categoriesSection = sideNavigationTray.getNavigationSection('categories');
            expect(categoriesSection.items).toHaveLength(4);
            expect(categoriesSection.items.map(item => item.page)).toEqual([
                'cybersecurity',
                'webdev',
                'automation',
                'devops'
            ]);
        });

        test('should have correct items in Account section', () => {
            const accountSection = sideNavigationTray.getNavigationSection('account');
            expect(accountSection.items).toHaveLength(2);
            expect(accountSection.items[0].page).toBe('profile');
            expect(accountSection.items[1].page).toBe('settings');
        });

        test('should retrieve navigation item by page identifier', () => {
            const item = sideNavigationTray.getNavigationItem('cybersecurity');
            expect(item).toBeTruthy();
            expect(item.label).toBe('Cybersecurity');
            expect(item.icon).toBe('fas fa-shield-alt');
        });
    });

    describe('Feature Links - Requirement 4.1, 4.2', () => {
        test('should have feature links for all platform sections', () => {
            const allItems = [];
            Object.values(sideNavigationTray.getAllNavigationSections()).forEach(section => {
                allItems.push(...section.items);
            });

            expect(allItems.length).toBeGreaterThan(0);
            expect(allItems.some(item => item.page === 'dashboard')).toBe(true);
            expect(allItems.some(item => item.page === 'profile')).toBe(true);
            expect(allItems.some(item => item.page === 'settings')).toBe(true);
        });

        test('should have icons for all feature links', () => {
            const allItems = [];
            Object.values(sideNavigationTray.getAllNavigationSections()).forEach(section => {
                allItems.push(...section.items);
            });

            allItems.forEach(item => {
                expect(item.icon).toBeTruthy();
                expect(item.icon).toMatch(/^fas fa-/);
            });
        });
    });

    describe('App Settings Access - Requirement 4.3', () => {
        test('should have settings link in Account section', () => {
            const accountSection = sideNavigationTray.getNavigationSection('account');
            const settingsItem = accountSection.items.find(item => item.page === 'settings');
            expect(settingsItem).toBeTruthy();
            expect(settingsItem.label).toBe('Settings');
        });

        test('should navigate to settings when settings link is clicked', () => {
            const settingsLink = container.querySelector('[data-page="settings"]');
            settingsLink.click();
            expect(mockNavigationController.navigateToPage).toHaveBeenCalledWith('settings');
        });
    });

    describe('Log Out Button Positioning - Requirement 4.3', () => {
        test('should have logout button in nav footer', () => {
            expect(sideNavigationTray.logoutBtn).toBeTruthy();
            expect(sideNavigationTray.logoutBtn.classList.contains('logout-btn')).toBe(true);
        });

        test('should position logout button at bottom of navigation', () => {
            const footer = container.querySelector('.nav-footer');
            expect(footer.contains(sideNavigationTray.logoutBtn)).toBe(true);
        });

        test('should show confirmation dialog on logout click', () => {
            window.confirm = jest.fn(() => false);
            sideNavigationTray.logoutBtn.click();
            expect(window.confirm).toHaveBeenCalled();
        });

        test('should clear session data on logout confirmation', () => {
            window.confirm = jest.fn(() => true);
            window.location.href = '/';
            
            sideNavigationTray.logoutBtn.click();
            
            expect(sessionStorage.getItem('authToken')).toBeNull();
            expect(sessionStorage.getItem('userData')).toBeNull();
        });
    });

    describe('Active State Management - Requirement 4.4, 4.5', () => {
        test('should update active state when navigation item is clicked', () => {
            const toolsLink = container.querySelector('[data-page="tools"]');
            toolsLink.click();
            
            expect(sideNavigationTray.getCurrentActivePage()).toBe('tools');
            expect(toolsLink.classList.contains('active')).toBe(true);
        });

        test('should remove active class from previous item', () => {
            const dashboardLink = container.querySelector('[data-page="dashboard"]');
            const toolsLink = container.querySelector('[data-page="tools"]');
            
            expect(dashboardLink.classList.contains('active')).toBe(true);
            
            toolsLink.click();
            
            expect(dashboardLink.classList.contains('active')).toBe(false);
            expect(toolsLink.classList.contains('active')).toBe(true);
        });

        test('should set aria-current attribute on active item', () => {
            const toolsLink = container.querySelector('[data-page="tools"]');
            toolsLink.click();
            
            expect(toolsLink.getAttribute('aria-current')).toBe('page');
        });

        test('should update active state from navigation controller events', () => {
            const pageChangeCallback = mockNavigationController.addEventListener.mock.calls.find(
                call => call[0] === 'pageChange'
            )[1];

            pageChangeCallback({ currentPage: 'orders' });

            expect(sideNavigationTray.getCurrentActivePage()).toBe('orders');
            const ordersLink = container.querySelector('[data-page="orders"]');
            expect(ordersLink.classList.contains('active')).toBe(true);
        });
    });

    describe('Collapsible Behavior - Requirement 4.5', () => {
        test('should toggle sidebar collapse state on desktop', () => {
            // Mock desktop screen size
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1024
            });

            expect(sideNavigationTray.isSidebarCollapsed()).toBe(false);
            
            sideNavigationTray.toggleSidebar();
            
            expect(sideNavigationTray.isSidebarCollapsed()).toBe(true);
            expect(container.classList.contains('collapsed')).toBe(true);
        });

        test('should not toggle sidebar on mobile', () => {
            // Mock mobile screen size
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 480
            });

            sideNavigationTray.toggleSidebar();
            
            expect(sideNavigationTray.isSidebarCollapsed()).toBe(false);
        });

        test('should open mobile menu on mobile devices', () => {
            // Mock mobile screen size
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 480
            });

            sideNavigationTray.openMobileMenu();
            
            expect(sideNavigationTray.isMobileMenuOpen()).toBe(true);
            expect(container.classList.contains('mobile-open')).toBe(true);
        });

        test('should close mobile menu', () => {
            // Mock mobile screen size
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 480
            });

            sideNavigationTray.openMobileMenu();
            expect(sideNavigationTray.isMobileMenuOpen()).toBe(true);
            
            sideNavigationTray.closeMobileMenu();
            
            expect(sideNavigationTray.isMobileMenuOpen()).toBe(false);
            expect(container.classList.contains('mobile-open')).toBe(false);
        });

        test('should toggle mobile menu', () => {
            // Mock mobile screen size
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 480
            });

            expect(sideNavigationTray.isMobileMenuOpen()).toBe(false);
            
            sideNavigationTray.toggleMobileMenu();
            expect(sideNavigationTray.isMobileMenuOpen()).toBe(true);
            
            sideNavigationTray.toggleMobileMenu();
            expect(sideNavigationTray.isMobileMenuOpen()).toBe(false);
        });

        test('should close mobile menu when navigation item is clicked', () => {
            // Mock mobile screen size
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 480
            });

            sideNavigationTray.openMobileMenu();
            expect(sideNavigationTray.isMobileMenuOpen()).toBe(true);
            
            const toolsLink = container.querySelector('[data-page="tools"]');
            toolsLink.click();
            
            expect(sideNavigationTray.isMobileMenuOpen()).toBe(false);
        });
    });

    describe('Integration with NavigationController - Requirement 4.1, 4.5', () => {
        test('should initialize with navigation controller', () => {
            expect(sideNavigationTray.navigationController).toBe(mockNavigationController);
        });

        test('should call navigation controller navigateToPage on item click', () => {
            const toolsLink = container.querySelector('[data-page="tools"]');
            toolsLink.click();
            
            expect(mockNavigationController.navigateToPage).toHaveBeenCalledWith('tools');
        });

        test('should listen to navigation controller page change events', () => {
            expect(mockNavigationController.addEventListener).toHaveBeenCalledWith(
                'pageChange',
                expect.any(Function)
            );
        });
    });

    describe('Event Handling', () => {
        test('should emit navigationItemClicked event', (done) => {
            sideNavigationTray.addEventListener('navigationItemClicked', (data) => {
                expect(data.page).toBe('tools');
                done();
            });

            const toolsLink = container.querySelector('[data-page="tools"]');
            toolsLink.click();
        });

        test('should emit activeStateUpdated event', (done) => {
            sideNavigationTray.addEventListener('activeStateUpdated', (data) => {
                expect(data.activePage).toBe('orders');
                done();
            });

            const ordersLink = container.querySelector('[data-page="orders"]');
            ordersLink.click();
        });

        test('should emit logoutRequested event', (done) => {
            window.confirm = jest.fn(() => true);
            
            sideNavigationTray.addEventListener('logoutRequested', () => {
                done();
            });

            sideNavigationTray.logoutBtn.click();
        });

        test('should emit mobileMenuOpened event', (done) => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 480
            });

            sideNavigationTray.addEventListener('mobileMenuOpened', () => {
                done();
            });

            sideNavigationTray.openMobileMenu();
        });

        test('should emit mobileMenuClosed event', (done) => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 480
            });

            sideNavigationTray.openMobileMenu();

            sideNavigationTray.addEventListener('mobileMenuClosed', () => {
                done();
            });

            sideNavigationTray.closeMobileMenu();
        });
    });

    describe('Navigation State Management', () => {
        test('should return current navigation state', () => {
            const state = sideNavigationTray.getNavigationState();
            
            expect(state).toHaveProperty('currentActivePage');
            expect(state).toHaveProperty('isCollapsed');
            expect(state).toHaveProperty('isMobileOpen');
            expect(state).toHaveProperty('isInitialized');
        });

        test('should update navigation sections dynamically', () => {
            const newSections = {
                main: {
                    title: 'Main',
                    items: [
                        { id: 'home', label: 'Home', icon: 'fas fa-home', page: 'home' }
                    ]
                }
            };

            sideNavigationTray.updateNavigationSections(newSections);
            
            const mainSection = sideNavigationTray.getNavigationSection('main');
            expect(mainSection.items).toHaveLength(1);
            expect(mainSection.items[0].page).toBe('home');
        });

        test('should add navigation item to section', () => {
            const newItem = {
                id: 'analytics',
                label: 'Analytics',
                icon: 'fas fa-chart-bar',
                page: 'analytics'
            };

            sideNavigationTray.addNavigationItem('main', newItem);
            
            const mainSection = sideNavigationTray.getNavigationSection('main');
            expect(mainSection.items).toHaveLength(4);
            expect(mainSection.items[3]).toEqual(newItem);
        });

        test('should remove navigation item from section', () => {
            sideNavigationTray.removeNavigationItem('main', 'tools');
            
            const mainSection = sideNavigationTray.getNavigationSection('main');
            expect(mainSection.items).toHaveLength(2);
            expect(mainSection.items.some(item => item.id === 'tools')).toBe(false);
        });
    });

    describe('Accessibility', () => {
        test('should have keyboard support for navigation items', () => {
            const toolsLink = container.querySelector('[data-page="tools"]');
            const keydownEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            
            toolsLink.dispatchEvent(keydownEvent);
            
            expect(sideNavigationTray.getCurrentActivePage()).toBe('tools');
        });

        test('should have aria-current attribute for active items', () => {
            const dashboardLink = container.querySelector('[data-page="dashboard"]');
            expect(dashboardLink.getAttribute('aria-current')).toBe('page');
        });

        test('should have proper ARIA labels', () => {
            const navItems = container.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                expect(item.getAttribute('aria-current')).toBeTruthy();
            });
        });
    });

    describe('Cleanup', () => {
        test('should destroy component and cleanup resources', () => {
            sideNavigationTray.destroy();
            
            expect(sideNavigationTray.isInitialized).toBe(false);
            expect(sideNavigationTray.container).toBeNull();
            expect(sideNavigationTray.navMenu).toBeNull();
        });

        test('should remove event listeners on destroy', () => {
            const initialListenerCount = sideNavigationTray.eventListeners.size;
            
            sideNavigationTray.destroy();
            
            expect(sideNavigationTray.eventListeners.size).toBe(0);
        });
    });
});
