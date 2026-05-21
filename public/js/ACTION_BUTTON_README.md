# ActionButton Component

A fully accessible, interactive button component with visual feedback, loading states, and success/error state management.

## Overview

The ActionButton component provides a reusable, accessible button implementation that supports:
- Visual feedback on hover and click interactions
- Loading states during async operations
- Success and error states after action completion
- Full keyboard navigation support
- Screen reader accessibility (ARIA labels and live regions)
- Multiple button types and variants
- Promise-based async handling

**Requirements Addressed:**
- 10.1: Visual feedback on hover and click interactions
- 10.2: Loading states during processing operations
- 10.3: Success/error states after action completion
- 10.4: Keyboard navigation and screen reader accessibility
- 10.5: Accessible via keyboard navigation and screen readers

## Installation

Include the ActionButton script in your HTML:

```html
<script src="/js/actionButton.js"></script>
<link rel="stylesheet" href="/css/styles.css">
```

## Basic Usage

### Simple Button

```javascript
const button = new ActionButton({
    id: 'my-button',
    label: 'Click Me',
    type: 'primary',
    onClick: () => {
        console.log('Button clicked');
    }
});

button.render('#container');
```

### Button with Icon

```javascript
const button = new ActionButton({
    label: 'Save',
    type: 'primary',
    icon: 'fas fa-save',
    ariaLabel: 'Save changes',
    onClick: () => {
        // Handle save action
    }
});

button.render('#container');
```

### Async Button with Loading State

```javascript
const button = new ActionButton({
    label: 'Submit',
    type: 'primary',
    onClick: async () => {
        // Return a Promise for automatic loading state management
        return fetch('/api/submit', {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(response => response.json());
    }
});

button.render('#container');
```

## Configuration Options

### Constructor Parameters

```javascript
new ActionButton({
    // Unique identifier for the button
    id: 'btn-id',
    
    // Button text label
    label: 'Click Me',
    
    // Button type: 'primary', 'secondary', 'danger', 'success'
    type: 'primary',
    
    // Callback function when button is clicked
    onClick: (event) => {},
    
    // Font Awesome icon class (optional)
    icon: 'fas fa-plus',
    
    // Whether button is initially disabled
    disabled: false,
    
    // Accessible label for screen readers
    ariaLabel: 'Button description',
    
    // Tooltip text on hover
    title: 'Helpful tooltip'
})
```

## Button Types

### Primary Button
```javascript
new ActionButton({
    label: 'Primary Action',
    type: 'primary'
});
```

### Secondary Button
```javascript
new ActionButton({
    label: 'Secondary Action',
    type: 'secondary'
});
```

### Danger Button
```javascript
new ActionButton({
    label: 'Delete',
    type: 'danger'
});
```

### Success Button
```javascript
new ActionButton({
    label: 'Confirm',
    type: 'success'
});
```

## Button Variants

### Small Button
```javascript
const button = new ActionButton({ label: 'Small' });
button.element.classList.add('btn-small');
button.render('#container');
```

### Large Button
```javascript
const button = new ActionButton({ label: 'Large' });
button.element.classList.add('btn-large');
button.render('#container');
```

### Icon-Only Button
```javascript
const button = new ActionButton({
    label: 'Add',
    icon: 'fas fa-plus'
});
button.element.classList.add('btn-icon-only');
button.render('#container');
```

### Full-Width Button
```javascript
const button = new ActionButton({ label: 'Full Width' });
button.element.classList.add('btn-full-width');
button.render('#container');
```

## API Methods

### State Management

#### `setLoading(isLoading: boolean)`
Set the button to loading state.

```javascript
button.setLoading(true);
// Button shows spinner and is disabled
button.setLoading(false);
// Button returns to normal state
```

#### `showSuccess(message?: string)`
Show success state with optional message.

```javascript
button.showSuccess('Item saved successfully!');
// Button shows success icon and returns to idle after 2 seconds
```

#### `showError(error?: Error | string)`
Show error state with optional error message.

```javascript
button.showError('Failed to save item');
// Button shows error icon and returns to idle after 3 seconds
```

#### `setState(state: 'idle' | 'loading' | 'success' | 'error')`
Set button state directly.

```javascript
button.setState('loading');
button.setState('success');
button.setState('error');
button.setState('idle');
```

### Enable/Disable

#### `enable()`
Enable the button.

```javascript
button.enable();
```

#### `disable()`
Disable the button.

```javascript
button.disable();
```

### Label Management

#### `setLabel(newLabel: string)`
Update button label.

```javascript
button.setLabel('Saving...');
```

### Rendering

#### `render(container: HTMLElement | string)`
Render button to a container.

```javascript
// Render to element
button.render(document.getElementById('container'));

// Render to selector
button.render('#container');
```

#### `getElement()`
Get the button DOM element.

```javascript
const element = button.getElement();
```

#### `remove()`
Remove button from DOM.

```javascript
button.remove();
```

#### `destroy()`
Destroy button and clean up all event listeners.

```javascript
button.destroy();
```

## Handling Async Operations

### Promise-Based Callbacks

When your `onClick` callback returns a Promise, the button automatically manages loading states:

```javascript
const button = new ActionButton({
    label: 'Save',
    onClick: async () => {
        // Show loading state automatically
        const response = await fetch('/api/save', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save');
        }
        
        return response.json();
        // Shows success state automatically
    }
});
```

### Error Handling

Errors are automatically caught and displayed:

```javascript
const button = new ActionButton({
    label: 'Delete',
    onClick: async () => {
        return fetch('/api/delete', { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Permission denied');
                }
                return response.json();
            });
        // If error is thrown, shows error state automatically
    }
});
```

## Accessibility Features

### Keyboard Navigation
- **Enter**: Activate button
- **Space**: Activate button
- **Escape**: Cancel loading state
- **Tab**: Navigate to button

### Screen Reader Support
- ARIA labels for button purpose
- ARIA busy state during loading
- ARIA disabled state when disabled
- Live region announcements for state changes
- Hidden icons with `aria-hidden="true"`

### Example: Accessible Button

```javascript
const button = new ActionButton({
    label: 'Save Changes',
    ariaLabel: 'Save all changes to your profile',
    title: 'Save changes (Ctrl+S)',
    icon: 'fas fa-save',
    onClick: async () => {
        return saveProfile();
    }
});

button.render('#form-actions');
```

## Styling

### CSS Classes

The button automatically applies CSS classes based on state:

- `.action-btn` - Base button class
- `.action-btn-primary` - Primary button type
- `.action-btn-secondary` - Secondary button type
- `.action-btn-danger` - Danger button type
- `.action-btn-success` - Success button type
- `.btn-hover` - Applied on hover
- `.btn-active` - Applied on click
- `.btn-focused` - Applied on focus
- `.btn-small` - Small variant
- `.btn-large` - Large variant
- `.btn-icon-only` - Icon-only variant
- `.btn-full-width` - Full-width variant
- `.btn-success` - Success state
- `.btn-error` - Error state

### Custom Styling

```css
/* Override button colors */
.action-btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Custom hover effect */
.action-btn:hover:not(:disabled) {
    transform: scale(1.05);
}

/* Custom loading animation */
.btn-spinner {
    animation: customSpin 0.6s linear infinite;
}
```

## Real-World Examples

### Add to Cart Button

```javascript
const addToCartButton = new ActionButton({
    id: 'add-to-cart',
    label: 'Add to Cart',
    type: 'primary',
    icon: 'fas fa-shopping-cart',
    ariaLabel: 'Add this item to your shopping cart',
    onClick: async () => {
        return fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: 123, quantity: 1 })
        }).then(response => response.json());
    }
});

addToCartButton.render('#product-card');
```

### Delete with Confirmation

```javascript
const deleteButton = new ActionButton({
    label: 'Delete Item',
    type: 'danger',
    icon: 'fas fa-trash',
    ariaLabel: 'Delete this item permanently',
    onClick: async () => {
        if (!confirm('Are you sure? This cannot be undone.')) {
            throw new Error('Deletion cancelled');
        }
        
        return fetch('/api/items/123', { method: 'DELETE' });
    }
});

deleteButton.render('#item-actions');
```

### Form Submit

```javascript
const submitButton = new ActionButton({
    label: 'Submit Form',
    type: 'primary',
    icon: 'fas fa-paper-plane',
    onClick: async () => {
        const formData = new FormData(document.getElementById('my-form'));
        
        return fetch('/api/submit', {
            method: 'POST',
            body: formData
        }).then(response => response.json());
    }
});

submitButton.render('#form-actions');
```

### Button Group

```javascript
const container = document.getElementById('actions');

const buttons = [
    {
        label: 'Save',
        type: 'primary',
        icon: 'fas fa-save',
        onClick: () => saveData()
    },
    {
        label: 'Cancel',
        type: 'secondary',
        onClick: () => cancelAction()
    },
    {
        label: 'Delete',
        type: 'danger',
        icon: 'fas fa-trash',
        onClick: () => deleteData()
    }
];

const group = document.createElement('div');
group.className = 'action-btn-group';
container.appendChild(group);

buttons.forEach(config => {
    new ActionButton(config).render(group);
});
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Buttons are lightweight and can be created in bulk
- Event listeners are properly cleaned up on destroy
- CSS animations use GPU acceleration
- No external dependencies required

## Testing

The component includes comprehensive unit tests covering:
- Initialization and configuration
- Visual feedback (hover, active, focus states)
- Click interactions
- Loading state management
- Success/error state handling
- Keyboard navigation
- Accessibility features
- State management
- Enable/disable functionality
- Label updates
- Rendering and cleanup
- Promise handling

Run tests with:
```bash
npm test -- actionButton.test.js
```

## Troubleshooting

### Button not responding to clicks
- Check if button is disabled: `button.disabled`
- Check if button is in loading state: `button.isLoading`
- Verify onClick callback is defined

### Loading state not showing
- Ensure onClick returns a Promise
- Check browser console for errors
- Verify CSS is loaded

### Accessibility issues
- Ensure ariaLabel is provided
- Check that button has proper focus styles
- Test with screen reader (NVDA, JAWS, VoiceOver)

## License

Part of TechVault E-Commerce Platform

## Support

For issues or questions, refer to the design document or contact the development team.
