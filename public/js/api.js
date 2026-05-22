// TechVault E-Commerce Platform - API Communication

/**
 * API Configuration
 */
const API_CONFIG = {
    // Detect environment and set appropriate API URL
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : (window.REACT_APP_API_URL || 'https://techvault-backend-production.up.railway.app/api'),
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
};

/**
 * HTTP Client with error handling and retries
 */
class APIClient {
    constructor(baseURL = API_CONFIG.BASE_URL) {
        this.baseURL = baseURL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
        this.retryDelay = API_CONFIG.RETRY_DELAY;
    }

    /**
     * Make HTTP request with retry logic
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @param {number} attempt - Current attempt number
     * @returns {Promise<Object>} API response
     */
    async request(endpoint, options = {}, attempt = 1) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: this.timeout,
            ...options
        };

        try {
            console.log(`API Request (attempt ${attempt}):`, url, defaultOptions);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(url, {
                ...defaultOptions,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('API Response:', data);
            
            return data;
        } catch (error) {
            console.error(`API Error (attempt ${attempt}):`, error);
            
            // Retry logic for network errors
            if (attempt < this.retryAttempts && this.shouldRetry(error)) {
                console.log(`Retrying in ${this.retryDelay}ms...`);
                await this.delay(this.retryDelay);
                return this.request(endpoint, options, attempt + 1);
            }
            
            throw this.handleError(error);
        }
    }

    /**
     * Determine if request should be retried
     * @param {Error} error - Error object
     * @returns {boolean} Should retry
     */
    shouldRetry(error) {
        // Retry on network errors, timeouts, and 5xx server errors
        return error.name === 'AbortError' || 
               error.message.includes('fetch') ||
               error.message.includes('5');
    }

    /**
     * Handle and format API errors
     * @param {Error} error - Error object
     * @returns {Error} Formatted error
     */
    handleError(error) {
        if (error.name === 'AbortError') {
            return new Error('Request timeout. Please check your connection and try again.');
        }
        
        if (error.message.includes('Failed to fetch')) {
            return new Error('Network error. Please check your connection and try again.');
        }
        
        return error;
    }

    /**
     * Delay utility for retries
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} API response
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @returns {Promise<Object>} API response
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @returns {Promise<Object>} API response
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<Object>} API response
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// Create API client instance
const api = new APIClient();

/**
 * Product API methods
 */
const ProductAPI = {
    /**
     * Get all products with optional filtering
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Array>} Products array
     */
    async getAll(filters = {}) {
        try {
            const response = await api.get('/products', filters);
            return response.success ? response.data : [];
        } catch (error) {
            console.error('Failed to fetch products:', error);
            throw error;
        }
    },

    /**
     * Get single product by ID
     * @param {number} id - Product ID
     * @returns {Promise<Object>} Product object
     */
    async getById(id) {
        try {
            const response = await api.get(`/products/${id}`);
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Failed to fetch product:', error);
            throw error;
        }
    },

    /**
     * Search products by query
     * @param {string} query - Search query
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Products array
     */
    async search(query, filters = {}) {
        try {
            const searchFilters = { ...filters, search: query };
            return await this.getAll(searchFilters);
        } catch (error) {
            console.error('Failed to search products:', error);
            throw error;
        }
    }
};

/**
 * Order API methods
 */
const OrderAPI = {
    /**
     * Create new order
     * @param {Object} orderData - Order data
     * @returns {Promise<Object>} Order response
     */
    async create(orderData) {
        try {
            const response = await api.post('/orders', orderData);
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Failed to create order:', error);
            throw error;
        }
    },

    /**
     * Get order by order number
     * @param {string} orderNumber - Order number
     * @returns {Promise<Object>} Order object
     */
    async getByOrderNumber(orderNumber) {
        try {
            const response = await api.get(`/orders/${orderNumber}`);
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Failed to fetch order:', error);
            throw error;
        }
    }
};

/**
 * Authentication API methods
 */
const AuthAPI = {
    /**
     * Login user
     * @param {Object} credentials - Login credentials
     * @returns {Promise<Object>} Authentication response
     */
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials);
            return response;
        } catch (error) {
            console.error('Login API call failed:', error);
            throw error;
        }
    },

    /**
     * Sign up new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Authentication response
     */
    async signup(userData) {
        try {
            const response = await api.post('/auth/signup', userData);
            return response;
        } catch (error) {
            console.error('Signup API call failed:', error);
            throw error;
        }
    },

    /**
     * Get user profile (requires authentication)
     * @param {string} token - Authentication token
     * @returns {Promise<Object>} User profile data
     */
    async getProfile(token) {
        try {
            const response = await api.request('/auth/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            console.error('Get profile API call failed:', error);
            throw error;
        }
    },

    /**
     * Update user profile (requires authentication)
     * @param {Object} profileData - Profile data to update
     * @param {string} token - Authentication token
     * @returns {Promise<Object>} Update response
     */
    async updateProfile(profileData, token) {
        try {
            const response = await api.request('/auth/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });
            return response;
        } catch (error) {
            console.error('Update profile API call failed:', error);
            throw error;
        }
    },

    /**
     * Logout user
     * @param {string} token - Authentication token
     * @returns {Promise<Object>} Logout response
     */
    async logout(token) {
        try {
            const response = await api.request('/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            console.error('Logout API call failed:', error);
            throw error;
        }
    }
};

/**
 * Health check API
 */
const HealthAPI = {
    /**
     * Check API health
     * @returns {Promise<boolean>} API health status
     */
    async check() {
        try {
            const response = await api.get('/health');
            return response.success;
        } catch (error) {
            console.error('API health check failed:', error);
            return false;
        }
    }
};

// Export API methods
window.API = {
    client: api,
    auth: AuthAPI,
    products: ProductAPI,
    orders: OrderAPI,
    health: HealthAPI,
    config: API_CONFIG
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APIClient,
        AuthAPI,
        ProductAPI,
        OrderAPI,
        HealthAPI,
        API_CONFIG
    };
}