/**
 * ActionButton Component - Usage Examples
 * Demonstrates how to use the ActionButton component in various scenarios
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

// Example 1: Basic Button with Click Handler
function example1_basicButton() {
    const button = new ActionButton({
        id: 'save-btn',
        label: 'Save',
        type: 'primary',
        icon: 'fas fa-save',
        ariaLabel: 'Save changes',
        onClick: () => {
            console.log('Save button clicked');
        }
    });
    
    button.render('#button-container');
}

// Example 2: Button with Async Operation (Promise)
function example2_asyncButton() {
    const button = new ActionButton({
        id: 'submit-btn',
        label: 'Submit Form',
        type: 'primary',
        icon: 'fas fa-paper-plane',
        ariaLabel: 'Submit the form',
        onClick: async () => {
            // Simulate API call
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simulate success
                    resolve();
                }, 2000);
            });
        }
    });
    
    button.render('#button-container');
}

// Example 3: Button with Error Handling
function example3_errorHandling() {
    const button = new ActionButton({
        id: 'delete-btn',
        label: 'Delete',
        type: 'danger',
        icon: 'fas fa-trash',
        ariaLabel: 'Delete item',
        onClick: async () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simulate error
                    reject(new Error('Permission denied'));
                }, 1500);
            });
        }
    });
    
    button.render('#button-container');
}

// Example 4: Button Group
function example4_buttonGroup() {
    const container = document.getElementById('button-group-container');
    
    // Create a button group container
    const group = document.createElement('div');
    group.className = 'action-btn-group';
    container.appendChild(group);
    
    // Create multiple buttons
    const buttons = [
        {
            label: 'Save',
            type: 'primary',
            icon: 'fas fa-save',
            onClick: () => console.log('Save clicked')
        },
        {
            label: 'Cancel',
            type: 'secondary',
            icon: 'fas fa-times',
            onClick: () => console.log('Cancel clicked')
        },
        {
            label: 'Delete',
            type: 'danger',
            icon: 'fas fa-trash',
            onClick: () => console.log('Delete clicked')
        }
    ];
    
    buttons.forEach(config => {
        const button = new ActionButton(config);
        button.render(group);
    });
}

// Example 5: Disabled Button
function example5_disabledButton() {
    const button = new ActionButton({
        id: 'disabled-btn',
        label: 'Disabled Action',
        type: 'secondary',
        disabled: true,
        ariaLabel: 'This button is disabled'
    });
    
    button.render('#button-container');
    
    // Enable after 3 seconds
    setTimeout(() => {
        button.enable();
    }, 3000);
}

// Example 6: Dynamic Label Update
function example6_dynamicLabel() {
    const button = new ActionButton({
        id: 'dynamic-btn',
        label: 'Click me',
        type: 'primary',
        onClick: () => {
            button.setLabel('Clicked!');
            setTimeout(() => {
                button.setLabel('Click me again');
            }, 2000);
        }
    });
    
    button.render('#button-container');
}

// Example 7: Icon-Only Button
function example7_iconOnlyButton() {
    const button = new ActionButton({
        id: 'icon-btn',
        label: 'Add',
        type: 'primary',
        icon: 'fas fa-plus',
        ariaLabel: 'Add new item',
        onClick: () => console.log('Add clicked')
    });
    
    button.element.classList.add('btn-icon-only');
    button.render('#button-container');
}

// Example 8: Full Width Button
function example8_fullWidthButton() {
    const button = new ActionButton({
        id: 'full-width-btn',
        label: 'Full Width Action',
        type: 'primary',
        ariaLabel: 'Full width button',
        onClick: () => console.log('Full width clicked')
    });
    
    button.element.classList.add('btn-full-width');
    button.render('#button-container');
}

// Example 9: Small Button
function example9_smallButton() {
    const button = new ActionButton({
        id: 'small-btn',
        label: 'Small',
        type: 'secondary',
        ariaLabel: 'Small button',
        onClick: () => console.log('Small clicked')
    });
    
    button.element.classList.add('btn-small');
    button.render('#button-container');
}

// Example 10: Large Button
function example10_largeButton() {
    const button = new ActionButton({
        id: 'large-btn',
        label: 'Large Action',
        type: 'primary',
        icon: 'fas fa-check',
        ariaLabel: 'Large button',
        onClick: () => console.log('Large clicked')
    });
    
    button.element.classList.add('btn-large');
    button.render('#button-container');
}

// Example 11: Success State
function example11_successState() {
    const button = new ActionButton({
        id: 'success-btn',
        label: 'Confirm',
        type: 'success',
        icon: 'fas fa-check',
        ariaLabel: 'Confirm action',
        onClick: () => {
            button.showSuccess('Action confirmed!');
        }
    });
    
    button.render('#button-container');
}

// Example 12: Error State
function example12_errorState() {
    const button = new ActionButton({
        id: 'error-btn',
        label: 'Try Action',
        type: 'danger',
        icon: 'fas fa-exclamation',
        ariaLabel: 'Try action',
        onClick: () => {
            button.showError('Something went wrong!');
        }
    });
    
    button.render('#button-container');
}

// Example 13: Add to Cart Button (Real-world scenario)
function example13_addToCartButton() {
    const button = new ActionButton({
        id: 'add-to-cart-btn',
        label: 'Add to Cart',
        type: 'primary',
        icon: 'fas fa-shopping-cart',
        ariaLabel: 'Add this item to your shopping cart',
        onClick: async () => {
            // Simulate API call to add item to cart
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simulate success
                    resolve();
                }, 1000);
            });
        }
    });
    
    button.render('#product-card');
}

// Example 14: Delete Confirmation Button
function example14_deleteButton() {
    const button = new ActionButton({
        id: 'delete-item-btn',
        label: 'Delete Item',
        type: 'danger',
        icon: 'fas fa-trash-alt',
        ariaLabel: 'Delete this item permanently',
        onClick: async () => {
            // Show confirmation
            if (!confirm('Are you sure you want to delete this item?')) {
                throw new Error('Deletion cancelled');
            }
            
            // Simulate API call
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, 1500);
            });
        }
    });
    
    button.render('#item-actions');
}

// Example 15: Form Submit Button
function example15_formSubmitButton() {
    const button = new ActionButton({
        id: 'form-submit-btn',
        label: 'Submit Form',
        type: 'primary',
        icon: 'fas fa-paper-plane',
        ariaLabel: 'Submit the form',
        onClick: async () => {
            const formData = new FormData(document.getElementById('my-form'));
            
            // Simulate API call
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log('Form submitted:', Object.fromEntries(formData));
                    resolve();
                }, 2000);
            });
        }
    });
    
    button.render('#form-actions');
}

// Example 16: Keyboard Navigation Demo
function example16_keyboardNavigation() {
    const button = new ActionButton({
        id: 'keyboard-btn',
        label: 'Press Enter or Space',
        type: 'primary',
        ariaLabel: 'Keyboard accessible button',
        onClick: () => {
            console.log('Button activated via keyboard');
        }
    });
    
    button.render('#button-container');
    
    // Focus the button for keyboard testing
    button.element.focus();
}

// Example 17: Multiple Buttons with State Management
function example17_multipleButtons() {
    const container = document.getElementById('button-container');
    
    const buttons = {
        save: new ActionButton({
            id: 'save-btn',
            label: 'Save',
            type: 'primary',
            icon: 'fas fa-save',
            onClick: async () => {
                buttons.cancel.disable();
                buttons.delete.disable();
                return new Promise(resolve => setTimeout(resolve, 1500));
            }
        }),
        cancel: new ActionButton({
            id: 'cancel-btn',
            label: 'Cancel',
            type: 'secondary',
            icon: 'fas fa-times',
            onClick: () => {
                buttons.save.enable();
                buttons.delete.enable();
            }
        }),
        delete: new ActionButton({
            id: 'delete-btn',
            label: 'Delete',
            type: 'danger',
            icon: 'fas fa-trash',
            onClick: () => {
                console.log('Delete clicked');
            }
        })
    };
    
    Object.values(buttons).forEach(btn => btn.render(container));
}

// Example 18: Button with Custom Timing
function example18_customTiming() {
    const button = new ActionButton({
        id: 'custom-timing-btn',
        label: 'Custom Timing',
        type: 'primary',
        onClick: () => {
            button.showSuccess('Success!');
        }
    });
    
    // Customize success duration
    button.successDuration = 5000; // 5 seconds
    
    button.render('#button-container');
}

// Example 19: Cleanup and Destroy
function example19_cleanup() {
    const button = new ActionButton({
        id: 'temp-btn',
        label: 'Temporary Button',
        type: 'secondary',
        onClick: () => console.log('Clicked')
    });
    
    button.render('#button-container');
    
    // Remove button after 5 seconds
    setTimeout(() => {
        button.destroy();
    }, 5000);
}

// Example 20: Accessibility Features Demo
function example20_accessibility() {
    const button = new ActionButton({
        id: 'accessible-btn',
        label: 'Accessible Action',
        type: 'primary',
        icon: 'fas fa-universal-access',
        ariaLabel: 'Perform accessible action',
        title: 'This button is fully accessible with keyboard navigation and screen reader support',
        onClick: () => {
            console.log('Accessible button clicked');
        }
    });
    
    button.render('#button-container');
}

// Export examples for use in HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        example1_basicButton,
        example2_asyncButton,
        example3_errorHandling,
        example4_buttonGroup,
        example5_disabledButton,
        example6_dynamicLabel,
        example7_iconOnlyButton,
        example8_fullWidthButton,
        example9_smallButton,
        example10_largeButton,
        example11_successState,
        example12_errorState,
        example13_addToCartButton,
        example14_deleteButton,
        example15_formSubmitButton,
        example16_keyboardNavigation,
        example17_multipleButtons,
        example18_customTiming,
        example19_cleanup,
        example20_accessibility
    };
}
