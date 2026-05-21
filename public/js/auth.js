// TechVault E-Commerce Platform - Enhanced Authentication System

/**
 * Enhanced Authentication System Class
 * Manages user authentication state, session validation, and secure token storage
 * Integrates with existing backend authentication endpoints
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.7
 */
class AuthenticationSystem {
    constructor() {
        this.isInitialized = false;
        this.sessionManager = null;
        this.validationInterval = null;
        this.eventListeners = new Map();
        this.apiEndpoints = {
            login: '/auth/login',
            signup: '/auth/signup',
            profile: '/auth/profile',
            logout: '/auth/logout'
        };
        
        // Initialize when DOM and API are ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            // Use setTimeout to ensure API is loaded
            setTimeout(() => this.init(), 100);
        }
    }

    /**
     * Initialize authentication system with enhanced session management
     */
    async init() {
        try {
            // Wait for API to be available
            if (!window.API) {
                console.log('Waiting for API to load...');
                setTimeout(() => this.init(), 100);
                return;
            }

            // Initialize enhanced session manager
            this.sessionManager = window.sessionManager || new SessionManager();

            // Set up session event listeners
            this.setupSessionEventListeners();

            // Validate existing session on startup
            await this.validateSession();
            
            // Set up automatic session validation
            this.setupAutoValidation();
            
            this.isInitialized = true;
            console.log('✅ Enhanced Authentication system initialized');
        } catch (error) {
            console.error('❌ Authentication system initialization failed:', error);
            this.isInitialized = true; // Continue even if validation fails
        }
    }

    /**
     * Validate current session with enhanced security checks
     * Requirement 2.1: Auth_Gate SHALL validate user sessions before allowing dashboard access
     * @returns {Promise<boolean>} True if session is valid
     */
    async validateSession() {
        try {
            const token = this.sessionManager.getAuthToken();
            
            if (!token) {
                console.log('No auth token found');
                this.emitEvent('sessionInvalid', { reason: 'no_token' });
                return false;
            }

            // Check if token is expired locally first
            if (!this.sessionManager.isSessionValid()) {
                console.log('Token expired locally');
                this.sessionManager.clearAuthData();
                this.emitEvent('sessionExpired', { reason: 'token_expired' });
                return false;
            }

            // Validate token with server using AuthAPI
            const response = await window.API.auth.getProfile(token);

            if (response && response.user) {
                console.log('✅ Session validated successfully');
                
                // Update user data if it has changed
                const currentUser = this.sessionManager.getUserData();
                if (!currentUser || currentUser.id !== response.user.id) {
                    this.sessionManager.updateUserData(response.user);
                }
                
                this.emitEvent('sessionValid', { user: response.user });
                return true;
            } else {
                console.log('❌ Invalid session response');
                this.sessionManager.clearAuthData();
                this.emitEvent('sessionInvalid', { reason: 'invalid_response' });
                return false;
            }

        } catch (error) {
            console.error('Session validation failed:', error);
            
            // Handle different types of errors
            if (error.message.includes('401') || error.message.includes('403')) {
                this.sessionManager.clearAuthData();
                this.emitEvent('sessionExpired', { reason: 'server_rejection', error });
            } else {
                this.emitEvent('sessionError', { error });
            }
            
            return false;
        }
    }

    /**
     * Login user with credentials and enhanced error handling
     * Requirement 2.2: WHEN a user completes login AND session activates successfully, 
     * THE Authentication_System SHALL redirect to the User_Dashboard
     * @param {Object} credentials - Login credentials
     * @param {string} credentials.username - Username or email
     * @param {string} credentials.password - Password
     * @returns {Promise<Object>} Authentication result
     */
    async login(credentials) {
        try {
            // Validate input
            if (!credentials.username || !credentials.password) {
                throw new Error('Username and password are required');
            }

            console.log('🔐 Attempting login for:', credentials.username);

            // Emit login attempt event
            this.emitEvent('loginAttempt', { username: credentials.username });

            // Send login request to backend using AuthAPI
            const response = await window.API.auth.login({
                username: credentials.username,
                password: credentials.password
            });

            if (response && response.token && response.user) {
                // Store authentication data using enhanced session manager
                this.sessionManager.storeAuthToken(response.token, response.user);

                console.log('✅ Login successful for user:', response.user.username);

                // Emit successful login event
                this.emitEvent('loginSuccess', { 
                    user: response.user, 
                    token: response.token 
                });

                return {
                    success: true,
                    message: response.message || 'Login successful',
                    user: response.user,
                    token: response.token
                };
            } else {
                throw new Error('Invalid response from server');
            }

        } catch (error) {
            console.error('❌ Login failed:', error);
            
            // Clear any partial session data
            this.sessionManager.clearAuthData();

            // Emit login failure event
            this.emitEvent('loginFailure', { 
                error: error.message,
                username: credentials.username 
            });

            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error
            };
        }
    }

    /**
     * Sign up new user with enhanced validation
     * Requirement 2.1: WHEN a user completes signup, THE Authentication_System SHALL 
     * automatically authenticate the user and redirect to the User_Dashboard
     * @param {Object} userData - User registration data
     * @param {string} userData.username - Username
     * @param {string} userData.email - Email address
     * @param {string} userData.password - Password
     * @param {string} [userData.fullName] - Full name (optional)
     * @returns {Promise<Object>} Authentication result
     */
    async signup(userData) {
        try {
            // Enhanced input validation
            if (!userData.username || !userData.email || !userData.password) {
                throw new Error('Username, email, and password are required');
            }

            if (userData.password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            if (!isValidEmail(userData.email)) {
                throw new Error('Please enter a valid email address');
            }

            // Additional username validation
            if (userData.username.length < 3) {
                throw new Error('Username must be at least 3 characters long');
            }

            console.log('📝 Attempting signup for:', userData.username);

            // Emit signup attempt event
            this.emitEvent('signupAttempt', { 
                username: userData.username, 
                email: userData.email 
            });

            // Send signup request to backend using AuthAPI
            const response = await window.API.auth.signup({
                username: userData.username,
                email: userData.email,
                password: userData.password,
                fullName: userData.fullName || ''
            });

            if (response && response.token && response.user) {
                // Store authentication data using enhanced session manager
                this.sessionManager.storeAuthToken(response.token, response.user);

                console.log('✅ Signup successful for user:', response.user.username);

                // Emit successful signup event
                this.emitEvent('signupSuccess', { 
                    user: response.user, 
                    token: response.token 
                });

                return {
                    success: true,
                    message: response.message || 'Account created successfully',
                    user: response.user,
                    token: response.token
                };
            } else {
                throw new Error('Invalid response from server');
            }

        } catch (error) {
            console.error('❌ Signup failed:', error);
            
            // Clear any partial session data
            this.sessionManager.clearAuthData();

            // Emit signup failure event
            this.emitEvent('signupFailure', { 
                error: error.message,
                username: userData.username,
                email: userData.email 
            });

            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error
            };
        }
    }

    /**
     * Logout current user with enhanced security measures
     * Requirement 2.7: WHEN a user logs out, THE Authentication_System SHALL clear all 
     * session data and redirect to the homepage
     * Requirement 12.1, 12.2, 12.3, 12.4, 12.5: Logout with confirmation, token clearing, 
     * server-side session invalidation, and homepage redirect
     * @param {Object} options - Logout options
     * @param {boolean} options.showConfirmation - Whether to show confirmation dialog (default: true)
     * @param {Function} options.onConfirm - Callback when user confirms logout
     * @param {Function} options.onCancel - Callback when user cancels logout
     * @returns {Promise<void>}
     */
    async logout(options = {}) {
        const { showConfirmation = true, onConfirm = null, onCancel = null } = options;

        try {
            // Show confirmation dialog if requested
            // Requirement 12.4: THE "Log Out" button SHALL show confirmation dialog for accidental click prevention
            if (showConfirmation) {
                const confirmed = await this.showLogoutConfirmation();
                
                if (!confirmed) {
                    console.log('🚫 Logout cancelled by user');
                    if (onCancel) {
                        onCancel();
                    }
                    this.emitEvent('logoutCancelled', {});
                    return;
                }
            }

            if (onConfirm) {
                onConfirm();
            }

            console.log('🚪 Logging out user...');

            const token = this.sessionManager.getAuthToken();
            const userData = this.sessionManager.getUserData();
            
            // Emit logout attempt event
            this.emitEvent('logoutAttempt', { user: userData });

            // Notify server about logout for server-side session invalidation
            // Requirement 12.5: THE Authentication_System SHALL invalidate server-side sessions during logout process
            if (token) {
                try {
                    console.log('📤 Notifying server for session invalidation...');
                    await window.API.auth.logout(token);
                    console.log('✅ Server session invalidated');
                } catch (error) {
                    // Don't fail logout if server request fails
                    console.warn('⚠️ Server logout notification failed:', error);
                    // Continue with client-side logout anyway
                }
            }

            // Clear all session data
            // Requirement 12.2: WHEN clicked, THE "Log Out" button SHALL clear all authentication tokens successfully before completing logout
            this.sessionManager.clearAuthData();

            // Clear validation interval
            if (this.validationInterval) {
                clearInterval(this.validationInterval);
                this.validationInterval = null;
            }

            console.log('✅ Logout successful - all tokens cleared');

            // Emit successful logout event
            this.emitEvent('logoutSuccess', { user: userData });

            // Requirement 12.3: WHEN logout completes successfully, THE Authentication_System SHALL redirect to the homepage
            this.redirectToHomepage();

        } catch (error) {
            console.error('❌ Logout error:', error);
            
            // Always clear session data even if server request fails
            this.sessionManager.clearAuthData();
            
            // Emit logout error event
            this.emitEvent('logoutError', { error: error.message });

            // Still redirect to homepage on error
            this.redirectToHomepage();
        }
    }

    /**
     * Show logout confirmation dialog
     * Requirement 12.4: THE "Log Out" button SHALL show confirmation dialog for accidental click prevention
     * @private
     * @returns {Promise<boolean>} True if user confirms logout
     */
    async showLogoutConfirmation() {
        return new Promise((resolve) => {
            // Check if custom confirmation dialog exists
            const confirmDialog = document.getElementById('logoutConfirmDialog');
            
            if (confirmDialog && confirmDialog.showModal) {
                // Use custom dialog if available
                const confirmBtn = confirmDialog.querySelector('.confirm-logout-btn');
                const cancelBtn = confirmDialog.querySelector('.cancel-logout-btn');
                
                const handleConfirm = () => {
                    cleanup();
                    resolve(true);
                };
                
                const handleCancel = () => {
                    cleanup();
                    resolve(false);
                };
                
                const cleanup = () => {
                    confirmBtn?.removeEventListener('click', handleConfirm);
                    cancelBtn?.removeEventListener('click', handleCancel);
                    confirmDialog.close();
                };
                
                confirmBtn?.addEventListener('click', handleConfirm);
                cancelBtn?.addEventListener('click', handleCancel);
                
                confirmDialog.showModal();
            } else {
                // Fallback to browser confirm dialog
                const confirmed = confirm('Are you sure you want to log out? You will be redirected to the homepage.');
                resolve(confirmed);
            }
        });
    }

    /**
     * Redirect to homepage
     * @private
     */
    redirectToHomepage() {
        console.log('🔄 Redirecting to homepage...');
        window.location.href = '/';
    }

    /**
     * Get current authentication token
     * @returns {string|null} Authentication token or null
     */
    getAuthToken() {
        return this.sessionManager ? this.sessionManager.getAuthToken() : null;
    }

    /**
     * Check if user is currently authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated() {
        return this.sessionManager ? 
            this.sessionManager.isSessionValid() && !!this.sessionManager.getAuthToken() : 
            false;
    }

    /**
     * Get current user data
     * @returns {Object|null} User data or null
     */
    getCurrentUser() {
        return this.sessionManager ? this.sessionManager.getUserData() : null;
    }

    /**
     * Get session information with enhanced details
     * @returns {Object} Comprehensive session information
     */
    getSessionInfo() {
        if (!this.sessionManager) {
            return {
                isAuthenticated: false,
                token: null,
                userData: null,
                expiresAt: null,
                isValid: false,
                timeUntilExpiry: null
            };
        }
        
        return this.sessionManager.getSessionInfo();
    }

    /**
     * Update user profile data
     * @param {Object} profileData - Updated profile data
     * @returns {Promise<Object>} Update result
     */
    async updateProfile(profileData) {
        try {
            const token = this.getAuthToken();
            
            if (!token) {
                throw new Error('Authentication required');
            }

            // Validate profile data
            if (profileData.email && !isValidEmail(profileData.email)) {
                throw new Error('Please enter a valid email address');
            }

            console.log('📝 Updating user profile...');

            // Send update request to backend
            const response = await window.API.auth.updateProfile(profileData, token);

            if (response && response.message) {
                // Update local user data
                const currentUser = this.getCurrentUser();
                const updatedUser = { ...currentUser, ...profileData };
                this.sessionManager.updateUserData(updatedUser);

                console.log('✅ Profile updated successfully');

                // Emit profile update event
                this.emitEvent('profileUpdated', { user: updatedUser });

                return {
                    success: true,
                    message: response.message,
                    user: updatedUser
                };
            } else {
                throw new Error('Invalid response from server');
            }

        } catch (error) {
            console.error('❌ Profile update failed:', error);

            // Emit profile update failure event
            this.emitEvent('profileUpdateFailure', { error: error.message });

            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error
            };
        }
    }

    /**
     * Redirect to login page
     * @param {string} [message] - Optional message to display
     */
    redirectToLogin(message = null) {
        const loginUrl = '/login.html';
        const currentPath = window.location.pathname;
        
        // Don't redirect if already on login page
        if (currentPath.includes('login.html')) {
            return;
        }

        // Store return URL for after login
        if (currentPath !== '/' && currentPath !== '/index.html') {
            this.sessionManager.storeReturnUrl(currentPath + window.location.search);
        }

        // Add message as query parameter if provided
        const url = message ? `${loginUrl}?message=${encodeURIComponent(message)}` : loginUrl;
        
        console.log('🔄 Redirecting to login:', url);
        window.location.href = url;
    }

    /**
     * Redirect to dashboard
     */
    redirectToDashboard() {
        const dashboardUrl = '/dashboard.html';
        const returnUrl = this.sessionManager.getReturnUrl();
        
        // Clear stored return URL
        this.sessionManager.clearReturnUrl();
        
        // Redirect to return URL or dashboard
        const targetUrl = returnUrl || dashboardUrl;
        
        console.log('🔄 Redirecting to dashboard:', targetUrl);
        window.location.href = targetUrl;
    }

    /**
     * Handle authentication errors
     * @param {Error} error - Authentication error
     */
    handleAuthError(error) {
        console.error('Authentication error:', error);
        
        if (error.message.includes('401') || error.message.includes('403')) {
            // Token expired or invalid
            this.sessionManager.clearAuthData();
            this.redirectToLogin('Your session has expired. Please log in again.');
        } else if (error.message.includes('Network')) {
            // Network error
            showToast('Network error. Please check your connection.', 'error');
        } else {
            // Generic error
            showToast(error.message || 'Authentication failed', 'error');
        }
    }

    /**
     * Refresh authentication token
     * @returns {Promise<boolean>} True if refresh successful
     */
    async refreshToken() {
        try {
            const currentToken = this.sessionManager.getAuthToken();
            
            if (!currentToken) {
                return false;
            }

            // For JWT tokens, we typically validate rather than refresh
            // since they are stateless. In a production app, you might
            // implement refresh tokens for better security.
            return await this.validateSession();

        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    /**
     * Set up automatic session validation with enhanced monitoring
     * @param {number} [interval=300000] - Validation interval in milliseconds (default: 5 minutes)
     */
    setupAutoValidation(interval = 300000) {
        // Clear existing interval
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
        }

        // Set up periodic validation
        this.validationInterval = setInterval(async () => {
            if (this.isAuthenticated()) {
                const isValid = await this.validateSession();
                if (!isValid) {
                    console.log('Session validation failed, handling session expiry');
                    this.handleSessionExpiry('auto_validation_failed');
                }
            }
        }, interval);

        console.log(`🔄 Auto-validation set up with ${interval}ms interval`);
    }

    /**
     * Set up session event listeners for enhanced session management
     * @private
     */
    setupSessionEventListeners() {
        if (this.sessionManager && this.sessionManager.addEventListener) {
            // Listen for session expiry events from SessionManager
            this.sessionManager.addEventListener('sessionExpired', (data) => {
                this.handleSessionExpiry(data.reason || 'session_manager_expiry');
            });

            // Listen for user data updates
            this.sessionManager.addEventListener('userDataUpdated', (userData) => {
                this.emitEvent('userDataUpdated', userData);
            });
        }
    }

    /**
     * Handle session expiry with appropriate user feedback
     * @private
     * @param {string} reason - Reason for session expiry
     */
    handleSessionExpiry(reason) {
        console.log(`🔒 Session expired: ${reason}`);
        
        // Clear any validation intervals
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
            this.validationInterval = null;
        }

        // Emit session expired event
        this.emitEvent('sessionExpired', { reason });

        // Show user-friendly message and redirect
        const messages = {
            'token_expired': 'Your session has expired. Please log in again.',
            'server_rejection': 'Your session is no longer valid. Please log in again.',
            'auto_validation_failed': 'Your session has expired. Please log in again.',
            'session_manager_expiry': 'Your session has expired. Please log in again.'
        };

        const message = messages[reason] || 'Your session has expired. Please log in again.';
        this.redirectToLogin(message);
    }

    /**
     * Get user-friendly error message
     * @private
     * @param {Error} error - Error object
     * @returns {string} User-friendly error message
     */
    getErrorMessage(error) {
        if (error.message.includes('401') || error.message.includes('Invalid username or password')) {
            return 'Invalid username or password. Please try again.';
        }
        
        if (error.message.includes('409') || error.message.includes('already exists')) {
            return 'Username or email already exists. Please choose different credentials.';
        }
        
        if (error.message.includes('Network') || error.message.includes('fetch')) {
            return 'Network error. Please check your connection and try again.';
        }
        
        if (error.message.includes('timeout')) {
            return 'Request timeout. Please try again.';
        }

        // Return the original message if it's user-friendly, otherwise generic message
        const userFriendlyMessages = [
            'Username and password are required',
            'Password must be at least 6 characters long',
            'Please enter a valid email address',
            'Username must be at least 3 characters long',
            'Authentication required'
        ];

        if (userFriendlyMessages.some(msg => error.message.includes(msg))) {
            return error.message;
        }

        return 'An error occurred. Please try again.';
    }

    /**
     * Add event listener for authentication events
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
     * Clean up authentication system
     */
    destroy() {
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
            this.validationInterval = null;
        }
        console.log('🧹 Authentication system cleaned up');
    }
}

/**
 * Session Manager Class
 * Handles secure token storage and retrieval
 */
class SessionManager {
    constructor() {
        this.tokenKey = 'techvault_auth_token';
        this.userKey = 'techvault_user_data';
        this.returnUrlKey = 'techvault_return_url';
        this.tokenExpiryKey = 'techvault_token_expiry';
    }

    /**
     * Store authentication token securely
     * @param {string} token - JWT token
     */
    storeAuthToken(token) {
        try {
            // Decode JWT to get expiry time
            const payload = this.decodeJWT(token);
            const expiryTime = payload.exp * 1000; // Convert to milliseconds
            
            // Store token and expiry
            Storage.set(this.tokenKey, token);
            Storage.set(this.tokenExpiryKey, expiryTime);
            
            console.log('🔐 Auth token stored securely');
        } catch (error) {
            console.error('Failed to store auth token:', error);
        }
    }

    /**
     * Get stored authentication token
     * @returns {string|null} Authentication token or null
     */
    getAuthToken() {
        return Storage.get(this.tokenKey);
    }

    /**
     * Store user data
     * @param {Object} userData - User data object
     */
    storeUserData(userData) {
        try {
            Storage.set(this.userKey, userData);
            console.log('👤 User data stored');
        } catch (error) {
            console.error('Failed to store user data:', error);
        }
    }

    /**
     * Get stored user data
     * @returns {Object|null} User data or null
     */
    getUserData() {
        return Storage.get(this.userKey);
    }

    /**
     * Store return URL for post-login redirect
     * @param {string} url - URL to return to after login
     */
    storeReturnUrl(url) {
        Storage.set(this.returnUrlKey, url);
    }

    /**
     * Get stored return URL
     * @returns {string|null} Return URL or null
     */
    getReturnUrl() {
        return Storage.get(this.returnUrlKey);
    }

    /**
     * Clear stored return URL
     */
    clearReturnUrl() {
        Storage.remove(this.returnUrlKey);
    }

    /**
     * Check if current session is valid
     * @returns {boolean} True if session is valid
     */
    isSessionValid() {
        const token = this.getAuthToken();
        const expiryTime = Storage.get(this.tokenExpiryKey);
        
        if (!token || !expiryTime) {
            return false;
        }

        // Check if token is expired (with 5 minute buffer)
        const now = Date.now();
        const buffer = 5 * 60 * 1000; // 5 minutes
        
        return now < (expiryTime - buffer);
    }

    /**
     * Clear all authentication data
     */
    clearAuthData() {
        Storage.remove(this.tokenKey);
        Storage.remove(this.userKey);
        Storage.remove(this.tokenExpiryKey);
        // Don't clear return URL here as it might be needed for redirect
        
        console.log('🧹 Authentication data cleared');
    }

    /**
     * Decode JWT token (client-side only for expiry checking)
     * @param {string} token - JWT token
     * @returns {Object} Decoded payload
     */
    decodeJWT(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }

            const payload = parts[1];
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded);
        } catch (error) {
            console.error('Failed to decode JWT:', error);
            return {};
        }
    }

    /**
     * Handle cross-tab session synchronization
     */
    setupCrossTabSync() {
        // Listen for storage changes in other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === this.tokenKey) {
                if (e.newValue === null) {
                    // Token was cleared in another tab
                    console.log('🔄 Session cleared in another tab');
                    window.location.reload();
                } else if (e.oldValue === null && e.newValue) {
                    // Token was set in another tab
                    console.log('🔄 Session established in another tab');
                    window.location.reload();
                }
            }
        });

        console.log('🔄 Cross-tab session sync enabled');
    }
}

// Create global authentication system instance
const authSystem = new AuthenticationSystem();

// Set up cross-tab synchronization
authSystem.sessionManager.setupCrossTabSync();

// Set up automatic session validation (every 5 minutes)
authSystem.setupAutoValidation();

// Export for global access
window.AuthSystem = authSystem;
window.AuthenticationSystem = AuthenticationSystem;
window.SessionManager = SessionManager;

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AuthenticationSystem,
        SessionManager,
        authSystem
    };
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    authSystem.destroy();
});