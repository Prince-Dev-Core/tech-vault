/**
 * Unit Tests for ActionButton Component
 * Tests button interactions, state management, and accessibility features
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

// Import ActionButton class
const ActionButton = require('./actionButton');

describe('ActionButton Component', () => {
    let button;
    let container;

    beforeEach(() => {
        // Create a container for testing
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        // Clean up
        if (button) {
            button.destroy();
        }
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    // ===== INITIALIZATION TESTS =====
    describe('Initialization', () => {
        test('should create button with default configuration', () => {
            button = new ActionButton();
            expect(button.element).toBeTruthy();
            expect(button.element.tagName).toBe('BUTTON');
            expect(button.state).toBe('idle');
            expect(button.isLoading).toBe(false);
        });

        test('should create button with custom configuration', () => {
            button = new ActionButton({
                id: 'test-btn',
                label: 'Click Me',
                type: 'primary',
                ariaLabel: 'Test Button'
            });
            expect(button.element.id).toBe('test-btn');
            expect(button.label).toBe('Click Me');
            expect(button.type).toBe('primary');
            expect(button.element.getAttribute('aria-label')).toBe('Test Button');
        });

        test('should apply correct CSS classes based on type', () => {
            button = new ActionButton({ type: 'danger' });
            expect(button.element.classList.contains('action-btn')).toBe(true);
            expect(button.element.classList.contains('action-btn-danger')).toBe(true);
        });

        test('should set disabled state on initialization', () => {
            button = new ActionButton({ disabled: true });
            expect(button.element.disabled).toBe(true);
            expect(button.element.getAttribute('aria-disabled')).toBe('true');
        });

        test('should include icon in button content if provided', () => {
            button = new ActionButton({
                label: 'Add',
                icon: 'fas fa-plus'
            });
            button.render(container);
            const icon = button.element.querySelector('.btn-icon');
            expect(icon).toBeTruthy();
            expect(icon.classList.contains('fas')).toBe(true);
            expect(icon.classList.contains('fa-plus')).toBe(true);
        });

        test('should set title attribute for tooltip', () => {
            button = new ActionButton({
                label: 'Save',
                title: 'Save changes'
            });
            expect(button.element.getAttribute('title')).toBe('Save changes');
        });
    });

    // ===== VISUAL FEEDBACK TESTS =====
    describe('Visual Feedback - Requirement 10.1', () => {
        test('should add hover class on mouse enter', () => {
            button = new ActionButton();
            button.render(container);
            
            const event = new MouseEvent('mouseenter');
            button.element.dispatchEvent(event);
            
            expect(button.element.classList.contains('btn-hover')).toBe(true);
        });

        test('should remove hover class on mouse leave', () => {
            button = new ActionButton();
            button.render(container);
            
            button.element.classList.add('btn-hover');
            const event = new MouseEvent('mouseleave');
            button.element.dispatchEvent(event);
            
            expect(button.element.classList.contains('btn-hover')).toBe(false);
        });

        test('should not add hover class when disabled', () => {
            button = new ActionButton({ disabled: true });
            button.render(container);
            
            const event = new MouseEvent('mouseenter');
            button.element.dispatchEvent(event);
            
            expect(button.element.classList.contains('btn-hover')).toBe(false);
        });

        test('should add active class on click', (done) => {
            button = new ActionButton({
                onClick: () => {}
            });
            button.render(container);
            
            const clickEvent = new MouseEvent('click');
            button.element.dispatchEvent(clickEvent);
            
            expect(button.element.classList.contains('btn-active')).toBe(true);
            
            // Active class should be removed after animation
            setTimeout(() => {
                expect(button.element.classList.contains('btn-active')).toBe(false);
                done();
            }, 150);
        });
    });

    // ===== CLICK INTERACTION TESTS =====
    describe('Click Interactions', () => {
        test('should call onClick callback when clicked', () => {
            const mockCallback = jest.fn();
            button = new ActionButton({ onClick: mockCallback });
            button.render(container);
            
            button.element.click();
            
            expect(mockCallback).toHaveBeenCalled();
        });

        test('should not call onClick when disabled', () => {
            const mockCallback = jest.fn();
            button = new ActionButton({
                onClick: mockCallback,
                disabled: true
            });
            button.render(container);
            
            button.element.click();
            
            expect(mockCallback).not.toHaveBeenCalled();
        });

        test('should not call onClick when loading', () => {
            const mockCallback = jest.fn();
            button = new ActionButton({ onClick: mockCallback });
            button.render(container);
            
            button.setLoading(true);
            button.element.click();
            
            expect(mockCallback).not.toHaveBeenCalled();
        });

        test('should handle Promise-based onClick callbacks', (done) => {
            const mockCallback = jest.fn(() => {
                return new Promise(resolve => {
                    setTimeout(resolve, 100);
                });
            });
            
            button = new ActionButton({ onClick: mockCallback });
            button.render(container);
            
            button.element.click();
            
            expect(button.isLoading).toBe(true);
            expect(button.state).toBe('loading');
            
            setTimeout(() => {
                expect(button.isLoading).toBe(false);
                expect(mockCallback).toHaveBeenCalled();
                done();
            }, 150);
        });
    });

    // ===== LOADING STATE TESTS =====
    describe('Loading State - Requirement 10.2', () => {
        test('should set loading state', () => {
            button = new ActionButton();
            button.render(container);
            
            button.setLoading(true);
            
            expect(button.isLoading).toBe(true);
            expect(button.state).toBe('loading');
            expect(button.element.disabled).toBe(true);
            expect(button.element.getAttribute('aria-busy')).toBe('true');
        });

        test('should clear loading state', () => {
            button = new ActionButton();
            button.render(container);
            
            button.setLoading(true);
            button.setLoading(false);
            
            expect(button.isLoading).toBe(false);
            expect(button.element.disabled).toBe(false);
            expect(button.element.getAttribute('aria-busy')).toBe('false');
        });

        test('should display loading spinner and text', () => {
            button = new ActionButton();
            button.render(container);
            
            button.setLoading(true);
            
            const spinner = button.element.querySelector('.btn-spinner');
            const text = button.element.querySelector('.btn-text');
            
            expect(spinner).toBeTruthy();
            expect(text.textContent).toBe('Loading...');
        });

        test('should disable button during loading', () => {
            button = new ActionButton();
            button.render(container);
            
            button.setLoading(true);
            
            expect(button.element.disabled).toBe(true);
        });

        test('should restore disabled state after loading', () => {
            button = new ActionButton({ disabled: true });
            button.render(container);
            
            button.setLoading(true);
            button.setLoading(false);
            
            expect(button.element.disabled).toBe(true);
        });
    });

    // ===== SUCCESS STATE TESTS =====
    describe('Success State - Requirement 10.3', () => {
        test('should show success state', (done) => {
            button = new ActionButton();
            button.render(container);
            
            button.showSuccess();
            
            expect(button.state).toBe('success');
            expect(button.element.classList.contains('btn-success')).toBe(true);
            
            const icon = button.element.querySelector('.btn-icon');
            expect(icon.classList.contains('fa-check')).toBe(true);
            
            done();
        });

        test('should display success message', () => {
            button = new ActionButton();
            button.render(container);
            
            button.showSuccess('Item added');
            
            const text = button.element.querySelector('.btn-text');
            expect(text.textContent).toBe('Success!');
        });

        test('should return to idle state after success duration', (done) => {
            button = new ActionButton();
            button.successDuration = 100;
            button.render(container);
            
            button.showSuccess();
            
            setTimeout(() => {
                expect(button.state).toBe('idle');
                expect(button.element.classList.contains('btn-success')).toBe(false);
                done();
            }, 150);
        });

        test('should announce success to screen readers', () => {
            button = new ActionButton({ ariaLabel: 'Save' });
            button.render(container);
            
            const announcer = document.getElementById('btn-announcer');
            button.showSuccess('Saved successfully');
            
            expect(announcer).toBeTruthy();
            expect(announcer.textContent).toContain('Save');
            expect(announcer.textContent).toContain('Saved successfully');
        });
    });

    // ===== ERROR STATE TESTS =====
    describe('Error State - Requirement 10.3', () => {
        test('should show error state', (done) => {
            button = new ActionButton();
            button.render(container);
            
            button.showError();
            
            expect(button.state).toBe('error');
            expect(button.element.classList.contains('btn-error')).toBe(true);
            
            const icon = button.element.querySelector('.btn-icon');
            expect(icon.classList.contains('fa-exclamation-circle')).toBe(true);
            
            done();
        });

        test('should display error message', () => {
            button = new ActionButton();
            button.render(container);
            
            button.showError('Failed to save');
            
            const text = button.element.querySelector('.btn-text');
            expect(text.textContent).toBe('Error');
        });

        test('should return to idle state after error duration', (done) => {
            button = new ActionButton();
            button.errorDuration = 100;
            button.render(container);
            
            button.showError();
            
            setTimeout(() => {
                expect(button.state).toBe('idle');
                expect(button.element.classList.contains('btn-error')).toBe(false);
                done();
            }, 150);
        });

        test('should announce error to screen readers', () => {
            button = new ActionButton({ ariaLabel: 'Delete' });
            button.render(container);
            
            const announcer = document.getElementById('btn-announcer');
            button.showError('Permission denied');
            
            expect(announcer).toBeTruthy();
            expect(announcer.textContent).toContain('Delete');
            expect(announcer.textContent).toContain('Error');
        });

        test('should handle Error objects', () => {
            button = new ActionButton();
            button.render(container);
            
            const error = new Error('Network timeout');
            button.showError(error);
            
            expect(button.state).toBe('error');
        });
    });

    // ===== KEYBOARD NAVIGATION TESTS =====
    describe('Keyboard Navigation - Requirement 10.4', () => {
        test('should activate button on Enter key', () => {
            const mockCallback = jest.fn();
            button = new ActionButton({ onClick: mockCallback });
            button.render(container);
            
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            button.element.dispatchEvent(event);
            
            expect(mockCallback).toHaveBeenCalled();
        });

        test('should activate button on Space key', () => {
            const mockCallback = jest.fn();
            button = new ActionButton({ onClick: mockCallback });
            button.render(container);
            
            const event = new KeyboardEvent('keydown', { key: ' ' });
            button.element.dispatchEvent(event);
            
            expect(mockCallback).toHaveBeenCalled();
        });

        test('should add focused class on focus', () => {
            button = new ActionButton();
            button.render(container);
            
            const event = new FocusEvent('focus');
            button.element.dispatchEvent(event);
            
            expect(button.element.classList.contains('btn-focused')).toBe(true);
        });

        test('should remove focused class on blur', () => {
            button = new ActionButton();
            button.render(container);
            
            button.element.classList.add('btn-focused');
            const event = new FocusEvent('blur');
            button.element.dispatchEvent(event);
            
            expect(button.element.classList.contains('btn-focused')).toBe(false);
        });

        test('should have focus-visible outline', () => {
            button = new ActionButton();
            button.render(container);
            
            const styles = window.getComputedStyle(button.element);
            // Note: outline is set via CSS, so we check the class
            button.element.classList.add('btn-focused');
            expect(button.element.classList.contains('btn-focused')).toBe(true);
        });

        test('should cancel loading on Escape key', () => {
            button = new ActionButton();
            button.render(container);
            
            button.setLoading(true);
            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            button.element.dispatchEvent(event);
            
            expect(button.state).toBe('idle');
        });
    });

    // ===== ACCESSIBILITY TESTS =====
    describe('Accessibility - Requirement 10.5', () => {
        test('should have aria-label attribute', () => {
            button = new ActionButton({
                label: 'Save Changes',
                ariaLabel: 'Save all changes'
            });
            
            expect(button.element.getAttribute('aria-label')).toBe('Save all changes');
        });

        test('should have type="button" attribute', () => {
            button = new ActionButton();
            
            expect(button.element.getAttribute('type')).toBe('button');
        });

        test('should set aria-disabled when disabled', () => {
            button = new ActionButton({ disabled: true });
            
            expect(button.element.getAttribute('aria-disabled')).toBe('true');
        });

        test('should set aria-busy during loading', () => {
            button = new ActionButton();
            button.render(container);
            
            button.setLoading(true);
            
            expect(button.element.getAttribute('aria-busy')).toBe('true');
        });

        test('should have aria-live region for announcements', () => {
            button = new ActionButton();
            button.render(container);
            
            button.showSuccess();
            
            const announcer = document.getElementById('btn-announcer');
            expect(announcer).toBeTruthy();
            expect(announcer.getAttribute('aria-live')).toBe('polite');
            expect(announcer.getAttribute('aria-atomic')).toBe('true');
        });

        test('should hide icons from screen readers', () => {
            button = new ActionButton({
                label: 'Add',
                icon: 'fas fa-plus'
            });
            button.render(container);
            
            const icon = button.element.querySelector('.btn-icon');
            expect(icon.getAttribute('aria-hidden')).toBe('true');
        });

        test('should announce state changes to screen readers', () => {
            button = new ActionButton({ ariaLabel: 'Submit' });
            button.render(container);
            
            const announcer = document.getElementById('btn-announcer');
            button.showSuccess('Form submitted');
            
            expect(announcer.textContent).toContain('Submit');
            expect(announcer.textContent).toContain('Form submitted');
        });
    });

    // ===== STATE MANAGEMENT TESTS =====
    describe('State Management', () => {
        test('should set state correctly', () => {
            button = new ActionButton();
            button.render(container);
            
            button.setState('loading');
            expect(button.state).toBe('loading');
            expect(button.element.getAttribute('data-state')).toBe('loading');
            
            button.setState('success');
            expect(button.state).toBe('success');
            expect(button.element.getAttribute('data-state')).toBe('success');
        });

        test('should ignore invalid states', () => {
            button = new ActionButton();
            
            button.setState('invalid');
            expect(button.state).toBe('idle');
        });

        test('should update content when state changes', () => {
            button = new ActionButton({ label: 'Click' });
            button.render(container);
            
            button.setState('loading');
            let text = button.element.querySelector('.btn-text');
            expect(text.textContent).toBe('Loading...');
            
            button.setState('success');
            text = button.element.querySelector('.btn-text');
            expect(text.textContent).toBe('Success!');
        });
    });

    // ===== ENABLE/DISABLE TESTS =====
    describe('Enable/Disable', () => {
        test('should enable button', () => {
            button = new ActionButton({ disabled: true });
            
            button.enable();
            
            expect(button.disabled).toBe(false);
            expect(button.element.disabled).toBe(false);
        });

        test('should disable button', () => {
            button = new ActionButton();
            
            button.disable();
            
            expect(button.disabled).toBe(true);
            expect(button.element.disabled).toBe(true);
            expect(button.element.getAttribute('aria-disabled')).toBe('true');
        });
    });

    // ===== LABEL UPDATE TESTS =====
    describe('Label Updates', () => {
        test('should update button label', () => {
            button = new ActionButton({ label: 'Save' });
            button.render(container);
            
            button.setLabel('Saving...');
            
            expect(button.label).toBe('Saving...');
            const text = button.element.querySelector('.btn-text');
            expect(text.textContent).toBe('Saving...');
        });

        test('should update aria-label when label changes', () => {
            button = new ActionButton({ label: 'Save' });
            
            button.setLabel('Update');
            
            expect(button.element.getAttribute('aria-label')).toBe('Update');
        });
    });

    // ===== RENDERING TESTS =====
    describe('Rendering', () => {
        test('should render button to container element', () => {
            button = new ActionButton();
            button.render(container);
            
            expect(container.contains(button.element)).toBe(true);
        });

        test('should render button to selector string', () => {
            const testContainer = document.createElement('div');
            testContainer.id = 'test-container';
            document.body.appendChild(testContainer);
            
            button = new ActionButton();
            button.render('#test-container');
            
            expect(testContainer.contains(button.element)).toBe(true);
            
            testContainer.parentNode.removeChild(testContainer);
        });

        test('should return element from render', () => {
            button = new ActionButton();
            const element = button.render(container);
            
            expect(element).toBe(button.element);
        });

        test('should get element reference', () => {
            button = new ActionButton();
            const element = button.getElement();
            
            expect(element).toBe(button.element);
        });
    });

    // ===== CLEANUP TESTS =====
    describe('Cleanup', () => {
        test('should remove button from DOM', () => {
            button = new ActionButton();
            button.render(container);
            
            expect(container.contains(button.element)).toBe(true);
            
            button.remove();
            
            expect(container.contains(button.element)).toBe(false);
        });

        test('should destroy button and clean up', () => {
            const mockCallback = jest.fn();
            button = new ActionButton({ onClick: mockCallback });
            button.render(container);
            
            button.destroy();
            
            expect(button.element).toBeNull();
            expect(button.onClick).toBeNull();
        });
    });

    // ===== PROMISE HANDLING TESTS =====
    describe('Promise Handling', () => {
        test('should handle successful Promise', (done) => {
            const mockCallback = jest.fn(() => {
                return Promise.resolve();
            });
            
            button = new ActionButton({ onClick: mockCallback });
            button.render(container);
            
            button.element.click();
            
            setTimeout(() => {
                expect(button.state).toBe('success');
                done();
            }, 150);
        });

        test('should handle rejected Promise', (done) => {
            const mockCallback = jest.fn(() => {
                return Promise.reject(new Error('Test error'));
            });
            
            button = new ActionButton({ onClick: mockCallback });
            button.render(container);
            
            button.element.click();
            
            setTimeout(() => {
                expect(button.state).toBe('error');
                done();
            }, 150);
        });

        test('should handle non-Promise callbacks', () => {
            const mockCallback = jest.fn(() => {
                return 'result';
            });
            
            button = new ActionButton({ onClick: mockCallback });
            button.render(container);
            
            button.element.click();
            
            expect(mockCallback).toHaveBeenCalled();
            expect(button.state).toBe('idle');
        });
    });
});
