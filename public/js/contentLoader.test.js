/**
 * Unit Tests for ContentLoader
 * Tests dynamic content loading, state management, and error handling
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */

// Import ContentLoader
const ContentLoader = require('./contentLoader.js');

describe('ContentLoader', () => {
    let contentLoader;
    let mockNavigationController;

    beforeEach(() => {
        // Create mock DOM structure
        document.body.innerHTML = `
            <main class="main-content" id="mainContent">
                <div class="content-body">
                    <!-- Content will be loaded here -->
                </div>
            </main>
        `;

        // Create mock NavigationController
        mockNavigationController = {
            navigateToPage: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };

        // Create ContentLoader instance
        contentLoader = new ContentLoader({
            navigationController: mockNavigationController
        });
    });

    afterEach(() => {
        if (contentLoader) {
            contentLoader.destroy();
        }
        document.body.innerHTML = '';
    });

    describe('Initialization', () => {
        test('should initialize successfully with valid DOM elements', () => {
            expect(contentLoader.isReady()).toBe(true);
        });

        test('should cache DOM elements on initialization', () => {
            expect(contentLoader.contentArea).toBeTruthy();
            expect(contentLoader.contentBody).toBeTruthy();
        });

        test('should fail gracefully if required DOM elements are missing', () => {
            document.getElementById('mainContent').remove();
            const loader = new ContentLoader();
            expect(loader.isReady()).toBe(false);
            // Don't call destroy since it wasn't initialized
        });

        test('should register with navigation controller', () => {
            expect(mockNavigationController.addEventListener).toHaveBeenCalledWith(
                'pageChange',
                expect.any(Function)
            );
        });
    });

    describe('Content Loading', () => {
        test('should load dashboard content', async () => {
            await contentLoader.loadContent('dashboard');

            const content = document.querySelector('.content-body');
            expect(content.innerHTML).toContain('Welcome to TechVault');
        });

        test('should load tools content', async () => {
            await contentLoader.loadContent('tools');

            const content = document.querySelector('.content-body');
            expect(content.innerHTML).toContain('All Tools');
        });

        test('should load orders content', async () => {
            await contentLoader.loadContent('orders');

            const content = document.querySelector('.content-body');
            expect(content.innerHTML).toContain('My Orders');
        });

        test('should load category tools content', async () => {
            await contentLoader.loadContent('cybersecurity');

            const content = document.querySelector('.content-body');
            expect(content.innerHTML).toContain('Cybersecurity Tools');
        });

        test('should load profile content', async () => {
            await contentLoader.loadContent('profile');

            const content = document.querySelector('.content-body');
            expect(content.innerHTML).toContain('My Profile');
        });

        test('should load settings content', async () => {
            await contentLoader.loadContent('settings');

            const content = document.querySelector('.content-body');
            expect(content.innerHTML).toContain('Settings');
        });

        test('should throw error for unknown content type', async () => {
            // loadContent catches errors and displays error state instead of throwing
            await contentLoader.loadContent('unknown');
            const errorContainer = document.querySelector('.error-container');
            expect(errorContainer).toBeTruthy();
        });

        test('should prevent duplicate loading', async () => {
            const loadSpy = jest.spyOn(contentLoader, 'loadDashboard');
            
            contentLoader.isLoading = true;
            contentLoader.currentContentType = 'dashboard';
            
            await contentLoader.loadContent('dashboard');
            
            expect(loadSpy).not.toHaveBeenCalled();
        });
    });

    describe('Loading States', () => {
        test('should show loading state', () => {
            contentLoader.showLoadingState();
            const loading = document.querySelector('.loading-container');
            expect(loading).toBeTruthy();
            expect(loading.textContent).toContain('Loading content');
        });

        test('should hide loading state', () => {
            contentLoader.showLoadingState();
            contentLoader.hideLoadingState();
            const loading = document.querySelector('.loading-container');
            expect(loading).toBeFalsy();
        });

        test('should display content', () => {
            const testContent = '<div class="test">Test Content</div>';
            contentLoader.displayContent(testContent);
            expect(document.querySelector('.test')).toBeTruthy();
            expect(document.querySelector('.test').textContent).toBe('Test Content');
        });

        test('should display HTML element content', () => {
            const element = document.createElement('div');
            element.className = 'test-element';
            element.textContent = 'Element Content';
            
            contentLoader.displayContent(element);
            expect(document.querySelector('.test-element')).toBeTruthy();
        });
    });

    describe('Error Handling', () => {
        test('should display error message', () => {
            contentLoader.displayError('Test error message');
            const error = document.querySelector('.error-container');
            expect(error).toBeTruthy();
            expect(error.textContent).toContain('Test error message');
        });

        test('should display error with retry button', () => {
            const retryCallback = jest.fn();
            contentLoader.displayError('Test error', retryCallback);
            
            const retryBtn = document.querySelector('.retry-btn');
            expect(retryBtn).toBeTruthy();
        });

        test('should display error with go home button', () => {
            contentLoader.displayError('Test error');
            const goHomeBtn = document.querySelector('.go-home-btn');
            expect(goHomeBtn).toBeTruthy();
        });

        test('should call retry callback when retry button clicked', () => {
            const retryCallback = jest.fn();
            contentLoader.displayError('Test error', retryCallback);
            
            const retryBtn = document.querySelector('.retry-btn');
            retryBtn.click();
            
            expect(retryCallback).toHaveBeenCalled();
        });

        test('should navigate to dashboard when go home button clicked', () => {
            contentLoader.displayError('Test error');
            const goHomeBtn = document.querySelector('.go-home-btn');
            goHomeBtn.click();
            
            expect(mockNavigationController.navigateToPage).toHaveBeenCalledWith('dashboard');
        });

        test('should escape HTML in error messages', () => {
            const maliciousMessage = '<script>alert("xss")</script>';
            contentLoader.displayError(maliciousMessage);
            
            const errorContainer = document.querySelector('.error-container');
            expect(errorContainer.innerHTML).not.toContain('<script>');
        });
    });

    describe('Scroll Position', () => {
        test('should reset scroll position to top', () => {
            const contentBody = document.querySelector('.content-body');
            contentBody.scrollTop = 500;
            
            contentLoader.resetScrollPosition();
            
            expect(contentBody.scrollTop).toBe(0);
        });

        test('should reset scroll position on content display', async () => {
            const contentBody = document.querySelector('.content-body');
            contentBody.scrollTop = 500;
            
            contentLoader.displayContent('<div>Test</div>');
            
            expect(contentBody.scrollTop).toBe(0);
        });
    });

    describe('Content Caching', () => {
        test('should cache content after loading', async () => {
            await contentLoader.loadContent('dashboard');
            
            const cacheKey = contentLoader.getCacheKey('dashboard');
            expect(contentLoader.contentCache.has(cacheKey)).toBe(true);
        });

        test('should use cached content on subsequent loads', async () => {
            await contentLoader.loadContent('dashboard');
            
            const loadSpy = jest.spyOn(contentLoader, 'loadDashboard');
            
            await contentLoader.loadContent('dashboard');
            
            expect(loadSpy).not.toHaveBeenCalled();
        });

        test('should clear cache', () => {
            contentLoader.contentCache.set('test', 'content');
            contentLoader.clearCache();
            expect(contentLoader.contentCache.size).toBe(0);
        });

        test('should clear cache for specific content type', () => {
            contentLoader.contentCache.set('dashboard', 'content1');
            contentLoader.contentCache.set('dashboard:filter1', 'content2');
            contentLoader.contentCache.set('tools', 'content3');
            
            contentLoader.clearCacheForType('dashboard');
            
            expect(contentLoader.contentCache.has('dashboard')).toBe(false);
            expect(contentLoader.contentCache.has('dashboard:filter1')).toBe(false);
            expect(contentLoader.contentCache.has('tools')).toBe(true);
        });

        test('should generate correct cache keys', () => {
            const key1 = contentLoader.getCacheKey('dashboard');
            const key2 = contentLoader.getCacheKey('dashboard', { filter: 'test' });
            
            expect(key1).toBe('dashboard');
            expect(key2).toContain('dashboard:');
        });
    });

    describe('Event Handling', () => {
        test('should emit contentLoaded event', async () => {
            const eventCallback = jest.fn();
            contentLoader.addEventListener('contentLoaded', eventCallback);
            
            await contentLoader.loadContent('dashboard');
            
            expect(eventCallback).toHaveBeenCalled();
            expect(eventCallback.mock.calls[0][0].contentType).toBe('dashboard');
        });

        test('should handle page change events from navigation controller', async () => {
            // Get the callback registered with navigation controller
            const pageChangeCallback = mockNavigationController.addEventListener.mock.calls[0][1];
            
            // Simulate page change event
            pageChangeCallback({ currentPage: 'tools' });
            
            expect(contentLoader.currentContentType).toBe('tools');
        });

        test('should add event listener', () => {
            const callback = jest.fn();
            contentLoader.addEventListener('test', callback);
            
            contentLoader.emitEvent('test', { data: 'test' });
            
            expect(callback).toHaveBeenCalled();
        });

        test('should remove event listener', () => {
            const callback = jest.fn();
            contentLoader.addEventListener('test', callback);
            contentLoader.removeEventListener('test', callback);
            
            contentLoader.emitEvent('test', { data: 'test' });
            
            expect(callback).not.toHaveBeenCalled();
        });

        test('should handle errors in event listeners gracefully', () => {
            contentLoader.addEventListener('test', () => {
                throw new Error('Test error');
            });
            contentLoader.addEventListener('test', jest.fn());
            
            expect(() => contentLoader.emitEvent('test', {})).not.toThrow();
        });
    });

    describe('Content Handlers', () => {
        test('should load dashboard with featured tools', async () => {
            const content = await contentLoader.loadDashboard();
            expect(content).toContain('Featured Tools');
            expect(content).toContain('Security Scanner');
        });

        test('should load tools with grid layout', async () => {
            const content = await contentLoader.loadTools();
            expect(content).toContain('tools-grid');
            expect(content).toContain('Security Scanner Pro');
        });

        test('should load orders with table', async () => {
            const content = await contentLoader.loadOrders();
            expect(content).toContain('orders-table');
            expect(content).toContain('ORD-001');
        });

        test('should load category tools with category name', async () => {
            contentLoader.currentContentType = 'cybersecurity';
            const content = await contentLoader.loadCategoryTools();
            expect(content).toContain('Cybersecurity Tools');
        });

        test('should load profile with form', async () => {
            const content = await contentLoader.loadProfile();
            expect(content).toContain('My Profile');
            expect(content).toContain('Full Name');
        });

        test('should load settings with options', async () => {
            const content = await contentLoader.loadSettings();
            expect(content).toContain('Settings');
            expect(content).toContain('Theme');
        });
    });

    describe('Utility Methods', () => {
        test('should escape HTML special characters', () => {
            const input = '<script>alert("xss")</script>';
            const escaped = contentLoader.escapeHtml(input);
            expect(escaped).not.toContain('<script>');
            expect(escaped).toContain('&lt;');
        });

        test('should delay execution', async () => {
            const start = Date.now();
            await contentLoader.delay(100);
            const elapsed = Date.now() - start;
            expect(elapsed).toBeGreaterThanOrEqual(100);
        });
    });

    describe('Cleanup', () => {
        test('should destroy content loader', () => {
            contentLoader.destroy();
            expect(contentLoader.isReady()).toBe(false);
        });

        test('should clear cache on destroy', () => {
            contentLoader.contentCache.set('test', 'content');
            contentLoader.destroy();
            expect(contentLoader.contentCache.size).toBe(0);
        });

        test('should clear event listeners on destroy', () => {
            const callback = jest.fn();
            contentLoader.addEventListener('test', callback);
            contentLoader.destroy();
            
            contentLoader.emitEvent('test', {});
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('Integration Tests', () => {
        test('should handle complete content loading workflow', async () => {
            const eventCallback = jest.fn();
            contentLoader.addEventListener('contentLoaded', eventCallback);
            
            await contentLoader.loadContent('dashboard');
            
            expect(contentLoader.currentContentType).toBe('dashboard');
            expect(eventCallback).toHaveBeenCalled();
            expect(document.querySelector('.content-body').innerHTML).toContain('Welcome to TechVault');
        });

        test('should handle navigation between different content types', async () => {
            await contentLoader.loadContent('dashboard');
            
            await contentLoader.loadContent('tools');
            
            expect(contentLoader.currentContentType).toBe('tools');
            expect(document.querySelector('.content-body').innerHTML).toContain('All Tools');
        });

        test('should handle error recovery with retry', async () => {
            const retryCallback = jest.fn();
            contentLoader.displayError('Test error', retryCallback);
            
            const retryBtn = document.querySelector('.retry-btn');
            retryBtn.click();
            
            expect(retryCallback).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        test('should handle null content gracefully', () => {
            // displayContent catches errors and displays error message instead of throwing
            contentLoader.displayContent(null);
            const errorContainer = document.querySelector('.error-container');
            expect(errorContainer).toBeTruthy();
        });

        test('should handle empty content type', async () => {
            // loadContent with empty string returns undefined (no handler found)
            await contentLoader.loadContent('');
            // Should display error message
            const errorContainer = document.querySelector('.error-container');
            expect(errorContainer).toBeTruthy();
        });

        test('should handle rapid content changes', async () => {
            contentLoader.loadContent('dashboard');
            contentLoader.loadContent('tools');
            contentLoader.loadContent('orders');
            
            await contentLoader.loadContent('orders');
            
            expect(contentLoader.currentContentType).toBe('orders');
        });

        test('should handle missing navigation controller', () => {
            const loader = new ContentLoader({
                navigationController: null
            });
            
            expect(loader.isReady()).toBe(true);
            loader.destroy();
        });
    });
});
