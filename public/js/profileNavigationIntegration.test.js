/**
 * Integration Tests for UserProfileSummary and SideNavigationTray
 * Tests the combined functionality of profile and navigation components
 * 
 * Validates: Requirements 4.1, 5.1, 13.1
 */

// Import the components
require('./userProfileSummary.js');
require('./sideNavigationTray.js');

describe('Profile and Navigation Integration Tests', () => {
    let userProfileSummary;
    let sideNavigationTray;
    let mockSessionManager;
    let mockNavigationController;

    beforeEach(() => {
        // Create comprehensive mock DOM structure
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

        // Create mock SessionManager
        mockSessionManager = {
            getUserData: jest.fn(() => ({
                username: 'john_doe',
                email: 'john@example.com',
                fullName: 'John Doe'
            })),
            updateUserData: jest.fn(),
            getAuthToken: jest.fn(() => 'mock-token'),
            clearAuthData: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };

        // Create mock NavigationController
        mockNavigationController = {
            navigateToPage: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            emitEvent: jest.fn()
        };

        // Set global mocks
        window.sessionManager = mockSessionManager;
        window.navigationController = mockNavigationController;
    });

    afterEach(() => {
        if (userProfileSummary) {
            userProfileSummary.destroy();
        }
        if (sideNavigationTray) {
            sideNavigationTray.destroy();
        }
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    // ===== PROFILE SUMMARY DISPLAY TESTS =====
    describe('Profile Summary Display with Various User Data', () => {
        test('should display profile with complete user data', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com',
                fullName: 'John Doe'
            });

            userProfileSummary = new UserProfileSummary();

            const nameElement = document.querySelector('#profileName');
            const emailElement = document.querySelector('#profileEmail');
            const avatarElement = document.querySelector('#profileAvatar');

            expect(nameElement.textContent).toBe('John Doe');
            expect(emailElement.textContent).toBe('john@example.com');
            expect(avatarElement.textContent).toBe('JD');
        });

        test('should display profile with minimal user data', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'jane_smith'
            });

            userProfileSummary = new UserProfileSummary();

            const nameElement = document.querySelector('#profileName');
            const emailElement = document.querySelector('#profileEmail');

            expect(nameElement.textContent).toBe('jane_smith');
            expect(emailElement.textContent).toBe('user@email.com');
        });

        test('should display profile with avatar image', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'user',
                email: 'user@example.com',
                fullName: 'Test User',
                avatar: 'https://example.com/avatar.jpg'
            });

            userProfileSummary = new UserProfileSummary();

            const avatarElement = document.querySelector('#profileAvatar');
            expect(avatarElement.style.backgroundImage).toContain('https://example.com/avatar.jpg');
        });

        test('should display profile with special characters in name', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'user',
                email: 'user@example.com',
                fullName: "O'Brien-Smith"
            });

            userProfileSummary = new UserProfileSummary();

            const nameElement = document.querySelector('#profileName');
            expect(nameElement.textContent).toBe("O'Brien-Smith");
        });

        test('should display profile with unicode characters', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'user',
                email: 'user@example.com',
                fullName: 'José García'
            });

            userProfileSummary = new UserProfileSummary();

            const nameElement = document.querySelector('#profileName');
            const avatarElement = document.querySelector('#profileAvatar');

            expect(nameElement.textContent).toBe('José García');
            expect(avatarElement.textContent).toBe('JG');
        });

        test('should display profile with very long email', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'user',
                email: 'very.long.email.address.with.many.parts@subdomain.example.com',
                fullName: 'User'
            });

            userProfileSummary = new UserProfileSummary();

            const emailElement = document.querySelector('#profileEmail');
            expect(emailElement.textContent).toBe('very.long.email.address.with.many.parts@subdomain.example.com');
            expect(emailElement.title).toBe('very.long.email.address.with.many.parts@subdomain.example.com');
        });

        test('should handle null user data gracefully', () => {
            mockSessionManager.getUserData.mockReturnValue(null);

            userProfileSummary = new UserProfileSummary();

            const nameElement = document.querySelector('#profileName');
            const emailElement = document.querySelector('#profileEmail');
            const avatarElement = document.querySelector('#profileAvatar');

            expect(nameElement.textContent).toBe('User');
            expect(emailElement.textContent).toBe('user@email.com');
            expect(avatarElement.textContent).toBe('U');
        });
    });

    // ===== NAVIGATION LINK ORGANIZATION AND ACCESSIBILITY =====
    describe('Navigation Link Organization and Accessibility', () => {
        test('should organize navigation links in logical sections', () => {
            sideNavigationTray = new SideNavigationTray({
                navigationController: mockNavigationController
            });

            const sections = sideNavigationTray.getAllNavigationSections();

            expect(sections).toHaveProperty('main');
            expect(sections).toHaveProperty('categories');
            expect(sections).toHaveProperty('account');

            expect(sections.main.items.length).toBeGreaterThan(0);
            expect(sections.categories.items.length).toBeGreaterThan(0);
            expect(sections.account.items.length).toBeGreaterThan(0);
        });

        test('should have proper ARIA labels for navigation items', () => {
            sideNavigationTray = new SideNavigationTray({
                navigationController: mockNavigationController
            });

            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                expect(item.getAttribute('aria-current')).toBeTruthy();
            });
        });

        test('should support keyboard navigation with Enter key', () => {
            sideNavigationTray = new SideNavigationTray({
                navigationController: mockNavigationController
            });

            const toolsLink = document.querySelector('[data-page="tools"]');
            const keydownEvent = new KeyboardEvent('keydown', { key: 'Enter' });

            toolsLink.dispatchEvent(keydownEvent);

            expect(mockNavigationController.navigateToPage).toHaveBeenCalledWith('tools');
        });

        test('should support keyboard navigation with Space key', () => {
            sideNavigationTray = new SideNavigationTray({
                navigationController: mockNavigationController
            });

            const toolsLink = document.querySelector('[data-page="tools"]');
            const keydownEvent = new KeyboardEvent('keydown', { key: ' ' });

            toolsLink.dispatchEvent(keydownEvent);

            expect(mockNavigationController.navigateToPage).toHaveBeenCalledWith('tools');
        });

        test('should have icons for all navigation items', () => {
            sideNavigationTray = new SideNavigationTray({
                navigationController: mockNavigationController
            });

            const sections = sideNavigationTray.getAllNavigationSections();
            Object.values(sections).forEach(section => {
                section.items.forEach(item => {
                    expect(item.icon).toBeTruthy();
                    expect(item.icon).toMatch(/^fas fa-/);
                });
            });
        });

        test('should have accessible profile section', () => {
            userProfileSummary = new UserProfileSummary({
                navigationController: mockNavigationController
            });

            const profileElement = document.querySelector('#userProfile');
            expect(profileElement.getAttribute('role')).toBe('button');
            expect(profileElement.getAttribute('tabindex')).toBe('0');
        });

        test('should have accessible logout button', () => {
            sideNavigationTray = new SideNavigationTray({
                navigationController: mockNavigationController
            });

            const logoutBtn = document.querySelector('.logout-btn');
            expect(logoutBtn).toBeTruthy();
            expect(logoutBtn.getAttribute('aria-label') || logoutBtn.textContent).toBeTruthy();
        });
    });
});
