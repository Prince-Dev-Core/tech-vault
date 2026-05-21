// TechVault E-Commerce Platform - User Profile Summary Component

/**
 * UserProfileSummary class for displaying user profile information in the navigation tray
 * Displays user avatar, name, and email with clickable access to detailed settings
 * Automatically updates when profile information changes
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
class UserProfileSummary {
    constructor(options = {}) {
        // Configuration
        this.containerSelector = options.containerSelector || '#userProfile';
        this.avatarSelector = options.avatarSelector || '#profileAvatar';
        this.nameSelector = options.nameSelector || '#profileName';
        this.emailSelector = options.emailSelector || '#profileEmail';
        this.navigationController = options.navigationController || null;
        
        // DOM elements
        this.container = null;
        this.avatarElement = null;
        this.nameElement = null;
        this.emailElement = null;
        
        // State
        this.currentUserData = null;
        this.isInitialized = false;
        
        // Event listeners
        this.eventListeners = new Map();
        
        // Initialize component
        this.initialize();
    }

    /**
     * Initialize the UserProfileSummary component
     * Sets up DOM elements, loads user data, and attaches event listeners
     */
    initialize() {
        try {
            // Get DOM elements
            this.container = document.querySelector(this.containerSelector);
            this.avatarElement = document.querySelector(this.avatarSelector);
            this.nameElement = document.querySelector(this.nameSelector);
            this.emailElement = document.querySelector(this.emailSelector);

            // Validate DOM elements exist
            if (!this.container || !this.avatarElement || !this.nameElement || !this.emailElement) {
                throw new Error('Required DOM elements not found for UserProfileSummary');
            }

            // Load initial user data
            this.loadUserData();

            // Setup event listeners
            this.setupEventListeners();

            // Listen for session manager updates
            if (window.sessionManager) {
                sessionManager.addEventListener('userDataUpdated', (data) => {
                    this.handleUserDataUpdate(data);
                });

                sessionManager.addEventListener('sessionExpired', () => {
                    this.handleSessionExpired();
                });
            }

            this.isInitialized = true;
            console.log('✅ UserProfileSummary initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize UserProfileSummary:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Load user data from SessionManager
     * Requirement 5.1, 5.2, 5.3
     */
    loadUserData() {
        try {
            if (!window.sessionManager) {
                console.warn('⚠️ SessionManager not available');
                return;
            }

            const userData = sessionManager.getUserData();
            
            if (!userData) {
                console.warn('⚠️ No user data available in session');
                this.displayDefaultProfile();
                return;
            }

            this.currentUserData = userData;
            this.updateProfileDisplay();

        } catch (error) {
            console.error('❌ Failed to load user data:', error);
            this.displayDefaultProfile();
        }
    }

    /**
     * Update profile display with current user data
     * Requirement 5.1, 5.2, 5.3
     */
    updateProfileDisplay() {
        try {
            if (!this.currentUserData) {
                this.displayDefaultProfile();
                return;
            }

            const { username, email, fullName, avatar } = this.currentUserData;
            
            // Update name
            const displayName = fullName || username || 'User';
            this.nameElement.textContent = displayName;
            this.nameElement.title = displayName;

            // Update email
            const displayEmail = email || 'user@email.com';
            this.emailElement.textContent = displayEmail;
            this.emailElement.title = displayEmail;

            // Update avatar
            this.updateAvatar(displayName, avatar);

            // Add accessibility attributes
            this.container.setAttribute('aria-label', `Profile: ${displayName} (${displayEmail})`);

        } catch (error) {
            console.error('❌ Failed to update profile display:', error);
            this.displayDefaultProfile();
        }
    }

    /**
     * Update avatar display with initials or image
     * Requirement 5.1
     * 
     * @param {string} displayName - User's display name for generating initials
     * @param {string} avatarUrl - Optional avatar image URL
     */
    updateAvatar(displayName, avatarUrl = null) {
        try {
            // Clear existing content
            this.avatarElement.innerHTML = '';
            this.avatarElement.style.backgroundImage = '';

            if (avatarUrl) {
                // Use avatar image if provided
                this.avatarElement.style.backgroundImage = `url('${avatarUrl}')`;
                this.avatarElement.style.backgroundSize = 'cover';
                this.avatarElement.style.backgroundPosition = 'center';
                this.avatarElement.setAttribute('aria-label', `Avatar for ${displayName}`);
            } else {
                // Generate initials from display name
                const initials = this.generateInitials(displayName);
                this.avatarElement.textContent = initials;
                this.avatarElement.setAttribute('aria-label', `Avatar initials: ${initials}`);
            }

        } catch (error) {
            console.error('❌ Failed to update avatar:', error);
            // Fallback to first letter
            const fallbackInitial = (displayName || 'U').charAt(0).toUpperCase();
            this.avatarElement.textContent = fallbackInitial;
        }
    }

    /**
     * Generate initials from display name
     * 
     * @param {string} displayName - User's display name
     * @returns {string} Initials (1-2 characters)
     */
    generateInitials(displayName) {
        if (!displayName || typeof displayName !== 'string') {
            return 'U';
        }

        const parts = displayName.trim().split(/\s+/);
        
        if (parts.length === 0) {
            return 'U';
        }

        if (parts.length === 1) {
            // Single name: use first letter
            return parts[0].charAt(0).toUpperCase();
        }

        // Multiple names: use first letter of first and last name
        const firstInitial = parts[0].charAt(0).toUpperCase();
        const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
        
        // Handle special characters - skip non-letter characters
        let lastNameInitial = lastInitial;
        if (!/[a-zA-Z]/.test(lastNameInitial)) {
            // If last name starts with non-letter, try to find first letter
            const lastNamePart = parts[parts.length - 1];
            for (let i = 0; i < lastNamePart.length; i++) {
                if (/[a-zA-Z]/.test(lastNamePart[i])) {
                    lastNameInitial = lastNamePart[i].toUpperCase();
                    break;
                }
            }
        }
        
        return (firstInitial + lastNameInitial).substring(0, 2);
    }

    /**
     * Display default profile when no user data is available
     */
    displayDefaultProfile() {
        try {
            this.nameElement.textContent = 'User';
            this.emailElement.textContent = 'user@email.com';
            this.avatarElement.textContent = 'U';
            this.avatarElement.style.backgroundImage = '';
            this.container.setAttribute('aria-label', 'User Profile');
        } catch (error) {
            console.error('❌ Failed to display default profile:', error);
        }
    }

    /**
     * Setup event listeners for profile interactions
     * Requirement 5.4
     */
    setupEventListeners() {
        try {
            // Make profile clickable to access settings
            this.container.addEventListener('click', (e) => {
                this.handleProfileClick(e);
            });

            // Add keyboard support for accessibility
            this.container.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleProfileClick(e);
                }
            });

            // Make container focusable for keyboard navigation
            if (!this.container.hasAttribute('tabindex')) {
                this.container.setAttribute('tabindex', '0');
            }

            // Add role for accessibility
            if (!this.container.hasAttribute('role')) {
                this.container.setAttribute('role', 'button');
            }

        } catch (error) {
            console.error('❌ Failed to setup event listeners:', error);
        }
    }

    /**
     * Handle profile click to navigate to settings
     * Requirement 5.4
     * 
     * @param {Event} event - Click or keyboard event
     */
    handleProfileClick(event) {
        try {
            // Prevent event propagation
            event.stopPropagation();

            // Navigate to profile settings
            if (this.navigationController) {
                this.navigationController.navigateToPage('profile');
            } else if (window.navigationController) {
                window.navigationController.navigateToPage('profile');
            } else {
                // Fallback: navigate directly
                window.location.hash = '#profile';
            }

            // Emit custom event for profile click
            this.emitEvent('profileClicked', { userData: this.currentUserData });

        } catch (error) {
            console.error('❌ Failed to handle profile click:', error);
        }
    }

    /**
     * Handle user data updates from SessionManager
     * Requirement 5.5
     * 
     * @param {Object} userData - Updated user data
     */
    handleUserDataUpdate(userData) {
        try {
            if (userData) {
                this.currentUserData = userData;
                this.updateProfileDisplay();
                
                // Emit custom event for data update
                this.emitEvent('profileUpdated', { userData });
                
                console.log('✅ User profile updated');
            }
        } catch (error) {
            console.error('❌ Failed to handle user data update:', error);
        }
    }

    /**
     * Handle session expiration
     * Requirement 5.5
     */
    handleSessionExpired() {
        try {
            this.displayDefaultProfile();
            this.emitEvent('sessionExpired', {});
            console.log('⚠️ Session expired, profile reset to default');
        } catch (error) {
            console.error('❌ Failed to handle session expiration:', error);
        }
    }

    /**
     * Update user profile data
     * Requirement 5.5
     * 
     * @param {Object} userData - New user data
     */
    updateUserProfile(userData) {
        try {
            if (!userData) {
                throw new Error('User data is required');
            }

            // Update session manager
            if (window.sessionManager) {
                sessionManager.updateUserData(userData);
            }

            // Update local state
            this.currentUserData = userData;
            this.updateProfileDisplay();

            // Emit custom event for profile update
            this.emitEvent('profileUpdated', { userData });

            console.log('✅ User profile updated successfully');

        } catch (error) {
            console.error('❌ Failed to update user profile:', error);
            throw error;
        }
    }

    /**
     * Get current user data
     * 
     * @returns {Object|null} Current user data or null
     */
    getUserData() {
        return this.currentUserData;
    }

    /**
     * Get user display name
     * 
     * @returns {string} User's display name
     */
    getDisplayName() {
        if (!this.currentUserData) {
            return 'User';
        }

        return this.currentUserData.fullName || this.currentUserData.username || 'User';
    }

    /**
     * Get user email
     * 
     * @returns {string} User's email address
     */
    getUserEmail() {
        if (!this.currentUserData) {
            return 'user@email.com';
        }

        return this.currentUserData.email || 'user@email.com';
    }

    /**
     * Get user initials
     * 
     * @returns {string} User's initials
     */
    getUserInitials() {
        return this.generateInitials(this.getDisplayName());
    }

    /**
     * Add event listener for profile events
     * 
     * @param {string} event - Event name (profileClicked, profileUpdated, sessionExpired)
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
     * Refresh profile data from server
     * 
     * @returns {Promise<Object>} Updated user data
     */
    async refreshProfile() {
        try {
            const token = sessionManager.getAuthToken();
            
            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch('/api/auth/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to refresh profile: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.user) {
                this.updateUserProfile(data.user);
                return data.user;
            }

            throw new Error('Invalid profile response');

        } catch (error) {
            console.error('❌ Failed to refresh profile:', error);
            throw error;
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
            if (this.container) {
                this.container.removeEventListener('click', this.handleProfileClick);
                this.container.removeEventListener('keydown', this.handleProfileClick);
            }

            // Clear event listeners map
            this.eventListeners.clear();

            // Clear references
            this.container = null;
            this.avatarElement = null;
            this.nameElement = null;
            this.emailElement = null;
            this.currentUserData = null;
            this.navigationController = null;

            this.isInitialized = false;
            console.log('✅ UserProfileSummary destroyed successfully');

        } catch (error) {
            console.error('❌ Failed to destroy UserProfileSummary:', error);
        }
    }
}

// Export for global access
window.UserProfileSummary = UserProfileSummary;

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserProfileSummary;
}

console.log('👤 UserProfileSummary module loaded successfully');
