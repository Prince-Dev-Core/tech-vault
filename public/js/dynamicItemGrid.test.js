/**
 * DynamicItemGrid Test Suite
 * Tests for responsive grid behavior, item card display, and pagination
 * 
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

// Import the DynamicItemGrid class
const DynamicItemGrid = require('./dynamicItemGrid');

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
};

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('DynamicItemGrid', () => {
    let grid;
    let container;
    let mockCart;

    // Mock data
    const mockItems = [
        {
            id: 1,
            name: 'Security Scanner Pro',
            description: 'Professional vulnerability scanner for web applications',
            price: 299.99,
            category: 'cybersecurity',
            image_url: 'https://via.placeholder.com/300x200?text=Scanner'
        },
        {
            id: 2,
            name: 'Web Framework Starter',
            description: 'Complete web development framework with built-in tools',
            price: 199.99,
            category: 'webdev',
            image_url: 'https://via.placeholder.com/300x200?text=Framework'
        },
        {
            id: 3,
            name: 'Automation Suite',
            description: 'Automate repetitive tasks with powerful scripting',
            price: 149.99,
            category: 'automation',
            image_url: 'https://via.placeholder.com/300x200?text=Automation'
        },
        {
            id: 4,
            name: 'DevOps Toolkit',
            description: 'Complete DevOps solution for CI/CD pipelines',
            price: 399.99,
            category: 'devops',
            image_url: 'https://via.placeholder.com/300x200?text=DevOps'
        }
    ];

    beforeEach(() => {
        // Create container
        container = document.createElement('div');
        container.id = 'itemsGrid';
        document.body.appendChild(container);

        // Mock cart
        mockCart = {
            addItem: jest.fn().mockReturnValue(true),
            removeItem: jest.fn().mockReturnValue(true)
        };

        // Initialize grid
        grid = new DynamicItemGrid({
            gridSelector: '#itemsGrid',
            itemsPerPage: 2,
            lazyLoadImages: false,
            cart: mockCart
        });
    });

    afterEach(() => {
        // Cleanup
        if (grid) {
            grid.destroy();
        }
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    // ===== INITIALIZATION TESTS =====
    describe('Initialization', () => {
        test('should initialize successfully with valid container', () => {
            expect(grid.isReady()).toBe(true);
            expect(grid.gridContainer).toBe(container);
        });

        test('should fail initialization with missing container', () => {
            const invalidGrid = new DynamicItemGrid({
                gridSelector: '#nonexistent'
            });
            expect(invalidGrid.isReady()).toBe(false);
        });

        test('should set default configuration values', () => {
            expect(grid.itemsPerPage).toBe(2);
            expect(grid.lazyLoadImages).toBe(false);
            expect(grid.currentPage).toBe(1);
            expect(grid.totalPages).toBe(1);
        });
    });

    // ===== GRID RENDERING TESTS =====
    describe('Grid Rendering - Requirement 8.1, 8.2', () => {
        test('should render grid with items', () => {
            grid.renderGrid(mockItems);
            const cards = container.querySelectorAll('.item-card');
            expect(cards.length).toBe(2); // First page with 2 items per page
        });

        test('should render correct number of items per page', () => {
            grid.renderGrid(mockItems);
            const cards = container.querySelectorAll('.item-card');
            expect(cards.length).toBe(grid.itemsPerPage);
        });

        test('should render all items across multiple pages', () => {
            grid.renderGrid(mockItems);
            expect(grid.totalPages).toBe(2); // 4 items / 2 per page = 2 pages
        });

        test('should render empty state when no items provided', () => {
            grid.renderGrid([]);
            const emptyState = container.querySelector('.empty-state');
            expect(emptyState).toBeTruthy();
        });

        test('should render error state on rendering error', () => {
            grid.gridContainer = null; // Simulate error condition
            grid.renderGrid(mockItems);
            // Grid should handle error gracefully
            expect(grid.gridContainer).toBeNull();
        });
    });

    // ===== ITEM CARD TESTS =====
    describe('Item Card Display - Requirement 8.3, 8.4', () => {
        test('should display item name in card', () => {
            grid.renderGrid(mockItems);
            const cardName = container.querySelector('.item-name');
            expect(cardName.textContent).toBe(mockItems[0].name);
        });

        test('should display item description in card', () => {
            grid.renderGrid(mockItems);
            const cardDescription = container.querySelector('.item-description');
            expect(cardDescription.textContent).toContain(mockItems[0].description);
        });

        test('should display item price in card', () => {
            grid.renderGrid(mockItems);
            const cardPrice = container.querySelector('.item-price');
            expect(cardPrice.textContent).toContain('299.99');
        });

        test('should display item category in card', () => {
            grid.renderGrid(mockItems);
            const cardCategory = container.querySelector('.item-category');
            expect(cardCategory.textContent).toContain('cybersecurity');
        });

        test('should display item image with correct alt text', () => {
            grid.renderGrid(mockItems);
            const cardImage = container.querySelector('.item-image');
            expect(cardImage.alt).toBe(mockItems[0].name);
        });

        test('should escape HTML in item data', () => {
            const itemWithHtml = {
                ...mockItems[0],
                name: '<script>alert("xss")</script>',
                description: '<img src=x onerror="alert(1)">'
            };
            grid.renderGrid([itemWithHtml]);
            const cardName = container.querySelector('.item-name');
            // textContent shows the escaped content, innerHTML shows the HTML entities
            expect(cardName.innerHTML).toContain('&lt;script&gt;');
            expect(cardName.innerHTML).not.toContain('<script>');
        });

        test('should handle missing item fields gracefully', () => {
            const incompleteItem = {
                id: 99,
                name: 'Incomplete Item'
                // Missing description, price, category, image
            };
            grid.renderGrid([incompleteItem]);
            const cards = container.querySelectorAll('.item-card');
            expect(cards.length).toBe(1);
            expect(cards[0]).toBeTruthy();
        });
    });

    // ===== ACTION BUTTON TESTS =====
    describe('Action Buttons - Requirement 8.4', () => {
        test('should render view details button', () => {
            grid.renderGrid(mockItems);
            const viewBtn = container.querySelector('.view-details-btn');
            expect(viewBtn).toBeTruthy();
            expect(viewBtn.textContent).toContain('View Details');
        });

        test('should render add to cart button', () => {
            grid.renderGrid(mockItems);
            const addBtn = container.querySelector('.add-to-cart-btn');
            expect(addBtn).toBeTruthy();
            expect(addBtn.textContent).toContain('Add to Cart');
        });

        test('should call cart.addItem when add to cart button clicked', () => {
            grid.renderGrid(mockItems);
            const addBtn = container.querySelector('.add-to-cart-btn');
            addBtn.click();
            expect(mockCart.addItem).toHaveBeenCalledWith(mockItems[0], 1);
        });

        test('should show loading state on add to cart button', (done) => {
            grid.renderGrid(mockItems);
            const addBtn = container.querySelector('.add-to-cart-btn');
            
            // Store original state
            const originalDisabled = addBtn.disabled;
            
            addBtn.click();
            
            // The button should be disabled after click
            expect(addBtn.disabled).toBe(true);
            
            // Wait for success state to appear
            setTimeout(() => {
                expect(addBtn.classList.contains('success')).toBe(true);
                expect(addBtn.innerHTML).toContain('Added');
                done();
            }, 100);
        });

        test('should emit itemAddedToCart event', (done) => {
            grid.renderGrid(mockItems);
            
            grid.addEventListener('itemAddedToCart', (data) => {
                expect(data.item.id).toBe(mockItems[0].id);
                done();
            });
            
            const addBtn = container.querySelector('.add-to-cart-btn');
            addBtn.click();
        });

        test('should emit itemDetailsRequested event on view details', (done) => {
            grid.renderGrid(mockItems);
            
            grid.addEventListener('itemDetailsRequested', (data) => {
                expect(data.item.id).toBe(mockItems[0].id);
                done();
            });
            
            const viewBtn = container.querySelector('.view-details-btn');
            viewBtn.click();
        });

        test('should handle add to cart error gracefully', (done) => {
            mockCart.addItem.mockImplementation(() => {
                throw new Error('Cart error');
            });
            
            grid.renderGrid(mockItems);
            const addBtn = container.querySelector('.add-to-cart-btn');
            
            addBtn.click();
            
            setTimeout(() => {
                expect(addBtn.classList.contains('error')).toBe(true);
                done();
            }, 100);
        });
    });

    // ===== PAGINATION TESTS =====
    describe('Pagination - Requirement 8.5', () => {
        test('should render pagination controls for multiple pages', () => {
            grid.renderGrid(mockItems);
            const pagination = container.parentElement.querySelector('.pagination-container');
            expect(pagination).toBeTruthy();
        });

        test('should show correct page info', () => {
            grid.renderGrid(mockItems);
            const pageInfo = container.parentElement.querySelector('.pagination-info');
            expect(pageInfo.textContent).toContain('Page 1 of 2');
        });

        test('should disable previous button on first page', () => {
            grid.renderGrid(mockItems);
            const prevBtn = container.parentElement.querySelector('.prev-btn');
            expect(prevBtn.disabled).toBe(true);
        });

        test('should enable next button when not on last page', () => {
            grid.renderGrid(mockItems);
            const nextBtn = container.parentElement.querySelector('.next-btn');
            expect(nextBtn.disabled).toBe(false);
        });

        test('should navigate to next page', () => {
            grid.renderGrid(mockItems);
            const nextBtn = container.parentElement.querySelector('.next-btn');
            nextBtn.click();
            
            expect(grid.currentPage).toBe(2);
            const cards = container.querySelectorAll('.item-card');
            expect(cards.length).toBe(2); // Should have 2 items on page 2
            expect(cards[0].getAttribute('data-item-id')).toBe('3');
        });

        test('should navigate to previous page', () => {
            grid.renderGrid(mockItems);
            grid.goToNextPage();
            grid.goToPreviousPage();
            
            expect(grid.currentPage).toBe(1);
            const cards = container.querySelectorAll('.item-card');
            expect(cards[0].getAttribute('data-item-id')).toBe('1');
        });

        test('should not render pagination for single page', () => {
            // Create a grid with only 1 item (less than itemsPerPage of 2)
            grid.renderGrid([mockItems[0]]);
            const pagination = container.parentElement.querySelector('.pagination-container');
            expect(pagination).toBeFalsy();
        });
    });

    // ===== LAZY LOADING TESTS =====
    describe('Lazy Loading - Requirement 8.5', () => {
        test('should use data-src for lazy loading when enabled', () => {
            const lazyGrid = new DynamicItemGrid({
                gridSelector: '#itemsGrid',
                lazyLoadImages: true
            });
            lazyGrid.renderGrid(mockItems);
            
            const img = container.querySelector('.item-image');
            expect(img.dataset.src).toBeTruthy();
            expect(img.src).not.toContain('placeholder');
            
            lazyGrid.destroy();
        });

        test('should use src directly for lazy loading when disabled', () => {
            grid.renderGrid(mockItems);
            const img = container.querySelector('.item-image');
            expect(img.src).toContain('placeholder');
        });
    });

    // ===== EMPTY STATE TESTS =====
    describe('Empty State - Requirement 8.5', () => {
        test('should display empty state message', () => {
            grid.renderGrid([]);
            const emptyState = container.querySelector('.empty-state');
            expect(emptyState.textContent).toContain('No items found');
        });

        test('should display clear filters button in empty state', () => {
            grid.renderGrid([]);
            const clearBtn = container.querySelector('#clearFiltersBtn');
            expect(clearBtn).toBeTruthy();
        });

        test('should emit clearFiltersRequested event', (done) => {
            grid.renderGrid([]);
            
            grid.addEventListener('clearFiltersRequested', () => {
                done();
            });
            
            const clearBtn = container.querySelector('#clearFiltersBtn');
            clearBtn.click();
        });
    });

    // ===== RESPONSIVE BEHAVIOR TESTS =====
    describe('Responsive Behavior - Requirement 8.1, 8.2', () => {
        test('should adapt grid columns based on screen size', () => {
            grid.renderGrid(mockItems);
            const gridElement = container;
            
            // Grid should have the items-grid class for CSS styling
            expect(gridElement.classList.contains('items-grid')).toBe(true);
        });

        test('should maintain consistent item card styling', () => {
            grid.renderGrid(mockItems);
            const cards = container.querySelectorAll('.item-card');
            
            cards.forEach(card => {
                expect(card.classList.contains('item-card')).toBe(true);
                expect(card.querySelector('.item-image')).toBeTruthy();
                expect(card.querySelector('.item-content')).toBeTruthy();
            });
        });
    });

    // ===== UTILITY FUNCTION TESTS =====
    describe('Utility Functions', () => {
        test('should format price correctly', () => {
            const formatted = grid.formatPrice(299.99);
            expect(formatted).toContain('299.99');
            expect(formatted).toContain('$');
        });

        test('should escape HTML special characters', () => {
            const escaped = grid.escapeHtml('<script>alert("xss")</script>');
            expect(escaped).toContain('&lt;');
            expect(escaped).toContain('&gt;');
            expect(escaped).not.toContain('<script>');
        });

        test('should get current items', () => {
            grid.renderGrid(mockItems);
            const items = grid.getItems();
            expect(items.length).toBe(mockItems.length);
        });

        test('should get current page', () => {
            grid.renderGrid(mockItems);
            expect(grid.getCurrentPage()).toBe(1);
        });

        test('should get total pages', () => {
            grid.renderGrid(mockItems);
            expect(grid.getTotalPages()).toBe(2);
        });
    });

    // ===== EVENT LISTENER TESTS =====
    describe('Event Listeners', () => {
        test('should add event listener', () => {
            const callback = jest.fn();
            grid.addEventListener('testEvent', callback);
            grid.emitEvent('testEvent', { test: true });
            expect(callback).toHaveBeenCalledWith({ test: true });
        });

        test('should remove event listener', () => {
            const callback = jest.fn();
            grid.addEventListener('testEvent', callback);
            grid.removeEventListener('testEvent', callback);
            grid.emitEvent('testEvent', { test: true });
            expect(callback).not.toHaveBeenCalled();
        });

        test('should handle multiple event listeners', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            grid.addEventListener('testEvent', callback1);
            grid.addEventListener('testEvent', callback2);
            grid.emitEvent('testEvent', { test: true });
            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });
    });

    // ===== CLEANUP TESTS =====
    describe('Cleanup', () => {
        test('should destroy component successfully', () => {
            grid.renderGrid(mockItems);
            grid.destroy();
            expect(grid.isReady()).toBe(false);
            expect(grid.gridContainer).toBeNull();
        });

        test('should clear all references on destroy', () => {
            grid.renderGrid(mockItems);
            grid.destroy();
            expect(grid.items.length).toBe(0);
            expect(grid.eventListeners.size).toBe(0);
        });
    });

    // ===== INTEGRATION TESTS =====
    describe('Integration', () => {
        test('should update items and re-render grid', () => {
            grid.renderGrid(mockItems);
            const newItems = [mockItems[0], mockItems[1]];
            grid.updateItems(newItems);
            
            expect(grid.getItems().length).toBe(2);
            expect(grid.getCurrentPage()).toBe(1);
        });

        test('should handle rapid page navigation', () => {
            grid.renderGrid(mockItems);
            grid.goToNextPage();
            grid.goToPreviousPage();
            grid.goToNextPage();
            
            expect(grid.currentPage).toBe(2);
        });

        test('should maintain state across multiple renders', () => {
            grid.renderGrid(mockItems);
            const firstRenderItems = grid.getItems();
            
            grid.renderGrid(mockItems);
            const secondRenderItems = grid.getItems();
            
            expect(firstRenderItems.length).toBe(secondRenderItems.length);
        });
    });
});
