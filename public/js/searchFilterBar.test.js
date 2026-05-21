/**
 * SearchFilterBar Unit Tests
 * Tests for search and filtering functionality
 * 
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */

// Import the SearchFilterBar class
const SearchFilterBar = require('./searchFilterBar.js');

describe('SearchFilterBar', () => {
    let searchFilterBar;
    let mockContentLoader;
    let mockNavigationController;
    let container;

    beforeEach(() => {
        // Create mock DOM elements
        document.body.innerHTML = `
            <div class="search-filter-bar">
                <div class="search-box">
                    <i class="fas fa-search search-icon"></i>
                    <input 
                        type="text" 
                        class="search-input" 
                        id="searchInput" 
                        placeholder="Search tools and products..."
                    >
                </div>
                <select class="filter-dropdown" id="categoryFilter">
                    <option value="">All Categories</option>
                    <option value="cybersecurity">Cybersecurity</option>
                    <option value="webdev">Web Development</option>
                    <option value="automation">Automation</option>
                    <option value="devops">DevOps</option>
                </select>
            </div>
        `;

        // Create mock objects
        mockContentLoader = {
            currentContentType: 'tools',
            loadContent: jest.fn()
        };

        mockNavigationController = {
            addEventListener: jest.fn(),
            navigateToPage: jest.fn()
        };

        // Initialize SearchFilterBar
        searchFilterBar = new SearchFilterBar({
            searchInputSelector: '#searchInput',
            categoryFilterSelector: '#categoryFilter',
            filterContainerSelector: '.search-filter-bar',
            contentLoader: mockContentLoader,
            navigationController: mockNavigationController
        });
    });

    afterEach(() => {
        if (searchFilterBar) {
            searchFilterBar.destroy();
        }
        document.body.innerHTML = '';
    });

    describe('Initialization', () => {
        test('should initialize successfully with required DOM elements', () => {
            expect(searchFilterBar.isReady()).toBe(true);
            expect(searchFilterBar.searchInput).not.toBeNull();
            expect(searchFilterBar.categoryFilter).not.toBeNull();
            expect(searchFilterBar.filterContainer).not.toBeNull();
        });

        test('should initialize with empty filters', () => {
            const filters = searchFilterBar.getFilters();
            expect(filters.searchQuery).toBe('');
            expect(filters.category).toBe('');
        });

        test('should fail gracefully if required DOM elements are missing', () => {
            document.body.innerHTML = '';
            
            // Suppress console.error for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            const invalidSearchFilterBar = new SearchFilterBar({
                searchInputSelector: '#nonexistent',
                categoryFilterSelector: '#nonexistent',
                filterContainerSelector: '.nonexistent'
            });
            
            expect(invalidSearchFilterBar.isReady()).toBe(false);
            
            // Restore console.error
            consoleSpy.mockRestore();
        });
    });

    describe('Search Input Handling', () => {
        test('should handle search input with debouncing', (done) => {
            const searchInput = document.getElementById('searchInput');
            
            // Simulate user typing
            searchInput.value = 'security';
            searchInput.dispatchEvent(new Event('input'));

            // Filters should not be applied immediately due to debouncing
            expect(mockContentLoader.loadContent).not.toHaveBeenCalled();

            // Wait for debounce delay
            setTimeout(() => {
                expect(mockContentLoader.loadContent).toHaveBeenCalled();
                expect(searchFilterBar.currentFilters.searchQuery).toBe('security');
                done();
            }, 350);
        });

        test('should update search query in filters', (done) => {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = 'test query';
            searchInput.dispatchEvent(new Event('input'));

            setTimeout(() => {
                const filters = searchFilterBar.getFilters();
                expect(filters.searchQuery).toBe('test query');
                done();
            }, 350);
        });

        test('should trim whitespace from search query', (done) => {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = '  test query  ';
            searchInput.dispatchEvent(new Event('input'));

            setTimeout(() => {
                const filters = searchFilterBar.getFilters();
                expect(filters.searchQuery).toBe('test query');
                done();
            }, 350);
        });

        test('should clear search on Escape key', () => {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = 'test';
            searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

            expect(searchInput.value).toBe('');
            expect(searchFilterBar.currentFilters.searchQuery).toBe('');
        });
    });

    describe('Category Filter Handling', () => {
        test('should handle category filter change', (done) => {
            const categoryFilter = document.getElementById('categoryFilter');
            categoryFilter.value = 'cybersecurity';
            categoryFilter.dispatchEvent(new Event('change'));

            // Category filter should apply immediately (no debounce)
            setTimeout(() => {
                expect(mockContentLoader.loadContent).toHaveBeenCalled();
                expect(searchFilterBar.currentFilters.category).toBe('cybersecurity');
                done();
            }, 50);
        });

        test('should update category in filters', () => {
            const categoryFilter = document.getElementById('categoryFilter');
            categoryFilter.value = 'webdev';
            categoryFilter.dispatchEvent(new Event('change'));

            const filters = searchFilterBar.getFilters();
            expect(filters.category).toBe('webdev');
        });

        test('should handle empty category selection', () => {
            const categoryFilter = document.getElementById('categoryFilter');
            categoryFilter.value = '';
            categoryFilter.dispatchEvent(new Event('change'));

            const filters = searchFilterBar.getFilters();
            expect(filters.category).toBe('');
        });
    });

    describe('Filter Application', () => {
        test('should apply filters to content loader', (done) => {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = 'security';
            searchInput.dispatchEvent(new Event('input'));

            setTimeout(() => {
                expect(mockContentLoader.loadContent).toHaveBeenCalledWith(
                    'tools',
                    expect.objectContaining({
                        searchQuery: 'security',
                        category: ''
                    })
                );
                done();
            }, 350);
        });

        test('should emit filtersApplied event', (done) => {
            const eventCallback = jest.fn();
            searchFilterBar.addEventListener('filtersApplied', eventCallback);

            const searchInput = document.getElementById('searchInput');
            searchInput.value = 'test';
            searchInput.dispatchEvent(new Event('input'));

            setTimeout(() => {
                expect(eventCallback).toHaveBeenCalledWith(
                    expect.objectContaining({
                        filters: expect.objectContaining({
                            searchQuery: 'test'
                        })
                    })
                );
                done();
            }, 350);
        });
    });

    describe('Active Filter Indicators', () => {
        test('should display search filter indicator', (done) => {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = 'security';
            searchInput.dispatchEvent(new Event('input'));

            setTimeout(() => {
                const indicators = document.querySelectorAll('.filter-indicator');
                expect(indicators.length).toBeGreaterThan(0);
                expect(indicators[0].textContent).toContain('Search: "security"');
                done();
            }, 350);
        });

        test('should display category filter indicator', () => {
            const categoryFilter = document.getElementById('categoryFilter');
            categoryFilter.value = 'cybersecurity';
            categoryFilter.dispatchEvent(new Event('change'));

            const indicators = document.querySelectorAll('.filter-indicator');
            expect(indicators.length).toBeGreaterThan(0);
            expect(indicators[0].textContent).toContain('Category: Cybersecurity');
        });

        test('should display clear all button when filters are active', (done) => {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = 'test';
            searchInput.dispatchEvent(new Event('input'));

            setTimeout(() => {
                const clearAllBtn = document.querySelector('.clear-all-btn');
                expect(clearAllBtn).not.toBeNull();
                expect(clearAllBtn.textContent).toContain('Clear All');
                done();
            }, 350);
        });

        test('should not display indicators when no filters are active', () => {
            searchFilterBar.displayActiveFilters();
            const indicators = document.querySelectorAll('.filter-indicator');
            expect(indicators.length).toBe(0);
        });
    });

    describe('Filter Removal', () => {
        test('should clear search filter', (done) => {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = 'security';
            searchInput.dispatchEvent(new Event('input'));

            setTimeout(() => {
                searchFilterBar.clearSearch();
                expect(searchInput.value).toBe('');
                expect(searchFilterBar.currentFilters.searchQuery).toBe('');
                done();
            }, 350);
        });

        test('should clear category filter', () => {
            const categoryFilter = document.getElementById('categoryFilter');
            categoryFilter.value = 'cybersecurity';
            categoryFilter.dispatchEvent(new Event('change'));

            searchFilterBar.clearCategory();
            expect(categoryFilter.value).toBe('');
            expect(searchFilterBar.currentFilters.category).toBe('');
        });

        test('should clear all filters', (done) => {
            const searchInput = document.getElementById('searchInput');
            const categoryFilter = document.getElementById('categoryFilter');

            searchInput.value = 'security';
            categoryFilter.value = 'cybersecurity';

            searchInput.dispatchEvent(new Event('input'));
            categoryFilter.dispatchEvent(new Event('change'));

            setTimeout(() => {
                searchFilterBar.clearAllFilters();

                expect(searchInput.value).toBe('');
                expect(categoryFilter.value).toBe('');
                expect(searchFilterBar.currentFilters.searchQuery).toBe('');
                expect(searchFilterBar.currentFilters.category).toBe('');

                const indicators = document.querySelectorAll('.filter-indicator');
                expect(indicators.length).toBe(0);
                done();
            }, 350);
        });

        test('should emit filtersCleared event when clearing all filters', (done) => {
            const eventCallback = jest.fn();
            searchFilterBar.addEventListener('filtersCleared', eventCallback);

            const searchInput = document.getElementById('searchInput');
            searchInput.value = 'test';
            searchInput.dispatchEvent(new Event('input'));

            setTimeout(() => {
                searchFilterBar.clearAllFilters();
                expect(eventCallback).toHaveBeenCalled();
                done();
            }, 350);
        });
    });

    describe('Filter Indicator Removal', () => {
        test('should remove filter when indicator remove button is clicked', (done) => {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = 'security';
            searchInput.dispatchEvent(new Event('input'));

            setTimeout(() => {
                const removeBtn = document.querySelector('.filter-remove-btn');
                expect(removeBtn).not.toBeNull();
                removeBtn.click();

                expect(searchInput.value).toBe('');
                expect(searchFilterBar.currentFilters.searchQuery).toBe('');
                done();
            }, 350);
        });
    });

    describe('Programmatic Filter Setting', () => {
        test('should set filters programmatically', (done) => {
            searchFilterBar.setFilters({
                searchQuery: 'test',
                category: 'cybersecurity'
            });

            setTimeout(() => {
                const searchInput = document.getElementById('searchInput');
                const categoryFilter = document.getElementById('categoryFilter');

                expect(searchInput.value).toBe('test');
                expect(categoryFilter.value).toBe('cybersecurity');
                expect(searchFilterBar.currentFilters.searchQuery).toBe('test');
                expect(searchFilterBar.currentFilters.category).toBe('cybersecurity');
                done();
            }, 350);
        });

        test('should reset filters to initial state', () => {
            searchFilterBar.setFilters({
                searchQuery: 'test',
                category: 'cybersecurity'
            });

            searchFilterBar.resetFilters();

            const searchInput = document.getElementById('searchInput');
            const categoryFilter = document.getElementById('categoryFilter');

            expect(searchInput.value).toBe('');
            expect(categoryFilter.value).toBe('');
            expect(searchFilterBar.currentFilters.searchQuery).toBe('');
            expect(searchFilterBar.currentFilters.category).toBe('');
        });
    });

    describe('Event Listeners', () => {
        test('should add and remove event listeners', () => {
            const callback = jest.fn();
            searchFilterBar.addEventListener('filtersApplied', callback);

            expect(searchFilterBar.eventListeners.has('filtersApplied')).toBe(true);

            searchFilterBar.removeEventListener('filtersApplied', callback);
            expect(searchFilterBar.eventListeners.get('filtersApplied').size).toBe(0);
        });

        test('should handle multiple event listeners', (done) => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            searchFilterBar.addEventListener('filtersApplied', callback1);
            searchFilterBar.addEventListener('filtersApplied', callback2);

            const searchInput = document.getElementById('searchInput');
            searchInput.value = 'test';
            searchInput.dispatchEvent(new Event('input'));

            setTimeout(() => {
                expect(callback1).toHaveBeenCalled();
                expect(callback2).toHaveBeenCalled();
                done();
            }, 350);
        });
    });

    describe('Cleanup and Destruction', () => {
        test('should destroy component and cleanup resources', () => {
            searchFilterBar.destroy();

            expect(searchFilterBar.isReady()).toBe(false);
            expect(searchFilterBar.searchInput).toBeNull();
            expect(searchFilterBar.categoryFilter).toBeNull();
            expect(searchFilterBar.eventListeners.size).toBe(0);
        });

        test('should clear debounce timer on destroy', (done) => {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = 'test';
            searchInput.dispatchEvent(new Event('input'));

            searchFilterBar.destroy();

            // Wait for debounce delay
            setTimeout(() => {
                // loadContent should not be called after destroy
                expect(mockContentLoader.loadContent).not.toHaveBeenCalled();
                done();
            }, 350);
        });
    });

    describe('HTML Escaping', () => {
        test('should escape HTML special characters in filter labels', (done) => {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = '<script>alert("xss")</script>';
            searchInput.dispatchEvent(new Event('input'));

            setTimeout(() => {
                const indicator = document.querySelector('.filter-indicator');
                // The innerHTML should contain the escaped version
                expect(indicator.innerHTML).toContain('&lt;script&gt;');
                done();
            }, 350);
        });
    });

    describe('Category Label Mapping', () => {
        test('should map category values to display labels', () => {
            expect(searchFilterBar.getCategoryLabel('cybersecurity')).toBe('Cybersecurity');
            expect(searchFilterBar.getCategoryLabel('webdev')).toBe('Web Development');
            expect(searchFilterBar.getCategoryLabel('automation')).toBe('Automation');
            expect(searchFilterBar.getCategoryLabel('devops')).toBe('DevOps');
            expect(searchFilterBar.getCategoryLabel('hardware')).toBe('Hardware');
        });

        test('should return category value if label not found', () => {
            expect(searchFilterBar.getCategoryLabel('unknown')).toBe('unknown');
        });
    });

    describe('Edge Cases', () => {
        test('should handle rapid filter changes', (done) => {
            const searchInput = document.getElementById('searchInput');

            searchInput.value = 'a';
            searchInput.dispatchEvent(new Event('input'));

            searchInput.value = 'ab';
            searchInput.dispatchEvent(new Event('input'));

            searchInput.value = 'abc';
            searchInput.dispatchEvent(new Event('input'));

            setTimeout(() => {
                // Only the last value should be applied
                expect(searchFilterBar.currentFilters.searchQuery).toBe('abc');
                done();
            }, 350);
        });

        test('should handle empty search query', (done) => {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));

            setTimeout(() => {
                expect(searchFilterBar.currentFilters.searchQuery).toBe('');
                done();
            }, 350);
        });

        test('should handle special characters in search', (done) => {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = '@#$%^&*()';
            searchInput.dispatchEvent(new Event('input'));

            setTimeout(() => {
                expect(searchFilterBar.currentFilters.searchQuery).toBe('@#$%^&*()');
                done();
            }, 350);
        });
    });
});
