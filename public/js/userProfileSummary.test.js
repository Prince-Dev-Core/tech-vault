// TechVault E-Commerce Platform - User Profile Summary Tests

/**
 * Unit tests for UserProfileSummary component
 * Tests profile display, user data handling, and interactive features
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

// Import the UserProfileSummary class
require('./userProfileSummary.js');

describe('UserProfileSummary Component', () => {
    let userProfileSummary;
    let mockSessionManager;
    let mockNavigationController;
    let container;

    // Setup before each test
    beforeEach(() => {
        // Create mock DOM structure
        document.body.innerHTML = `
            <div id="userProfile" class="user-profile">
                <div class="profile-info">
                    <div class="profile-avatar" id="profileAvatar">U</div>
                    <div class="profile-details">
                        <h3 id="profileName">User Name</h3>
                        <p id="profileEmail">user@email.com</p>
                    </div>
                </div>
            </div>
        `;

        // Create mock SessionManager
        mockSessionManager = {
            getUserData: jest.fn(),
            updateUserData: jest.fn(),
            getAuthToken: jest.fn(() => 'mock-token'),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };

        // Create mock NavigationController
        mockNavigationController = {
            navigateToPage: jest.fn()
        };

        // Set global mocks
        window.sessionManager = mockSessionManager;
        window.navigationController = mockNavigationController;
    });

    // Cleanup after each test
    afterEach(() => {
        if (userProfileSummary) {
            userProfileSummary.destroy();
        }
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    // ===== REQUIREMENT 5.1: Display user avatar (initials or image) =====
    describe('Requirement 5.1: User Avatar Display', () => {
        test('should display user initials when no avatar image provided', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com',
                fullName: 'John Doe'
            });

            userProfileSummary = new UserProfileSummary();

            const avatarElement = document.querySelector('#profileAvatar');
            expect(avatarElement.textContent).toBe('JD');
        });

        test('should display single initial for single-word names', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john',
                email: 'john@example.com',
                fullName: 'John'
            });

            userProfileSummary = new UserProfileSummary();

            const avatarElement = document.querySelector('#profileAvatar');
            expect(avatarElement.textContent).toBe('J');
        });

        test('should display avatar image when provided', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com',
                fullName: 'John Doe',
                avatar: 'https://example.com/avatar.jpg'
            });

            userProfileSummary = new UserProfileSummary();

            const avatarElement = document.querySelector('#profileAvatar');
            expect(avatarElement.style.backgroundImage).toContain('https://example.com/avatar.jpg');
        });

        test('should handle multiple-word names correctly', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'jane_smith',
                email: 'jane@example.com',
                fullName: 'Jane Marie Smith'
            });

            userProfileSummary = new UserProfileSummary();

            const avatarElement = document.querySelector('#profileAvatar');
            expect(avatarElement.textContent).toBe('JS');
        });

        test('should fallback to U when no name provided', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: '',
                email: 'user@example.com'
            });

            userProfileSummary = new UserProfileSummary();

            const avatarElement = document.querySelector('#profileAvatar');
            expect(avatarElement.textContent).toBe('U');
        });

        test('should handle whitespace in names correctly', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'user',
                email: 'user@example.com',
                fullName: '  John   Doe  '
            });

            userProfileSummary = new UserProfileSummary();

            const avatarElement = document.querySelector('#profileAvatar');
            expect(avatarElement.textContent).toBe('JD');
        });
    });

    // ===== REQUIREMENT 5.2: Show user name and email =====
    describe('Requirement 5.2: User Name and Email Display', () => {
        test('should display user full name', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com',
                fullName: 'John Doe'
            });

            userProfileSummary = new UserProfileSummary();

            const nameElement = document.querySelector('#profileName');
            expect(nameElement.textContent).toBe('John Doe');
        });

        test('should display user email', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com',
                fullName: 'John Doe'
            });

            userProfileSummary = new UserProfileSummary();

            const emailElement = document.querySelector('#profileEmail');
            expect(emailElement.textContent).toBe('john@example.com');
        });

        test('should fallback to username when fullName not provided', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com'
            });

            userProfileSummary = new UserProfileSummary();

            const nameElement = document.querySelector('#profileName');
            expect(nameElement.textContent).toBe('john_doe');
        });

        test('should display default values when no user data available', () => {
            mockSessionManager.getUserData.mockReturnValue(null);

            userProfileSummary = new UserProfileSummary();

            const nameElement = document.querySelector('#profileName');
            const emailElement = document.querySelector('#profileEmail');
            
            expect(nameElement.textContent).toBe('User');
            expect(emailElement.textContent).toBe('user@email.com');
        });

        test('should set title attributes for truncated text', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john.very.long.email@example.com',
                fullName: 'John Doe'
            });

            userProfileSummary = new UserProfileSummary();

            const nameElement = document.querySelector('#profileName');
            const emailElement = document.querySelector('#profileEmail');
            
            expect(nameElement.title).toBe('John Doe');
            expect(emailElement.title).toBe('john.very.long.email@example.com');
        });
    });

    // ===== REQUIREMENT 5.3: Display user email address =====
    describe('Requirement 5.3: Email Address Display', () => {
        test('should display email from user data', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'user',
                email: 'test@example.com'
            });

            userProfileSummary = new UserProfileSummary();

            const emailElement = document.querySelector('#profileEmail');
            expect(emailElement.textContent).toBe('test@example.com');
        });

        test('should handle various email formats', () => {
            const testEmails = [
                'simple@example.com',
                'user+tag@example.co.uk',
                'first.last@subdomain.example.com'
            ];

            testEmails.forEach(email => {
                mockSessionManager.getUserData.mockReturnValue({
                    username: 'user',
                    email: email
                });

                userProfileSummary = new UserProfileSummary();

                const emailElement = document.querySelector('#profileEmail');
                expect(emailElement.textContent).toBe(email);

                userProfileSummary.destroy();
            });
        });

        test('should display default email when not provided', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'user'
            });

            userProfileSummary = new UserProfileSummary();

            const emailElement = document.querySelector('#profileEmail');
            expect(emailElement.textContent).toBe('user@email.com');
        });
    });

    // ===== REQUIREMENT 5.4: Make profile clickable to access settings =====
    describe('Requirement 5.4: Profile Clickable Access to Settings', () => {
        test('should navigate to profile page on click', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com'
            });

            userProfileSummary = new UserProfileSummary({
                navigationController: mockNavigationController
            });

            const profileElement = document.querySelector('#userProfile');
            profileElement.click();

            expect(mockNavigationController.navigateToPage).toHaveBeenCalledWith('profile');
        });

        test('should support keyboard navigation (Enter key)', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com'
            });

            userProfileSummary = new UserProfileSummary({
                navigationController: mockNavigationController
            });

            const profileElement = document.querySelector('#userProfile');
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            
            profileElement.dispatchEvent(event);

            expect(mockNavigationController.navigateToPage).toHaveBeenCalledWith('profile');
        });

        test('should support keyboard navigation (Space key)', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com'
            });

            userProfileSummary = new UserProfileSummary({
                navigationController: mockNavigationController
            });

            const profileElement = document.querySelector('#userProfile');
            const event = new KeyboardEvent('keydown', { key: ' ' });
            
            profileElement.dispatchEvent(event);

            expect(mockNavigationController.navigateToPage).toHaveBeenCalledWith('profile');
        });

        test('should emit profileClicked event', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com'
            });

            userProfileSummary = new UserProfileSummary();
            
            const eventCallback = jest.fn();
            userProfileSummary.addEventListener('profileClicked', eventCallback);

            const profileElement = document.querySelector('#userProfile');
            profileElement.click();

            expect(eventCallback).toHaveBeenCalled();
        });

        test('should have proper accessibility attributes', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com'
            });

            userProfileSummary = new UserProfileSummary();

            const profileElement = document.querySelector('#userProfile');
            
            expect(profileElement.getAttribute('role')).toBe('button');
            expect(profileElement.getAttribute('tabindex')).toBe('0');
        });
    });

    // ===== REQUIREMENT 5.5: Auto-update when profile information changes =====
    describe('Requirement 5.5: Automatic Profile Updates', () => {
        test('should update profile when user data changes', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com',
                fullName: 'John Doe'
            });

            userProfileSummary = new UserProfileSummary();

            // Simulate user data update
            const newUserData = {
                username: 'jane_doe',
                email: 'jane@example.com',
                fullName: 'Jane Doe'
            };

            userProfileSummary.updateUserProfile(newUserData);

            const nameElement = document.querySelector('#profileName');
            const emailElement = document.querySelector('#profileEmail');
            const avatarElement = document.querySelector('#profileAvatar');

            expect(nameElement.textContent).toBe('Jane Doe');
            expect(emailElement.textContent).toBe('jane@example.com');
            expect(avatarElement.textContent).toBe('JD');
        });

        test('should listen to SessionManager userDataUpdated events', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com',
                fullName: 'John Doe'
            });

            userProfileSummary = new UserProfileSummary();

            // Get the callback registered with SessionManager
            const addEventListenerCall = mockSessionManager.addEventListener.mock.calls.find(
                call => call[0] === 'userDataUpdated'
            );
            
            expect(addEventListenerCall).toBeDefined();
        });

        test('should emit profileUpdated event when data changes', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com'
            });

            userProfileSummary = new UserProfileSummary();
            
            const eventCallback = jest.fn();
            userProfileSummary.addEventListener('profileUpdated', eventCallback);

            const newUserData = {
                username: 'jane_doe',
                email: 'jane@example.com'
            };

            userProfileSummary.updateUserProfile(newUserData);

            expect(eventCallback).toHaveBeenCalled();
        });

        test('should handle session expiration', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com'
            });

            userProfileSummary = new UserProfileSummary();

            // Get the callback registered for sessionExpired
            const addEventListenerCall = mockSessionManager.addEventListener.mock.calls.find(
                call => call[0] === 'sessionExpired'
            );
            
            expect(addEventListenerCall).toBeDefined();
        });

        test('should reset to default profile on session expiration', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com'
            });

            userProfileSummary = new UserProfileSummary();

            // Simulate session expiration
            userProfileSummary.handleSessionExpired();

            const nameElement = document.querySelector('#profileName');
            const emailElement = document.querySelector('#profileEmail');
            const avatarElement = document.querySelector('#profileAvatar');

            expect(nameElement.textContent).toBe('User');
            expect(emailElement.textContent).toBe('user@email.com');
            expect(avatarElement.textContent).toBe('U');
        });
    });

    // ===== INTEGRATION TESTS =====
    describe('Integration Tests', () => {
        test('should initialize with user data from SessionManager', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com',
                fullName: 'John Doe'
            });

            userProfileSummary = new UserProfileSummary();

            expect(userProfileSummary.isReady()).toBe(true);
            expect(userProfileSummary.getDisplayName()).toBe('John Doe');
            expect(userProfileSummary.getUserEmail()).toBe('john@example.com');
        });

        test('should handle missing DOM elements gracefully', () => {
            document.body.innerHTML = '';

            userProfileSummary = new UserProfileSummary();

            expect(userProfileSummary.isReady()).toBe(false);
        });

        test('should provide getter methods for user data', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com',
                fullName: 'John Doe'
            });

            userProfileSummary = new UserProfileSummary();

            expect(userProfileSummary.getDisplayName()).toBe('John Doe');
            expect(userProfileSummary.getUserEmail()).toBe('john@example.com');
            expect(userProfileSummary.getUserInitials()).toBe('JD');
            expect(userProfileSummary.getUserData()).toEqual({
                username: 'john_doe',
                email: 'john@example.com',
                fullName: 'John Doe'
            });
        });

        test('should cleanup resources on destroy', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com'
            });

            userProfileSummary = new UserProfileSummary();
            userProfileSummary.destroy();

            expect(userProfileSummary.isReady()).toBe(false);
        });

        test('should handle custom container selectors', () => {
            document.body.innerHTML = `
                <div id="customProfile" class="user-profile">
                    <div class="profile-info">
                        <div class="profile-avatar" id="customAvatar">U</div>
                        <div class="profile-details">
                            <h3 id="customName">User Name</h3>
                            <p id="customEmail">user@email.com</p>
                        </div>
                    </div>
                </div>
            `;

            mockSessionManager.getUserData.mockReturnValue({
                username: 'john_doe',
                email: 'john@example.com',
                fullName: 'John Doe'
            });

            userProfileSummary = new UserProfileSummary({
                containerSelector: '#customProfile',
                avatarSelector: '#customAvatar',
                nameSelector: '#customName',
                emailSelector: '#customEmail'
            });

            expect(userProfileSummary.isReady()).toBe(true);
            expect(document.querySelector('#customName').textContent).toBe('John Doe');
        });
    });

    // ===== EDGE CASES =====
    describe('Edge Cases', () => {
        test('should handle null user data', () => {
            mockSessionManager.getUserData.mockReturnValue(null);

            userProfileSummary = new UserProfileSummary();

            expect(userProfileSummary.getDisplayName()).toBe('User');
            expect(userProfileSummary.getUserEmail()).toBe('user@email.com');
        });

        test('should handle empty user data object', () => {
            mockSessionManager.getUserData.mockReturnValue({});

            userProfileSummary = new UserProfileSummary();

            expect(userProfileSummary.getDisplayName()).toBe('User');
            expect(userProfileSummary.getUserEmail()).toBe('user@email.com');
        });

        test('should handle very long names', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'user',
                email: 'user@example.com',
                fullName: 'Alexander Christopher Benjamin Montgomery'
            });

            userProfileSummary = new UserProfileSummary();

            const avatarElement = document.querySelector('#profileAvatar');
            expect(avatarElement.textContent).toBe('AM');
        });

        test('should handle special characters in names', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'user',
                email: 'user@example.com',
                fullName: "O'Brien-Smith"
            });

            userProfileSummary = new UserProfileSummary();

            const avatarElement = document.querySelector('#profileAvatar');
            // "O'Brien-Smith" splits into ["O'Brien-Smith"] (single word due to hyphen)
            // So we get first letter of first word: O
            expect(avatarElement.textContent).toBe('O');
        });

        test('should handle unicode characters in names', () => {
            mockSessionManager.getUserData.mockReturnValue({
                username: 'user',
                email: 'user@example.com',
                fullName: 'José García'
            });

            userProfileSummary = new UserProfileSummary();

            const avatarElement = document.querySelector('#profileAvatar');
            expect(avatarElement.textContent).toBe('JG');
        });
    });
});
