/**
 * ActionButton Component
 * Provides interactive buttons with visual feedback, loading states, and accessibility
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

class ActionButton {
    /**
     * Create an ActionButton instance
     * @param {Object} config - Configuration object
     * @param {string} config.id - Unique identifier for the button
     * @param {string} config.label - Button text label
     * @param {string} config.type - Button type: 'primary', 'secondary', 'danger', 'success'
     * @param {Function} config.onClick - Callback function when button is clicked
     * @param {string} config.icon - Optional Font Awesome icon class (e.g., 'fas fa-plus')
     * @param {boolean} config.disabled - Whether button is initially disabled
     * @param {string} config.ariaLabel - Accessible label for screen readers
     * @param {string} config.title - Tooltip text on hover
     */
    constructor(config = {}) {
        this.id = config.id || `btn-${Date.now()}`;
        this.label = config.label || 'Action';
        this.type = config.type || 'primary';
        this.onClick = config.onClick || (() => {});
        this.icon = config.icon || null;
        this.disabled = config.disabled || false;
        this.ariaLabel = config.ariaLabel || config.label;
        this.title = config.title || '';
        
        // State management
        this.state = 'idle'; // idle, loading, success, error
        this.isLoading = false;
        this.element = null;
        this.originalContent = null;
        
        // Timing
        this.successDuration = 2000; // ms
        this.errorDuration = 3000; // ms
        
        // Create the button element
        this.create();
    }

    /**
     * Create the button DOM element
     * Requirement 10.1, 10.4, 10.5
     */
    create() {
        this.element = document.createElement('button');
        this.element.id = this.id;
        this.element.className = `action-btn action-btn-${this.type}`;
        this.element.setAttribute('aria-label', this.ariaLabel);
        this.element.setAttribute('type', 'button');
        
        if (this.title) {
            this.element.setAttribute('title', this.title);
        }
        
        if (this.disabled) {
            this.element.disabled = true;
            this.element.setAttribute('aria-disabled', 'true');
        }
        
        // Build button content
        this.updateContent();
        
        // Add event listeners
        this.element.addEventListener('click', this.handleClick.bind(this));
        this.element.addEventListener('keydown', this.handleKeydown.bind(this));
        this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.element.addEventListener('focus', this.handleFocus.bind(this));
        this.element.addEventListener('blur', this.handleBlur.bind(this));
    }

    /**
     * Update button content based on current state
     * Requirement 10.1, 10.2, 10.3
     */
    updateContent() {
        let content = '';
        
        switch (this.state) {
            case 'loading':
                content = `
                    <span class="btn-spinner" aria-hidden="true"></span>
                    <span class="btn-text">Loading...</span>
                `;
                break;
            case 'success':
                content = `
                    <i class="fas fa-check btn-icon" aria-hidden="true"></i>
                    <span class="btn-text">Success!</span>
                `;
                break;
            case 'error':
                content = `
                    <i class="fas fa-exclamation-circle btn-icon" aria-hidden="true"></i>
                    <span class="btn-text">Error</span>
                `;
                break;
            default: // idle
                content = '';
                if (this.icon) {
                    content += `<i class="${this.icon} btn-icon" aria-hidden="true"></i>`;
                }
                content += `<span class="btn-text">${this.label}</span>`;
        }
        
        this.element.innerHTML = content;
    }

    /**
     * Handle button click
     * Requirement 10.1, 10.2
     */
    handleClick(event) {
        event.preventDefault();
        
        if (this.isLoading || this.disabled) {
            return;
        }
        
        // Add visual feedback
        this.element.classList.add('btn-active');
        
        // Call the onClick callback
        const result = this.onClick(event);
        
        // If onClick returns a Promise, handle loading state
        if (result && typeof result.then === 'function') {
            this.setLoading(true);
            
            result
                .then(() => {
                    this.showSuccess();
                })
                .catch((error) => {
                    this.showError(error);
                })
                .finally(() => {
                    this.setLoading(false);
                });
        }
        
        // Remove active state after animation
        setTimeout(() => {
            if (this.element) {
                this.element.classList.remove('btn-active');
            }
        }, 100);
    }

    /**
     * Handle keyboard navigation
     * Requirement 10.4
     */
    handleKeydown(event) {
        // Enter or Space to activate button
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.element.click();
        }
        
        // Escape to cancel loading state
        if (event.key === 'Escape' && this.isLoading) {
            this.setLoading(false);
            this.setState('idle');
        }
    }

    /**
     * Handle mouse enter for hover effects
     * Requirement 10.1
     */
    handleMouseEnter() {
        if (!this.disabled && !this.isLoading) {
            this.element.classList.add('btn-hover');
        }
    }

    /**
     * Handle mouse leave
     * Requirement 10.1
     */
    handleMouseLeave() {
        this.element.classList.remove('btn-hover');
    }

    /**
     * Handle focus for keyboard navigation
     * Requirement 10.4
     */
    handleFocus() {
        this.element.classList.add('btn-focused');
    }

    /**
     * Handle blur
     * Requirement 10.4
     */
    handleBlur() {
        this.element.classList.remove('btn-focused');
    }

    /**
     * Set loading state
     * Requirement 10.2
     */
    setLoading(isLoading) {
        this.isLoading = isLoading;
        
        if (isLoading) {
            this.setState('loading');
            this.element.disabled = true;
            this.element.setAttribute('aria-busy', 'true');
            this.element.setAttribute('aria-disabled', 'true');
        } else {
            this.element.disabled = this.disabled;
            this.element.setAttribute('aria-busy', 'false');
            if (this.disabled) {
                this.element.setAttribute('aria-disabled', 'true');
            } else {
                this.element.removeAttribute('aria-disabled');
            }
        }
    }

    /**
     * Show success state
     * Requirement 10.3
     */
    showSuccess(message = 'Success!') {
        this.setState('success');
        this.element.classList.add('btn-success');
        
        // Announce to screen readers
        this.announceToScreenReader(`${this.ariaLabel}: ${message}`);
        
        // Reset to idle state after duration
        setTimeout(() => {
            this.setState('idle');
            this.element.classList.remove('btn-success');
        }, this.successDuration);
    }

    /**
     * Show error state
     * Requirement 10.3
     */
    showError(error = 'An error occurred') {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.setState('error');
        this.element.classList.add('btn-error');
        
        // Announce to screen readers
        this.announceToScreenReader(`${this.ariaLabel}: Error - ${errorMessage}`);
        
        // Reset to idle state after duration
        setTimeout(() => {
            this.setState('idle');
            this.element.classList.remove('btn-error');
        }, this.errorDuration);
    }

    /**
     * Set button state
     * @param {string} newState - New state: 'idle', 'loading', 'success', 'error'
     */
    setState(newState) {
        if (['idle', 'loading', 'success', 'error'].includes(newState)) {
            this.state = newState;
            this.updateContent();
            this.element.setAttribute('data-state', newState);
        }
    }

    /**
     * Announce message to screen readers
     * Requirement 10.5
     */
    announceToScreenReader(message) {
        // Create or get aria-live region
        let liveRegion = document.getElementById('btn-announcer');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'btn-announcer';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = message;
    }

    /**
     * Enable the button
     */
    enable() {
        this.disabled = false;
        this.element.disabled = false;
        this.element.removeAttribute('aria-disabled');
    }

    /**
     * Disable the button
     */
    disable() {
        this.disabled = true;
        this.element.disabled = true;
        this.element.setAttribute('aria-disabled', 'true');
    }

    /**
     * Update button label
     * @param {string} newLabel - New button label
     */
    setLabel(newLabel) {
        this.label = newLabel;
        this.ariaLabel = newLabel;
        this.element.setAttribute('aria-label', this.ariaLabel);
        if (this.state === 'idle') {
            this.updateContent();
        }
    }

    /**
     * Get the button element
     * @returns {HTMLElement} The button DOM element
     */
    getElement() {
        return this.element;
    }

    /**
     * Render button to a container
     * @param {HTMLElement|string} container - Container element or selector
     */
    render(container) {
        let target = container;
        
        if (typeof container === 'string') {
            target = document.querySelector(container);
        }
        
        if (target) {
            target.appendChild(this.element);
        }
        
        return this.element;
    }

    /**
     * Remove button from DOM
     */
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    /**
     * Destroy button and clean up
     */
    destroy() {
        // Remove event listeners
        if (this.element) {
            this.element.removeEventListener('click', this.handleClick);
            this.element.removeEventListener('keydown', this.handleKeydown);
            this.element.removeEventListener('mouseenter', this.handleMouseEnter);
            this.element.removeEventListener('mouseleave', this.handleMouseLeave);
            this.element.removeEventListener('focus', this.handleFocus);
            this.element.removeEventListener('blur', this.handleBlur);
        }
        
        // Remove from DOM
        this.remove();
        
        // Clear references
        this.element = null;
        this.onClick = null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActionButton;
}
