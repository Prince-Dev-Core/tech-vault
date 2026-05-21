// TechVault E-Commerce Platform - Session Manager

/**
 * SessionManager class for persistent authentication state management
 * Handles secure localStorage token management, expiration validation, and cross-tab synchronization
 */
class SessionManager {
    constructor() {
        this.storageKeys = {
            TOKEN: 'techvault_auth_token',
            USER: 'techvault_user_data',
            EXPIRES_AT: 'techvault_token_expires',
            REFRESH_TOKEN: 'techvault_refresh_token'
        };
        
        this.eventListeners = new Map();
        this.refreshPromise = null;
        this.refreshTimer = null;
        
        // Initialize cross-tab synchronization
        this.initializeCrossTabSync();
        
        // Set up automatic token refresh
        this.setupTokenRefresh();
    }

    /**
     * Store authentication token securely in localStorage
     * @param {string} token - JWT authentication token
     * @param {Object} userData - User data object
     * @param {string} refreshToken - Optional refresh token
     */
    storeAuthToken(token, userData = null, refreshToken = null) {
        try {
            if (!token) {
                throw new Error('Token is required');
            }

            // Parse token to get expiration
            const tokenData = this.parseJWT(token);
            const expiresAt = tokenData.exp ? new Date(tokenData.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);

            // Store token data
            localStorage.setItem(this.storageKeys.TOKEN, token);
            localStorage.setItem(this.storageKeys.EXPIRES_AT, expiresAt.toISOString());
            
            if (userData) {
                localStorage.setItem(this.storageKeys.USER, JSON.stringify(userData));
            }
            
            if (refreshToken) {
                localStorage.setItem(this.storageKeys.REFRESH_TOKEN, refreshToken);
            }

            // Notify other tabs about session change
            this.broadcastSessionChange('login', { token, userData, expiresAt });
            
            // Setup refresh timer
            this.setupTokenRefresh();
            
            console.log('✅ Authentication token stored successfully');
            
        } catch (error) {
            console.error('❌ Failed to store auth token:', error);
            throw new Error('Failed to store authentication token');
        }
    }

    /**
     * Get authentication token from localStorage
     * @returns {string|null} Authentication token or null if not found/expired
     */
    getAuthToken() {
        try {
            const token = localStorage.getItem(this.storageKeys.TOKEN);
            
            if (!token) {
                return null;
            }

            // Check if token is expired
            if (!this.isSessionValid()) {
                this.clearAuthData();
                return null;
            }

            return token;
            
        } catch (error) {
            console.error('❌ Failed to get auth token:', error);
            return null;
        }
    }

    /**
     * Get user data from localStorage
     * @returns {Object|null} User data object or null if not found
     */
    getUserData() {
        try {
            const userData = localStorage.getItem(this.storageKeys.USER);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('❌ Failed to get user data:', error);
            return null;
        }
    }

    /**
     * Clear all authentication data from localStorage
     */
    clearAuthData() {
        try {
            // Clear all auth-related data
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });

            // Clear refresh timer
            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer);
                this.refreshTimer = null;
            }

            // Notify other tabs about session change
            this.broadcastSessionChange('logout');
            
            console.log('✅ Authentication data cleared successfully');
            
        } catch (error) {
            console.error('❌ Failed to clear auth data:', error);
        }
    }

    /**
     * Check if current session is valid (token exists and not expired)
     * @returns {boolean} True if session is valid
     */
    isSessionValid() {
        try {
            const token = localStorage.getItem(this.storageKeys.TOKEN);
            const expiresAt = localStorage.getItem(this.storageKeys.EXPIRES_AT);
            
            if (!token || !expiresAt) {
                return false;
            }

            const expiration = new Date(expiresAt);
            const now = new Date();
            
            // Add 5-minute buffer for token refresh
            const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
            
            return expiration.getTime() > (now.getTime() + bufferTime);
            
        } catch (error) {
            console.error('❌ Failed to validate session:', error);
            return false;
        }
    }

    /**
     * Get token expiration time
     * @returns {Date|null} Expiration date or null if no token
     */
    getTokenExpiration() {
        try {
            const expiresAt = localStorage.getItem(this.storageKeys.EXPIRES_AT);
            return expiresAt ? new Date(expiresAt) : null;
        } catch (error) {
            console.error('❌ Failed to get token expiration:', error);
            return null;
        }
    }

    /**
     * Refresh authentication token
     * @returns {Promise<string>} New authentication token
     */
    async refreshToken() {
        // Prevent multiple simultaneous refresh attempts
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = this._performTokenRefresh();
        
        try {
            const result = await this.refreshPromise;
            return result;
        } finally {
            this.refreshPromise = null;
        }
    }

    /**
     * Perform the actual token refresh
     * @private
     * @returns {Promise<string>} New authentication token
     */
    async _performTokenRefresh() {
        try {
            const currentToken = this.getAuthToken();
            const refreshToken = localStorage.getItem(this.storageKeys.REFRESH_TOKEN);
            
            if (!currentToken) {
                throw new Error('No current token to refresh');
            }

            // For now, we'll validate the current token with the server
            // In a full implementation, you'd use a refresh token endpoint
            const response = await fetch('/api/auth/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${currentToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Token is still valid, extend expiration
                const tokenData = this.parseJWT(currentToken);
                const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
                
                localStorage.setItem(this.storageKeys.EXPIRES_AT, newExpiresAt.toISOString());
                
                // Setup next refresh
                this.setupTokenRefresh();
                
                console.log('✅ Token refreshed successfully');
                return currentToken;
            } else {
                // Token is invalid, clear session
                this.clearAuthData();
                throw new Error('Token refresh failed - session expired');
            }
            
        } catch (error) {
            console.error('❌ Token refresh failed:', error);
            this.clearAuthData();
            throw error;
        }
    }

    /**
     * Setup automatic token refresh timer
     * @private
     */
    setupTokenRefresh() {
        // Clear existing timer
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        const expiresAt = this.getTokenExpiration();
        if (!expiresAt) {
            return;
        }

        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        
        // Refresh 10 minutes before expiration
        const refreshTime = Math.max(timeUntilExpiry - (10 * 60 * 1000), 60000); // At least 1 minute

        if (refreshTime > 0) {
            this.refreshTimer = setTimeout(async () => {
                try {
                    await this.refreshToken();
                } catch (error) {
                    console.error('❌ Automatic token refresh failed:', error);
                    // Emit session expired event
                    this.emitEvent('sessionExpired', { error });
                }
            }, refreshTime);
            
            console.log(`🔄 Token refresh scheduled in ${Math.round(refreshTime / 60000)} minutes`);
        }
    }

    /**
     * Initialize cross-tab session synchronization
     * @private
     */
    initializeCrossTabSync() {
        // Listen for storage changes from other tabs
        window.addEventListener('storage', (event) => {
            if (event.key === 'techvault_session_sync') {
                try {
                    const syncData = JSON.parse(event.newValue || '{}');
                    this.handleCrossTabSync(syncData);
                } catch (error) {
                    console.error('❌ Failed to handle cross-tab sync:', error);
                }
            }
        });

        // Listen for beforeunload to cleanup
        window.addEventListener('beforeunload', () => {
            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer);
            }
        });
    }

    /**
     * Handle cross-tab synchronization events
     * @private
     * @param {Object} syncData - Synchronization data
     */
    handleCrossTabSync(syncData) {
        const { type, data, timestamp } = syncData;
        
        // Ignore old events (older than 5 seconds)
        if (Date.now() - timestamp > 5000) {
            return;
        }

        switch (type) {
            case 'login':
                // Another tab logged in, update local session
                if (data.token && data.userData) {
                    this.storeAuthToken(data.token, data.userData);
                    this.emitEvent('sessionUpdated', data);
                }
                break;
                
            case 'logout':
                // Another tab logged out, clear local session
                this.clearAuthData();
                this.emitEvent('sessionExpired', { reason: 'logout_other_tab' });
                break;
                
            case 'refresh':
                // Another tab refreshed token, update local expiration
                if (data.expiresAt) {
                    localStorage.setItem(this.storageKeys.EXPIRES_AT, data.expiresAt);
                    this.setupTokenRefresh();
                }
                break;
        }
    }

    /**
     * Broadcast session changes to other tabs
     * @private
     * @param {string} type - Type of change (login, logout, refresh)
     * @param {Object} data - Additional data
     */
    broadcastSessionChange(type, data = {}) {
        try {
            const syncData = {
                type,
                data,
                timestamp: Date.now()
            };
            
            // Use a temporary storage item for cross-tab communication
            localStorage.setItem('techvault_session_sync', JSON.stringify(syncData));
            
            // Remove the sync item after a short delay
            setTimeout(() => {
                localStorage.removeItem('techvault_session_sync');
            }, 1000);
            
        } catch (error) {
            console.error('❌ Failed to broadcast session change:', error);
        }
    }

    /**
     * Parse JWT token to extract payload
     * @private
     * @param {string} token - JWT token
     * @returns {Object} Parsed token payload
     */
    parseJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('❌ Failed to parse JWT token:', error);
            return {};
        }
    }

    /**
     * Add event listener for session events
     * @param {string} event - Event name (sessionExpired, sessionUpdated)
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
     * Get session information
     * @returns {Object} Session information object
     */
    getSessionInfo() {
        const token = this.getAuthToken();
        const userData = this.getUserData();
        const expiresAt = this.getTokenExpiration();
        const isValid = this.isSessionValid();
        
        return {
            isAuthenticated: !!token && isValid,
            token,
            userData,
            expiresAt,
            isValid,
            timeUntilExpiry: expiresAt ? expiresAt.getTime() - Date.now() : null
        };
    }

    /**
     * Update user data in session
     * @param {Object} userData - Updated user data
     */
    updateUserData(userData) {
        try {
            if (userData && this.getAuthToken()) {
                localStorage.setItem(this.storageKeys.USER, JSON.stringify(userData));
                this.emitEvent('userDataUpdated', userData);
                console.log('✅ User data updated successfully');
            }
        } catch (error) {
            console.error('❌ Failed to update user data:', error);
        }
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if user is authenticated
     */
    isAuthenticated() {
        return this.isSessionValid() && !!this.getAuthToken();
    }
}

// Create global session manager instance
const sessionManager = new SessionManager();

// Export for global access
window.SessionManager = SessionManager;
window.sessionManager = sessionManager;

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SessionManager;
}

console.log('🔐 SessionManager initialized successfully');